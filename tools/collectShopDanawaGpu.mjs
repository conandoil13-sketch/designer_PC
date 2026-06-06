import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const JSON_OUTPUT = path.join(OUTPUT_DIR, "shopGpu.json");
const JS_OUTPUT = "shopDanawaGpuLiveData.js";
const CRAWLED_AT = new Date().toISOString();
const LIST_URL =
  "https://shop.danawa.com/main/?controller=goods&methods=index&productRegisterAreaGroupSeq=100&serviceSectionSeq=597#4";
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

function makeDetailUrl(product) {
  const url = new URL("https://shop.danawa.com/main/");
  url.searchParams.set("controller", "goods");
  url.searchParams.set("methods", "blog");
  url.searchParams.set("billingInternalProductSeq", product.productSeq);
  url.searchParams.set("productRegisterAreaGroupSeq", product.productRegisterAreaGroupSeq || "100");
  url.searchParams.set("serviceSectionSeq", product.serviceSectionSeq || "597");
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

async function fetchGpuListPage(page = 1, limit = 90) {
  const params = new URLSearchParams({
    marketPlaceSeq: "29",
    page: String(page),
    productListType: "LIST",
    cartDisplayYN: "Y",
    compareList: "",
    registerSectionSeq: "142",
    serviceSectionSeq: "597",
    categorySeq1: "861",
    categorySeq2: "876",
    category1: "100",
    category2: "597",
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
    throw new Error(`Shop Danawa GPU list failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    rows: data.goodsData?.searchList || [],
    totalCount: Number(data.goodsData?.totalCount || 0),
    pageCount: Number(data.goodsData?.count || limit),
  };
}

function extractMetaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  return decodeEntities(html.match(pattern)?.[1] || "");
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

function inferChipset(name, specText) {
  const text = `${name}|${specText}`;
  const patterns = [
    /RTX\s*5090/i,
    /RTX\s*5080/i,
    /RTX\s*5070\s*Ti/i,
    /RTX\s*5070/i,
    /RTX\s*5060\s*Ti/i,
    /RTX\s*5060/i,
    /RTX\s*4090/i,
    /RTX\s*4080\s*SUPER/i,
    /RTX\s*4080/i,
    /RTX\s*4070\s*Ti\s*SUPER/i,
    /RTX\s*4070\s*Ti/i,
    /RTX\s*4070\s*SUPER/i,
    /RTX\s*4070/i,
    /RTX\s*4060\s*Ti/i,
    /RTX\s*4060/i,
    /RX\s*9070\s*XT/i,
    /RX\s*9070/i,
    /RX\s*9060\s*XT/i,
    /RX\s*9060/i,
    /RX\s*7900\s*XTX/i,
    /RX\s*7900\s*XT/i,
    /RX\s*7800\s*XT/i,
    /RX\s*7700\s*XT/i,
    /RX\s*7600\s*XT/i,
    /RX\s*7600/i,
    /RTX\s*PRO\s*[^|/]+/i,
    /Quadro\s*[^|/]+/i,
    /TITAN\s*[^|/]+/i,
  ];
  return patterns.find((pattern) => pattern.test(text))?.exec(text)?.[0].replace(/\s+/g, " ").trim() || "";
}

function inferMemoryType(text) {
  if (/GDDR7|D7/i.test(text)) return "GDDR7";
  if (/GDDR6X|D6X/i.test(text)) return "GDDR6X";
  if (/GDDR6|D6/i.test(text)) return "GDDR6";
  if (/HBM/i.test(text)) return "HBM";
  return "";
}

function parseGpuSpecs(name, specText) {
  const text = `${name}|${specText}`;
  const chipset = inferChipset(name, specText);

  return {
    chipset,
    vramGb: parseFirstNumber(text, /(\d+)\s*GB/i),
    memoryType: inferMemoryType(text),
    busBit: parseFirstNumber(text, /(\d{2,3})\s*[- ]?bit/i),
    cudaCores: parseFirstNumber(text, /스트림\s*프로세서\s*:?\s*(\d{3,5})/i),
    aiTops: parseFirstNumber(text, /최대\s*AI\s*TOPS\s*:?\s*(\d{2,5})/i),
    tdpW: parseFirstNumber(text, /사용전력\s*:?\s*(\d{2,4})\s*W/i),
    recommendedPsuW: parseFirstNumber(text, /(\d{3,4})\s*W\s*이상/i),
    fanCount: parseFirstNumber(text, /(\d)\s*팬/i),
    lengthMm: parseFirstNumber(text, /가로(?:\(길이\))?\s*:?\s*(\d{2,4}(?:\.\d+)?)\s*mm/i),
    thicknessMm: parseFirstNumber(text, /두께\s*:?\s*(\d{2,4}(?:\.\d+)?)\s*mm/i),
    boostMhz: parseFirstNumber(text, /부스트클럭\s*:?\s*(\d{3,5})\s*MHz/i),
    ocMhz: parseFirstNumber(text, /OC클럭\s*:?\s*(\d{3,5})\s*MHz/i),
    powerConnector: text.match(/전원\s*포트\s*:?\s*([^|/]+)/i)?.[1]?.trim() || "",
    pcie: text.match(/PCIe[\d.]+x\d+(?:\(at x\d+\))?/i)?.[0] || "",
    outputPorts: text.match(/출력단자\s*:?\s*([^|]+)/i)?.[1]?.trim() || "",
    isBlower: /블로워팬/i.test(text),
    hasZeroFan: /제로팬|0-dB/i.test(text),
  };
}

function isNvidia(product) {
  return /NVIDIA|지포스|GeForce|RTX|GTX/i.test(`${product.name} ${product.specs?.chipset || ""}`);
}

function isAmd(product) {
  return /AMD|라데온|Radeon|RX\s/i.test(`${product.name} ${product.specs?.chipset || ""}`);
}

function isAllowedServiceGpu(product) {
  const chipset = product.specs?.chipset || "";
  return [
    /RTX\s*4070\s*Ti\s*SUPER/i,
    /RTX\s*4070\s*Ti/i,
    /RTX\s*4070\s*SUPER/i,
    /RTX\s*4070/i,
    /RTX\s*4080\s*SUPER/i,
    /RTX\s*4080/i,
    /RTX\s*4090/i,
    /RTX\s*5070\s*Ti/i,
    /RTX\s*5070/i,
    /RTX\s*5080/i,
    /RTX\s*5090/i,
    /RX\s*7800\s*XT/i,
    /RX\s*7900\s*XTX/i,
    /RX\s*7900\s*XT/i,
    /RX\s*9070\s*XT/i,
    /RX\s*9070/i,
  ].some((pattern) => pattern.test(chipset));
}

function makeQuality(product, row, detail) {
  const flags = [];
  const reviewReasons = [];
  const specs = product.specs || {};
  const price = product.sourceData.price;
  const rawText = product.sourceData.rawSpecText || "";

  if (!price) {
    flags.push("missingPrice");
    reviewReasons.push("가격 정보가 없습니다.");
  }
  if (!specs.chipset) {
    flags.push("missingChipset");
    reviewReasons.push("GPU 칩셋을 파싱하지 못했습니다.");
  }
  if (!specs.vramGb) {
    flags.push("missingVram");
    reviewReasons.push("VRAM 용량을 파싱하지 못했습니다.");
  }
  if (!specs.cudaCores && isNvidia(product)) {
    flags.push("missingCudaOrStreamProcessor");
    reviewReasons.push("NVIDIA 계열의 스트림/CUDA 코어 정보를 파싱하지 못했습니다.");
  }
  if (!specs.tdpW) {
    flags.push("missingPowerSpec");
    reviewReasons.push("사용전력 정보를 파싱하지 못했습니다.");
  }
  if (!specs.lengthMm) {
    flags.push("missingLength");
    reviewReasons.push("그래픽카드 길이 정보를 파싱하지 못했습니다.");
  }
  if (!specs.fanCount) {
    flags.push("missingFanCount");
    reviewReasons.push("팬 개수를 파싱하지 못했습니다.");
  }
  if (detail.detailError) {
    flags.push("detailFetchFailed");
    reviewReasons.push("상품 상세 페이지 보강에 실패했습니다.");
  }
  if (/중고|리퍼/i.test(product.name)) {
    flags.push("usedOrRefurbished");
    reviewReasons.push("중고/리퍼 상품은 일반 추천 후보에서 분리 검토해야 합니다.");
  }
  if (/워터블럭|수랭블럭|백플레이트|쿨러|브라켓|지지대|라이저|케이블|중고|리퍼|벌크/i.test(product.name)) {
    flags.push("possibleAccessory");
    reviewReasons.push("그래픽카드 단품이 아닌 액세서리일 가능성이 있습니다.");
  }
  if (/조립PC|게이밍PC|컴퓨터|본체|OS미포함|미들타워/i.test(rawText)) {
    flags.push("possibleNonGpuMixedSpec");
    reviewReasons.push("그래픽카드 단품이 아닌 완제품 PC 스펙이 섞였을 가능성이 있습니다.");
  }
  if (isAmd(product)) {
    flags.push("amdGpuCudaCaution");
  }
  if (!isAllowedServiceGpu(product)) {
    flags.push("belowServiceGpuRange");
  }
  if (price && price < 400000) flags.push("suspiciousLowPrice");
  if (price && price > 5000000) flags.push("suspiciousHighPrice");

  const hardRejectReasons = [];
  const softWarnings = [];
  const referenceOnlyReasons = [];

  if (!price || price < 400000) hardRejectReasons.push("가격이 없거나 400,000원 미만입니다.");
  if (price && price > 5000000) hardRejectReasons.push("가격이 5,000,000원을 초과합니다.");
  if (!specs.chipset) hardRejectReasons.push("GPU 칩셋 정보가 없습니다.");
  if (!specs.vramGb || specs.vramGb < 12) hardRejectReasons.push("VRAM이 12GB 미만이거나 없습니다.");
  if (specs.vramGb && specs.vramGb > 32) hardRejectReasons.push("VRAM이 32GB를 초과해 일반 소비자용 추천 범위를 벗어납니다.");
  if (isNvidia(product) && specs.cudaCores && specs.cudaCores < 5500) {
    hardRejectReasons.push("CUDA/스트림 프로세서 수가 4070급 기준보다 낮습니다.");
  }
  if (isNvidia(product) && specs.cudaCores && specs.cudaCores > 25000) {
    hardRejectReasons.push("CUDA/스트림 프로세서 수가 일반 소비자 GPU 범위를 벗어납니다.");
  }
  if (flags.includes("usedOrRefurbished")) hardRejectReasons.push("중고/리퍼 상품입니다.");
  if (flags.includes("possibleAccessory")) hardRejectReasons.push("그래픽카드 액세서리일 가능성이 있습니다.");
  if (flags.includes("possibleNonGpuMixedSpec")) hardRejectReasons.push("그래픽카드 단품이 아닐 가능성이 있습니다.");
  if (specs.tdpW && specs.tdpW < 150) hardRejectReasons.push("사용전력이 4070급 이상 GPU 기준보다 낮습니다.");
  if (specs.tdpW && specs.tdpW > 600) hardRejectReasons.push("사용전력이 600W를 초과합니다.");
  if (specs.recommendedPsuW && specs.recommendedPsuW < 550) {
    hardRejectReasons.push("권장 파워가 4070급 이상 GPU 기준보다 낮습니다.");
  }
  if (specs.recommendedPsuW && specs.recommendedPsuW > 1200) {
    hardRejectReasons.push("권장 파워가 일반 소비자용 추천 범위를 벗어납니다.");
  }
  if (specs.lengthMm && specs.lengthMm > 420) hardRejectReasons.push("그래픽카드 길이가 일반 케이스 호환 범위를 벗어납니다.");
  if (flags.includes("belowServiceGpuRange")) {
    hardRejectReasons.push("현재 서비스의 4070급 이상 GPU 추천 범위에 포함되지 않습니다.");
  }

  if (price && price > 2500000) softWarnings.push("일반 디자이너용 PC 기준으로 그래픽카드 가격이 높은 편입니다.");
  if (specs.vramGb && specs.vramGb > 24) softWarnings.push("VRAM이 큰 특수 작업형 후보라 가격 대비 체감 효율을 확인해야 합니다.");
  if (specs.tdpW && specs.tdpW > 450) softWarnings.push("전력과 발열이 높아 파워·쿨링·소음 리뷰를 함께 확인해야 합니다.");
  if (specs.recommendedPsuW && specs.recommendedPsuW > 850) {
    softWarnings.push("권장 파워가 높아 파워 용량과 케이스 통풍을 함께 확인해야 합니다.");
  }
  if (specs.lengthMm && specs.lengthMm > 340) softWarnings.push("그래픽카드 길이가 긴 편이라 케이스 장착 여유를 확인해야 합니다.");
  if (specs.fanCount && specs.fanCount < 3 && specs.tdpW && specs.tdpW > 220) {
    softWarnings.push("고부하 GPU인데 3팬 미만이라 발열·소음 확인이 필요합니다.");
  }
  if (isAmd(product)) {
    softWarnings.push("CUDA 기반 로컬 AI·일부 GPU 렌더링 목적이라면 NVIDIA와 호환성 차이를 확인해야 합니다.");
  }
  if (!specs.lengthMm) softWarnings.push("케이스 장착 길이 확인을 위해 상세 스펙 보강이 필요합니다.");

  if (price && price > 2500000) referenceOnlyReasons.push("250만 원 초과 고가 GPU라 일반 추천 후보보다 기준/특수 작업 참고용으로 분류합니다.");
  if (/RTX\s*4090|RTX\s*5090|RTX\s*PRO|Quadro|TITAN/i.test(`${product.name} ${specs.chipset}`)) {
    referenceOnlyReasons.push("일반 디자이너 추천보다 고성능/워크스테이션 기준 제품에 가깝습니다.");
  }
  if (specs.vramGb && specs.vramGb > 24) referenceOnlyReasons.push("24GB 초과 VRAM은 일반 추천보다 특수 작업 기준에 가깝습니다.");
  if (specs.tdpW && specs.tdpW > 450) referenceOnlyReasons.push("450W 초과 GPU는 파워·쿨링 부담이 커서 참고용으로 분류합니다.");

  const hardRejected = hardRejectReasons.length > 0;
  const referenceOnly = !hardRejected && referenceOnlyReasons.length > 0;
  const generalDesignerFit =
    !hardRejected &&
    !referenceOnly &&
    price <= 1800000 &&
    specs.vramGb >= 12 &&
    specs.vramGb <= 16 &&
    (!specs.tdpW || specs.tdpW <= 350);
  const qualityScore = Math.max(
    0,
    Math.round((100 - hardRejectReasons.length * 18 - softWarnings.length * 5 - referenceOnlyReasons.length * 10) * 10) / 10,
  );

  return {
    flags: [...new Set(flags)],
    reviewReasons,
    qualityScore,
    recommendationEligibility: {
      hardRejected,
      referenceOnly,
      generalDesignerFit,
      hardRejectReasons,
      softWarnings,
      referenceOnlyReasons,
    },
    specCompleteness: {
      price: Boolean(price),
      chipset: Boolean(specs.chipset),
      vramGb: Boolean(specs.vramGb),
      streamProcessor: Boolean(specs.cudaCores),
      memoryType: Boolean(specs.memoryType),
      power: Boolean(specs.tdpW),
      length: Boolean(specs.lengthMm),
      fanCount: Boolean(specs.fanCount),
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
  const rawSpecText =
    detail.detailKeywords ||
    detail.detailDescription ||
    row.simpleDescription ||
    row.addDescription ||
    "";
  const name = row.goodsName;
  const specs = parseGpuSpecs(name, rawSpecText);
  const idSafeName = makeIdSafeName(name);
  const product = {
    id: `shop_danawa_gpu_${idSafeName}_${row.goodsSeq}`,
    category: "gpu",
    name,
    brand: row.makerName || "",
    chipBrand: isAmd({ name, specs }) ? "AMD" : "NVIDIA",
    boardPartner: row.makerName || name.split(" ")[0],
    chipset: specs.chipset,
    specs,
    sourceData: {
      source: "shop-danawa",
      sourceProductId: row.goodsSeq,
      productSeq: row.productSeq,
      productUrl: detail.detailUrl,
      price: parsePrice(row.goodsPrice),
      priceStatus: "shopLive",
      crawledAt: CRAWLED_AT,
      rawName: name,
      rawSpecText,
      rawSimpleDescription: row.simpleDescription || "",
      rawAddDescription: row.addDescription || "",
      priceModifyDate: row.priceModifyDate || "",
      goodsUpdateDate: row.goodsUpdateDate || "",
      goodsQuantity: row.goodsQuantity || "",
      makerCode: row.makerCode || "",
      brandCode: row.brandCode || "",
      serviceSectionSeq: row.serviceSectionSeq || "",
      productRegisterAreaGroupSeq: row.productRegisterAreaGroupSeq || "",
      detailTitle: detail.detailTitle || "",
      detailDescription: detail.detailDescription || "",
      detailKeywords: detail.detailKeywords || "",
      detailError: detail.detailError || "",
    },
  };

  product.sourceData.qualityFlags = makeQuality(product, row, detail);
  return product;
}

async function main() {
  const firstPage = await fetchGpuListPage(1, 90);
  const rows = [...firstPage.rows];
  const totalCount = firstPage.totalCount || firstPage.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 90));

  for (let page = 2; page <= totalPages; page += 1) {
    const pageData = await fetchGpuListPage(page, 90);
    rows.push(...pageData.rows);
  }

  const seen = new Set();
  const uniqueRows = rows.filter((row) => {
    const key = row.goodsSeq || row.productSeq || row.goodsName;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const details = await mapLimit(uniqueRows, 3, (row) => fetchDetailMeta(row));
  const products = uniqueRows.map((row, index) => toProduct(row, details[index]));

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    JSON_OUTPUT,
    `${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "shop-danawa-goods",
        criteria: {
          category: "gpu",
          listUrl: LIST_URL,
          listApiUrl: LIST_API_URL,
          totalCount,
          totalPages,
          note: "샵다나와 그래픽카드 상품 목록 API와 상품 상세 meta 스펙을 결합한 프로토타입용 실제 수집 데이터입니다. 이미지, 리뷰, 견적/장바구니 정보는 제외했습니다.",
        },
        products,
      },
      null,
      2,
    )}\n`,
  );
  await fs.writeFile(
    JS_OUTPUT,
    `window.cpuMasterShopDanawaGpuLiveData = ${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "shop-danawa-goods",
        products,
      },
      null,
      2,
    )};\n`,
  );

  console.log(
    JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        productCount: products.length,
        pricedCount: products.filter((product) => product.sourceData.price).length,
        specReadyCount: products.filter(
          (product) => product.specs.chipset && product.specs.vramGb && product.specs.cudaCores,
        ).length,
        reviewNeededCount: products.filter(
          (product) => product.sourceData.qualityFlags.reviewReasons.length > 0,
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
  process.exitCode = 1;
});
