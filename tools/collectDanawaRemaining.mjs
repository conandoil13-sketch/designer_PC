import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const CRAWLED_AT = new Date().toISOString();
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const categoryConfigs = {
  cpu: {
    jsonOutput: path.join(OUTPUT_DIR, "cpu.json"),
    jsOutput: "danawaCpuLiveData.js",
    windowName: "cpuMasterDanawaCpuLiveData",
    limit: 30,
    queries: [
      "인텔 코어 i5 14400F",
      "인텔 코어 i5 14600K",
      "인텔 코어 i7 14700K",
      "인텔 코어 Ultra 5 245K",
      "인텔 코어 Ultra 7 265K",
      "AMD 라이젠 5 7500F",
      "AMD 라이젠 5 7600",
      "AMD 라이젠 7 7700",
      "AMD 라이젠 7 7800X3D",
      "AMD 라이젠 7 9700X",
      "AMD 라이젠 7 9800X3D",
      "AMD 라이젠 9 9900X",
    ],
    nameInclude: /인텔\s*코어|코어\s*i[3579]|Core\s*i[3579]|라이젠|Ryzen|Ultra/i,
    nameExclude: /표준PC|게이밍|컴퓨터|본체|STAI|스트라이커|Codex|포유컴퓨터|RTX|GTX|RX\s*\d/i,
    include: /인텔|Intel|코어|Core|라이젠|Ryzen|AMD/i,
    exclude: /메인보드|노트북|컴퓨터|본체|OS미포함|윈도우|파워서플라이|미들타워|그래픽\s*메모리|용도\s*:|중고|리퍼|서버|제온|Xeon|벌크\s*쿨러|가이드/i,
    priceBounds: { min: 70000, max: 1300000 },
  },
  ram: {
    jsonOutput: path.join(OUTPUT_DIR, "ram.json"),
    jsOutput: "danawaRamLiveData.js",
    windowName: "cpuMasterDanawaRamLiveData",
    limit: 20,
    queries: [
      "DDR4 3200 16GB 데스크탑 메모리",
      "DDR4 3200 32GB 데스크탑 메모리",
      "DDR4 3600 32GB 데스크탑 메모리",
      "DDR4 3600 64GB 데스크탑 메모리",
      "DDR5 5600 16GB 데스크탑 메모리",
      "DDR5 5600 32GB 데스크탑 메모리",
      "DDR5 6000 32GB 데스크탑 메모리",
      "DDR5 6000 64GB 데스크탑 메모리",
    ],
    nameInclude: /DDR4|DDR5|메모리|RAM|VENGEANCE|Ripjaws|Trident|T-Force|삼성전자|SK하이닉스|TeamGroup|G\.?SKILL|CORSAIR|ADATA|ESSENCORE|GeIL|마이크론/i,
    nameExclude: /A320|A520|B450|B550|B650|X570|X670|H610|B760|Z790|메인보드|듀러블에디션|M\.2\s*V\d+/i,
    include: /DDR4|DDR5|PC4|PC5/i,
    exclude: /노트북|SO-DIMM|SODIMM|서버|ECC|REG|중고|리퍼|방열판만|쿨러|맥용/i,
    priceBounds: { min: 15000, max: 700000 },
  },
  ssd: {
    jsonOutput: path.join(OUTPUT_DIR, "ssd.json"),
    jsOutput: "danawaSsdLiveData.js",
    windowName: "cpuMasterDanawaSsdLiveData",
    limit: 20,
    queries: [
      "NVMe SSD 1TB",
      "NVMe SSD 2TB",
      "NVMe SSD 4TB",
      "PCIe 4.0 NVMe SSD 1TB",
      "PCIe 4.0 NVMe SSD 2TB",
      "PCIe 5.0 NVMe SSD 2TB",
    ],
    include: /SSD|NVMe|M\.2|PCIe/i,
    exclude: /외장|케이스|인클로저|어댑터|중고|리퍼|SATA\s*케이블|USB/i,
    priceBounds: { min: 30000, max: 900000 },
  },
  monitor: {
    jsonOutput: path.join(OUTPUT_DIR, "monitor.json"),
    jsOutput: "danawaMonitorLiveData.js",
    windowName: "cpuMasterDanawaMonitorLiveData",
    limit: 20,
    queries: [
      "27인치 QHD IPS sRGB 모니터",
      "27인치 4K UHD IPS DCI-P3 모니터",
      "32인치 4K UHD IPS 모니터",
      "Adobe RGB 모니터",
      "디자이너 모니터 DCI-P3",
      "QHD 144Hz IPS 모니터",
    ],
    include: /모니터|UHD|QHD|WQHD|IPS|OLED|sRGB|DCI-P3|Adobe\s*RGB/i,
    exclude: /암|모니터암|스탠드|보호필름|케이블|중고|리퍼|TV|사이니지/i,
    priceBounds: { min: 100000, max: 4000000 },
  },
};

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

