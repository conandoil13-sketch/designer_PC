import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const JSON_OUTPUT = path.join(OUTPUT_DIR, "shopSsd.json");
const JS_OUTPUT = "shopDanawaSsdLiveData.js";
const CRAWLED_AT = new Date().toISOString();
const LIST_URL =
  "https://shop.danawa.com/main/?controller=goods&methods=index&productRegisterAreaGroupSeq=100&serviceSectionSeq=604#11";
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
  url.searchParams.set("serviceSectionSeq", product.serviceSectionSeq || "604");
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

async function fetchSsdListPage(page = 1, limit = 90) {
  const params = new URLSearchParams({
    marketPlaceSeq: "29",
    page: String(page),
    productListType: "LIST",
    cartDisplayYN: "Y",
    compareList: "",
    registerSectionSeq: "142",
    serviceSectionSeq: "604",
    categorySeq1: "861",
    categorySeq2: "32617",
    category1: "100",
    category2: "604",
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
    throw new Error(`Shop Danawa SSD list failed: ${response.status}`);
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
    ["Solidigm", /Solidigm|솔리다임/i],
    ["WD", /Western\s*Digital|WD\s|샌디스크|Sandisk/i],
    ["Micron Crucial", /마이크론|Crucial|Micron/i],
    ["KIOXIA", /키오시아|KIOXIA/i],
    ["Seagate", /Seagate|씨게이트/i],
    ["Kingston", /Kingston/i],
    ["ADATA", /ADATA|XPG/i],
    ["ESSENCORE KLEVV", /ESSENCORE|KLEVV/i],
    ["TeamGroup", /TeamGroup|T-Force/i],
    ["PNY", /PNY/i],
    ["PATRIOT", /PATRIOT/i],
  ];
  return pairs.find(([, pattern]) => pattern.test(name))?.[0] || String(name || "").split(/\s+/)[0] || "Unknown";
}

function parseCapacity(text) {
  const cleaned = String(text || "")
    .replace(/TBW\s*:?\s*\d[\d,]*(?:\.\d+)?\s*TB/gi, " ")
    .replace(/보증\s*쓰기\s*:?\s*\d[\d,]*(?:\.\d+)?\s*TB/gi, " ");
  const tb = parseFirstNumber(cleaned, /(\d+(?:\.\d+)?)\s*TB(?!W)/i);
  if (tb) return { capacityTb: tb, capacityGb: tb * 1024 };
  const gb = parseFirstNumber(cleaned, /(\d{3,4})\s*GB/i);
  return { capacityTb: gb ? Math.round((gb / 1024) * 100) / 100 : null, capacityGb: gb || null };
}

function inferInterface(text) {
  if (/PCIe\s*5\.0|PCIe5\.0|Gen5/i.test(text)) return "PCIe5.0";
  if (/PCIe\s*4\.0|PCIe4\.0|Gen4/i.test(text)) return "PCIe4.0";
  if (/PCIe\s*3\.0|PCIe3\.0|Gen3/i.test(text)) return "PCIe3.0";
  if (/NVMe/i.test(text)) return "NVMe";
  if (/SATA/i.test(text)) return "SATA";
  return "";
}

function parseSsdSpecs(name, specText) {
  const text = `${name}|${specText}`;
  const capacity = parseCapacity(text);
  return {
    ...capacity,
    readMb:
      parseFirstNumber(text, /(?:읽기|순차읽기)\s*:?\s*(\d[\d,]{2,6})\s*MB\/s/i) ||
      parseFirstNumber(text, /읽기\D*(\d[\d,]{2,6})/i),
    writeMb:
      parseFirstNumber(text, /(?:쓰기|순차쓰기)\s*:?\s*(\d[\d,]{2,6})\s*MB\/s/i) ||
      parseFirstNumber(text, /쓰기\D*(\d[\d,]{2,6})/i),
    formFactor: text.match(/M\.2\s*\(?2280\)?/i)?.[0] || text.match(/2\.5\s*인치/i)?.[0] || "",
    interfaceType: inferInterface(text),
    protocol: /NVMe/i.test(text) ? "NVMe" : /SATA/i.test(text) ? "SATA" : "",
    hasDram: /DRAM\s*탑재|DRAM\s*캐시|DDR[34]\s*캐시/i.test(text),
    hasHeatsink: /히트싱크|방열판/i.test(text),
    nandType: text.match(/TLC|QLC|MLC/i)?.[0]?.toUpperCase() || "",
    tbw: parseFirstNumber(text, /TBW\s*:?\s*(\d[\d,]{2,6})\s*TB/i),
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
  if (!specs.capacityTb) {
    flags.push("missingCapacity");
    reviewReasons.push("SSD 용량을 파싱하지 못했습니다.");
  }
  if (!specs.interfaceType) {
    flags.push("missingInterface");
    reviewReasons.push("SSD 인터페이스를 파싱하지 못했습니다.");
  }
  if (!specs.readMb || !specs.writeMb) {
    flags.push("missingSpeed");
    reviewReasons.push("읽기/쓰기 속도를 파싱하지 못했습니다.");
  }
  if (/외장|USB|케이스|인클로저|어댑터|도킹|중고|리퍼/i.test(product.name)) {
    flags.push("notInternalSsd");
  }
  if (/SATA/i.test(rawText) || specs.interfaceType === "SATA") {
    flags.push("sataSsd");
  }
  if (price && price < 30000) flags.push("suspiciousLowPrice");
  if (price && price > 1000000) flags.push("suspiciousHighPrice");

  if (!price || price < 30000) hardRejectReasons.push("가격이 없거나 30,000원 미만입니다.");
  if (!specs.capacityTb || specs.capacityTb < 1) hardRejectReasons.push("SSD 용량이 1TB 미만이거나 없습니다.");
  if (specs.capacityTb && specs.capacityTb > 8) hardRejectReasons.push("SSD 용량이 일반 디자이너 PC 추천 범위를 벗어납니다.");
  if (flags.includes("notInternalSsd")) hardRejectReasons.push("내장 SSD가 아닐 가능성이 있습니다.");
  if (flags.includes("sataSsd")) hardRejectReasons.push("SATA SSD라 현재 추천 풀에서는 제외합니다.");
  if (specs.readMb && specs.readMb < 2500) hardRejectReasons.push("읽기 속도가 NVMe 작업용 기준보다 낮습니다.");
  if (specs.writeMb && specs.writeMb < 1500) hardRejectReasons.push("쓰기 속도가 작업 캐시용 기준보다 낮습니다.");

  if (price && price > 500000) softWarnings.push("일반 디자이너용 SSD 기준으로 가격이 높은 편입니다.");
  if (specs.capacityTb && specs.capacityTb >= 4) softWarnings.push("4TB 이상은 파일 축적형 사용자에게 유리하지만 예산 대비 필요성을 확인해야 합니다.");
  if (specs.interfaceType === "PCIe5.0") softWarnings.push("PCIe 5.0 SSD는 빠르지만 발열과 가격 대비 체감 효율을 확인해야 합니다.");
  if (!specs.hasDram && specs.writeMb && specs.writeMb < 4000) softWarnings.push("DRAM 캐시 여부와 지속 쓰기 성능을 확인해야 합니다.");
  if (specs.hasHeatsink) softWarnings.push("히트싱크 모델은 메인보드 방열판과 간섭이 없는지 확인해야 합니다.");

  if (price && price > 800000) referenceOnlyReasons.push("고가 SSD라 특수 대용량 작업 참고용으로 분류합니다.");
  if (specs.capacityTb && specs.capacityTb >= 8) referenceOnlyReasons.push("8TB급 SSD는 일반 추천보다 대용량 파일 보관 참고용에 가깝습니다.");

  const hardRejected = hardRejectReasons.length > 0;
  const referenceOnly = !hardRejected && referenceOnlyReasons.length > 0;
  const trustedBrand = /삼성|samsung|sk\s*hynix|sk하이닉스|하이닉스|wd|western|sandisk|crucial|마이크론|solidigm|키오시아|kioxia/i.test(
    `${product.brand} ${product.name}`,
  );
  const generalDesignerFit =
    !hardRejected &&
    !referenceOnly &&
    specs.capacityTb >= 1 &&
    specs.capacityTb <= 4 &&
    price <= 500000;
  const specConfidence =
    specs.capacityTb && specs.interfaceType && specs.readMb && specs.writeMb
      ? "high"
      : specs.capacityTb && specs.interfaceType
        ? "medium"
        : "low";

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
      capacity: Boolean(specs.capacityTb),
      interfaceType: Boolean(specs.interfaceType),
      speed: Boolean(specs.readMb && specs.writeMb),
      formFactor: Boolean(specs.formFactor),
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
  const specs = parseSsdSpecs(name, rawSpecText);
  const price = parsePrice(row.goodsPrice);
  const idSafeName = makeIdSafeName(name);
  const product = {
    id: `shop_danawa_ssd_${idSafeName}_${row.productCode || row.productSeq || row.goodsSeq}`,
    category: "ssd",
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
      serviceSectionSeq: row.serviceSectionSeq || "604",
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
  const firstPage = await fetchSsdListPage(1);
  const limit = Math.max(firstPage.pageCount || 90, 90);
  const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / limit));
  const rows = [...firstPage.rows];

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await fetchSsdListPage(page, limit);
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
      category: "ssd",
      serviceSectionSeq: 604,
      categorySeq1: 861,
      categorySeq2: 32617,
      note: "샵다나와 SSD 카테고리에서 1TB 이상 NVMe 중심 추천 풀을 만들기 위한 프로토타입용 실제 데이터입니다.",
    },
    products,
  };

  await fs.writeFile(JSON_OUTPUT, JSON.stringify(payload, null, 2));
  await fs.writeFile(JS_OUTPUT, `window.cpuMasterShopDanawaSsdLiveData = ${JSON.stringify(payload, null, 2)};\n`);

  const capacityCounts = products.reduce((acc, product) => {
    const key = product.specs.capacityTb ? `${product.specs.capacityTb}TB` : "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(
    JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        productCount: products.length,
        pricedCount: products.filter((product) => product.sourceData.price).length,
        capacityCounts,
        specReadyCount: products.filter(
          (product) => product.specs.capacityTb && product.specs.interfaceType && product.specs.readMb && product.specs.writeMb,
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
