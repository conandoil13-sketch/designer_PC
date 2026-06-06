import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const JSON_OUTPUT = path.join(OUTPUT_DIR, "shopCpu.json");
const JS_OUTPUT = "shopDanawaCpuLiveData.js";
const CRAWLED_AT = new Date().toISOString();
const LIST_URL =
  "https://shop.danawa.com/main/?controller=goods&methods=index&productRegisterAreaGroupSeq=100&serviceSectionSeq=594#1";
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

function makeDetailUrl(product) {
  const url = new URL("https://shop.danawa.com/main/");
  url.searchParams.set("controller", "goods");
  url.searchParams.set("methods", "blog");
  url.searchParams.set("billingInternalProductSeq", product.productSeq);
  url.searchParams.set("productRegisterAreaGroupSeq", product.productRegisterAreaGroupSeq || "100");
  url.searchParams.set("serviceSectionSeq", product.serviceSectionSeq || "594");
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

async function fetchCpuListPage(page = 1, limit = 90) {
  const params = new URLSearchParams({
    marketPlaceSeq: "29",
    page: String(page),
    productListType: "LIST",
    cartDisplayYN: "Y",
    compareList: "",
    registerSectionSeq: "142",
    serviceSectionSeq: "594",
    categorySeq1: "861",
    categorySeq2: "873",
    category1: "100",
    category2: "594",
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
    throw new Error(`Shop Danawa CPU list failed: ${response.status}`);
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

function parseCpuSpecs(name, specText) {
  const text = `${name}|${specText}`;
  const peCoreMatch = text.match(/P\s*(\d+)\s*\+\s*E\s*(\d+)\s*코어/i);
  const splitThreadMatch = text.match(/(\d+)\s*\+\s*(\d+)\s*스레드/i);
  const socket =
    text.match(/AMD\s*\(소켓\s*(AM[45])\)/i)?.[1] ||
    text.match(/인텔\s*\(소켓\s*(\d{4})\)/i)?.[1] ||
    text.match(/LGA\s*\d{4}/i)?.[0]?.replace(/\s+/g, "") ||
    text.match(/AM[45]/i)?.[0] ||
    "";

  return {
    cores: peCoreMatch
      ? Number(peCoreMatch[1]) + Number(peCoreMatch[2])
      : parseFirstNumber(text, /(\d+)\s*코어/i),
    threads: splitThreadMatch
      ? Number(splitThreadMatch[1]) + Number(splitThreadMatch[2])
      : parseFirstNumber(text, /(\d+)\s*스레드/i),
    boostGhz:
      parseFirstNumber(text, /최대\s*클럭\s*:?\s*(\d(?:\.\d+)?)\s*GHz/i) ||
      parseFirstNumber(text, /부스트\s*클럭\s*:?\s*(\d(?:\.\d+)?)\s*GHz/i),
    baseGhz: parseFirstNumber(text, /기본\s*클럭\s*:?\s*(\d(?:\.\d+)?)\s*GHz/i),
    tdpW:
      parseFirstNumber(text, /TDP\s*:?\s*(\d{2,3})\s*W/i) ||
      parseFirstNumber(text, /PBP-MTP\s*:?\s*(\d{2,3})/i),
    pptW: parseFirstNumber(text, /PPT\s*:?\s*(\d{2,3})\s*W/i),
    socket: socket ? (socket.match(/^\d{4}$/) ? `LGA${socket}` : socket.toUpperCase()) : "",
    memorySpec: text.match(/메모리\s*규격\s*:?\s*([^|/]+)/i)?.[1]?.trim() || "",
    hasIntegratedGraphics: /내장그래픽\s*:?\s*탑재|라데온\s*그래픽|UHD/i.test(text) && !/미탑재/i.test(text),
    coolerIncluded: /쿨러\s*:?\s*[^|/]*포함/i.test(text) && !/쿨러\s*:?\s*미포함/i.test(text),
    cinebenchSingle: parseFirstNumber(text, /시네벤치R23\s*\(싱글\)\s*:?\s*(\d+)/i),
    cinebenchMulti: parseFirstNumber(text, /시네벤치R23\s*\(멀티\)\s*:?\s*(\d+)/i),
  };
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
  if (!specs.cores) {
    flags.push("missingCores");
    reviewReasons.push("코어 수를 파싱하지 못했습니다.");
  }
  if (!specs.threads) {
    flags.push("missingThreads");
    reviewReasons.push("스레드 수를 파싱하지 못했습니다.");
  }
  if (!specs.boostGhz) {
    flags.push("missingBoostClock");
    reviewReasons.push("최대 클럭을 파싱하지 못했습니다.");
  }
  if (!specs.socket) {
    flags.push("missingSocket");
    reviewReasons.push("CPU 소켓을 파싱하지 못했습니다.");
  }
  if (!specs.tdpW && !specs.pptW) {
    flags.push("missingPowerSpec");
    reviewReasons.push("TDP/PPT/PBP 전력 정보를 파싱하지 못했습니다.");
  }
  if (!specs.memorySpec) {
    flags.push("missingMemorySpec");
    reviewReasons.push("지원 메모리 규격을 파싱하지 못했습니다.");
  }
  if (!specs.cinebenchSingle || !specs.cinebenchMulti) {
    flags.push("missingBenchmark");
    reviewReasons.push("시네벤치 점수가 없거나 일부만 있습니다.");
  }
  if (detail.detailError) {
    flags.push("detailFetchFailed");
    reviewReasons.push("상품 상세 페이지 보강에 실패했습니다.");
  }
  if (/벌크/i.test(product.name)) {
    flags.push("bulkPackage");
    reviewReasons.push("벌크 상품이라 정품/멀티팩과 구성 차이가 있을 수 있습니다.");
  }
  if (/멀티팩/i.test(product.name)) {
    flags.push("multiPack");
  }
  if (/정품/i.test(product.name)) {
    flags.push("officialPackage");
  }
  if (/해외|병행/i.test(product.name)) {
    flags.push("parallelImport");
    reviewReasons.push("해외/병행수입 상품일 수 있어 보증 조건 확인이 필요합니다.");
  }
  if (/중고|리퍼/i.test(product.name)) {
    flags.push("usedOrRefurbished");
    reviewReasons.push("중고/리퍼 상품은 일반 추천 후보에서 분리 검토해야 합니다.");
  }
  if (price && price < 50000) {
    flags.push("suspiciousLowPrice");
    reviewReasons.push("CPU 단품 기준 가격이 지나치게 낮습니다.");
  }
  if (price && price > 2000000) {
    flags.push("suspiciousHighPrice");
    reviewReasons.push("CPU 단품 기준 가격이 지나치게 높습니다.");
  }
  if (/그래픽카드|메인보드|M\\.2|파워서플라이|미들타워|RTX|라데온 RX/i.test(rawText)) {
    flags.push("possibleNonCpuMixedSpec");
    reviewReasons.push("CPU 외 부품 키워드가 섞여 있어 단품 여부 확인이 필요합니다.");
  }

  const criticalMissing = flags.filter((flag) =>
    [
      "missingPrice",
      "missingCores",
      "missingThreads",
      "missingBoostClock",
      "missingSocket",
      "detailFetchFailed",
      "usedOrRefurbished",
      "possibleNonCpuMixedSpec",
    ].includes(flag),
  ).length;
  const warningCount = Math.max(0, reviewReasons.length - criticalMissing);
  const qualityScore = Math.max(0, Math.round((100 - criticalMissing * 18 - warningCount * 6) * 10) / 10);
  const hardRejectReasons = [];
  const softWarnings = [];
  const referenceOnlyReasons = [];

  if (!price || price < 50000) hardRejectReasons.push("가격이 없거나 50,000원 미만입니다.");
  if (!specs.cores || specs.cores < 4) hardRejectReasons.push("4코어 미만이거나 코어 수가 없습니다.");
  if (specs.cores && specs.cores > 24) hardRejectReasons.push("24코어 초과로 일반 디자이너 PC 범위를 벗어납니다.");
  if (!specs.threads || specs.threads < 4) hardRejectReasons.push("4스레드 미만이거나 스레드 수가 없습니다.");
  if (specs.threads && specs.threads > 48) hardRejectReasons.push("48스레드 초과로 일반 디자이너 PC 범위를 벗어납니다.");
  if (specs.boostGhz && (specs.boostGhz < 3.5 || specs.boostGhz > 6.5)) {
    hardRejectReasons.push("최대 클럭이 일반 추천 범위를 벗어납니다.");
  }
  if (specs.baseGhz && (specs.baseGhz < 1.5 || specs.baseGhz > 5.5)) {
    hardRejectReasons.push("기본 클럭이 일반 추천 범위를 벗어납니다.");
  }
  if (specs.tdpW && specs.tdpW > 250) hardRejectReasons.push("TDP/PBP가 250W를 초과합니다.");
  if (specs.pptW && specs.pptW > 250) hardRejectReasons.push("PPT가 250W를 초과합니다.");
  if (flags.includes("usedOrRefurbished")) hardRejectReasons.push("중고/리퍼 상품입니다.");
  if (flags.includes("possibleNonCpuMixedSpec")) hardRejectReasons.push("CPU 단품이 아닐 가능성이 있습니다.");

  if (price && price > 1000000) softWarnings.push("일반 디자이너용 PC 기준으로 가격이 높은 편입니다.");
  if (specs.cores && specs.cores > 16) softWarnings.push("16코어 초과라 영상·렌더링 외 작업에서는 과할 수 있습니다.");
  if (specs.tdpW && specs.tdpW > 170) softWarnings.push("전력과 발열이 높아 쿨링·파워 구성을 함께 확인해야 합니다.");
  if (!specs.cinebenchSingle) softWarnings.push("싱글코어 벤치 데이터가 없어 체감 반응성 판단에 보정이 필요합니다.");
  if (!specs.cinebenchMulti) softWarnings.push("멀티코어 벤치 데이터가 없어 렌더링 성능 판단에 보정이 필요합니다.");
  if (flags.includes("bulkPackage")) softWarnings.push("벌크 상품이라 구성품과 보증 조건 확인이 필요합니다.");
  if (flags.includes("parallelImport")) softWarnings.push("병행/해외 상품일 수 있어 보증 조건 확인이 필요합니다.");

  if (price && price > 1500000) {
    referenceOnlyReasons.push("150만 원 초과 고가 CPU라 일반 추천 후보보다 기준/특수 작업 참고용으로 분류합니다.");
  }

  const hardRejected = hardRejectReasons.length > 0;
  const referenceOnly = !hardRejected && referenceOnlyReasons.length > 0;
  const generalDesignerFit =
    !hardRejected &&
    !referenceOnly &&
    price <= 800000 &&
    specs.cores >= 6 &&
    specs.cores <= 16 &&
    (!specs.tdpW || specs.tdpW <= 170);

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
      cores: Boolean(specs.cores),
      threads: Boolean(specs.threads),
      boostGhz: Boolean(specs.boostGhz),
      socket: Boolean(specs.socket),
      power: Boolean(specs.tdpW || specs.pptW),
      memorySpec: Boolean(specs.memorySpec),
      cinebenchSingle: Boolean(specs.cinebenchSingle),
      cinebenchMulti: Boolean(specs.cinebenchMulti),
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
  const specs = parseCpuSpecs(name, rawSpecText);
  const idSafeName = makeIdSafeName(name);

  const product = {
    id: `shop_danawa_cpu_${idSafeName}_${row.goodsSeq}`,
    category: "cpu",
    name,
    brand: row.makerName || "",
    chipBrand: row.makerName || "",
    socket: specs.socket,
    generation: row.brandName || "",
    role: row.serviceSectionName || "CPU",
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
  const firstPage = await fetchCpuListPage(1, 90);
  const rows = [...firstPage.rows];
  const totalCount = firstPage.totalCount || firstPage.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 90));

  for (let page = 2; page <= totalPages; page += 1) {
    const pageData = await fetchCpuListPage(page, 90);
    rows.push(...pageData.rows);
  }

  const seen = new Set();
  const uniqueRows = rows.filter((row) => {
    const key = row.goodsSeq || row.productSeq || row.goodsName;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const products = [];

  for (const row of uniqueRows) {
    const detail = await fetchDetailMeta(row);
    products.push(toProduct(row, detail));
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    JSON_OUTPUT,
    `${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "shop-danawa-goods",
        criteria: {
          category: "cpu",
          listUrl: LIST_URL,
          listApiUrl: LIST_API_URL,
          totalCount,
          totalPages,
          note: "샵다나와 CPU 상품 목록 API와 상품 상세 meta 스펙을 결합한 프로토타입용 실제 수집 데이터입니다. 이미지, 리뷰, 견적/장바구니 정보는 제외했습니다.",
        },
        products,
      },
      null,
      2,
    )}\n`,
  );
  await fs.writeFile(
    JS_OUTPUT,
    `window.cpuMasterShopDanawaCpuLiveData = ${JSON.stringify(
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
          (product) => product.specs.cores && product.specs.threads && product.specs.boostGhz,
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