function parseSearchResults(html, category, query, config) {
  return html
    .split('<div class="prod_main_info">')
    .slice(1)
    .map((chunk) => {
      const sourceProductId =
        chunk.match(/pcode=(\d+)/)?.[1] || chunk.match(/id="min_price_(\d+)"/)?.[1] || "";
      const name = stripTags(chunk.match(/<p class="prod_name">([\s\S]*?)<\/p>/)?.[1] || "");
      const rawSpecText = stripTags(
        chunk.match(/<dl class="prod_spec_set">([\s\S]*?)<\/dl>/)?.[1] ||
          chunk.match(/<div class="spec_list">([\s\S]*?)<\/div>/)?.[1] ||
          "",
      );
      const productUrl =
        chunk
          .match(/href="(https:\/\/prod\.danawa\.com\/info\/\?pcode=\d+[^"]*)"/)?.[1]
          ?.replace(/&amp;/g, "&") || "";
      const price =
        Number(
          chunk.match(/id="min_price_\d+"\s+value="(\d+)"/)?.[1] ||
            chunk.match(/class="price_sect"[\s\S]*?<strong>([\d,]+)<\/strong>/)?.[1]?.replace(/,/g, "") ||
            0,
        ) || null;
      const searchable = `${name} ${rawSpecText}`;

      return {
        category,
        sourceProductId,
        name,
        productUrl,
        price,
        rawSpecText,
        query,
        searchable,
      };
    })
    .filter((product) => {
      if (!product.sourceProductId || !product.name || !product.price) return false;
      if (config.nameInclude && !config.nameInclude.test(product.name)) return false;
      if (config.nameExclude && config.nameExclude.test(product.name)) return false;
      if (!config.include.test(product.searchable)) return false;
      if (config.exclude.test(product.searchable)) return false;
      const bounds = config.priceBounds;
      if (bounds && (product.price < bounds.min || product.price > bounds.max)) return false;
      return true;
    });
}

async function fetchSearch(query) {
  const url = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`Danawa search failed: ${response.status} ${query}`);
  }

  return response.text();
}

function inferBrand(name) {
  const value = String(name || "");
  const pairs = [
    [/AMD|라이젠|Ryzen/i, "AMD"],
    [/인텔|Intel|코어|Core/i, "Intel"],
    [/삼성|Samsung/i, "Samsung"],
    [/SK하이닉스|SK hynix|하이닉스/i, "SK hynix"],
    [/마이크론|Crucial|크루셜/i, "Crucial"],
    [/TeamGroup|팀그룹|T-Force/i, "TeamGroup"],
    [/G\.?SKILL|지스킬/i, "G.SKILL"],
    [/CORSAIR|커세어/i, "CORSAIR"],
    [/WD|Western Digital|웨스턴디지털/i, "Western Digital"],
    [/Seagate|씨게이트/i, "Seagate"],
    [/LG|LG전자/i, "LG"],
    [/BenQ|벤큐/i, "BenQ"],
    [/DELL|Dell|델/i, "Dell"],
    [/ASUS|에이수스/i, "ASUS"],
    [/알파스캔|AOC/i, "AOC"],
  ];
  return pairs.find(([pattern]) => pattern.test(value))?.[1] || value.split(" ")[0] || "";
}

function parseCpuSpecs(name, specText) {
  const text = `${name} ${specText}`;
  const peMatch = text.match(/P\s*(\d+)\s*\+\s*E\s*(\d+)\s*코어/i);
  const socket =
    text.match(/LGA\s*\d{4}/i)?.[0]?.replace(/\s+/g, "") ||
    text.match(/AM[45]/i)?.[0] ||
    text.match(/소켓\s*(\d{4})/)?.[1] ||
    "";
  return {
    cores: peMatch
      ? Number(peMatch[1]) + Number(peMatch[2])
      : parseFirstNumber(text, /(\d+)\s*코어/i),
    threads: parseFirstNumber(text, /(\d+)\s*스레드/i),
    boostGhz:
      parseFirstNumber(text, /최대\s*클럭\s*:?\s*(\d(?:\.\d+)?)\s*GHz/i) ||
      parseFirstNumber(text, /부스트\s*클럭\s*:?\s*(\d(?:\.\d+)?)\s*GHz/i) ||
      parseFirstNumber(text, /(\d(?:\.\d+)?)\s*GHz/i),
    tdpW:
      parseFirstNumber(text, /PBP(?:-MTP)?\s*:?\s*(\d{2,3})/i) ||
      parseFirstNumber(text, /TDP\s*:?\s*(\d{2,3})\s*W/i) ||
      parseFirstNumber(text, /(\d{2,3})\s*W/i),
    socket: socket ? (socket.length === 4 ? `LGA${socket}` : socket) : "",
    hasIntegratedGraphics: /내장그래픽|UHD|Radeon\s*Graphics/i.test(text) && !/미탑재|없음/i.test(text),
    coolerIncluded: /쿨러\s*포함/i.test(text),
  };
}

