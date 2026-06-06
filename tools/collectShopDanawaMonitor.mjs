import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const JSON_OUTPUT = path.join(OUTPUT_DIR, "shopMonitor.json");
const JS_OUTPUT = "shopDanawaMonitorLiveData.js";
const CRAWLED_AT = new Date().toISOString();
const LIST_URL =
  "https://shop.danawa.com/main/?controller=goods&methods=index&productRegisterAreaGroupSeq=101&serviceSectionSeq=606#13";
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
  url.searchParams.set("productRegisterAreaGroupSeq", product.productRegisterAreaGroupSeq || "101");
  url.searchParams.set("serviceSectionSeq", product.serviceSectionSeq || "606");
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

async function fetchMonitorListPage(page = 1, limit = 90) {
  const params = new URLSearchParams({
    marketPlaceSeq: "29",
    page: String(page),
    productListType: "LIST",
    cartDisplayYN: "Y",
    compareList: "",
    registerSectionSeq: "142",
    productRegisterAreaGroupSeq: "101",
    serviceSectionSeq: "606",
    categorySeq1: "860",
    categorySeq2: "13735",
    category1: "101",
    category2: "606",
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
    throw new Error(`Shop Danawa monitor list failed: ${response.status}`);
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
    ["LG", /LG전자|LG\s/i],
    ["Samsung", /삼성전자|Samsung/i],
    ["Dell", /DELL|Dell/i],
    ["BenQ", /BenQ|벤큐/i],
    ["ASUS", /ASUS|에이수스/i],
    ["MSI", /MSI/i],
    ["AOC", /알파스캔|AOC/i],
    ["ViewSonic", /ViewSonic|뷰소닉/i],
    ["EIZO", /EIZO|에이조/i],
    ["HP", /HP\s|휴렛/i],
    ["Lenovo", /Lenovo|레노버/i],
    ["Philips", /필립스|Philips/i],
  ];
  return pairs.find(([, pattern]) => pattern.test(name))?.[0] || String(name || "").split(/\s+/)[0] || "Unknown";
}

function inferResolution(text) {
  const explicit = text.match(/\d{3,4}\s*[xX]\s*\d{3,4}/)?.[0];
  if (explicit) return explicit.replace(/[xX]/, " x ");
  if (/5K|5120\s*x\s*2880/i.test(text)) return "5120 x 2880";
  if (/DQHD|5120\s*x\s*1440/i.test(text)) return "5120 x 1440";
  if (/WQHD\+|3840\s*x\s*1600/i.test(text)) return "3840 x 1600";
  if (/UHD|4K|3840/i.test(text)) return "3840 x 2160";
  if (/WQHD|UWQHD|3440/i.test(text)) return "3440 x 1440";
  if (/QHD|2560/i.test(text)) return "2560 x 1440";
  if (/FHD|1920/i.test(text)) return "1920 x 1080";
  return "";
}

function scoreResolutionRank(resolution) {
  const text = String(resolution || "");
  if (/5120\s*x\s*2880|5120\s*x\s*1440/.test(text)) return 5;
  if (/3840\s*x\s*2160|3840\s*x\s*1600/.test(text)) return 4;
  if (/3440\s*x\s*1440/.test(text)) return 3.4;
  if (/2560\s*x\s*1440/.test(text)) return 3;
  if (/1920\s*x\s*1080/.test(text)) return 1.8;
  return 1;
}

function parseColorPercent(text, labelPattern) {
  const pattern = new RegExp(`(?:${labelPattern})[^\\d]{0,16}(\\d{2,3})(?:\\s*%)?`, "i");
  return parseFirstNumber(text, pattern);
}

function parseMonitorSpecs(name, specText) {
  const text = `${name}|${specText}`;
  const resolution = inferResolution(text);
  const sizeInch = parseFirstNumber(text, /(\d{2}(?:\.\d+)?)\s*(?:인치|형|inch)/i);
  return {
    sizeInch,
    resolution,
    resolutionRank: scoreResolutionRank(resolution),
    refreshHz: parseFirstNumber(text, /(\d{2,3})\s*Hz/i),
    panelType: text.match(/IPS\s*Black/i)?.[0] || text.match(/Nano\s*IPS/i)?.[0] || text.match(/IPS|OLED|VA|TN/i)?.[0] || "",
    srgb: parseColorPercent(text, "sRGB"),
    dcip3: parseColorPercent(text, "DCI\\s*-?\\s*P3|DCI-P3"),
    adobeRgb: parseColorPercent(text, "Adobe\\s*RGB"),
    deltaE: parseFirstNumber(text, /Delta\s*E\s*[<≤]?\s*(\d(?:\.\d)?)/i),
    brightnessNit:
      parseFirstNumber(text, /밝기\s*:?\s*(\d{2,4})\s*(?:cd|니트|nit)/i) ||
      parseFirstNumber(text, /(\d{2,4})\s*(?:cd\/㎡|nit|니트)/i),
    isUltrawide: /울트라와이드|UltraWide|21\s*:\s*9|32\s*:\s*9|3440\s*x\s*1440|5120\s*x\s*1440/i.test(text),
    hasUsbC: /USB\s*Type-?C|USB-C|Type-C/i.test(text),
    hasPivot: /피벗|pivot/i.test(text),
    hasHeightAdjust: /높낮이|엘리베이션|HAS|height/i.test(text),
    hasFactoryCalibration: /공장\s*캘리브레이션|팩토리\s*캘리브레이션|Calibrated|캘리브레이션/i.test(text),
    isPortable: /휴대용|포터블|portable/i.test(text),
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
  if (!specs.sizeInch) {
    flags.push("missingSize");
    reviewReasons.push("화면 크기를 파싱하지 못했습니다.");
  }
  if (!specs.resolution) {
    flags.push("missingResolution");
    reviewReasons.push("해상도를 파싱하지 못했습니다.");
  }
  if (!specs.panelType) {
    flags.push("missingPanel");
    reviewReasons.push("패널 정보를 파싱하지 못했습니다.");
  }
  if (!specs.srgb && !specs.dcip3 && !specs.adobeRgb) {
    flags.push("missingColorGamut");
    reviewReasons.push("색역 정보를 파싱하지 못했습니다.");
  }
  if (/TV|사이니지|전자칠판|키오스크|보호필름|모니터암|암\s*스탠드|케이블|중고|리퍼/i.test(product.name)) {
    flags.push("notMonitorCandidate");
  }
  if (specs.isPortable) flags.push("portableMonitor");
  if (price && price < 100000) flags.push("suspiciousLowPrice");
  if (price && price > 3000000) flags.push("suspiciousHighPrice");

  if (!price || price < 100000) hardRejectReasons.push("가격이 없거나 100,000원 미만입니다.");
  if (price && price > 3000000) hardRejectReasons.push("가격이 일반 디자이너용 모니터 추천 범위를 벗어납니다.");
  if (!specs.sizeInch || specs.sizeInch < 27) hardRejectReasons.push("27인치 미만이거나 크기 정보가 없습니다.");
  if (!specs.resolution) hardRejectReasons.push("해상도 정보가 없습니다.");
  if (specs.resolution && specs.resolutionRank < 3) hardRejectReasons.push("QHD 미만 해상도라 현재 추천 풀에서는 제외합니다.");
  if (flags.includes("notMonitorCandidate")) hardRejectReasons.push("모니터 본체가 아닌 상품이거나 추천 범위 밖 상품입니다.");
  if (flags.includes("portableMonitor")) hardRejectReasons.push("휴대용 모니터라 작업용 메인 모니터 추천에서 제외합니다.");

  if (!specs.srgb && !specs.dcip3 && !specs.adobeRgb) softWarnings.push("색역 정보가 없어 색 작업 적합도 판단에 보정이 필요합니다.");
  if (specs.refreshHz && specs.refreshHz >= 144) softWarnings.push("고주사율 제품이라 영상/게임성 비용이 포함됐는지 확인해야 합니다.");
  if (specs.panelType && /VA|TN/i.test(specs.panelType)) softWarnings.push("색·시야각 작업에서는 IPS/OLED 대비 확인이 필요합니다.");
  if (specs.isUltrawide) softWarnings.push("울트라와이드 제품은 작업공간에는 유리하지만 책상 공간과 호환을 확인해야 합니다.");
  if (price && price > 1500000) softWarnings.push("고가 모니터라 본체 예산과의 균형을 확인해야 합니다.");

  if (price && price > 1800000) referenceOnlyReasons.push("고가 전문/대형 모니터라 일반 추천보다 참고용에 가깝습니다.");
  if ((specs.adobeRgb || 0) >= 95 || specs.hasFactoryCalibration) {
    referenceOnlyReasons.push("전문 색 작업 기준 제품이라 일반 사용자에게는 과할 수 있습니다.");
  }

  const hardRejected = hardRejectReasons.length > 0;
  const referenceOnly = !hardRejected && referenceOnlyReasons.length > 0;
  const generalDesignerFit =
    !hardRejected &&
    !referenceOnly &&
    price <= 1500000 &&
    specs.sizeInch >= 27 &&
    specs.resolutionRank >= 3;
  const specConfidence =
    specs.sizeInch && specs.resolution && specs.panelType && (specs.srgb || specs.dcip3 || specs.adobeRgb)
      ? "high"
      : specs.sizeInch && specs.resolution
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
      specConfidence,
      hardRejectReasons,
      softWarnings,
      referenceOnlyReasons,
    },
    specCompleteness: {
      price: Boolean(price),
      size: Boolean(specs.sizeInch),
      resolution: Boolean(specs.resolution),
      panel: Boolean(specs.panelType),
      color: Boolean(specs.srgb || specs.dcip3 || specs.adobeRgb),
      refresh: Boolean(specs.refreshHz),
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
  const specs = parseMonitorSpecs(name, rawSpecText);
  const price = parsePrice(row.goodsPrice);
  const idSafeName = makeIdSafeName(name);
  const product = {
    id: `shop_danawa_monitor_${idSafeName}_${row.productCode || row.productSeq || row.goodsSeq}`,
    category: "monitor",
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
      serviceSectionSeq: row.serviceSectionSeq || "606",
      productRegisterAreaGroupSeq: row.productRegisterAreaGroupSeq || "101",
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
  const firstPage = await fetchMonitorListPage(1);
  const limit = Math.max(firstPage.pageCount || 90, 90);
  const totalPages = Math.max(1, Math.ceil(firstPage.totalCount / limit));
  const rows = [...firstPage.rows];

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await fetchMonitorListPage(page, limit);
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
      category: "monitor",
      serviceSectionSeq: 606,
      categorySeq1: 860,
      categorySeq2: 13735,
      note: "샵다나와 모니터 카테고리에서 작업공간/색·선명도/영상 확인 기준을 만들기 위한 프로토타입용 실제 데이터입니다.",
    },
    products,
  };

  await fs.writeFile(JSON_OUTPUT, JSON.stringify(payload, null, 2));
  await fs.writeFile(JS_OUTPUT, `window.cpuMasterShopDanawaMonitorLiveData = ${JSON.stringify(payload, null, 2)};\n`);

  const resolutionCounts = products.reduce((acc, product) => {
    const key = product.specs.resolution || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(
    JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        productCount: products.length,
        pricedCount: products.filter((product) => product.sourceData.price).length,
        resolutionCounts,
        specReadyCount: products.filter((product) => product.specs.sizeInch && product.specs.resolution).length,
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
