(function () {
  const PRODUCT_CATEGORIES = ["gpu", "cpu", "ram", "ssd", "monitor"];

  function clamp(value, min = 0, max = 3) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value) {
    return Math.round(value * 100) / 100;
  }

  function normalizeList(value) {
    return Array.isArray(value) ? value : [];
  }

  function parseFirstNumber(value, pattern) {
    const match = String(value || "").match(pattern);
    return match ? Number(match[1]) : null;
  }

  function parseGpuSpecText(rawProduct) {
    const text = [
      rawProduct.rawName,
      rawProduct.name,
      rawProduct.rawSpecText,
      rawProduct.specText,
      rawProduct.sourceData?.rawName,
      rawProduct.sourceData?.rawSpecText,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      vramGb:
        rawProduct.specs?.vramGb ||
        parseFirstNumber(text, /(\d+)\s*GB/i),
      cudaCores:
        rawProduct.specs?.cudaCores ||
        parseFirstNumber(text, /(\d{4,5})\s*CUDA/i),
      tdpW:
        rawProduct.specs?.tdpW ||
        parseFirstNumber(text, /(\d{2,4})\s*W/i),
      memoryType:
        rawProduct.specs?.memoryType ||
        (text.match(/GDDR\dX?/i)?.[0] || null),
      busBit:
        rawProduct.specs?.busBit ||
        parseFirstNumber(text, /(\d{2,3})\s*[- ]?bit/i),
      fanCount:
        rawProduct.specs?.fanCount ||
        parseFirstNumber(text, /(\d)\s*팬/i),
      isBlower: rawProduct.specs?.isBlower || /블로워팬/i.test(text),
    };
  }

  function parseCommonSpecText(rawProduct) {
    const text = [
      rawProduct.rawName,
      rawProduct.name,
      rawProduct.rawSpecText,
      rawProduct.specText,
      rawProduct.sourceData?.rawName,
      rawProduct.sourceData?.rawSpecText,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      text,
      capacityGb: rawProduct.specs?.capacityGb || parseFirstNumber(text, /(\d+)\s*GB/i),
      capacityTb: rawProduct.specs?.capacityTb || parseFirstNumber(text, /(\d+)\s*TB/i),
      readMb: rawProduct.specs?.readMb || parseFirstNumber(text, /읽기\D*(\d{3,5})/i),
      writeMb: rawProduct.specs?.writeMb || parseFirstNumber(text, /쓰기\D*(\d{3,5})/i),
      cores: rawProduct.specs?.cores || parseFirstNumber(text, /(\d+)\s*코어/i),
      threads: rawProduct.specs?.threads || parseFirstNumber(text, /(\d+)\s*스레드/i),
      boostGhz: rawProduct.specs?.boostGhz || parseFirstNumber(text, /(\d(?:\.\d)?)\s*GHz/i),
      tdpW: rawProduct.specs?.tdpW || parseFirstNumber(text, /(\d{2,4})\s*W/i),
      sizeInch: rawProduct.specs?.sizeInch || parseFirstNumber(text, /(\d{2})\s*(?:인치|inch)/i),
      srgb: rawProduct.specs?.srgb || parseFirstNumber(text, /sRGB\D*(\d{2,3})/i),
      dcip3: rawProduct.specs?.dcip3 || parseFirstNumber(text, /DCI-P3\D*(\d{2,3})/i),
      adobeRgb: rawProduct.specs?.adobeRgb || parseFirstNumber(text, /Adobe RGB\D*(\d{2,3})/i),
      deltaE: rawProduct.specs?.deltaE || parseFirstNumber(text, /Delta\s*E\D*(\d(?:\.\d)?)/i),
      resolution: rawProduct.specs?.resolution || text.match(/\d{3,4}\s*x\s*\d{3,4}/i)?.[0] || null,
    };
  }

  function inferGpuGenerationScore(name) {
    const value = String(name || "");
    if (/RTX\s*50/i.test(value)) return 0.2;
    if (/RTX\s*40/i.test(value)) return 0.05;
    return 0;
  }

  function scoreGpuPerformance({ cudaCores }, name) {
    if (!cudaCores) return 1.5 + inferGpuGenerationScore(name);
    if (cudaCores >= 10500) return 3;
    if (cudaCores >= 8800) return 2.65;
    if (cudaCores >= 7600) return 2.4;
    if (cudaCores >= 5000) return 2;
    if (cudaCores >= 3000) return 1.5;
    return 1;
  }

  function scoreVram({ vramGb }) {
    if (!vramGb) return 1.2;
    if (vramGb >= 24) return 3;
    if (vramGb >= 16) return 2.7;
    if (vramGb >= 12) return 2.25;
    if (vramGb >= 8) return 1.7;
    if (vramGb >= 6) return 1.2;
    return 0.8;
  }

  function scoreCoolingBurden({ tdpW }) {
    if (!tdpW) return 1.8;
    if (tdpW >= 340) return 2.9;
    if (tdpW >= 280) return 2.35;
    if (tdpW >= 220) return 2;
    if (tdpW >= 160) return 1.55;
    return 1.1;
  }

  function scoreCoolingFit(specs) {
    const burden = scoreCoolingBurden(specs);
    const fanRelief = specs.isBlower
      ? -0.3
      : specs.fanCount >= 3
        ? 0.15
        : specs.fanCount === 2
          ? -0.05
          : 0;
    return clamp(4 - burden + fanRelief);
  }

  function scoreCpuSingle({ boostGhz }) {
    if (!boostGhz) return 1.8;
    if (boostGhz >= 5.6) return 2.8;
    if (boostGhz >= 5.2) return 2.55;
    if (boostGhz >= 4.8) return 2.25;
    if (boostGhz >= 4.2) return 1.8;
    return 1.3;
  }

  function scoreCpuMulti({ cores, threads }) {
    const coreValue = cores || Math.ceil((threads || 0) / 2);
    if (!coreValue) return 1.5;
    if (coreValue >= 16) return 3;
    if (coreValue >= 12) return 2.65;
    if (coreValue >= 8) return 2.15;
    if (coreValue >= 6) return 1.65;
    return 1.1;
  }

  function scoreRamCapacity({ capacityGb }) {
    if (!capacityGb) return 1.4;
    if (capacityGb >= 128) return 3;
    if (capacityGb >= 64) return 2.8;
    if (capacityGb >= 32) return 2.2;
    if (capacityGb >= 16) return 1.45;
    return 0.9;
  }

  function scoreSsdSpeed({ readMb, writeMb }) {
    const speed = Math.max(readMb || 0, writeMb || 0);
    if (!speed) return 1.5;
    if (speed >= 7000) return 2.8;
    if (speed >= 5000) return 2.25;
    if (speed >= 3000) return 1.8;
    if (speed >= 1000) return 1.3;
    return 0.9;
  }

  function scoreSsdCapacity({ capacityTb, capacityGb }) {
    const tb = capacityTb || (capacityGb ? capacityGb / 1024 : 0);
    if (!tb) return 1.3;
    if (tb >= 4) return 3;
    if (tb >= 2) return 2.6;
    if (tb >= 1) return 2;
    return 1.2;
  }

  function scoreMonitorSpace({ sizeInch, resolution }) {
    const text = String(resolution || "").toLowerCase();
    const is4k = /3840\s*x\s*2160/.test(text);
    const isQhd = /2560\s*x\s*1440/.test(text);
    if ((sizeInch || 0) >= 32 && is4k) return 2.9;
    if (is4k) return 2.55;
    if ((sizeInch || 0) >= 27 && isQhd) return 2.3;
    if ((sizeInch || 0) >= 27) return 1.9;
    return 1.4;
  }

  function scoreMonitorColor({ srgb, dcip3, adobeRgb, deltaE }) {
    let score = 1.4;
    if ((srgb || 0) >= 99) score = Math.max(score, 2.15);
    if ((dcip3 || 0) >= 95) score = Math.max(score, 2.65);
    if ((adobeRgb || 0) >= 95) score = Math.max(score, 2.9);
    if (deltaE && deltaE <= 1.5) score = Math.max(score, 3);
    return score;
  }

  function scoreMonitorRefresh({ refreshHz }) {
    if (!refreshHz) return 1.2;
    if (refreshHz >= 165) return 2.6;
    if (refreshHz >= 144) return 2.35;
    if (refreshHz >= 100) return 2;
    if (refreshHz >= 75) return 1.6;
    return 1.2;
  }

  const requiredSpecFieldsByCategory = {
    gpu: ["vramGb", "cudaCores", "tdpW", "memoryType"],
    cpu: ["cores", "threads", "boostGhz", "tdpW"],
    ram: ["capacityGb", "speedMt", "memoryType"],
    ssd: ["capacityTb", "readMb", "writeMb", "formFactor"],
    monitor: ["sizeInch", "resolution", "srgb", "dcip3", "adobeRgb", "refreshHz"],
  };

  function getSourceQuality(rawProduct, sourceData, specs, category) {
    const requiredFields = requiredSpecFieldsByCategory[category] || [];
    const foundFields = requiredFields.filter((field) => {
      const value = specs?.[field];
      return value !== null && value !== undefined && value !== "";
    });
    const missingFields = requiredFields.filter((field) => !foundFields.includes(field));
    const isProductPageLinked =
      /prod\.danawa\.com\/info\/\?pcode=/i.test(sourceData.productUrl || "") &&
      !String(sourceData.sourceProductId || "").startsWith("search_");
    const hasPrice = typeof sourceData.price === "number" && sourceData.price > 0;
    const hasRawSpecText = Boolean(sourceData.rawSpecText);
    const specCompleteness =
      requiredFields.length === 0 ? 1 : foundFields.length / requiredFields.length;

    let level = "needsSourceReview";
    let label = "출처 보강 필요";
    let nextAction = "상품 URL, 가격, 실제 스펙 텍스트를 우선 확인해야 합니다.";

    if (isProductPageLinked && specCompleteness >= 0.75) {
      level = hasPrice ? "purchaseReadySample" : "productPageSample";
      label = hasPrice ? "가격 포함 샘플" : "상품페이지 연결";
      nextAction = hasPrice
        ? "판매 여부와 가격 최신성만 주기적으로 확인하면 됩니다."
        : "가격을 보강하면 구매 후보로 쓰기 좋아집니다.";
    } else if (specCompleteness >= 0.7) {
      level = "specReadySearchSample";
      label = "스펙 해석 가능";
      nextAction = "다나와 pcode와 가격을 붙이면 실제 상품 후보로 전환할 수 있습니다.";
    }

    return {
      level,
      label,
      nextAction,
      isProductPageLinked,
      hasPrice,
      hasRawSpecText,
      specCompleteness: round(specCompleteness),
      foundFields,
      missingFields,
    };
  }

  function getGpuTier(axisScores) {
    if (axisScores.GPU >= 2.85) return "고성능 후보";
    if (axisScores.GPU >= 2.45) return "균형형 후보";
    return "가격 조건부 가성비 후보";
  }

  function getGpuUseCase(axisScores, specs) {
    if (axisScores.GPU >= 2.85) {
      return "GPU 렌더링, 고해상도 영상, 로컬 AI 이미지 생성, 3D 작업";
    }
    if (axisScores.GPU >= 2.45 || (specs.vramGb || 0) >= 16) {
      return "영상 편집, 모션그래픽, 3D 입문, 로컬 AI 이미지 생성 중간 수준";
    }
    return "2D 디자인, UI 디자인, 가벼운 영상 편집, 로컬 AI 이미지 생성 입문";
  }

  function makeGpuExplanation(product, specs, axisScores) {
    const vramText = specs.vramGb ? `${specs.vramGb}GB VRAM` : "확인 가능한 VRAM";
    if (axisScores.GPU >= 2.85) {
      return `${product.name}은 ${vramText}과 높은 GPU 성능을 바탕으로 Blender, DaVinci Resolve, 로컬 AI처럼 그래픽카드가 실제 작업 시간을 줄이는 영역을 고려한 후보입니다. 다만 순수 2D 작업자에게는 과할 수 있어 RAM, SSD, 모니터 예산을 함께 봐야 합니다.`;
    }
    if (axisScores.GPU >= 2.45) {
      return `${product.name}은 ${vramText}을 바탕으로 2D 디자인뿐 아니라 영상, 모션, 3D 입문, 로컬 AI 가능성까지 넓게 커버하려는 사용자에게 맞는 균형형 후보입니다.`;
    }
    return `${product.name}은 고성능에 몰아붙이기보다 예산을 RAM, SSD, 모니터에도 나누면서 그래픽 작업 여유를 확보하려는 사용자를 위한 후보입니다.`;
  }

  function makeGpuOverkillWarning(axisScores) {
    if (axisScores.GPU >= 2.85) {
      return "Photoshop, Illustrator, Figma 중심의 순수 2D 작업자에게는 과할 수 있습니다. 이 제품을 고르느라 RAM, SSD, CPU, 모니터 예산을 줄이면 실제 체감이 낮아질 수 있습니다.";
    }
    if (axisScores.GPU >= 2.45) {
      return "Figma, Illustrator, Photoshop 위주의 순수 2D 작업자에게는 과한 선택일 수 있습니다. GPU보다 RAM, SSD, 모니터 색 정확도, CPU 싱글 성능이 더 큰 체감 차이를 만들 수 있습니다.";
    }
    return "Photoshop, Illustrator, Figma만 주로 사용한다면 이 카드도 이미 과할 수 있습니다. RAM, SSD, 색 정확도 좋은 모니터에 예산을 남기는지 함께 확인하세요.";
  }

  function normalizeProduct(rawProduct, categoryFallback = "gpu") {
    const category = rawProduct.category || categoryFallback;
    const sourceData = {
      source: rawProduct.sourceData?.source || rawProduct.source || "mock",
      sourceProductId: rawProduct.sourceData?.sourceProductId || rawProduct.sourceProductId || rawProduct.id,
      productUrl: rawProduct.sourceData?.productUrl || rawProduct.productUrl || "",
      searchKeyword:
        rawProduct.sourceData?.searchKeyword ||
        rawProduct.searchKeyword ||
        rawProduct.danawaSearchKeywords?.[0] ||
        rawProduct.name ||
        "",
      crawledAt: rawProduct.sourceData?.crawledAt || rawProduct.crawledAt || "",
      price: rawProduct.sourceData?.price ?? rawProduct.price ?? null,
      priceStatus: rawProduct.sourceData?.priceStatus || rawProduct.priceStatus || "unknown",
      rawName: rawProduct.sourceData?.rawName || rawProduct.rawName || rawProduct.name || "",
      rawSpecText: rawProduct.sourceData?.rawSpecText || rawProduct.rawSpecText || rawProduct.specText || "",
      qualityFlags: rawProduct.sourceData?.qualityFlags || rawProduct.qualityFlags || null,
    };
    const specs = {
      ...(rawProduct.specs || {}),
      ...(category === "gpu" ? parseGpuSpecText(rawProduct) : {}),
      ...(category !== "gpu" ? parseCommonSpecText(rawProduct) : {}),
    };
    const sourceQuality = getSourceQuality(rawProduct, sourceData, specs, category);

    return {
      ...rawProduct,
      id: rawProduct.id || `${sourceData.source}_${category}_${sourceData.sourceProductId}`,
      category,
      name: rawProduct.name || sourceData.rawName,
      sourceData: {
        ...sourceData,
        quality: sourceQuality,
      },
      specs,
    };
  }

  function interpretGpuProduct(normalizedProduct) {
    if (normalizedProduct.axisScores && normalizedProduct.productTraits) {
      return normalizedProduct;
    }

    const specs = normalizedProduct.specs || {};
    const coolingBurden = round(scoreCoolingBurden(specs));
    const axisScores = {
      GPU: round(scoreGpuPerformance(specs, normalizedProduct.name)),
      VRAM: round(scoreVram(specs)),
      COOL: round(scoreCoolingFit(specs)),
    };

    return {
      ...normalizedProduct,
      tier: normalizedProduct.tier || getGpuTier(axisScores),
      status: normalizedProduct.status || normalizedProduct.sourceData.priceStatus || "unknown",
      coreUseCase: normalizedProduct.coreUseCase || getGpuUseCase(axisScores, specs),
      recommendedFor:
        normalizedProduct.recommendedFor ||
        [
          "그래픽 작업 여유를 실제 제품 스펙으로 확인하고 싶은 사용자",
          "영상·모션·3D·AI 가능성을 함께 비교하려는 사용자",
          "RAM, SSD, 모니터 예산과 GPU 예산의 균형을 보고 싶은 사용자",
        ],
      notRecommendedFor:
        normalizedProduct.notRecommendedFor ||
        [
          "Photoshop, Illustrator, Figma만 사용하는 순수 2D 사용자",
          "GPU를 올리느라 RAM, SSD, 모니터 예산을 낮춰야 하는 사용자",
          "저소음·저전력 구성이 더 중요한 사용자",
        ],
      specSummary: {
        vram: specs.vramGb ? `${specs.vramGb}GB ${specs.memoryType || ""}`.trim() : "VRAM 확인 필요",
        cudaTier: specs.cudaCores ? `${specs.cudaCores} CUDA cores 기준` : "CUDA 정보 확인 필요",
        rawGpuPower: `GPU 성능 점수 ${axisScores.GPU} / 3 기준`,
        powerDemand: specs.tdpW ? `약 ${specs.tdpW}W급 GPU 전력 기준` : "제품별 권장 파워 확인 필요",
        coolingDifficulty: `안정성 적합도 ${axisScores.COOL} / 3, 전력·발열 부담 ${coolingBurden} / 3`,
      },
      axisScores,
      productTraits: {
        performanceFit: axisScores.GPU,
        vramFit: axisScores.VRAM,
        stabilityFit: round(clamp(3 - Math.max(0, coolingBurden - 1.8) * 0.35)),
        coolingBurden,
        overkillRiskFor2D: round(clamp((axisScores.GPU + axisScores.VRAM) / 2)),
      },
      designerExplanation:
        normalizedProduct.designerExplanation ||
        makeGpuExplanation(normalizedProduct, specs, axisScores),
      overkillWarning:
        normalizedProduct.overkillWarning ||
        makeGpuOverkillWarning(axisScores),
      buyingChecklist:
        normalizedProduct.buyingChecklist ||
        [
          "VRAM 용량 확인",
          "권장 파워와 보조전원 커넥터 확인",
          "케이스 장착 길이와 슬롯 두께 확인",
          "장시간 작업 시 발열과 소음 리뷰 확인",
        ],
      danawaSearchKeywords:
        normalizedProduct.danawaSearchKeywords ||
        [normalizedProduct.sourceData.searchKeyword || normalizedProduct.name],
      sourceNote:
        normalizedProduct.sourceNote ||
        "정규화된 제품 데이터. 실제 가격, 판매 여부, 벤치마크로 추가 검증 필요.",
      sources: normalizedProduct.sources || [],
    };
  }

  function completeInterpretedProduct(normalizedProduct, axisScores, defaults) {
    if (normalizedProduct.axisScores && normalizedProduct.productTraits) {
      return normalizedProduct;
    }

    return {
      ...normalizedProduct,
      tier: normalizedProduct.tier || defaults.tier,
      status: normalizedProduct.status || normalizedProduct.sourceData.priceStatus || "unknown",
      coreUseCase: normalizedProduct.coreUseCase || defaults.coreUseCase,
      recommendedFor: normalizedProduct.recommendedFor || defaults.recommendedFor,
      notRecommendedFor: normalizedProduct.notRecommendedFor || defaults.notRecommendedFor,
      specSummary: normalizedProduct.specSummary || defaults.specSummary,
      axisScores,
      productTraits: normalizedProduct.productTraits || defaults.productTraits,
      designerExplanation: normalizedProduct.designerExplanation || defaults.designerExplanation,
      overkillWarning: normalizedProduct.overkillWarning || defaults.overkillWarning,
      buyingChecklist: normalizedProduct.buyingChecklist || defaults.buyingChecklist,
      danawaSearchKeywords:
        normalizedProduct.danawaSearchKeywords ||
        [normalizedProduct.sourceData.searchKeyword || normalizedProduct.name],
      sourceNote:
        normalizedProduct.sourceNote ||
        "정규화된 제품 데이터. 실제 가격, 판매 여부, 벤치마크로 추가 검증 필요.",
      sources: normalizedProduct.sources || [],
    };
  }

  function interpretCpuProduct(normalizedProduct) {
    const specs = normalizedProduct.specs || {};
    const axisScores = {
      CS: round(scoreCpuSingle(specs)),
      CM: round(scoreCpuMulti(specs)),
      COOL: round(scoreCoolingBurden(specs)),
    };

    return completeInterpretedProduct(normalizedProduct, axisScores, {
      tier: axisScores.CM >= 2.8 ? "렌더링 고성능 후보" : "CPU 균형 후보",
      coreUseCase: "디자인 앱 반응성, 렌더링, 인코딩, 멀티태스킹",
      recommendedFor: ["작업 중 반응성과 출력 시간을 함께 보는 사용자", "여러 앱을 동시에 쓰는 사용자", "CPU 성능을 실제 작업 흐름과 연결해 보고 싶은 사용자"],
      notRecommendedFor: ["CPU보다 GPU나 모니터가 더 중요한 사용자", "예산이 제한적인 순수 2D 사용자", "쿨링 예산을 줄여야 하는 사용자"],
      specSummary: {
        cores: specs.cores ? `${specs.cores}코어` : "코어 수 확인 필요",
        boost: specs.boostGhz ? `${specs.boostGhz}GHz급 부스트` : "부스트 클럭 확인 필요",
        power: specs.tdpW ? `${specs.tdpW}W급 전력 기준` : "전력·쿨링 확인 필요",
      },
      productTraits: { responsivenessFit: axisScores.CS, renderFit: axisScores.CM, coolingBurden: axisScores.COOL },
      designerExplanation: `${normalizedProduct.name}은 작업 중 조작감과 렌더링·인코딩 처리력을 함께 비교하기 위한 CPU 후보입니다.`,
      overkillWarning: "렌더링이나 인코딩이 주 작업이 아니라면 코어 수를 과하게 올리는 것보다 RAM, SSD, 모니터 예산을 함께 보는 편이 좋습니다.",
      buyingChecklist: ["싱글·멀티 벤치마크 확인", "메인보드 소켓 호환 확인", "쿨러와 파워 여유 확인", "사용 앱의 CPU 활용도 확인"],
    });
  }

  function interpretRamProduct(normalizedProduct) {
    const specs = normalizedProduct.specs || {};
    const axisScores = { RAM: round(scoreRamCapacity(specs)) };

    return completeInterpretedProduct(normalizedProduct, axisScores, {
      tier: axisScores.RAM >= 2.8 ? "대용량 후보" : "메모리 균형 후보",
      coreUseCase: "큰 파일, 여러 프로그램, 브라우저 탭, 작업 상태 유지",
      recommendedFor: ["여러 앱을 동시에 켜두는 사용자", "대형 파일을 다루는 사용자", "작업 중 버벅임을 줄이고 싶은 사용자"],
      notRecommendedFor: ["가벼운 웹·문서 중심 사용자", "저장공간이나 모니터가 더 부족한 사용자", "현재 RAM 사용량이 낮은 사용자"],
      specSummary: {
        capacity: specs.capacityGb ? `${specs.capacityGb}GB` : "용량 확인 필요",
        speed: specs.speedMt ? `DDR ${specs.speedMt}급` : "속도 확인 필요",
        expand: "메인보드 확장성 확인 필요",
      },
      productTraits: { memoryFit: axisScores.RAM, expansionBurden: axisScores.RAM > 2.8 ? 2 : 1.4 },
      designerExplanation: `${normalizedProduct.name}은 여러 프로그램과 큰 파일을 버티는 작업 여유를 확보하기 위한 RAM 후보입니다.`,
      overkillWarning: "작업 파일이 크지 않다면 RAM을 과하게 늘려도 체감이 제한적일 수 있습니다.",
      buyingChecklist: ["용량 확인", "메인보드 DDR 세대 확인", "모듈 개수와 추후 확장성 확인", "호환성 확인"],
    });
  }

  function interpretSsdProduct(normalizedProduct) {
    const specs = normalizedProduct.specs || {};
    const axisScores = {
      SSD_S: round(scoreSsdSpeed(specs)),
      SSD_C: round(scoreSsdCapacity(specs)),
    };

    return completeInterpretedProduct(normalizedProduct, axisScores, {
      tier: axisScores.SSD_C >= 2.8 ? "대용량 저장 후보" : "SSD 균형 후보",
      coreUseCase: "파일 열기·저장, 캐시, 소스 관리, 프로젝트 저장",
      recommendedFor: ["파일 열기와 저장이 답답한 사용자", "영상·모션 캐시를 쓰는 사용자", "소스 파일이 빠르게 쌓이는 사용자"],
      notRecommendedFor: ["클라우드와 외장 저장을 주로 쓰는 사용자", "용량 부족이 없는 사용자", "모니터나 RAM이 더 급한 사용자"],
      specSummary: {
        capacity: specs.capacityTb ? `${specs.capacityTb}TB` : "용량 확인 필요",
        speed: specs.readMb ? `읽기 ${specs.readMb}MB/s급` : "속도 확인 필요",
        form: specs.formFactor || "M.2/NVMe 여부 확인",
      },
      productTraits: { speedFit: axisScores.SSD_S, capacityFit: axisScores.SSD_C, expansionBurden: axisScores.SSD_C > 2.8 ? 2 : 1.3 },
      designerExplanation: `${normalizedProduct.name}은 파일 열기·저장·캐시 속도와 저장공간 여유를 비교하기 위한 SSD 후보입니다.`,
      overkillWarning: "저장공간이 부족하지 않다면 초고용량 SSD보다 RAM이나 모니터 예산이 더 체감될 수 있습니다.",
      buyingChecklist: ["NVMe 여부 확인", "용량 확인", "읽기·쓰기 속도 확인", "M.2 슬롯 여유 확인"],
    });
  }

  function interpretMonitorProduct(normalizedProduct) {
    const specs = normalizedProduct.specs || {};
    const axisScores = {
      MON_S: round(scoreMonitorSpace(specs)),
      MON_C: round(scoreMonitorColor(specs)),
    };

    return completeInterpretedProduct(normalizedProduct, axisScores, {
      tier: axisScores.MON_C >= 2.8 ? "색 정확도 후보" : "화면 균형 후보",
      coreUseCase: "작업 공간, 색 확인, 선명도, 장시간 시각 작업",
      recommendedFor: ["여러 창을 펼쳐두는 사용자", "색과 디테일 확인이 중요한 사용자", "본체 성능만큼 화면 품질을 보는 사용자"],
      notRecommendedFor: ["색 정확도가 중요하지 않은 사용자", "책상 공간이 좁은 사용자", "본체 성능이 더 급한 사용자"],
      specSummary: {
        size: specs.sizeInch ? `${specs.sizeInch}인치` : "크기 확인 필요",
        resolution: specs.resolution
          ? `${specs.resolution}${specs.refreshHz ? ` / ${specs.refreshHz}Hz` : ""}`
          : "해상도 확인 필요",
        color: specs.dcip3 ? `DCI-P3 ${specs.dcip3}%급` : specs.srgb ? `sRGB ${specs.srgb}%급` : "색역 확인 필요",
      },
      productTraits: {
        workspaceFit: axisScores.MON_S,
        colorFit: axisScores.MON_C,
        previewSmoothnessFit: round(scoreMonitorRefresh(specs)),
        eyeComfortFit: 2,
      },
      designerExplanation: `${normalizedProduct.name}은 작업 화면 공간과 색·선명도를 제품 기준으로 비교하기 위한 모니터 후보입니다.`,
      overkillWarning: "웹/UI 중심이라면 전문가용 색보정 모니터까지는 과할 수 있습니다.",
      buyingChecklist: ["해상도와 크기 확인", "색역과 색 정확도 확인", "패널 종류 확인", "스탠드 조절과 VESA 지원 확인"],
    });
  }

  function interpretProduct(normalizedProduct) {
    if (normalizedProduct.category === "gpu") return interpretGpuProduct(normalizedProduct);
    if (normalizedProduct.category === "cpu") return interpretCpuProduct(normalizedProduct);
    if (normalizedProduct.category === "ram") return interpretRamProduct(normalizedProduct);
    if (normalizedProduct.category === "ssd") return interpretSsdProduct(normalizedProduct);
    if (normalizedProduct.category === "monitor") return interpretMonitorProduct(normalizedProduct);
    return normalizedProduct;
  }

  function groupByCategory(products) {
    const grouped = PRODUCT_CATEGORIES.reduce((result, category) => {
      result[category] = [];
      return result;
    }, {});

    normalizeList(products).forEach((product) => {
      const category = product.category || "gpu";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(product);
    });

    return grouped;
  }

  function flattenProductSource(source) {
    if (Array.isArray(source)) return source;
    return PRODUCT_CATEGORIES.flatMap((category) =>
      normalizeList(source?.[category]).map((product) => ({ ...product, category: product.category || category })),
    );
  }

  function buildProductCatalog(sourceProducts = {}) {
    const normalized = flattenProductSource(sourceProducts).map((product) =>
      normalizeProduct(product, product.category || "gpu"),
    );
    const interpreted = normalized.map(interpretProduct);

    return {
      rawProducts: groupByCategory(flattenProductSource(sourceProducts)),
      normalizedProducts: groupByCategory(normalized),
      diagnosisProducts: groupByCategory(interpreted),
    };
  }

  window.cpuMasterProductInterpreter = {
    normalizeProduct,
    interpretProduct,
    buildProductCatalog,
  };
})();
