const cpuMasterData = window.cpuMasterData;
const surveyQuestions = cpuMasterData.questions;
const surveyScaleLabels = cpuMasterData.questionScaleLabels;
const programLabels = cpuMasterData.programDisplayLabels;
const termGlossary = cpuMasterData.termDescriptions;
const scoreFields = cpuMasterData.weightFields;
const questionWeightMatrix = cpuMasterData.questionWeights;
const programWeightPresets = cpuMasterData.programPresetWeights;
const appAxisInfo = cpuMasterData.axisDescriptions;
const appSpecDiagnosisCopy = cpuMasterData.specDiagnosisCopy;
const appComponentCriteria = cpuMasterData.componentCriteria;
const appProfilePatterns = cpuMasterData.profilePatterns;
const appTagRules = cpuMasterData.tagRules;
const appMotherboardSupportCriteria = cpuMasterData.motherboardSupportCriteria || {};
const appProgramKnowledge = cpuMasterData.programKnowledge;
const appProgramSpecs = window.cpuMasterProgramSpecs || {};
const appProgramSpecKeyMap = appProgramSpecs.programSpecKeyMap || {};
const appProgramSpecGuides = appProgramSpecs.programSpecGuides || {};
const appMockProducts = window.cpuMasterMockProducts || {};
const appShopDanawaGpuLiveData = window.cpuMasterShopDanawaGpuLiveData || {};
const appDanawaGpuLiveData = window.cpuMasterDanawaGpuLiveData || {};
const appShopDanawaCpuLiveData = window.cpuMasterShopDanawaCpuLiveData || {};
const appDanawaCpuLiveData = window.cpuMasterDanawaCpuLiveData || {};
const appShopDanawaRamLiveData = window.cpuMasterShopDanawaRamLiveData || {};
const appDanawaRamLiveData = window.cpuMasterDanawaRamLiveData || {};
const appShopDanawaSsdLiveData = window.cpuMasterShopDanawaSsdLiveData || {};
const appDanawaSsdLiveData = window.cpuMasterDanawaSsdLiveData || {};
const appShopDanawaMonitorLiveData = window.cpuMasterShopDanawaMonitorLiveData || {};
const appDanawaMonitorLiveData = window.cpuMasterDanawaMonitorLiveData || {};
const appDanawaGpuSamples = window.cpuMasterDanawaGpuSamples || {};
const appDanawaCpuSamples = window.cpuMasterDanawaCpuSamples || {};
const appDanawaRamSsdSamples = window.cpuMasterDanawaRamSsdSamples || {};
const appDanawaMonitorSamples = window.cpuMasterDanawaMonitorSamples || {};
const appProductInterpreter = window.cpuMasterProductInterpreter || {};
const ENABLE_SIMPLE_RESULT_SCREEN = false;

const tradeoffQuestionOptions = {
  23: {
    low: "최종 출력이 조금 느려도 작업 중 조작이 부드러운 쪽",
    high: "작업 중 약간 기다려도 렌더링·내보내기가 빠른 쪽",
  },
  24: {
    low: "지금 작업에 필요한 성능만 맞추는 쪽",
    high: "가격이 조금 올라가도 오래 쓸 여유를 남기는 쪽",
  },
  25: {
    low: "본체 성능을 우선하고 모니터는 기본으로 맞추는 쪽",
    high: "본체 성능을 조금 낮추더라도 모니터 품질을 우선하는 쪽",
  },
};

