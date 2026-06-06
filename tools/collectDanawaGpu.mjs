import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = "crawlResults";
const JSON_OUTPUT = path.join(OUTPUT_DIR, "gpu.json");
const JS_OUTPUT = "danawaGpuLiveData.js";
const CRAWLED_AT = new Date().toISOString();

const queries = [
  "RTX 4070 SUPER 그래픽카드",
  "RTX 4070 Ti SUPER 그래픽카드",
  "RTX 5070 Ti 그래픽카드",
  "RTX 5080 그래픽카드",
  "RTX 4090 그래픽카드",
  "라데온 RX 7900 XTX 그래픽카드",
];

const targetChipsets = [
  "RTX 4070 SUPER",
  "RTX 4070 Ti SUPER",
  "RTX 5070 Ti",
  "RTX 5080",
  "RTX 4090",
  "RX 7900 XTX",
];

const priceBoundsByChipset = {
  "RTX 4070 SUPER": { min: 600000, max: 1600000 },
  "RTX 4070 Ti SUPER": { min: 800000, max: 2200000 },
  "RTX 5070 Ti": { min: 1000000, max: 2300000 },
  "RTX 5080": { min: 1500000, max: 3500000 },
  "RTX 4090": { min: 2200000, max: 6000000 },
  "RX 7900 XTX": { min: 1000000, max: 2600000 },
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
  return match ? Number(match[1]) : null;
}

function inferChipset(name, specText) {
  const text = `${name} ${specText}`;
  return targetChipsets.find((chipset) => new RegExp(chipset.replaceAll(" ", "\\s*"), "i").test(text)) || "";
}

function inferMemoryType(name, specText) {
  const text = `${name} ${specText}`;
  if (/GDDR7|D7/i.test(text)) return "GDDR7";
  if (/GDDR6X|D6X/i.test(text)) return "GDDR6X";
  if (/GDDR6|D6/i.test(text)) return "GDDR6";
  return "";
}

function parseGpuSpecs(name, specText) {
  const text = `${name} ${specText}`;
  return {
    vramGb: parseFirstNumber(text, /(\d+)\s*GB/i),
    memoryType: inferMemoryType(name, specText),
    busBit: parseFirstNumber(text, /(\d{2,3})\s*[- ]?bit/i),
    cudaCores:
      parseFirstNumber(text, /스트림\s*프로세서\s*:?\s*(\d{4,5})/i) ||
      parseFirstNumber(text, /(\d{4,5})개/i),
    tdpW: parseFirstNumber(text, /사용전력\s*:?\s*(\d{2,4})W/i),
    fanCount: parseFirstNumber(text, /(\d)\s*팬/i),
    lengthMm: parseFirstNumber(text, /(?:가로\\(길이\\)|길이)\s*:?\s*(\d{2,4}(?:\.\d+)?)/i),
  };
}

function parseSearchResults(html, query) {
  return html
    .split('<div class="prod_main_info">')
    .slice(1)
    .map((chunk) => {
      const sourceProductId =
        chunk.match(/pcode=(\d+)/)?.[1] || chunk.match(/id="min_price_(\d+)"/)?.[1] || "";
      const nameHtml = chunk.match(/<p class="prod_name">([\s\S]*?)<\/p>/)?.[1] || "";
      const name = stripTags(nameHtml);
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
      const chipset = inferChipset(name, rawSpecText);

      return {
        sourceProductId,
        name,
        chipset,
        productUrl,
        price,
        rawSpecText,
        query,
      };
    })
    .filter((product) => {
      if (!product.sourceProductId || !product.name || !product.chipset) return false;
      if (!/RTX|지포스|GeForce|라데온|Radeon/i.test(product.name)) return false;
      if (/표준PC|조립PC|게이밍PC|컴퓨터|본체|중고|리퍼|워터블럭|백플레이트|수랭블럭|그래픽카드\s*쿨러|VGA\s*쿨러/i.test(product.name)) return false;
      const bounds = priceBoundsByChipset[product.chipset];
      if (bounds && (product.price < bounds.min || product.price > bounds.max)) return false;
      return Boolean(product.price);
    });
}

async function fetchSearch(query) {
  const url = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Danawa search failed: ${response.status} ${query}`);
  }

  return response.text();
}

function toProduct(row) {
  const specs = parseGpuSpecs(row.name, row.rawSpecText);
  const idSafeName = row.name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return {
    id: `danawa_live_gpu_${idSafeName}_${row.sourceProductId}`,
    category: "gpu",
    name: row.name,
    chipBrand: /Radeon|라데온|RX/i.test(row.name) ? "AMD" : "NVIDIA",
    boardPartner: row.name.split(" ")[0],
    chipset: row.chipset,
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

function sortProducts(products) {
  const chipsetOrder = new Map(targetChipsets.map((chipset, index) => [chipset, index]));
  return [...products].sort((a, b) => {
    const orderDiff =
      (chipsetOrder.get(a.chipset) ?? 99) - (chipsetOrder.get(b.chipset) ?? 99);
    if (orderDiff !== 0) return orderDiff;
    return (a.sourceData.price || Infinity) - (b.sourceData.price || Infinity);
  });
}

function pickBalancedProducts(products, perChipsetLimit = 5) {
  const sorted = sortProducts(products);
  const grouped = sorted.reduce((acc, product) => {
    if (!acc[product.chipset]) acc[product.chipset] = [];
    acc[product.chipset].push(product);
    return acc;
  }, {});

  return targetChipsets.flatMap((chipset) => (grouped[chipset] || []).slice(0, perChipsetLimit));
}

async function main() {
  const rows = [];

  for (const query of queries) {
    const html = await fetchSearch(query);
    rows.push(...parseSearchResults(html, query));
  }

  const seen = new Set();
  const products = pickBalancedProducts(
    rows
      .filter((row) => {
        if (seen.has(row.sourceProductId)) return false;
        seen.add(row.sourceProductId);
        return true;
      })
      .map(toProduct),
  );

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(
    JSON_OUTPUT,
    `${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "danawa-search",
        criteria: {
          category: "gpu",
          queries,
          note: "다나와 검색 결과에서 그래픽카드 후보만 필터링한 프로토타입용 실제 수집 데이터입니다. 가격은 수집 시점 기준이며 판매 여부는 재검증이 필요합니다.",
        },
        products,
      },
      null,
      2,
    )}\n`,
  );
  await fs.writeFile(
    JS_OUTPUT,
    `window.cpuMasterDanawaGpuLiveData = ${JSON.stringify(
      {
        collectedAt: CRAWLED_AT,
        source: "danawa-search",
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
        byChipset: products.reduce((acc, product) => {
          acc[product.chipset] = (acc[product.chipset] || 0) + 1;
          return acc;
        }, {}),
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