function parseRamSpecs(name, specText, query) {
  const text = `${name} ${specText} ${query}`;
  const kitMatch =
    text.match(/(\d+)\s*GB\s*[xX×]\s*(\d+)/i) ||
    text.match(/(\d+)\s*GB\s*\(\s*(\d+)\s*GB\s*[xX×]\s*(\d+)\s*\)/i);
  const parenthesizedKit = text.match(/(\d+)\s*GB\s*\(\s*(\d+)\s*GB\s*[xX×]\s*(\d+)\s*\)/i);
  const capacityGb = parenthesizedKit
    ? Number(parenthesizedKit[2]) * Number(parenthesizedKit[3])
    : kitMatch
      ? Number(kitMatch[1]) * Number(kitMatch[2])
      : parseFirstNumber(text, /(\d+)\s*GB/i);
  const memoryType = text.match(/DDR[45]/i)?.[0]?.toUpperCase() || "";

  return {
    capacityGb,
    speedMt:
      parseFirstNumber(text, /(\d{4})\s*MHz/i) ||
      parseFirstNumber(text, /DDR[45][-\s]*(\d{4})/i) ||
      parseFirstNumber(text, /PC[45]-\d+\s*\/\s*(\d{4})/i),
    modules: parenthesizedKit
      ? `${parenthesizedKit[2]}GB x${parenthesizedKit[3]}`
      : kitMatch
        ? `${kitMatch[1]}GB x${kitMatch[2]}`
        : capacityGb
          ? `${capacityGb}GB x1`
          : "",
    memoryType,
  };
}

function parseSsdSpecs(name, specText, query) {
  const text = `${name} ${specText} ${query}`;
  const capacityTb = parseFirstNumber(text, /(\d+(?:\.\d+)?)\s*TB/i);
  const capacityGb = parseFirstNumber(text, /(\d+)\s*GB/i);

  return {
    capacityTb: capacityTb || (capacityGb ? Math.round((capacityGb / 1024) * 100) / 100 : null),
    capacityGb: capacityTb ? capacityTb * 1024 : capacityGb || null,
    readMb:
      parseFirstNumber(text, /(?:읽기|순차읽기)\s*:?\s*(\d[\d,]{2,6})\s*MB\/s/i) ||
      parseFirstNumber(text, /읽기\D*(\d[\d,]{2,6})/i),
    writeMb:
      parseFirstNumber(text, /(?:쓰기|순차쓰기)\s*:?\s*(\d[\d,]{2,6})\s*MB\/s/i) ||
      parseFirstNumber(text, /쓰기\D*(\d[\d,]{2,6})/i),
    formFactor: text.match(/M\.2\s*\(?2280\)?/i)?.[0] || text.match(/2\.5\s*인치/i)?.[0] || "",
    interfaceType:
      text.match(/PCIe\s*5\.0/i)?.[0] ||
      text.match(/PCIe\s*4\.0/i)?.[0] ||
      text.match(/PCIe\s*3\.0/i)?.[0] ||
      text.match(/NVMe/i)?.[0] ||
      text.match(/SATA/i)?.[0] ||
      "",
  };
}

function inferResolution(text) {
  const explicit = text.match(/\d{3,4}\s*[xX]\s*\d{3,4}/)?.[0];
  if (explicit) return explicit.replace(/[xX]/, " x ");
  if (/UHD|4K|3840/i.test(text)) return "3840 x 2160";
  if (/WQHD|3440/i.test(text)) return "3440 x 1440";
  if (/QHD|2560/i.test(text)) return "2560 x 1440";
  if (/FHD|1920/i.test(text)) return "1920 x 1080";
  return null;
}