function mergeProductSources(...sources) {
  const merged = [];
  const seen = new Set();
  sources.flat().filter(Boolean).forEach((product) => {
    const key =
      product.id ||
      product.sourceData?.sourceProductId ||
      product.sourceProductId ||
      `${product.category || ""}:${product.name || ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(product);
  });
  return merged;
}

const productSource = {
  ...(appMockProducts.products || {}),
  gpu: mergeProductSources(
    appShopDanawaGpuLiveData.products ||
    [],
    appDanawaGpuLiveData.products || [],
    appDanawaGpuSamples.products || [],
    appMockProducts.products?.gpu || [],
    appMockProducts.mockGpuCandidates || [],
  ),
  cpu:
    appShopDanawaCpuLiveData.products ||
    appDanawaCpuLiveData.products ||
    appDanawaCpuSamples.products ||
    appMockProducts.products?.cpu ||
    [],
  ram: mergeProductSources(
    appShopDanawaRamLiveData.products || [],
    appDanawaRamLiveData.products || [],
    appDanawaRamSsdSamples.ram || [],
    appMockProducts.products?.ram || [],
  ),
  ssd: mergeProductSources(
    appShopDanawaSsdLiveData.products || [],
    appDanawaSsdLiveData.products || [],
    appDanawaRamSsdSamples.ssd || [],
    appMockProducts.products?.ssd || [],
  ),
  monitor:
    mergeProductSources(
      appShopDanawaMonitorLiveData.products || [],
      appDanawaMonitorLiveData.products || [],
      appDanawaMonitorSamples.products || [],
      appMockProducts.products?.monitor || [],
    ),
};
const appProductCatalog = appProductInterpreter.buildProductCatalog
  ? appProductInterpreter.buildProductCatalog(productSource)
  : {
      diagnosisProducts: {
        gpu: productSource.gpu || [],
        cpu: [],
        ram: [],
        ssd: [],
        monitor: [],
      },
    };
const productCatalog = appProductCatalog.diagnosisProducts || {};

const answers = Array(surveyQuestions.length).fill(null);

let currentQuestionIndex = 0;
const programUsageScores = new Map();
let chipPreference = "all";

const startScreen = document.querySelector("#startScreen");
const programScreen = document.querySelector("#programScreen");
const questionScreen = document.querySelector("#questionScreen");
const loadingScreen = document.querySelector("#loadingScreen");
const resultScreen = document.querySelector("#resultScreen");
const productScreen = document.querySelector("#productScreen");
const loadingStepText = document.querySelector("#loadingStepText");
const loadingStepList = document.querySelector("#loadingStepList");
const startButton = document.querySelector("#startButton");
const programNextButton = document.querySelector("#programNextButton");
const productBackButton = document.querySelector("#productBackButton");
const programHelper = document.querySelector("#programHelper");
const programRows = Array.from(document.querySelectorAll(".program-rating-row"));
const nextButton = document.querySelector("#nextButton");
const questionText = document.querySelector("#questionText");
const progressText = document.querySelector("#progressText");
const progressFill = document.querySelector("#progressFill");
const scaleLowLabel = document.querySelector("#scaleLowLabel");
const scaleHighLabel = document.querySelector("#scaleHighLabel");
const tradeoffPanel = document.querySelector("#tradeoffPanel");
const tradeoffLowText = document.querySelector("#tradeoffLowText");
const tradeoffHighText = document.querySelector("#tradeoffHighText");
const scaleButtons = Array.from(document.querySelectorAll(".scale-button"));
const accordionCards = Array.from(document.querySelectorAll(".accordion-card"));
const termSheetBackdrop = document.querySelector("#termSheetBackdrop");
const termTitle = document.querySelector("#termTitle");
const termDescription = document.querySelector("#termDescription");
const termCloseButton = document.querySelector("#termCloseButton");
const chipPreferenceModal = document.querySelector("#chipPreferenceModal");
const chipPreferenceButtons = Array.from(document.querySelectorAll("[data-chip-preference]"));
const profileTitle = document.querySelector("#profileTitle");
const profileDescription = document.querySelector("#profileDescription");
const profileTags = document.querySelector("#profileTags");
const productProfileTitle = document.querySelector("#productProfileTitle");
const productProfileDescription = document.querySelector("#productProfileDescription");
const productProfileTags = document.querySelector("#productProfileTags");
const priorityContent = document.querySelector("#priorityContent");
const holdContent = document.querySelector("#holdContent");
const prioritySummary = document.querySelector("#prioritySummary");
const holdSummary = document.querySelector("#holdSummary");
const simpleResultButtons = Array.from(document.querySelectorAll('[data-action="show-simple-result"]'));
const productResultButtons = Array.from(document.querySelectorAll('[data-action="show-product-result"]'));
const productBasisSummary = document.querySelector("#productBasisSummary");
const productBasisDescription = document.querySelector("#productBasisDescription");
const productListContainers = {
  gpu: document.querySelector("#gpuProductList"),
  cpu: document.querySelector("#cpuProductList"),
  ram: document.querySelector("#ramProductList"),
  ssd: document.querySelector("#ssdProductList"),
  monitor: document.querySelector("#monitorProductList"),
};
const productSectionContainers = Object.fromEntries(
  Object.entries(productListContainers).map(([category, container]) => [
    category,
    container?.closest(".product-section") || null,
  ]),
);
const estimateLinkSection = document.querySelector(".estimate-link-section");

function createEmptyScore() {
  return scoreFields.reduce((score, field) => {
    score[field] = 0;
    return score;
  }, {});
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

function clampScore(value, min = 0, max = 3) {
  return Math.min(max, Math.max(min, value));
}

function getScoreLevelLabel(score) {
  if (score >= 2) return "높음";
  if (score >= 1.2) return "중간";
  return "낮음";
}

function getProgramUsageScore(program) {
  return programUsageScores.get(program) || 1;
}

function getProgramUsageMultiplier(program) {
  return (getProgramUsageScore(program) - 1) / 4;
}

function getHighUsagePrograms(threshold = 3) {
  return programRows
    .map((row) => row.dataset.program)
    .filter((program) => getProgramUsageScore(program) >= threshold);
}

function isProgramPrimary(program) {
  return getProgramUsageScore(program) >= 5;
}

function isProgramFrequent(program) {
  return getProgramUsageScore(program) >= 4;
}

function calculateProgramScores() {
  const programScore = createEmptyScore();
  const selectedPrograms = programRows
    .map((row) => row.dataset.program)
    .filter((program) => getProgramUsageMultiplier(program) > 0);

  scoreFields.forEach((field) => {
    const fieldValues = selectedPrograms
      .map((program) => {
        const weights = programWeightPresets[program];
        const multiplier = getProgramUsageMultiplier(program);
        return weights ? (weights[field] || 0) * multiplier : 0;
      })
      .filter((value) => value > 0);

    if (fieldValues.length === 0) return;

    const maxValue = Math.max(...fieldValues);
    const averageValue =
      fieldValues.reduce((sum, value) => sum + value, 0) / fieldValues.length;

    programScore[field] = 0.6 * maxValue + 0.4 * averageValue;
  });

  return programScore;
}

function getQuestionWeightConfig(questionIndex) {
  return questionWeightMatrix.find((item) => item.id === questionIndex + 1);
}

function calculateSurveyScores() {
  const surveyScore = createEmptyScore();
  const maxPossibleSurveyScore = createEmptyScore();
  const surveyNorm = createEmptyScore();

  answers.forEach((answer, questionIndex) => {
    if (answer === null) return;

    const config = getQuestionWeightConfig(questionIndex);
    if (!config) return;

    const highSide = answer - 1;
    const lowSide = 5 - answer;

    scoreFields.forEach((field) => {
      const rawWeight = config.weights?.[field] || 0;

      if (rawWeight >= 0) {
        surveyScore[field] += highSide * rawWeight;
      } else {
        surveyScore[field] += lowSide * Math.abs(rawWeight);
      }

      maxPossibleSurveyScore[field] += 4 * Math.abs(rawWeight);
    });
  });

  scoreFields.forEach((field) => {
    const maxScore = maxPossibleSurveyScore[field];
    surveyNorm[field] = maxScore === 0 ? 0 : (3 * surveyScore[field]) / maxScore;
  });

  return {
    surveyScore,
    maxPossibleSurveyScore,
    surveyNorm,
  };
}

function calculateFinalScores() {
  const programScore = calculateProgramScores();
  const { surveyScore, maxPossibleSurveyScore, surveyNorm } = calculateSurveyScores();
  const finalScore = createEmptyScore();

  scoreFields.forEach((field) => {
    finalScore[field] = 0.45 * programScore[field] + 0.55 * surveyNorm[field];
  });

  return {
    programScore,
    surveyScore,
    maxPossibleSurveyScore,
    surveyNorm,
    finalScore,
  };
}

function getSelectedPrograms() {
  return getHighUsagePrograms(3);
}

function getProgramBoost(pattern) {
  return getSelectedPrograms().reduce((boost, program) => {
    const baseBoost = pattern.programBoosts?.[program] || 0;
    return boost + baseBoost * getProgramUsageMultiplier(program);
  }, 0);
}

function calculatePatternScore(pattern, finalScore) {
  const axisScore = Object.entries(pattern.axisWeights || {}).reduce(
    (sum, [field, weight]) => sum + (finalScore[field] || 0) * weight,
    0,
  );
  return Math.min(3, axisScore + getProgramBoost(pattern));
}

const twoDHeavyPrograms = ["Photoshop", "Illustrator", "InDesign"];

function getAverageAnswer(questionNumbers = []) {
  const values = questionNumbers
    .map((questionNumber) => answers[questionNumber - 1])
    .filter((answer) => typeof answer === "number");
  if (values.length === 0) return 0;
  return values.reduce((sum, answer) => sum + answer, 0) / values.length;
}

function getProfileContextBonus(profileId, finalScore) {
  if (profileId !== "TWO_D_HEAVY") return 0;

  const hasTwoDPrimary = twoDHeavyPrograms.some(isProgramPrimary);
  const hasTwoDProgram = hasSelectedProgramIn(twoDHeavyPrograms);
  if (!hasTwoDProgram) return 0;

  const heavyFileAverage = getAverageAnswer([2, 3, 7, 8, 13, 14]);
  const fileAxisAverage =
    ((finalScore.RAM || 0) + (finalScore.CS || 0) + (finalScore.SSD_S || 0)) / 3;
  const colorDominance = Math.max(0, (finalScore.MON_C || 0) - fileAxisAverage);

  let bonus = 0;
  if (hasTwoDPrimary) bonus += 0.16;
  if (heavyFileAverage >= 4) bonus += 0.28;
  else if (heavyFileAverage >= 3.5) bonus += 0.18;
  if (fileAxisAverage >= 2.05) bonus += 0.16;

  return Math.max(0, bonus - colorDominance * 0.25);
}

function hasAnyProgram(programs = []) {
  return programs.some((program) => getProgramUsageScore(program) >= 3);
}

function matchesNameCondition(condition, finalScore) {
  if (!condition) return true;
  if (condition.anyProgram && !hasAnyProgram(condition.anyProgram)) return false;
  if (condition.axisAtLeast) {
    return Object.entries(condition.axisAtLeast).every(
      ([field, threshold]) => (finalScore[field] || 0) >= threshold,
    );
  }
  return true;
}

function pickProfileName(pattern, finalScore) {
  return (
    pattern.names.find((item) => matchesNameCondition(item.when, finalScore)) ||
    pattern.names[0]
  );
}

function calculateProfileResult(finalScore) {
  const profileScores = Object.entries(appProfilePatterns).map(([id, pattern]) => ({
    id,
    pattern,
    score: clampScore(calculatePatternScore(pattern, finalScore) + getProfileContextBonus(id, finalScore)),
  }));

  profileScores.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.12) return scoreDiff;
    return a.pattern.priority - b.pattern.priority;
  });

  const selectedProfile = profileScores[0];
  const selectedName = pickProfileName(selectedProfile.pattern, finalScore);

  return {
    id: selectedProfile.id,
    score: selectedProfile.score,
    title: selectedName.title,
    description: selectedName.description,
    profileScores,
  };
}

function makeTags(finalScore, mainProfileId) {
  const mainProfileTagHints = {
    GPU_3D_AI: ["GPU 가속형"],
    VIDEO_MOTION: ["출력 단축형"],
    SCREEN_MONITOR: ["모니터 투자형"],
    TWO_D_HEAVY: ["체감 반응형"],
    STABILITY_LONG_WORK: ["안정성 중시형"],
  };
  const mutedTags = new Set(mainProfileTagHints[mainProfileId] || []);

  const candidates = appTagRules
    .filter((rule) =>
      Object.entries(rule.axes).every(
        ([field, threshold]) => (finalScore[field] || 0) >= threshold,
      ),
    )
    .map((rule) => ({
      tag: rule.tag,
      score: Object.keys(rule.axes).reduce((sum, field) => sum + (finalScore[field] || 0), 0),
      muted: mutedTags.has(rule.tag),
    }))
    .sort((a, b) => {
      if (a.muted !== b.muted) return a.muted ? 1 : -1;
      return b.score - a.score;
    });

  const uniqueTags = [];
  candidates.forEach((candidate) => {
    if (!uniqueTags.includes(candidate.tag) && uniqueTags.length < 3) {
      uniqueTags.push(candidate.tag);
    }
  });

  return uniqueTags.length > 0 ? uniqueTags : ["예산 균형형"];
}

function getSortedAxes(finalScore, direction = "desc") {
  return scoreFields
    .map((field) => ({ field, score: finalScore[field] || 0, info: appAxisInfo[field] }))
    .sort((a, b) => (direction === "desc" ? b.score - a.score : a.score - b.score));
}

function renderSummary(container, axes) {
  if (!container) return;
  container.innerHTML = axes
    .map(({ info }) => `<span class="summary-chip">${info.title}</span>`)
    .join("");
}

function getProgramContext(field) {
  return getSelectedPrograms()
    .map((program) => {
      const specKey = appProgramSpecKeyMap[program];
      const specGuide = specKey ? appProgramSpecGuides[specKey] : null;
      const specContext = specGuide?.designerExplanation?.[field];
      const context = specContext || appProgramKnowledge[program]?.[field];
      if (!context) return null;
      return {
        program,
        context,
        category: specGuide?.category,
        isPrimary: isProgramPrimary(program),
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

function renderProgramContext(field, mode) {
  const contexts = getProgramContext(field).slice(0, 3);
  if (contexts.length === 0) {
    const fallback =
      mode === "priority"
        ? "선택한 프로그램과 설문 답변을 함께 보면, 이 기준이 작업 흐름에 영향을 줄 가능성이 있습니다."
        : "선택한 프로그램과 설문 답변 기준으로는, 이 기준이 당장 최우선은 아닐 수 있습니다.";

    return `
      <div class="program-context">
        <strong>선택한 프로그램 기준</strong>
        <p>${fallback}</p>
      </div>
    `;
  }

  return `
    <div class="program-context">
      <strong>선택한 프로그램 기준</strong>
      ${contexts
        .map(
          ({ program, context, category, isPrimary }) => `
            <p><span>${renderTermText(program)}${isPrimary ? " · 주력" : ""}${category ? ` · ${renderTermText(category)}` : ""}</span>${renderTermText(context)}</p>
          `,
        )
        .join("")}
    </div>
  `;
}

function getDiagnosisLevel(score, mode) {
  if (mode === "hold") return "low";
  if (score >= 2) return "high";
  if (score >= 1.2) return "medium";
  return "low";
}

function getImportanceClass(label) {
  const classMap = {
    "매우 중요": "danger",
    중요: "warning",
    "보조 지표": "info",
    "보류 가능": "success",
    "보류 기준": "hold",
  };

  return classMap[label] || "neutral";
}

function renderImportance(label, extraClass = "") {
  return `<span class="importance importance-${getImportanceClass(label)} ${extraClass}">${label}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getFirstSentence(text) {
  const cleanText = String(text || "").trim();
  const match = cleanText.match(/^.*?[.!?。]|^.*?[.]/);
  return match ? match[0].trim() : cleanText;
}

function removeProductNameFromSentence(text, productName) {
  const cleanText = String(text || "");
  const name = String(productName || "").trim();
  if (!name) return cleanText;
  return cleanText
    .replace(`${name}은`, "이 후보는")
    .replace(`${name}는`, "이 후보는")
    .replace(name, "이 후보");
}

const termReplacementRules = [
  { pattern: /로컬 AI 이미지 생성/g, key: "localAi" },
  { pattern: /웹 기반 AI 이미지 생성/g, key: "webAi" },
  { pattern: /Quick Sync/g, key: "quickSync" },
  { pattern: /CUDA \/ Tensor/g, key: "tensor" },
  { pattern: /CUDA·Tensor/g, key: "tensor" },
  { pattern: /CUDA/g, key: "cuda" },
  { pattern: /Tensor/g, key: "tensor" },
  { pattern: /NVENC/g, key: "nvenc" },
  { pattern: /AV1/g, key: "av1" },
  { pattern: /VRAM/g, key: "vram" },
  { pattern: /DDR5|DDR4|DDR/g, key: "ddrMemory" },
  { pattern: /NVMe SSD/g, key: "nvme" },
  { pattern: /NVMe/g, key: "nvme" },
  { pattern: /M\.2/g, key: "m2" },
  { pattern: /CPU 소켓/g, key: "cpuSocket" },
  { pattern: /메인보드/g, key: "motherboard" },
  { pattern: /그래픽카드/g, key: "graphicsCard" },
  { pattern: /파워서플라이/g, key: "powerSupply" },
  { pattern: /권장 파워|파워 용량|파워/g, key: "powerSupply" },
  { pattern: /칩셋/g, key: "chipset" },
  { pattern: /PCIe/g, key: "pcie" },
  { pattern: /sRGB/g, key: "srgb" },
  { pattern: /DCI-P3/g, key: "dcip3" },
  { pattern: /Adobe RGB/g, key: "adobeRgb" },
  { pattern: /Delta E/g, key: "deltaE" },
  { pattern: /IPS/g, key: "ips" },
  { pattern: /공랭/g, key: "airCooler" },
  { pattern: /수랭/g, key: "liquidCooler" },
  { pattern: /정격 용량/g, key: "psuWattage" },
  { pattern: /효율 등급/g, key: "psuEfficiency" },
  { pattern: /airflow/g, key: "airflow" },
  { pattern: /통풍/g, key: "airflow" },
  { pattern: /GPU 가속/g, key: "gpuAccel" },
  { pattern: /SSD 캐시/g, key: "ssdCache" },
  { pattern: /RAM 슬롯/g, key: "ramSlot" },
  { pattern: /슬롯/g, key: "ramSlot" },
  { pattern: /CPU/g, key: "cpu" },
  { pattern: /SSD/g, key: "ssd" },
  { pattern: /쿨러/g, key: "cooler" },
  { pattern: /RAM/g, key: "ram" },
];

function renderTermText(value) {
  let html = escapeHtml(value);
  const tokens = [];

  termReplacementRules.forEach(({ pattern, key }) => {
    html = html.replace(
      pattern,
      (match) => {
        const token = `__TERM_TOKEN_${tokens.length}__`;
        tokens.push({
          token,
          html: `<button class="term-button" type="button" data-term="${key}">${match}</button>`,
        });
        return token;
      },
    );
  });

  tokens.forEach(({ token, html: tokenHtml }) => {
    html = html.replaceAll(token, tokenHtml);
  });

  return html;
}

function renderSpecDiagnosis(axis, mode) {
  const level = getDiagnosisLevel(axis.score, mode);
  const specCopy = appSpecDiagnosisCopy[axis.field]?.levels?.[level];

  if (!specCopy) return "";

  return `
    <article class="diagnosis-card">
      <div class="diagnosis-head">
        <strong>${renderTermText(appSpecDiagnosisCopy[axis.field]?.title || axis.info.title)}</strong>
        ${renderImportance(specCopy.badge)}
      </div>
      <p>${renderTermText(specCopy.summary)}</p>
      <p>${renderTermText(specCopy.impact)}</p>
      <div class="check-point"><strong>제품을 볼 때:</strong> ${renderTermText(specCopy.buyingTip)}</div>
      ${specCopy.guard ? `<p class="diagnosis-guard">${renderTermText(specCopy.guard)}</p>` : ""}
    </article>
  `;
}

function renderMotherboardSupport(field, mode) {
  const support = appMotherboardSupportCriteria[field];
  if (!support) return "";

  const description =
    mode === "priority" ? support.priorityDescription : support.holdDescription;
  const pointList = (support.points || [])
    .map((point) => `<span>${renderTermText(point)}</span>`)
    .join("");

  return `
    <article class="motherboard-support ${mode === "hold" ? "motherboard-support-hold" : ""}">
      <div class="motherboard-support-head">
        <span aria-hidden="true">＋</span>
        <strong>${renderTermText(support.title)}</strong>
      </div>
      <p>${renderTermText(description)}</p>
      <div class="motherboard-support-points">${pointList}</div>
      <div class="check-point"><strong>제품을 볼 때:</strong> ${renderTermText(support.checkpoint)}</div>
    </article>
  `;
}

function renderAxisCards(container, axes, mode, topAxes = []) {
  if (!container) return;
  container.innerHTML = axes
    .map((axis) => {
      const { field, score, info } = axis;
      const criteria = appComponentCriteria[field]?.[mode] || [];
      const diagnosis = renderSpecDiagnosis(axis, mode);

      return `
        <section class="criteria-group">
          <div class="criterion-head">
            <h2 class="criteria-group-title">${renderTermText(info.title)}</h2>
            ${
              mode === "priority"
                ? `<span class="importance importance-score">${roundScore(score)}</span>`
                : renderImportance("보류 기준")
            }
          </div>
          <div class="sub-criteria-list">
            ${diagnosis}
            ${renderProgramContext(field, mode)}
            ${criteria
              .map(
                (item) => `
                  <article class="sub-criterion-card">
                    <div class="sub-criterion-head">
                      <h3>${renderTermText(item.title)}</h3>
                      ${renderImportance(item.importance)}
                    </div>
                    <p>${renderTermText(item.description)}</p>
                    <div class="check-point"><strong>제품을 볼 때:</strong> ${renderTermText(item.checkpoint)}</div>
                  </article>
                `,
              )
              .join("")}
            ${renderMotherboardSupport(field, mode)}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderProfileResult(scores) {
  const profile = calculateProfileResult(scores.finalScore);
  const tags = makeTags(scores.finalScore, profile.id);
  const topAxes = getSortedAxes(scores.finalScore).slice(0, 3);
  const lowAxes = getSortedAxes(scores.finalScore, "asc").slice(0, 3);

  if (profileTitle) profileTitle.textContent = profile.title;
  if (profileDescription) profileDescription.textContent = profile.description;
  if (profileTags) {
    profileTags.innerHTML = tags.map((tag) => `<span class="profile-tag">${tag}</span>`).join("");
  }

  renderSummary(prioritySummary, topAxes);
  renderSummary(holdSummary, lowAxes);
  renderAxisCards(priorityContent, topAxes, "priority");
  renderAxisCards(holdContent, lowAxes, "hold", topAxes);
}

function renderResult(scores = calculateFinalScores()) {
  renderProfileResult(scores);
}

const productFitAxisWeightsByCategory = {
  gpu: { GPU: 0.45, VRAM: 0.45, COOL: 0.1 },
  cpu: { CS: 0.42, CM: 0.42, COOL: 0.16 },
  ram: { RAM: 1 },
  ssd: { SSD_S: 0.48, SSD_C: 0.52 },
  monitor: { MON_S: 0.44, MON_C: 0.56 },
};

const productTierBias = {
  "가격 조건부 가성비 후보": 0.2,
  "체감 반응 균형 후보": 0.15,
  "영상·멀티 균형 후보": 0.12,
  "렌더링 고성능 후보": 0,
  "기본 권장 후보": 0.18,
  "대용량 균형 후보": 0.12,
  "워크스테이션 후보": 0,
  "기본 작업용 후보": 0.18,
  "작업·캐시 균형 후보": 0.12,
  "대용량 확장 후보": 0,
  "디자인 기본 후보": 0.18,
  "색·선명도 균형 후보": 0.12,
  "전문 색 작업 후보": 0,
  "균형형 후보": 0.12,
  "고성능 후보": 0,
};

const productSpecLabels = {
  vram: "VRAM",
  cudaTier: "CUDA",
  rawGpuPower: "GPU",
  coolingDifficulty: "전력·쿨링",
  cores: "코어",
  boost: "반응성",
  power: "전력",
  capacity: "용량",
  speed: "속도",
  expand: "확장",
  form: "형태",
  size: "크기",
  color: "색",
  panel: "패널",
  resolution: "해상도",
};

const productSpecAxisMap = {
  gpu: {
    vram: "VRAM",
    cudaTier: "GPU",
    rawGpuPower: "GPU",
    coolingDifficulty: "COOL",
  },
  cpu: {
    cores: "CM",
    boost: "CS",
    power: "COOL",
  },
  ram: {
    capacity: "RAM",
    speed: "RAM",
    expand: "RAM",
  },
  ssd: {
    capacity: "SSD_C",
    speed: "SSD_S",
    form: "SSD_S",
  },
  monitor: {
    size: "MON_S",
    resolution: "MON_S",
    color: "MON_C",
    panel: "MON_C",
  },
};

const productSpecDescriptions = {
  gpu: {
    vram: "고해상도 이미지, 여러 레이어, 로컬 AI 작업처럼 그래픽 메모리를 오래 잡아두는 작업에서 여유를 봅니다.",
    cudaTier: "GPU 가속을 쓰는 영상 효과, 렌더링, 일부 AI 작업에서 체감 차이를 만들 수 있습니다.",
    rawGpuPower: "미리보기 안정성과 GPU 가속 처리량을 함께 볼 때 참고하는 기본 성능입니다.",
    coolingDifficulty: "전력과 발열 부담이 높을수록 파워, 케이스 통풍, 소음까지 같이 확인해야 합니다.",
  },
  cpu: {
    cores: "렌더링, 인코딩, 여러 앱 동시 작업에서 버티는 힘을 볼 때 참고합니다.",
    boost: "필터 적용, 타임라인 조작, 앱 반응성처럼 순간 처리에 영향을 주는 기준입니다.",
    power: "전력 기준은 발열, 소음, 쿨러와 파워 여유를 함께 확인하기 위한 항목입니다.",
  },
  ram: {
    capacity: "대형 PSD, 영상 편집, 브라우저와 앱 동시 실행에서 작업 여유를 좌우합니다.",
    speed: "체감 차이는 제한적일 수 있지만 CPU와 메인보드 조합을 볼 때 참고하면 좋습니다.",
    expand: "나중에 용량을 늘릴 수 있는지 확인할 때 보는 기준입니다.",
  },
  ssd: {
    capacity: "소스 파일, 캐시, 프로젝트 파일을 함께 둘 때 작업 공간의 여유를 봅니다.",
    speed: "캐시, 프록시, 대용량 파일 이동에서 작업 흐름이 막히는지 판단할 때 봅니다.",
    form: "메인보드 슬롯 호환과 발열판 장착 가능성을 확인하기 위한 기본 정보입니다.",
  },
  monitor: {
    size: "작업 창, 타임라인, 레퍼런스를 동시에 펼칠 수 있는 화면 공간을 봅니다.",
    resolution: "작은 글자, 얇은 선, 이미지 디테일을 확인하는 데 영향을 줍니다.",
    color: "색 확인이 중요한 디자인과 영상 작업에서 먼저 볼 만한 기준입니다.",
    panel: "색, 시야각, 반응 특성의 기본 방향을 확인할 때 참고합니다.",
  },
};

const productSpecCheckpoints = {
  gpu: {
    vram: "4K 영상, 모션, 로컬 AI 작업이면 여유 있는 VRAM을 우선 확인하세요.",
    cudaTier: "같은 세대라면 CUDA 코어 수와 실제 벤치 성능을 함께 보세요.",
    rawGpuPower: "가격 차이가 크다면 GPU 성능보다 VRAM, 전력, 전체 구성 균형을 같이 보세요.",
    coolingDifficulty: "케이스 길이, 권장 파워, 쿨링 리뷰를 함께 확인하세요.",
  },
  cpu: {
    cores: "렌더링과 인코딩 비중이 크면 멀티코어 벤치마크를 같이 보세요.",
    boost: "작업 중 반응성이 중요하면 싱글코어 벤치마크를 확인하세요.",
    power: "장시간 작업이 많다면 쿨러와 메인보드 전원부 여유를 같이 보세요.",
  },
  ram: {
    capacity: "동시에 여는 파일과 앱이 많다면 용량을 먼저 확인하세요.",
    speed: "CPU와 메인보드가 지원하는 규격인지 확인하세요.",
    expand: "남는 슬롯과 최대 지원 용량을 같이 보세요.",
  },
  ssd: {
    capacity: "캐시와 프로젝트 파일을 한 드라이브에 둘지 먼저 정하세요.",
    speed: "대용량 파일을 자주 다룬다면 실제 지속 쓰기 성능도 보세요.",
    form: "메인보드 M.2 슬롯 규격과 방열판 간섭을 확인하세요.",
  },
  monitor: {
    size: "책상 거리와 해상도를 같이 봐야 글자 크기가 편합니다.",
    resolution: "해상도가 높을수록 GPU 부담과 글자 배율 설정도 함께 보세요.",
    color: "색 작업이 많다면 색역, 캘리브레이션, 패널 균일도를 같이 보세요.",
    panel: "영상, 디자인, 게임 비중에 따라 패널 특성의 우선순위가 달라집니다.",
  },
};

function getProductSpecAxis(product, label) {
  return productSpecAxisMap[product.category]?.[label] || null;
}

function getFallbackSpecInsightDescription(product, label) {
  return (
    productSpecDescriptions[product.category]?.[label] ||
    "이 스펙은 작업 흐름에서 병목이 생길 가능성을 확인하기 위한 참고 기준입니다."
  );
}

function getSpecNeedLevel(product, label, recommendation, finalScore = {}) {
  const field = getProductSpecAxis(product, label);
  const comparison = recommendation.axisComparisons.find((item) => item.field === field);
  const score = comparison?.userScore ?? finalScore[field] ?? 0;
  if (score >= 2) return "high";
  if (score >= 1.2) return "medium";
  return "low";
}

function getFrequentProgramNames(limit = 2) {
  return getHighUsagePrograms(4)
    .map((program) => programLabels[program] || program)
    .slice(0, limit);
}

function makeProgramContextText(fallback = "현재 작업") {
  const programs = getFrequentProgramNames(2);
  if (programs.length === 0) return fallback;
  return programs.join("과 ");
}

function getProductSpecInsightDescription(product, label, recommendation, finalScore = {}) {
  const needLevel = getSpecNeedLevel(product, label, recommendation, finalScore);
  const programText = makeProgramContextText();
  const isLocalAiOrVideo = hasSelectedProgramIn([
    "로컬 AI 이미지 생성",
    "Premiere Pro",
    "After Effects",
    "DaVinci Resolve",
    "Blender",
    "Cinema 4D",
  ]);

  if (product.category === "gpu" && label === "vram") {
    if (needLevel === "high") {
      return isLocalAiOrVideo
        ? `로컬 AI 이미지 생성이나 영상 편집처럼 그래픽카드 작업 공간을 오래 쓰는 흐름이 보여서, VRAM 여유를 먼저 확인하는 편이 좋습니다.`
        : "고해상도 이미지나 여러 레이어를 자주 다루는 응답이라, VRAM 부족이 프리뷰와 저장 흐름을 답답하게 만들 수 있습니다.";
    }
    if (needLevel === "medium") {
      return "당장 최상급 VRAM까지 볼 필요는 낮지만, 고해상도 소스와 여러 앱을 함께 쓰는 순간을 대비해 중간 이상 여유를 보면 좋습니다.";
    }
    return "지금 답변 기준에서는 VRAM을 과하게 올리기보다, 가격과 전체 부품 균형을 먼저 보는 편이 좋습니다.";
  }

  if (product.category === "gpu" && label === "cudaTier") {
    if (needLevel === "high") {
      return "GPU 가속이나 로컬 AI 이미지 생성처럼 반복 계산을 그래픽카드에 맡기는 작업 비중이 있어, CUDA 성능을 함께 봐야 합니다.";
    }
    if (needLevel === "medium") {
      return "GPU 가속을 쓰는 순간은 있지만 매번 병목이 되는 유형은 아니라, CUDA 숫자만 단독으로 보기보다 실제 앱 벤치와 함께 보면 좋습니다.";
    }
    return "현재 흐름에서는 CUDA 코어 수보다 가격, VRAM, 전력 균형이 더 먼저 볼 기준입니다.";
  }

  if (product.category === "cpu" && label === "cores") {
    if (needLevel === "high") {
      return "렌더링과 인코딩, 여러 앱을 동시에 여는 흐름이 있어 CPU 멀티코어 성능이 작업 시간을 줄이는 데 영향을 줄 수 있습니다.";
    }
    if (needLevel === "medium") {
      return "가끔 무거운 출력 작업이 섞이는 편이라, 코어 수는 기본 이상으로 보되 최상위 CPU까지 고집할 필요는 낮습니다.";
    }
    return "지금 답변에서는 CPU 멀티코어보다 작업 중 반응성, RAM, SSD 균형을 먼저 보는 편이 좋습니다.";
  }

  if (product.category === "cpu" && label === "boost") {
    if (needLevel === "high") {
      return "작업 중 조작감과 앱 반응성이 중요한 응답이라, 싱글코어 성능과 부스트 클럭을 같이 확인하면 좋습니다.";
    }
    if (needLevel === "medium") {
      return "기본 반응성은 중요하지만 부스트 숫자만 높다고 항상 체감이 커지는 것은 아니라, 세대와 실제 앱 리뷰를 함께 보세요.";
    }
    return "부스트 클럭은 참고 정도로 보고, 현재는 예산을 더 체감 큰 부품에 배분해도 괜찮습니다.";
  }

  if (product.category === "ram" && label === "capacity") {
    if (needLevel === "high") {
      return `${programText}처럼 여러 파일과 앱을 함께 켜는 흐름이 있어, RAM 용량 여유가 멀티태스킹 체감에 직접 영향을 줄 수 있습니다.`;
    }
    if (needLevel === "medium") {
      return "작업량이 커질 때를 대비해 RAM은 너무 타이트하게 잡지 않는 편이 좋습니다.";
    }
    return "현재 답변에서는 대용량 RAM보다 기본 용량과 가격 균형을 먼저 맞춰도 괜찮습니다.";
  }

  if (product.category === "ssd" && label === "speed") {
    if (needLevel === "high") {
      return "큰 소스 파일, 캐시, 프로젝트 파일을 자주 읽고 쓰는 응답이라 NVMe SSD 속도가 작업 흐름을 덜 끊기게 해줄 수 있습니다.";
    }
    if (needLevel === "medium") {
      return "SSD 속도는 체감될 수 있지만, 최고 속도보다 충분한 용량과 안정적인 모델인지 함께 보는 편이 좋습니다.";
    }
    return "지금은 최상급 SSD 속도보다 용량, 가격, 브랜드 안정성을 먼저 봐도 충분합니다.";
  }

  if (product.category === "monitor" && label === "color") {
    if (needLevel === "high") {
      return "색 확인 비중이 높게 나와서 sRGB, DCI-P3, Delta E 같은 색 정확도 정보를 우선 확인하는 편이 좋습니다.";
    }
    if (needLevel === "medium") {
      return "색 품질은 중요하지만 전문 색보정 모델까지 고집하기보다 IPS 패널과 기본 색역을 먼저 보면 좋습니다.";
    }
    return "현재 답변에서는 고급 색역보다 화면 크기, 해상도, 본체 성능 균형이 더 중요할 수 있습니다.";
  }

  return getFallbackSpecInsightDescription(product, label);
}

function getProductSpecCheckpoint(product, label, recommendation, finalScore = {}) {
  const needLevel = getSpecNeedLevel(product, label, recommendation, finalScore);
  if (product.category === "gpu" && label === "vram" && needLevel === "low") {
    return "VRAM 숫자만 올리기보다 GPU 성능, 가격, 파워 여유를 함께 확인하세요.";
  }
  if (product.category === "cpu" && label === "cores" && needLevel === "low") {
    return "멀티코어 벤치보다 싱글코어 체감 리뷰와 전체 예산 균형을 먼저 보세요.";
  }
  if (product.category === "monitor" && label === "color" && needLevel === "high") {
    return "sRGB, DCI-P3, Delta E와 공장 색보정 여부를 함께 확인하세요.";
  }

  return (
    productSpecCheckpoints[product.category]?.[label] ||
    "제품 상세 페이지의 세부 규격과 실제 사용 후기를 함께 확인하세요."
  );
}

function getProductSpecImportance(product, label, recommendation) {
  const field = getProductSpecAxis(product, label);
  const comparison = recommendation.axisComparisons.find((item) => item.field === field);
  const userScore = comparison?.userScore || 0;
  const productScore = comparison?.productScore || 0;
  const score = Math.max(userScore, Math.min(3, productScore));

  if (score >= 2.25) return { label: "매우 중요", tone: "critical" };
  if (score >= 1.6) return { label: "중요", tone: "warning" };
  if (score >= 1.05) return { label: "보조 지표", tone: "support" };
  return { label: "참고", tone: "reference" };
}

function getProductSpecInsightItems(product, recommendation, finalScore = {}) {
  return Object.entries(product.specSummary || {})
    .slice(0, 4)
    .map(([label, value]) => {
      const importance = getProductSpecImportance(product, label, recommendation);
      return {
        title: productSpecLabels[label] || label,
        value,
        importanceLabel: importance.label,
        importanceTone: importance.tone,
        description: getProductSpecInsightDescription(product, label, recommendation, finalScore),
        checkpoint: getProductSpecCheckpoint(product, label, recommendation, finalScore),
      };
    });
}

function getProductPriceLabel(product) {
  const price = product.sourceData?.price ?? product.price;
  return typeof price === "number" && price > 0 ? `${price.toLocaleString("ko-KR")}원` : "가격 미확인";
}

function getProductSearchText(product) {
  return [
    product.name,
    product.brand,
    product.tier,
    product.sourceData?.rawName,
    product.sourceData?.rawSpecText,
  ]
    .filter(Boolean)
    .join(" ");
}

function isCpuOutsideDesignerPool(product) {
  if (product.category !== "cpu") return false;
  const text = getProductSearchText(product);
  return /벌크|코어X|Core\s*X|Threadripper|스레드리퍼|Xeon|제온|EPYC|에픽/i.test(text);
}

function getCpuAgePenalty(product) {
  if (product.category !== "cpu") return 0;
  const text = getProductSearchText(product);
  if (/코어i[3579]-[1-7]세대|라이젠[3579]-[1-3]세대/i.test(text)) return 0.28;
  if (/코어i[3579]-[89]세대|라이젠[3579]-4세대/i.test(text)) return 0.14;
  return 0;
}

function isLightWebAiProfile(finalScore = {}) {
  const webAiPrimary = isProgramFrequent("웹 기반 AI 이미지 생성");
  const webReferencePrimary = isProgramFrequent("웹/레퍼런스 중심 작업");
  const localGpuWork = hasSelectedProgramIn(["로컬 AI 이미지 생성", "Blender", "Cinema 4D", "DaVinci Resolve"]);
  return (
    (webAiPrimary || webReferencePrimary) &&
    !localGpuWork &&
    (finalScore.GPU || 0) < 1.7 &&
    (finalScore.VRAM || 0) < 1.7
  );
}

function getContextualProductBias(product, finalScore = {}) {
  let bias = 0;

  if (product.category === "cpu") {
    bias -= getCpuAgePenalty(product);
  }

  if (product.category === "gpu" && isLightWebAiProfile(finalScore)) {
    const gpuSupply = ((product.axisScores?.GPU || 0) + (product.axisScores?.VRAM || 0)) / 2;
    bias -= 0.22 + Math.max(0, gpuSupply - 1.7) * 0.16;
  }

  if (product.category === "monitor") {
    const refreshHz = product.specs?.refreshHz || 0;
    const colorNeed = finalScore.MON_C || 0;
    const colorSupply = product.axisScores?.MON_C || 0;
    const isVideoRefreshRelevant = shouldMentionMonitorRefresh(product);

    if (!isVideoRefreshRelevant && refreshHz >= 200) bias -= 0.24;
    else if (!isVideoRefreshRelevant && refreshHz >= 144) bias -= 0.16;

    if (colorNeed >= 2.05 && colorSupply >= 2.5) bias += 0.12;
    if (colorNeed >= 2.35 && refreshHz <= 100 && colorSupply >= 2.35) bias += 0.08;
  }

  return bias;
}

function getAxisFit(userScore, productScore) {
  return clampScore(3 - Math.abs(userScore - productScore));
}

function getAxisCoverageFit(userScore, productScore) {
  if (userScore < 1.2) return getAxisFit(userScore, productScore);

  const gap = productScore - userScore;
  return gap >= 0
    ? clampScore(3 - gap * 0.35)
    : clampScore(3 + gap * 1.25);
}

const monitorSpacePrograms = ["Figma", "웹/레퍼런스 중심 작업", "Premiere Pro", "After Effects"];
const monitorColorPrograms = ["Photoshop", "Illustrator", "InDesign", "DaVinci Resolve", "웹 기반 AI 이미지 생성"];

function hasSelectedProgramIn(programs = []) {
  return programs.some((program) => getProgramUsageScore(program) >= 3);
}

function getMonitorAxisWeights(finalScore) {
  let spaceWeight = 0.44;
  let colorWeight = 0.56;

  if ((finalScore.MON_S || 0) - (finalScore.MON_C || 0) >= 0.35) {
    spaceWeight += 0.12;
    colorWeight -= 0.12;
  }
  if ((finalScore.MON_C || 0) - (finalScore.MON_S || 0) >= 0.35) {
    colorWeight += 0.12;
    spaceWeight -= 0.12;
  }
  if (hasSelectedProgramIn(monitorSpacePrograms)) {
    spaceWeight += 0.08;
    colorWeight -= 0.08;
  }
  if (hasSelectedProgramIn(monitorColorPrograms)) {
    colorWeight += 0.1;
    spaceWeight -= 0.1;
  }
  if (videoPrograms.some(isProgramFrequent)) {
    colorWeight += 0.04;
    spaceWeight -= 0.04;
  }

  const total = Math.max(0.01, spaceWeight + colorWeight);
  return {
    MON_S: clampScore((spaceWeight / total) * 3) / 3,
    MON_C: clampScore((colorWeight / total) * 3) / 3,
  };
}

function getProductAxisWeight(product, field, finalScore = {}) {
  if (product.category === "monitor" && (field === "MON_S" || field === "MON_C")) {
    return getMonitorAxisWeights(finalScore)[field] || 0.5;
  }
  return productFitAxisWeightsByCategory[product.category]?.[field] || 0.15;
}

function getProductFitLabel(score) {
  if (score >= 2.45) return "잘 맞음";
  if (score >= 1.85) return "비교 요망";
  return "주의";
}

function getProductFitTone(score) {
  if (score >= 2.45) return "strong";
  if (score >= 1.85) return "caution";
  return "low";
}

function getProductSourceMeta(product) {
  const price = product.sourceData?.price;
  const hasPrice = typeof price === "number" && price > 0;
  const priceLabel = hasPrice ? `${price.toLocaleString("ko-KR")}원` : "가격 미확인";

  return `
    <div class="product-source-meta" aria-label="가격 상태">
      <span>${escapeHtml(priceLabel)}</span>
    </div>
  `;
}

function getProductScoreSummary({ matchScore, overkillRisk, practicalScore }) {
  return [
    {
      label: "작업 궁합",
      value: matchScore >= 2.35 ? "잘 맞음" : matchScore >= 1.75 ? "무난함" : "조건부",
      tone: matchScore >= 2.35 ? "strong" : matchScore >= 1.75 ? "good" : "caution",
    },
    {
      label: "사양 여유",
      value: overkillRisk >= 1 ? "많음" : overkillRisk >= 0.45 ? "보통" : "적당함",
      tone: overkillRisk >= 1 ? "caution" : overkillRisk >= 0.45 ? "neutral" : "good",
    },
    {
      label: "추천 판단",
      value: practicalScore >= 2.35 ? "우선 후보" : practicalScore >= 1.75 ? "비교 후보" : "신중히",
      tone: practicalScore >= 2.35 ? "strong" : practicalScore >= 1.75 ? "caution" : "low",
    },
  ];
}

function getProductAxisNeedLabel(score) {
  if (score >= 2) return "많이 필요";
  if (score >= 1.2) return "어느 정도 필요";
  return "우선순위 낮음";
}

function getProductAxisSupplyLabel(score) {
  if (score >= 2.5) return "여유 큼";
  if (score >= 1.8) return "충분";
  if (score >= 1.1) return "기본";
  return "낮음";
}

function getAxisMatchWord({ field, userScore, productScore }) {
  if (field === "COOL") {
    if (productScore >= 2.3) return "가벼움";
    if (productScore >= 1.6) return "무난";
    return "부담 큼";
  }

  const gap = productScore - userScore;
  if (userScore >= 2.1 && gap < -0.35) return "부족";
  if (gap >= 1) return "과함";
  if (gap >= 0.35) return "여유";
  if (gap >= -0.35) return "적당";
  return "조건부";
}

function getAxisMatchTone(word) {
  const toneMap = {
    가벼움: "strong",
    무난: "good",
    "부담 큼": "low",
    부족: "low",
    과함: "caution",
    여유: "strong",
    적당: "good",
    조건부: "caution",
  };
  return toneMap[word] || "neutral";
}

function getProductRole(index, product) {
  if (index === 0) return "강추";
  if (/가성비|기본|가격/.test(product.tier || "")) return "가성비";
  if (/고성능|워크스테이션|전문/.test(product.tier || "")) return "고성능";
  if (/대용량|확장/.test(product.tier || "")) return "대용량";
  if (/색|디자인/.test(product.tier || "")) return "디자인";
  return "균형";
}

function getProductRoleTone(role) {
  const toneMap = {
    강추: "strong",
    가성비: "good",
    고성능: "caution",
    대용량: "info",
    디자인: "info",
    균형: "neutral",
  };
  return toneMap[role] || "neutral";
}

function calculateProductFit(product, finalScore) {
  const axisEntries = Object.entries(product.axisScores || {});
  const weightedFit = axisEntries.reduce(
    (result, [field, productScore]) => {
      const weight = getProductAxisWeight(product, field, finalScore);
      const userScore = finalScore[field] || 0;
      const axisFit = getAxisFit(userScore, productScore);
      const coverageFit = getAxisCoverageFit(userScore, productScore);

      result.fitTotal += axisFit * weight;
      result.coverageTotal += coverageFit * weight;
      result.weightTotal += weight;

      result.overkillTotal += Math.max(0, productScore - userScore) * weight;
      result.overkillWeight += weight;

      result.axisComparisons.push({
        field,
        title: appAxisInfo[field]?.title || field,
        userScore,
        productScore,
        axisFit,
      });

      return result;
    },
    {
      fitTotal: 0,
      coverageTotal: 0,
      weightTotal: 0,
      overkillTotal: 0,
      overkillWeight: 0,
      axisComparisons: [],
    },
  );

  const matchScore =
    weightedFit.weightTotal === 0 ? 0 : weightedFit.fitTotal / weightedFit.weightTotal;
  const coverageScore =
    weightedFit.weightTotal === 0 ? 0 : weightedFit.coverageTotal / weightedFit.weightTotal;
  const overkillRisk =
    weightedFit.overkillWeight === 0
      ? 0
      : weightedFit.overkillTotal / weightedFit.overkillWeight;
  const coolingBurden = product.productTraits?.coolingBurden || product.axisScores?.COOL || 0;
  const userCoolingNeed = finalScore.COOL || 0;
  const coolingPenalty =
    userCoolingNeed < 1.2
      ? coolingBurden * 0.1
      : Math.max(0, coolingBurden - userCoolingNeed) * 0.08;
  const monitorRefreshBonus =
    product.category === "monitor" && shouldMentionMonitorRefresh(product)
      ? getAxisCoverageFit(2, product.productTraits?.previewSmoothnessFit || 0) * 0.045
      : 0;
  const contextualBias = getContextualProductBias(product, finalScore);
  const practicalScore = clampScore(
    matchScore * 0.42 +
      coverageScore * 0.58 -
      overkillRisk * 0.22 -
      coolingPenalty +
      monitorRefreshBonus +
      contextualBias +
      (productTierBias[product.tier] || 0),
  );

  return {
    product,
    matchScore,
    coverageScore,
    overkillRisk,
    practicalScore,
    coolingBurden,
    monitorRefreshBonus,
    contextualBias,
    axisComparisons: weightedFit.axisComparisons,
  };
}

function getProductPrice(product) {
  const price = product.sourceData?.price ?? product.price;
  return typeof price === "number" && price > 0 ? price : Number.POSITIVE_INFINITY;
}

function getRamSpecKey(product) {
  const specs = product.specs || {};
  return [
    specs.memoryType || "unknown",
    specs.capacityGb || "unknown",
    specs.speedMt || "unknown",
    specs.modules || "unknown",
  ].join("|");
}

function isTrustedRamBrand(product) {
  const text = `${product.brand || ""} ${product.name || ""}`.toLowerCase();
  return /samsung|삼성|sk\s*hynix|sk하이닉스|하이닉스/.test(text);
}

function getRamPreferenceScore(product) {
  let score = 0;
  if (isTrustedRamBrand(product)) score += 0.18;
  if (/삼성|하이닉스|sk\s*hynix|samsung/i.test(`${product.name} ${product.brand}`)) score += 0.04;
  return score;
}

function pickRamSpecRepresentatives(recommendations) {
  const groups = new Map();
  recommendations.forEach((recommendation) => {
    const key = getRamSpecKey(recommendation.product);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(recommendation);
  });

  const picked = [];
  groups.forEach((group) => {
    const byPrice = [...group].sort((a, b) => getProductPrice(a.product) - getProductPrice(b.product));
    const cheapest = byPrice[0];
    const trusted = [...group]
      .filter((item) => isTrustedRamBrand(item.product))
      .sort((a, b) => getProductPrice(a.product) - getProductPrice(b.product))[0];

    if (cheapest) picked.push({ ...cheapest, ramPickReason: "가격 우선" });
    if (trusted && trusted.product.id !== cheapest?.product.id) {
      picked.push({ ...trusted, ramPickReason: "신뢰 브랜드" });
    }
  });

  return picked.sort((a, b) => {
    const scoreDiff = b.practicalScore - a.practicalScore;
    if (Math.abs(scoreDiff) > 0.08) return scoreDiff;

    const preferenceDiff = getRamPreferenceScore(b.product) - getRamPreferenceScore(a.product);
    if (Math.abs(preferenceDiff) > 0.01) return preferenceDiff;

    return getProductPrice(a.product) - getProductPrice(b.product);
  });
}

function getSsdSpecKey(product) {
  const specs = product.specs || {};
  return [
    specs.capacityTb || "unknown",
    specs.interfaceType || "unknown",
    specs.formFactor || "unknown",
    specs.readMb ? Math.round(specs.readMb / 1000) * 1000 : "unknown",
  ].join("|");
}

function isTrustedSsdBrand(product) {
  const text = `${product.brand || ""} ${product.name || ""}`.toLowerCase();
  return /samsung|삼성|sk\s*hynix|sk하이닉스|하이닉스|wd|western|sandisk|crucial|마이크론|solidigm|솔리다임|kioxia|키오시아/.test(
    text,
  );
}

function getSsdPreferenceScore(product) {
  let score = 0;
  if (isTrustedSsdBrand(product)) score += 0.16;
  if ((product.specs?.capacityTb || 0) >= 2) score += 0.04;
  return score;
}

function pickSsdSpecRepresentatives(recommendations) {
  const groups = new Map();
  recommendations.forEach((recommendation) => {
    const key = getSsdSpecKey(recommendation.product);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(recommendation);
  });

  const picked = [];
  groups.forEach((group) => {
    const byPrice = [...group].sort((a, b) => getProductPrice(a.product) - getProductPrice(b.product));
    const cheapest = byPrice[0];
    const trusted = [...group]
      .filter((item) => isTrustedSsdBrand(item.product))
      .sort((a, b) => getProductPrice(a.product) - getProductPrice(b.product))[0];

    if (cheapest) picked.push({ ...cheapest, ssdPickReason: "가격 우선" });
    if (trusted && trusted.product.id !== cheapest?.product.id) {
      picked.push({ ...trusted, ssdPickReason: "신뢰 브랜드" });
    }
  });

  return picked.sort((a, b) => {
    const scoreDiff = b.practicalScore - a.practicalScore;
    if (Math.abs(scoreDiff) > 0.08) return scoreDiff;

    const preferenceDiff = getSsdPreferenceScore(b.product) - getSsdPreferenceScore(a.product);
    if (Math.abs(preferenceDiff) > 0.01) return preferenceDiff;

    return getProductPrice(a.product) - getProductPrice(b.product);
  });
}

const videoPrograms = ["Premiere Pro", "After Effects", "DaVinci Resolve"];

function shouldMentionMonitorRefresh(product) {
  if (product.category !== "monitor") return false;
  if ((product.specs?.refreshHz || 0) < 100) return false;

  const selectedVideoProgramCount = videoPrograms.filter((program) =>
    getProgramUsageScore(program) >= 3,
  ).length;

  return videoPrograms.some(isProgramFrequent) || selectedVideoProgramCount >= 2;
}

function getMonitorRefreshNote(product) {
  if (!shouldMentionMonitorRefresh(product)) return "";

  return ` 영상 프로그램을 주력으로 쓰거나 여러 영상 툴을 함께 쓰는 경우에는 ${product.specs.refreshHz}Hz 주사율이 타임라인 프리뷰와 움직임 확인을 조금 더 편하게 느끼게 해줄 수 있습니다.`;
}

function getProductReason(recommendation, finalScore) {
  const { product, axisComparisons } = recommendation;
  const strongestAxes = axisComparisons
    .sort((a, b) => b.userScore - a.userScore)
    .slice(0, 2);
  const axisText = strongestAxes
    .map(({ title, userScore }) => `${title}(${getScoreLevelLabel(userScore)})`)
    .join(" · ");

  const isAllLow = axisComparisons.every(({ userScore }) => userScore < 1.2);
  const productSummary = removeProductNameFromSentence(
    getFirstSentence(product.designerExplanation),
    product.name,
  );
  const refreshNote = getMonitorRefreshNote(product);
  const ramReason =
    product.category === "ram" && recommendation.ramPickReason
      ? recommendation.ramPickReason === "신뢰 브랜드"
        ? " 같은 스펙 안에서 삼성/SK하이닉스처럼 AS와 교체 가능성을 기대하기 쉬운 브랜드라 비교 후보로 올렸습니다."
        : " 같은 스펙 안에서 가격이 가장 낮은 축에 있어 먼저 비교할 후보로 올렸습니다."
      : "";
  const ssdReason =
    product.category === "ssd" && recommendation.ssdPickReason
      ? recommendation.ssdPickReason === "신뢰 브랜드"
        ? " 같은 용량과 속도대 안에서 삼성, SK하이닉스, WD, Crucial처럼 신뢰도가 높은 브랜드라 비교 후보로 올렸습니다."
        : " 같은 용량과 속도대 안에서 가격이 가장 낮은 축에 있어 먼저 비교할 후보로 올렸습니다."
      : "";
  const pickReason = ramReason || ssdReason;
  if (isAllLow) {
    return `앞선 진단에서 이 부품 축은 최우선까지는 아니었습니다. 그래서 이 후보는 꼭 사야 할 제품이라기보다, 어느 정도부터 과한 선택인지 비교하기 위한 기준입니다.${pickReason} ${productSummary}${refreshNote}`;
  }

  return `앞선 진단에서 ${axisText} 기준이 제품 선택에 영향을 줄 수 있게 나왔습니다. 이 후보는 그 기준을 실제 제품 스펙으로 바꿔봤을 때 비교해볼 만한 제품입니다.${pickReason} ${productSummary}${refreshNote}`;
}

function getProductDynamicWarning(recommendation, finalScore) {
  const { product, overkillRisk, coolingBurden } = recommendation;

  if (overkillRisk >= 0.95) {
    return "현재 답변 기준보다 이 부품의 스펙 여유가 더 높은 후보입니다. 이 제품을 고르느라 더 중요한 부품 예산이 줄어든다면 실제 체감은 오히려 낮아질 수 있습니다.";
  }

  if (coolingBurden - (finalScore.COOL || 0) >= 1) {
    return "제품 자체의 전력·발열 부담이 사용자의 안정성 기준보다 큰 편입니다. 고성능을 선택한다면 파워, 케이스 통풍, 소음 리뷰를 같이 확인해야 합니다.";
  }

  return product.overkillWarning;
}

function getProgramProductFitScore(program, product) {
  const productAxisWeights = productFitAxisWeightsByCategory[product.category] || {};
  const productAxes = Object.keys(productAxisWeights);
  const programKnowledge = appProgramKnowledge[program] || {};
  const relevantAxes = productAxes.filter((axis) => programKnowledge[axis]);

  if (relevantAxes.length === 0) {
    return {
      program,
      score: 0,
      relevantAxes,
      label: programLabels[program] || program,
    };
  }

  const weightedScore = relevantAxes.reduce((sum, axis) => {
    const needWeight = programWeightPresets[program]?.[axis] || 1;
    const productScore = product.axisScores?.[axis] || 0;
    return sum + productScore * needWeight;
  }, 0);
  const weightTotal = relevantAxes.reduce(
    (sum, axis) => sum + (programWeightPresets[program]?.[axis] || 1),
    0,
  );

  return {
    program,
    score: weightTotal ? weightedScore / weightTotal : 0,
    relevantAxes,
    label: programLabels[program] || program,
  };
}

function getProductProgramFitGroups(product) {
  const selectedPrograms = getHighUsagePrograms(3);
  const sourcePrograms = selectedPrograms.length > 0 ? selectedPrograms : getHighUsagePrograms(1);
  const rankedPrograms = sourcePrograms
    .map((program) => getProgramProductFitScore(program, product))
    .sort((a, b) => {
      const usageDiff = getProgramUsageScore(b.program) - getProgramUsageScore(a.program);
      if (usageDiff !== 0) return usageDiff;
      return b.score - a.score;
    });

  const goodPrograms = rankedPrograms
    .filter((item) => item.relevantAxes.length > 0 && item.score >= 1.55)
    .slice(0, 3);
  let lessPrograms = rankedPrograms
    .filter((item) => !goodPrograms.some((good) => good.program === item.program))
    .filter((item) => item.relevantAxes.length === 0 || item.score < 1.55)
    .slice(0, 3);

  if (lessPrograms.length === 0) {
    lessPrograms = rankedPrograms
      .filter((item) => !goodPrograms.some((good) => good.program === item.program))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
  }

  return {
    good: goodPrograms,
    less: lessPrograms,
  };
}

function renderProgramFitChips(programs, emptyText) {
  if (!programs.length) {
    return `<span class="program-fit-empty">${escapeHtml(emptyText)}</span>`;
  }

  return programs
    .map((item) => `<span class="program-fit-chip">${escapeHtml(item.label)}</span>`)
    .join("");
}

function isProductInRecommendationPool(product) {
  if (isCpuOutsideDesignerPool(product)) return false;
  const eligibility = product.sourceData?.qualityFlags?.recommendationEligibility;
  if (!eligibility) return true;
  return !eligibility.hardRejected && !eligibility.referenceOnly;
}

function getProductSearchText(product) {
  return [
    product.name,
    product.brand,
    product.chipBrand,
    product.sourceData?.rawName,
    product.sourceData?.rawSpecText,
    product.sourceData?.searchKeyword,
  ]
    .filter(Boolean)
    .join(" ");
}

function isIntelProduct(product) {
  return /intel|인텔|core\s|코어\s/i.test(getProductSearchText(product));
}

function isNvidiaProduct(product) {
  return /nvidia|엔비디아|geforce|rtx|gtx/i.test(getProductSearchText(product));
}

function filterProductsByChipPreference(products, category) {
  if (chipPreference !== "intel-nvidia") return products;
  if (category !== "cpu" && category !== "gpu") return products;

  const preferredProducts = products.filter((product) =>
    category === "cpu" ? isIntelProduct(product) : isNvidiaProduct(product),
  );
  if (preferredProducts.length >= Math.min(3, products.length)) return preferredProducts;

  const preferredIds = new Set(preferredProducts.map((product) => product.id || product.name));
  return [
    ...preferredProducts,
    ...products.filter((product) => !preferredIds.has(product.id || product.name)),
  ];
}

function calculateProductRecommendations(products, finalScore) {
  const recommendations = products
    .filter(isProductInRecommendationPool)
    .map((product) => calculateProductFit(product, finalScore))
    .sort((a, b) => b.practicalScore - a.practicalScore);

  if (recommendations[0]?.product.category === "ram") {
    return pickRamSpecRepresentatives(recommendations);
  }
  if (recommendations[0]?.product.category === "ssd") {
    return pickSsdSpecRepresentatives(recommendations);
  }

  return recommendations;
}

function renderProductBasis(scores) {
  if (!productBasisSummary || !productBasisDescription) return;

  const profile = calculateProfileResult(scores.finalScore);
  const tags = makeTags(scores.finalScore, profile.id);
  const topAxes = getSortedAxes(scores.finalScore).slice(0, 3);
  if (productProfileTitle) productProfileTitle.textContent = profile.title;
  if (productProfileDescription) productProfileDescription.textContent = profile.description;
  if (productProfileTags) {
    productProfileTags.innerHTML = tags.map((tag) => `<span class="profile-tag">${tag}</span>`).join("");
  }
  productBasisSummary.innerHTML = topAxes
    .map(
      ({ info, score }) => `
        <span>
          <strong>${escapeHtml(info.title)}</strong>
          ${roundScore(score)}
        </span>
      `,
    )
    .join("");

  productBasisDescription.textContent = "";
}

function getProductCategoryPriorityScore(category, finalScore = {}) {
  const weights = productFitAxisWeightsByCategory[category] || {};
  const entries = Object.entries(weights);
  if (entries.length === 0) return 0;

  const weightedScore = entries.reduce(
    (sum, [field, weight]) => sum + (finalScore[field] || 0) * weight,
    0,
  );
  const weightTotal = entries.reduce((sum, [, weight]) => sum + weight, 0);
  return weightTotal ? weightedScore / weightTotal : 0;
}

function updateProductSectionPriority(finalScore = {}) {
  const rankedSections = Object.entries(productSectionContainers)
    .map(([category, section]) => ({
      category,
      section,
      score: getProductCategoryPriorityScore(category, finalScore),
    }))
    .filter(({ section }) => Boolean(section))
    .sort((a, b) => b.score - a.score);

  rankedSections.forEach(({ section }, index) => {
    const isPriority = index < 2;
    section.classList.toggle("is-priority", isPriority);
    const meta = section.querySelector(".product-section-head span");
    if (meta) {
      meta.innerHTML = isPriority
        ? `<b class="product-section-priority-badge">먼저 보기</b> 추천 후보 3개`
        : "추천 후보 3개";
    }

    if (estimateLinkSection) {
      estimateLinkSection.parentNode.insertBefore(section, estimateLinkSection);
    }
  });
}

function renderProductCards(container, products, scores) {
  if (!container) return;
  const category = products[0]?.category || container.id.replace("ProductList", "");
  const displayProducts = filterProductsByChipPreference(products, category);
  const recommendations = calculateProductRecommendations(displayProducts, scores.finalScore).slice(0, 3);
  const rows = recommendations
    .map((recommendation, index) => {
        const { product, practicalScore } = recommendation;
        const roleLabel = getProductRole(index, product);
        const fitLabel = getProductFitLabel(practicalScore);
        const specInsightItems = getProductSpecInsightItems(product, recommendation, scores.finalScore);
        const programFitGroups = getProductProgramFitGroups(product);

        return `
        <details class="product-card">
          <summary class="product-table-row">
            <span class="product-summary-name">
              <b>${index + 1}</b>
              <strong>${escapeHtml(product.name)}</strong>
            </span>
            <span class="product-summary-price">${escapeHtml(getProductPriceLabel(product))}</span>
            <span class="product-summary-fit">
              <b class="product-pill product-pill-${getProductFitTone(practicalScore)}">${escapeHtml(fitLabel)}</b>
            </span>
            <span class="product-summary-toggle">자세히 보기</span>
          </summary>

          <div class="product-card-detail">
            <div class="product-detail-reason">
              <div class="product-detail-reason-head">
                <strong>왜 이 후보를 보나요?</strong>
                <span class="product-pill product-pill-${getProductRoleTone(roleLabel)}">${escapeHtml(roleLabel)}</span>
              </div>
              <p>${escapeHtml(getProductReason(recommendation, scores.finalScore))}</p>
              ${getProductSourceMeta(product)}
            </div>

            <div class="product-spec-insights" aria-label="세부 스펙 해석">
              ${specInsightItems
                .map(
                  (item) => `
                    <section class="product-spec-insight-card">
                      <div class="product-spec-insight-head">
                        <span class="product-spec-icon">${escapeHtml(item.title.slice(0, 2))}</span>
                        <span>
                          <strong>${escapeHtml(item.title)}</strong>
                          <small>${escapeHtml(item.value)}</small>
                        </span>
                        <b class="product-importance product-importance-${item.importanceTone}">${escapeHtml(item.importanceLabel)}</b>
                      </div>
                      <p>${renderTermText(item.description)}</p>
                      <div class="product-spec-checkpoint">
                        <strong>체크 포인트:</strong>
                        ${renderTermText(item.checkpoint)}
                      </div>
                    </section>
                  `,
                )
                .join("")}
            </div>

            <div class="product-program-points">
              <section>
                <h3>잘 맞는 프로그램</h3>
                <div class="program-fit-list">
                  ${renderProgramFitChips(programFitGroups.good, "강하게 맞는 프로그램이 적어요")}
                </div>
              </section>
              <section>
                <h3>덜 맞는 프로그램</h3>
                <div class="program-fit-list">
                  ${renderProgramFitChips(programFitGroups.less, "덜 맞는 프로그램이 적어요")}
                </div>
              </section>
            </div>

            <div class="product-checkline">
              <strong>제품을 볼 때</strong>
              <p>${product.buyingChecklist.slice(0, 3).map((item) => escapeHtml(item)).join(" · ")}</p>
            </div>
          </div>
        </details>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="product-table-head" aria-hidden="true">
      <span>제품명</span>
      <span>가격</span>
      <span>적합도</span>
      <span>상세</span>
    </div>
    ${rows}
  `;
}

function renderProductList(scores = calculateFinalScores()) {
  renderProductBasis(scores);
  updateProductSectionPriority(scores.finalScore);
  Object.entries(productListContainers).forEach(([category, container]) => {
    renderProductCards(container, productCatalog[category] || [], scores);
  });
}


function showScreen(screen) {
  [startScreen, programScreen, questionScreen, loadingScreen, resultScreen, productScreen].forEach(
    (item) => {
      if (!item) return;
      item.classList.remove("active");
    },
  );
  if (!screen) return;
  screen.classList.add("active");
}

const programUsageLabelMap = {
  1: "거의 안 씀",
  2: "가끔 씀",
  3: "보조로 씀",
  4: "자주 씀",
  5: "주력으로 씀",
};

function renderProgramSelection() {
  programRows.forEach((row) => {
    const program = row.dataset.program;
    const score = getProgramUsageScore(program);
    row.classList.toggle("is-active", score >= 3);
    row.querySelector(".program-rating-value").textContent = `${score}점 · ${programUsageLabelMap[score]}`;
    row.querySelectorAll(".program-rating-button").forEach((button) => {
      const isSelected = Number(button.dataset.score) === score;
      button.classList.toggle("selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  });

  const activeCount = getHighUsagePrograms(3).length;
  programNextButton.disabled = false;
  programHelper.textContent =
    activeCount > 0
      ? `${activeCount}개 프로그램이 3점 이상으로 반영됩니다.`
      : "선택하지 않은 프로그램은 1점, 거의 안 쓰는 것으로 처리됩니다.";
}

function renderQuestion() {
  const currentAnswer = answers[currentQuestionIndex];
  const [lowLabel, highLabel] = surveyScaleLabels[currentQuestionIndex];
  const tradeoffOption = tradeoffQuestionOptions[currentQuestionIndex + 1];
  questionText.textContent = surveyQuestions[currentQuestionIndex];
  progressText.textContent = `${currentQuestionIndex + 1} / ${surveyQuestions.length}`;
  progressFill.style.width = `${((currentQuestionIndex + 1) / surveyQuestions.length) * 100}%`;
  scaleLowLabel.textContent = lowLabel;
  scaleHighLabel.textContent = highLabel;
  tradeoffPanel.hidden = !tradeoffOption;
  if (tradeoffOption) {
    tradeoffLowText.textContent = tradeoffOption.low;
    tradeoffHighText.textContent = tradeoffOption.high;
  }
  nextButton.disabled = currentAnswer === null;
  nextButton.textContent =
    currentQuestionIndex === surveyQuestions.length - 1 ? "분석하기" : "다음";

  scaleButtons.forEach((button) => {
    const isSelected = Number(button.dataset.score) === currentAnswer;
    button.classList.toggle("selected", isSelected);
  });
}

function getDatabaseProductCounts() {
  return {
    cpu: (productCatalog.cpu || []).length,
    gpu: (productCatalog.gpu || []).length,
    ram: (productCatalog.ram || []).length,
    ssd: (productCatalog.ssd || []).length,
    monitor: (productCatalog.monitor || []).length,
  };
}

function formatCount(count) {
  return Number(count || 0).toLocaleString("ko-KR");
}

function getLoadingSteps() {
  const counts = getDatabaseProductCounts();
  return [
    "프로그램 사용률과 설문 답변을 작업 기준 점수로 변환중",
    `다나와 기반 CPU 데이터베이스 ${formatCount(counts.cpu)}개에서 작업 반응성과 렌더링 기준 검색중`,
    `다나와 기반 그래픽카드 데이터베이스 ${formatCount(counts.gpu)}개에서 GPU·VRAM 기준 검색중`,
    `다나와 기반 RAM 데이터베이스 ${formatCount(counts.ram)}개에서 멀티태스킹 여유 검색중`,
    `다나와 기반 SSD 데이터베이스 ${formatCount(counts.ssd)}개에서 속도·용량 기준 검색중`,
    `다나와 기반 모니터 데이터베이스 ${formatCount(counts.monitor)}개에서 화면 공간과 색 기준 검색중`,
    "우선순위와 과한 선택 가능성을 비교해 결과 정리중",
  ];
}

function renderLoadingStep(activeIndex = 0) {
  if (!loadingStepText || !loadingStepList) return;
  const steps = getLoadingSteps();
  const safeIndex = Math.min(activeIndex, steps.length - 1);
  loadingStepText.textContent = steps[safeIndex];
  loadingStepList.innerHTML = steps
    .slice(0, safeIndex + 1)
    .map(
      (step, index) => `
        <li class="${index < safeIndex ? "done" : ""} ${index === safeIndex ? "active" : ""}">
          <span>${index + 1}</span>
          <p>${step}</p>
        </li>
      `,
    )
    .join("");
}

function openChipPreferenceModal() {
  if (!chipPreferenceModal) {
    startLoading();
    return;
  }
  chipPreferenceModal.hidden = false;
  chipPreferenceModal.classList.add("open");
  chipPreferenceModal.setAttribute("aria-hidden", "false");
}

function closeChipPreferenceModal() {
  if (!chipPreferenceModal) return;
  chipPreferenceModal.classList.remove("open");
  chipPreferenceModal.setAttribute("aria-hidden", "true");
  chipPreferenceModal.hidden = true;
}

function startLoading() {
  showScreen(loadingScreen);
  let loadingStepIndex = 0;
  const loadingSteps = getLoadingSteps();
  renderLoadingStep(loadingStepIndex);
  const loadingStepTimer = window.setInterval(() => {
    loadingStepIndex += 1;
    renderLoadingStep(loadingStepIndex);
    if (loadingStepIndex >= loadingSteps.length - 1) {
      window.clearInterval(loadingStepTimer);
    }
  }, 1400);

  window.setTimeout(() => {
    window.clearInterval(loadingStepTimer);
    const scores = calculateFinalScores();
    renderResult(scores);
    renderProductList(scores);
    showScreen(productScreen);
  }, 11000);
}

function fillRandomAnswers() {
  answers.forEach((_, index) => {
    answers[index] = Math.floor(Math.random() * 5) + 1;
  });
}

function goToProgramScreen() {
  showScreen(programScreen);
  renderProgramSelection();
}

window.cpuMasterGoToProgramScreen = goToProgramScreen;

if (startButton) {
  startButton.addEventListener("click", goToProgramScreen);
}

programRows.forEach((row) => {
  const program = row.dataset.program;
  const label = programLabels[program] || program;
  const helpKeyMap = {
    "로컬 AI 이미지 생성": "localAi",
    "웹 기반 AI 이미지 생성": "webAi",
  };
  const helpKey = helpKeyMap[program];
  const helpIcon = helpKey
    ? `<span class="program-help" role="button" tabindex="0" aria-label="${label} 설명 보기" data-term="${helpKey}">?</span>`
    : "";

  row.innerHTML = `
    <div class="program-rating-info">
      <span class="program-label">${label}</span>
      ${helpIcon}
      <span class="program-rating-value"></span>
    </div>
    <div class="program-rating-controls" aria-label="${label} 사용률">
      <button class="program-rating-button" type="button" data-program="${program}" data-score="1" aria-label="${label} 1점">1</button>
      <button class="program-rating-button" type="button" data-program="${program}" data-score="2" aria-label="${label} 2점">2</button>
      <button class="program-rating-button" type="button" data-program="${program}" data-score="3" aria-label="${label} 3점">3</button>
      <button class="program-rating-button" type="button" data-program="${program}" data-score="4" aria-label="${label} 4점">4</button>
      <button class="program-rating-button" type="button" data-program="${program}" data-score="5" aria-label="${label} 5점">5</button>
    </div>
  `;
});

document.querySelectorAll(".program-rating-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    programUsageScores.set(button.dataset.program, Number(button.dataset.score));
    renderProgramSelection();
  });
});

document.querySelectorAll(".program-help").forEach((helpButton) => {
  helpButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openTermSheet(helpButton.dataset.term);
  });

  helpButton.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    openTermSheet(helpButton.dataset.term);
  });
});

programNextButton.addEventListener("click", (event) => {
  if (event.shiftKey) {
    fillRandomAnswers();
    startLoading();
    return;
  }

  currentQuestionIndex = 0;
  showScreen(questionScreen);
  renderQuestion();
});

scaleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    answers[currentQuestionIndex] = Number(button.dataset.score);
    renderQuestion();
  });
});

nextButton.addEventListener("click", () => {
  if (answers[currentQuestionIndex] === null) return;

  if (currentQuestionIndex === surveyQuestions.length - 1) {
    openChipPreferenceModal();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
});

chipPreferenceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    chipPreference = button.dataset.chipPreference || "all";
    closeChipPreferenceModal();
    startLoading();
  });
});

accordionCards.forEach((card) => {
  const trigger = card.querySelector(".accordion-trigger");
  const icon = card.querySelector(".accordion-icon");
  const actionText = card.querySelector(".accordion-action-text");
  const openText = card.classList.contains("priority-check")
    ? "왜 먼저 봐야 하는지 보기"
    : "왜 지금은 덜 봐도 되는지 보기";

  trigger.addEventListener("click", () => {
    const isOpen = card.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    icon.textContent = isOpen ? "−" : "+";
    if (actionText) actionText.textContent = isOpen ? "접기" : openText;
  });
});

function openTermSheet(termKey) {
  const term = termGlossary[termKey];
  if (!term) return;

  termTitle.textContent = term.title;
  termDescription.textContent = term.description;
  termSheetBackdrop.classList.add("open");
  termSheetBackdrop.setAttribute("aria-hidden", "false");
}

function closeTermSheet() {
  termSheetBackdrop.classList.remove("open");
  termSheetBackdrop.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const termButton = event.target.closest(".term-button");
  if (!termButton) return;
  openTermSheet(termButton.dataset.term);
});

termCloseButton.addEventListener("click", closeTermSheet);

termSheetBackdrop.addEventListener("click", (event) => {
  if (event.target === termSheetBackdrop) {
    closeTermSheet();
  }
});

function showSimpleResultScreen() {
  if (!ENABLE_SIMPLE_RESULT_SCREEN) return;
  renderResult(calculateFinalScores());
  showScreen(resultScreen);
}

if (ENABLE_SIMPLE_RESULT_SCREEN) {
  simpleResultButtons.forEach((button) => {
    button.addEventListener("click", showSimpleResultScreen);
  });
}

function showProductResultScreen() {
  showScreen(productScreen);
}

productResultButtons.forEach((button) => {
  button.addEventListener("click", showProductResultScreen);
});

document.body.dataset.appReady = "true";
