import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const JSON_OUTPUT = path.join(OUTPUT_DIR, "shopRam.json");
const JS_OUTPUT = "shopDanawaRamLiveData.js";
const CRAWLED_AT = new Date().toISOString();
const LIST_URL =
  "https://shop.danawa.com/main/?controller=goods&methods=index&productRegisterAreaGroupSeq=100&serviceSectionSeq=596#3";
const LIST_API_URL =
  "https://shop.danawa.com/main/?controller=goods&methods=getBillingInternalProductList";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

function decodeEntities(text) {
  return String(text || "")
    .replace(/&quot;/g, '"')
    .replace(/&#034;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(text) {
  return decodeEntities(String(text || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseFirstNumber(text, pattern) {
  const match = String(text || "").match(pattern);
  return match ? Number(String(match[1]).replace(/,/g, "")) : null;
}

function makeIdSafeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 56);
}

function parsePrice(value) {
  const number = Number(String(value || "").replace(/[^\d]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function extractMetaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  return decodeEntities(html.match(pattern)?.[1] || "");
}

function makeDetailUrl(product) {
  const url = new URL("https://shop.danawa.com/main/");
  url.searchParams.set("controller", "goods");
  url.searchParams.set("methods", "blog");
  url.searchParams.set("billingInternalProductSeq", product.productSeq);
  url.searchParams.set("productRegisterAreaGroupSeq", product.productRegisterAreaGroupSeq || "100");
  url.searchParams.set("serviceSectionSeq", product.serviceSectionSeq || "596");
  return url.toString();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRamListPage(page = 1, limit = 90) {
  const params = new URLSearchParams({
    marketPlaceSeq: "29",
    page: String(page),
    productListType: "LIST",
    cartDisplayYN: "Y",
    compareList: "",
    registerSectionSeq: "142",
    serviceSectionSeq: "596",
    categorySeq1: "861",
    categorySeq2: "874",
    category1: "100",
    category2: "596",
    order: "1|2,2|2",
    limit: String(limit),
  });

  const response = await fetchWithTimeout(LIST_API_URL, {
    method: "POST",
    headers: {
      "user-agent": USER_AGENT,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      referer: LIST_URL,
      "x-requested-with": "XMLHttpRequest",
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Shop Danawa RAM list failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    rows: data.goodsData?.searchList || [],
    totalCount: Number(data.goodsData?.totalCount || 0),
    pageCount: Number(data.goodsData?.count || limit),
  };
}

async function fetchDetailMeta(product) {
  const detailUrl = makeDetailUrl(product);
  try {
    const response = await fetchWithTimeout(
      detailUrl,
      {
        headers: {
          "user-agent": USER_AGENT,
          referer: LIST_URL,
        },
      },
      10000,
    );
    if (!response.ok) throw new Error(`detail ${response.status}`);
    const html = await response.text();
    return {
      detailUrl,
      detailTitle: extractMetaContent(html, "title"),
      detailKeywords: extractMetaContent(html, "keywords"),
      detailDescription: extractMetaContent(html, "description"),
    };
  } catch (error) {
    return {
      detailUrl,
      detailTitle: "",
      detailKeywords: "",
      detailDescription: "",
      detailError: error.message,
    };
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

function inferBrand(name) {
  const pairs = [
    ["삼성전자", /삼성전자|Samsung/i],
    ["SK hynix", /SK하이닉스|SK hynix|하이닉스/i],
    ["Micron Crucial", /마이크론|Crucial|Micron/i],
    ["ESSENCORE KLEVV", /ESSENCORE|KLEVV/i],
    ["TeamGroup", /TeamGroup|T-Force/i],
    ["G.SKILL", /G\.?SKILL|지스킬/i],
    ["CORSAIR", /CORSAIR|커세어/i],
    ["ADATA", /ADATA|XPG/i],
    ["GeIL", /GeIL/i],
    ["Kingston", /Kingston|FURY/i],
    ["PNY", /PNY/i],
    ["Apacer", /Apacer/i],
  ];
  return pairs.find(([, pattern]) => pattern.test(name))?.[0] || String(name || "").split(/\s+/)[0] || "Unknown";
}

function inferMemoryType(text) {
  return text.match(/DDR[45]/i)?.[0]?.toUpperCase() || "";
}

function parseRamSpecs(name, specText) {
  const text = `${name}|${specText}`;
  const parenthesizedKit =
    text.match(/(\d+)\s*GB\s*\(\s*(\d+)\s*(?:GB|G)\s*[xX×]\s*(\d+)\s*\)/i) ||
    text.match(/\(\s*(\d+)\s*GB\s*\(\s*(\d+)\s*(?:GB|G)\s*[xX×]\s*(\d+)\s*\)\s*\)/i);
  const explicitKit = text.match(/(\d+)\s*GB\s*[xX×]\s*(\d+)/i);
  const capacityGb = parenthesizedKit
    ? Number(parenthesizedKit[2]) * Number(parenthesizedKit[3])
    : explicitKit
      ? Number(explicitKit[1]) * Number(explicitKit[2])
      : parseFirstNumber(text, /(\d+)\s*GB/i);
  const moduleGb = parenthesizedKit
    ? Number(parenthesizedKit[2])
    : explicitKit
      ? Number(explicitKit[1])
      : capacityGb;
  const moduleCount = parenthesizedKit ? Number(parenthesizedKit[3]) : explicitKit ? Number(explicitKit[2]) : 1;

  return {
    capacityGb,
    speedMt:
      parseFirstNumber(text, /(\d{4})\s*MHz/i) ||
      parseFirstNumber(text, /DDR[45][-\s]*(\d{4})/i) ||
      parseFirstNumber(text, /PC[45]-\d+\s*\/\s*(\d{4})/i),
    modules: moduleGb && moduleCount ? `${moduleGb}GB x${moduleCount}` : "",
    moduleGb: moduleGb || null,
    moduleCount: moduleCount || null,
    memoryType: inferMemoryType(text),
    casLatency: parseFirstNumber(text, /CL\s*(\d{2,3})/i),
    voltage: parseFirstNumber(text, /(\d(?:\.\d+)?)\s*V/i),
    hasHeatsink: /방열판|히트싱크|heatsink/i.test(text),
    hasRgb: /RGB|LED\s*라이트/i.test(text),
    isServerEcc: /RDIMM|LRDIMM|Registered|REG\s*ECC|ECC\s*REG|서버용/i.test(text),
    isXmp: /XMP/i.test(text),
    isExpo: /EXPO/i.test(text),
  };
}

function makeQuality(product, row, detail) {
  const flags = [];
  const reviewReasons = [];
  const specs = product.specs || {};
  const price = product.sourceData.price;
  const rawText = product.sourceData.rawSpecText || "";
  const hardRejectReasons = [];
  const softWarnings = [];
  const referenceOnlyReasons = [];

  if (!price) {
    flags.push("missingPrice");
    reviewReasons.push("가격 정보가 없습니다.");
  }
  if (!specs.memoryType) {
    flags.push("missingMemoryType");
    reviewReasons.push("DDR4/DDR5 규격을 파싱하지 못했습니다.");
  }
  if (!specs.capacityGb) {
    flags.push("missingCapacity");
    reviewReasons.push("RAM 용량을 파싱하지 못했습니다.");
  }
  if (!specs.speedMt) {
    flags.push("missingSpeed");
    reviewReasons.push("RAM 클럭을 파싱하지 못했습니다.");
  }
  if (/노트북|SO-?DIMM|SODIMM/i.test(rawText) || /노트북|SO-?DIMM|SODIMM/i.test(product.name)) {
    flags.push("notDesktopRam");
  }
  if (/중고|리퍼|벌크/i.test(product.name)) {
    flags.push("usedOrBulk");
  }
  if (/서버용|REG\s*ECC|ECC\s*REG|Registered|RDIMM|LRDIMM/i.test(rawText) || specs.isServerEcc) {
    flags.push("serverOrEccRam");
  }
  if (price && price < 10000) flags.push("suspiciousLowPrice");
  if (price && price > 1000000) flags.push("suspiciousHighPrice");

  if (!price || price < 10000) hardRejectReasons.push("가격이 없거나 10,000원 미만입니다.");
  if (!specs.memoryType) hardRejectReasons.push("DDR4/DDR5 규격 정보가 없습니다.");
  if (!specs.capacityGb || specs.capacityGb < 16) hardRejectReasons.push("RAM 용량이 16GB 미만이거나 없습니다.");
  if (specs.capacityGb && specs.capacityGb > 128) hardRejectReasons.push("RAM 용량이 일반 디자이너 PC 추천 범위를 벗어납니다.");
  if (flags.includes("notDesktopRam")) hardRejectReasons.push("데스크탑용 RAM이 아닐 가능성이 있습니다.");
  if (flags.includes("serverOrEccRam")) hardRejectReasons.push("서버/ECC RAM이라 일반 조립 PC 추천 범위에서 제외합니다.");
  if (flags.includes("usedOrBulk")) hardRejectReasons.push("중고/리퍼/벌크 상품입니다.");

  if (price && price > 400000) softWarnings.push("일반 디자이너용 RAM 기준으로 가격이 높은 편입니다.");
  if (!specs.speedMt) softWarnings.push("클럭 정보가 없어 같은 용량 안에서 비교 보정이 필요합니다.");
  if (specs.moduleCount === 1 && specs.capacityGb >= 32) {
    softWarnings.push("단일 모듈 구성이라 듀얼채널 구성을 별도로 확인해야 합니다.");
  }
  if (specs.hasRgb) softWarnings.push("RGB/튜닝 요소가 있어 같은 스펙 대비 가격을 비교해야 합니다.");

  if (price && price > 600000) referenceOnlyReasons.push("고가 RAM이라 특수 대용량 작업 참고용으로 분류합니다.");
  if (specs.capacityGb && specs.capacityGb >= 128) referenceOnlyReasons.push("128GB급 RAM은 일반 추천보다 대용량 작업 참고용에 가깝습니다.");

  const hardRejected = hardRejectReasons.length > 0;
  const referenceOnly = !hardRejected && referenceOnlyReasons.length > 0;
  const trustedBrand = /삼성|samsung|sk\s*hynix|sk하이닉스|하이닉스/i.test(`${product.brand} ${product.name}`);
  const generalDesignerFit =
    !hardRejected &&
    !referenceOnly &&
    specs.capacityGb >= 16 &&
    specs.capacityGb <= 64 &&
    price <= 400000;
  const specConfidence =
    specs.memoryType && specs.capacityGb && specs.speedMt ? "high" : specs.memoryType && specs.capacityGb ? "medium" : "low";

  return {
    flags: [...new Set(flags)],
    reviewReasons,
    qualityScore: Math.max(
      0,
      Math.round((100 - hardRejectReasons.length * 18 - softWarnings.length * 5 - referenceOnlyReasons.length * 10) * 10) / 10,
    ),
    recommendationEligibility: {
      hardRejected,
      referenceOnly,
      generalDesignerFit,
      trustedBrand,
      specConfidence,
      hardRejectReasons,
      softWarnings,
      referenceOnlyReasons,
    },
    specCompleteness: {
      price: Boolean(price),
      memoryType: Boolean(specs.memoryType),
      capacityGb: Boolean(specs.capacityGb),
      speedMt: Boolean(specs.speedMt),
      moduleConfig: Boolean(specs.modules),
      detailMeta: Boolean(detail.detailKeywords || detail.detailDescription),
    },
    rawRowMeta: {
      goodsState: row.goodsState || "",
      productDisplayYN: row.productDisplayYN || "",
      priceCompareServiceYN: row.priceCompareServiceYN || "",
      type: row.type || "",
    },
  };
}

function toProduct(row, detail) {
  const name = stripTags(row.goodsName || row.productName || row.name);
  const rawSimple = stripTags(row.simpleDescription || row.addDescription || "");
  const rawAdd = stripTags(row.addDescription || "");
  const rawSpecText = [name, rawSimple, rawAdd, detail.detailDescription, detail.detailKeywords].filter(Boolean).join("|");
  const specs = parseRamSpecs(name, rawSpecText);
  const price = parsePrice(row.goodsPrice);
  const idSafeName = makeIdSafeName(name);
  const product = {
    id: `shop_danawa_ram_${idSafeName}_${row.productCode || row.productSeq || row.goodsSeq}`,
    category: "ram",
    name,
    brand: inferBrand(name),
    specs,
    sourceData: {
      source: "shop-danawa",
      sourceProductId: String(row.productCode || row.productSeq || row.goodsSeq || ""),
      productSeq: String(row.productSeq || row.billingInternalProductSeq || ""),
      productUrl: detail.detailUrl,
      price,
      priceStatus: price ? "shopLive" : "unknown",
      crawledAt: CRAWLED_AT,
      rawName: name,
      rawSpecText,
      rawSimpleDescription: rawSimple,
      rawAddDescription: rawAdd,
      priceModifyDate: row.priceModifyDate || "",
      goodsUpdateDate: row.goodsUpdateDate || "",
      goodsQuantity: row.goodsQuantity || "",
      makerCode: row.makerCode || "",
      brandCode: row.brandCode || "",
      serviceSectionSeq: row.serviceSectionSeq || "596",
      productRegisterAreaGroupSeq: row.productRegisterAreaGroupSeq || "100",
      detailTitle: detail.detailTitle,
      detailDescription: detail.detailDescription,
      detailKeywords: detail.detailKeywords,
      detailError: detail.detailError || "",
    },
  };

  product.sourceData.qualityFlags = makeQuality(product, row, detail);
  return product;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const firstPage = await fetchRamListPage(1);
  const limit = Math.max(firstPage.pageCount || 90, 90);
  const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / limit));
  const rows = [...firstPage.rows];

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await fetchRamListPage(page, limit);
    rows.push(...result.rows);
  }

  const uniqueRows = rows.filter((row, index, array) => {
    const key = row.productCode || row.productSeq || row.goodsSeq || `${row.goodsName}-${row.goodsPrice}`;
    return array.findIndex((item) => (item.productCode || item.productSeq || item.goodsSeq || `${item.goodsName}-${item.goodsPrice}`) === key) === index;
  });

  const details = await mapLimit(uniqueRows, 3, fetchDetailMeta);
  const products = uniqueRows.map((row, index) => toProduct(row, details[index]));
  const payload = {
    collectedAt: CRAWLED_AT,
    source: "shop-danawa",
    sourceUrl: LIST_URL,
    criteria: {
      category: "ram",
      serviceSectionSeq: 596,
      categorySeq1: 861,
      categorySeq2: 874,
      note: "샵다나와 RAM 카테고리에서 DDR4/DDR5를 함께 수집한 프로토타입용 실제 데이터입니다.",
    },
    products,
  };

  await fs.writeFile(JSON_OUTPUT, JSON.stringify(payload, null, 2));
  await fs.writeFile(JS_OUTPUT, `window.cpuMasterShopDanawaRamLiveData = ${JSON.stringify(payload, null, 2)};\n`);

  const ddrCounts = products.reduce((acc, product) => {
    const type = product.specs.memoryType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  console.log(
    JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        productCount: products.length,
        pricedCount: products.filter((product) => product.sourceData.price).length,
        ddrCounts,
        specReadyCount: products.filter(
          (product) => product.specs.memoryType && product.specs.capacityGb && product.specs.speedMt,
        ).length,
        outputs: [JSON_OUTPUT, JS_OUTPUT],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