function parseMonitorSpecs(name, specText) {
  const text = `${name} ${specText}`;
  return {
    sizeInch: parseFirstNumber(text, /(\d{2}(?:\.\d+)?)\s*(?:인치|형|inch)/i),
    resolution: inferResolution(text),
    refreshHz: parseFirstNumber(text, /(\d{2,3})\s*Hz/i),
    panelType: text.match(/IPS\s*Black/i)?.[0] || text.match(/IPS|OLED|VA|TN/i)?.[0] || "",
    srgb: parseFirstNumber(text, /sRGB\D*(\d{2,3})/i),
    dcip3: parseFirstNumber(text, /DCI[\s-]*P3\D*(\d{2,3})/i),
    adobeRgb: parseFirstNumber(text, /Adobe\s*RGB\D*(\d{2,3})/i),
    deltaE: parseFirstNumber(text, /Delta\s*E\s*[<≤]?\s*(\d(?:\.\d)?)/i),
  };
}

function parseSpecs(category, row) {
  if (category === "cpu") return parseCpuSpecs(row.name, row.rawSpecText);
  if (category === "ram") return parseRamSpecs(row.name, row.rawSpecText, row.query);
  if (category === "ssd") return parseSsdSpecs(row.name, row.rawSpecText, row.query);
  if (category === "monitor") return parseMonitorSpecs(row.name, row.rawSpecText);
  return {};
}

function toProduct(row) {
  const specs = parseSpecs(row.category, row);
  const idSafeName = makeIdSafeName(row.name);

  return {
    id: `danawa_live_${row.category}_${idSafeName}_${row.sourceProductId}`,
    category: row.category,
    name: row.name,
    brand: inferBrand(row.name),
    chipBrand: row.category === "cpu" ? inferBrand(row.name) : undefined,
    specs,
    sourceData: {
      source: "danawa",
      sourceProductId: row.sourceProductId,
      productUrl: row.productUrl || `https://prod.danawa.com/info/?pcode=${row.sourceProductId}`,
      price: row.price,
      priceStatus: "liveSearch",
      crawledAt: CRAWLED_AT,
      rawName: row.name,
      rawSpecText: row.rawSpecText,
      searchKeyword: row.query,
    },
  };
}

function specCompleteness(product) {
  const specs = product.specs || {};
  const requiredFields = {
    cpu: ["cores", "threads", "boostGhz"],
    ram: ["capacityGb", "memoryType"],
    ssd: ["capacityTb", "readMb", "writeMb"],
    monitor: ["sizeInch", "resolution"],
  }[product.category] || [];
  if (!requiredFields.length) return 1;
  return requiredFields.filter((field) => specs[field] !== null && specs[field] !== undefined && specs[field] !== "").length / requiredFields.length;
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    const completenessDiff = specCompleteness(b) - specCompleteness(a);
    if (completenessDiff !== 0) return completenessDiff;
    return (a.sourceData.price || Infinity) - (b.sourceData.price || Infinity);
  });
}

async function collectCategory(category, config) {
  const rows = [];

  for (const query of config.queries) {
    try {
      const html = await fetchSearch(query);
      rows.push(...parseSearchResults(html, category, query, config));
    } catch (error) {
      console.warn(`[${category}] skipped "${query}": ${error.message}`);
    }
  }

  const seen = new Set();
  const products = sortProducts(
    rows
      .filter((row) => {
        if (seen.has(row.sourceProductId)) return false;
        seen.add(row.sourceProductId);
        return true;
      })
      .map(toProduct),
  ).slice(0, config.limit);

  await fs.writeFile(
    config.jsonOutput,
    `${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "danawa-search",
        criteria: {
          category,
          queries: config.queries,
          note: "다나와 검색 결과에서 프로토타입용 제품 후보만 필터링한 실제 수집 데이터입니다. 가격은 수집 시점 기준이며 판매 여부는 재검증이 필요합니다.",
        },
        products,
      },
      null,
      2,
    )}\n`,
  );
  await fs.writeFile(
    config.jsOutput,
    `window.${config.windowName} = ${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "danawa-search",
        products,
      },
      null,
      2,
    )};\n`,
  );

  return {
    category,
    productCount: products.length,
    pricedCount: products.filter((product) => product.sourceData.price).length,
    outputs: [config.jsonOutput, config.jsOutput],
  };
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const summaries = [];

  for (const [category, config] of Object.entries(categoryConfigs)) {
    summaries.push(await collectCategory(category, config));
  }

  console.log(JSON.stringify({ collectedAt: CRAWLED_AT, summaries }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
