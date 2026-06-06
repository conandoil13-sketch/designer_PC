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
const primaryPrograms = new Set();
const usedPrograms = new Set();

const startScreen = document.querySelector("#startScreen");
const programScreen = document.querySelector("#programScreen");
const questionScreen = document.querySelector("#questionScreen");
const loadingScreen = document.querySelector("#loadingScreen");
const resultScreen = document.querySelector("#resultScreen");
const productScreen = document.querySelector("#productScreen");
const startButton = document.querySelector("#startButton");
const programNextButton = document.querySelector("#programNextButton");
const productBackButton = document.querySelector("#productBackButton");
const programHelper = document.querySelector("#programHelper");
const programButtons = Array.from(document.querySelectorAll(".program-option"));
const nextButton = document.querySelector("#nextButton");
const questionText = document.querySelector("#questionText");
const progressText = document.querySelector("#progressText");
const progressFill = document.querySelector("#progressFill");
const scaleLowLabel = document.querySelector("#scaleLowLabel");
const scaleHighLabel = document.querySelector("#scaleHighLabel");
const scaleButtons = Array.from(document.querySelectorAll(".scale-button"));
const accordionCards = Array.from(document.querySelectorAll(".accordion-card"));
const termSheetBackdrop = document.querySelector("#termSheetBackdrop");
const termTitle = document.querySelector("#termTitle");
const termDescription = document.querySelector("#termDescription");
const termCloseButton = document.querySelector("#termCloseButton");
const profileTitle = document.querySelector("#profileTitle");
const profileDescription = document.querySelector("#profileDescription");
const profileTags = document.querySelector("#profileTags");
const priorityContent = document.querySelector("#priorityContent");
const holdContent = document.querySelector("#holdContent");
const prioritySummary = document.querySelector("#prioritySummary");
const holdSummary = document.querySelector("#holdSummary");
const productSearchButton = document.querySelector(".floating-action");
const productBasisSummary = document.querySelector("#productBasisSummary");
const productBasisDescription = document.querySelector("#productBasisDescription");
const productListContainers = {
  gpu: document.querySelector("#gpuProductList"),
  cpu: document.querySelector("#cpuProductList"),
  ram: document.querySelector("#ramProductList"),
  ssd: document.querySelector("#ssdProductList"),
  monitor: document.querySelector("#monitorProductList"),
};
const productScrollIndicators = Object.fromEntries(
  Object.entries(productListContainers).map(([category, container]) => [
    category,
    container?.closest(".product-section")?.querySelector(".product-scroll-indicator") || null,
  ]),
);

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

function getProgramRoleMultiplier(program) {
  if (primaryPrograms.has(program)) return 1;
  if (usedPrograms.has(program)) return 0.5;
  return 0;
}

function calculateProgramScores() {
  const programScore = createEmptyScore();
  const selectedPrograms = Array.from(new Set([...usedPrograms, ...primaryPrograms]));

  scoreFields.forEach((field) => {
    const fieldValues = selectedPrograms
      .map((program) => {
        const weights = programWeightPresets[program];
        const multiplier = getProgramRoleMultiplier(program);
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
  return Array.from(new Set([...usedPrograms, ...primaryPrograms]));
}

function getProgramBoost(pattern) {
  return getSelectedPrograms().reduce((boost, program) => {
    const baseBoost = pattern.programBoosts?.[program] || 0;
    return boost + baseBoost * getProgramRoleMultiplier(program);
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

  const hasTwoDPrimary = twoDHeavyPrograms.some((program) => primaryPrograms.has(program));
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
  return programs.some((program) => primaryPrograms.has(program) || usedPrograms.has(program));
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
        isPrimary: primaryPrograms.has(program),
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
  { pattern: /Quick Sync/g, key: "quickSync" },
  { pattern: /CUDA \/ Tensor/g, key: "tensor" },
  { pattern: /CUDA·Tensor/g, key: "tensor" },
  { pattern: /CUDA/g, key: "cuda" },
  { pattern: /Tensor/g, key: "tensor" },
  { pattern: /NVENC/g, key: "nvenc" },
  { pattern: /AV1/g, key: "av1" },
  { pattern: /VRAM/g, key: "vram" },
  { pattern: /NVMe SSD/g, key: "nvme" },
  { pattern: /NVMe/g, key: "nvme" },
  { pattern: /M\.2/g, key: "m2" },
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

function renderResult() {
  const scores = calculateFinalScores();
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
  const webAiPrimary = primaryPrograms.has("웹 기반 AI 이미지 생성");
  const webReferencePrimary = primaryPrograms.has("웹/레퍼런스 중심 작업");
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
  return programs.some((program) => primaryPrograms.has(program) || usedPrograms.has(program));
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
  if (videoPrograms.some((program) => primaryPrograms.has(program))) {
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
    primaryPrograms.has(program) || usedPrograms.has(program),
  ).length;

  return videoPrograms.some((program) => primaryPrograms.has(program)) || selectedVideoProgramCount >= 2;
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

function isProductInRecommendationPool(product) {
  if (isCpuOutsideDesignerPool(product)) return false;
  const eligibility = product.sourceData?.qualityFlags?.recommendationEligibility;
  if (!eligibility) return true;
  return !eligibility.hardRejected && !eligibility.referenceOnly;
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

  const topAxes = getSortedAxes(scores.finalScore).slice(0, 3);
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

  const gpuScore = scores.finalScore.GPU || 0;
  const vramScore = scores.finalScore.VRAM || 0;
  productBasisDescription.textContent =
    gpuScore >= 2 || vramScore >= 2
      ? "각 부품 후보는 위 기준이 실제 제품 스펙으로 어떻게 바뀌는지 보여줍니다. GPU와 VRAM이 높다면 그래픽카드 섹션을 특히 보면 좋아요."
      : "각 섹션은 앞선 진단 기준과 제품 스펙이 어떻게 연결되는지 확인하기 위한 후보입니다.";
}

function renderProductCards(container, products, scores) {
  if (!container) return;
  const recommendations = calculateProductRecommendations(products, scores.finalScore).slice(0, 3);
  container.innerHTML = recommendations
    .map(
      (recommendation, index) => {
        const { product, matchScore, overkillRisk, practicalScore, axisComparisons } =
          recommendation;
        const scoreSummary = getProductScoreSummary({
          matchScore,
          overkillRisk,
          practicalScore,
        });
        const roleLabel = getProductRole(index, product);
        const fitLabel = getProductFitLabel(practicalScore);

        return `
        <article class="product-card">
          <div class="product-card-head">
            <div class="product-card-meta">
              <span class="product-pill product-pill-${getProductRoleTone(roleLabel)}">${escapeHtml(roleLabel)}</span>
              <span class="product-pill product-pill-${getProductFitTone(practicalScore)}">${escapeHtml(fitLabel)}</span>
            </div>
            <h2>${escapeHtml(product.name)}</h2>
            ${getProductSourceMeta(product)}
            <p>${escapeHtml(product.coreUseCase)}</p>
          </div>

          <div class="product-score-debug">
            ${scoreSummary
              .map(
                (item) => `
                  <span>
                    <strong>${escapeHtml(item.label)}</strong>
                    <b class="product-pill product-pill-${item.tone}">${escapeHtml(item.value)}</b>
                  </span>
                `,
              )
              .join("")}
          </div>

          <div class="product-reason">
            <strong>왜 이 후보를 보나요?</strong>
            <p>${escapeHtml(getProductReason(recommendation, scores.finalScore))}</p>
          </div>

          <div class="product-axis-match">
            ${axisComparisons
              .slice(0, 2)
              .map(({ field, title, userScore, productScore }) => {
                const matchWord = getAxisMatchWord({ field, userScore, productScore });
                return `
                  <span>
                    <strong>${escapeHtml(title)}</strong>
                    <b class="product-pill product-pill-${getAxisMatchTone(matchWord)}">${escapeHtml(matchWord)}</b>
                  </span>
                `;
              })
              .join("")}
          </div>

          <div class="product-spec-row" aria-label="핵심 스펙">
            ${Object.entries(product.specSummary || {})
              .slice(0, 3)
              .map(
                ([label, value]) => `
                  <span><strong>${escapeHtml(productSpecLabels[label] || label)}</strong>${escapeHtml(value)}</span>
                `,
              )
              .join("")}
          </div>

          <div class="product-compact-points">
            <section>
              <h3>잘 맞는 경우</h3>
              <p>${product.recommendedFor.slice(0, 1).map((item) => escapeHtml(item)).join(" · ")}</p>
            </section>
            <section>
              <h3>주의/과잉</h3>
              <p>${escapeHtml(product.notRecommendedFor[0] || "")} · ${escapeHtml(getFirstSentence(getProductDynamicWarning(recommendation, scores.finalScore)))}</p>
            </section>
          </div>

          <div class="product-checkline">
            <strong>제품을 볼 때</strong>
            <p>${product.buyingChecklist.slice(0, 3).map((item) => escapeHtml(item)).join(" · ")}</p>
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderProductList(scores = calculateFinalScores()) {
  renderProductBasis(scores);
  Object.entries(productListContainers).forEach(([category, container]) => {
    renderProductCards(container, productCatalog[category] || [], scores);
    updateProductScrollIndicator(category);
  });
}

function updateProductScrollIndicator(category) {
  const container = productListContainers[category];
  const indicator = productScrollIndicators[category];
  if (!container || !indicator) return;

  const cards = Array.from(container.querySelectorAll(".product-card"));
  const dots = Array.from(indicator.querySelectorAll("span"));
  const cardWidth = cards[0]?.getBoundingClientRect().width || container.clientWidth || 1;
  const activeIndex = Math.min(
    Math.max(Math.round(container.scrollLeft / cardWidth), 0),
    Math.max(cards.length - 1, 0),
  );

  dots.forEach((dot, index) => {
    const isVisibleDot = index < cards.length;
    dot.hidden = !isVisibleDot;
    dot.classList.toggle("active", index === activeIndex);
  });

  indicator.classList.toggle("is-end", activeIndex >= cards.length - 1);
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

function renderProgramSelection() {
  programButtons.forEach((button) => {
    const program = button.dataset.program;
    const group = button.dataset.group;
    const isPrimary = primaryPrograms.has(program);
    const isUsed = usedPrograms.has(program);
    const isSelected = group === "primary" ? isPrimary : isUsed;
    const isLocked =
      group === "primary" && primaryPrograms.size >= 2 && !isPrimary;

    button.classList.toggle("selected", isSelected);
    button.classList.toggle("locked", isLocked);
    button.setAttribute("aria-pressed", String(isSelected));
    button.querySelector(".program-check").textContent = isSelected ? "✓" : "";
  });

  const primaryCount = primaryPrograms.size;
  const usedCount = usedPrograms.size;
  programNextButton.disabled = primaryCount !== 2;
  programHelper.textContent =
    primaryCount === 2
      ? `주력 2개 선택 완료. 사용 프로그램 ${usedCount}개가 체크되어 있습니다.`
      : `주력 프로그램을 ${2 - primaryCount}개 더 골라야 다음 단계로 넘어갈 수 있습니다.`;
}

function renderQuestion() {
  const currentAnswer = answers[currentQuestionIndex];
  const [lowLabel, highLabel] = surveyScaleLabels[currentQuestionIndex];
  questionText.textContent = surveyQuestions[currentQuestionIndex];
  progressText.textContent = `${currentQuestionIndex + 1} / ${surveyQuestions.length}`;
  progressFill.style.width = `${((currentQuestionIndex + 1) / surveyQuestions.length) * 100}%`;
  scaleLowLabel.textContent = lowLabel;
  scaleHighLabel.textContent = highLabel;
  nextButton.disabled = currentAnswer === null;
  nextButton.textContent =
    currentQuestionIndex === surveyQuestions.length - 1 ? "분석하기" : "다음";

  scaleButtons.forEach((button) => {
    const isSelected = Number(button.dataset.score) === currentAnswer;
    button.classList.toggle("selected", isSelected);
  });
}

function startLoading() {
  showScreen(loadingScreen);
  window.setTimeout(() => {
    renderResult();
    showScreen(resultScreen);
  }, 3000);
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

programButtons.forEach((button) => {
  const label = programLabels[button.dataset.program] || button.textContent.trim();
  const helpKeyMap = {
    "로컬 AI 이미지 생성": "localAi",
    "웹 기반 AI 이미지 생성": "webAi",
  };
  const helpKey = helpKeyMap[button.dataset.program];
  const helpIcon = helpKey
    ? `<span class="program-help" role="button" tabindex="0" aria-label="${label} 설명 보기" data-term="${helpKey}">?</span>`
    : "";

  button.innerHTML = `
    <span class="program-label">${label}</span>
    <span class="program-actions">
      ${helpIcon}
      <span class="program-check" aria-hidden="true"></span>
    </span>
  `;
});

programButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const helpTarget = event.target.closest(".program-help");
    if (helpTarget) {
      event.stopPropagation();
      openTermSheet(helpTarget.dataset.term);
      return;
    }

    const program = button.dataset.program;
    const group = button.dataset.group;

    if (group === "primary") {
      if (primaryPrograms.has(program)) {
        primaryPrograms.delete(program);
      } else if (primaryPrograms.size < 2) {
        primaryPrograms.add(program);
        usedPrograms.add(program);
      }
    }

    if (group === "used") {
      if (usedPrograms.has(program) && !primaryPrograms.has(program)) {
        usedPrograms.delete(program);
      } else {
        usedPrograms.add(program);
      }
    }

    renderProgramSelection();
  });
});

document.querySelectorAll(".program-help").forEach((helpButton) => {
  helpButton.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    openTermSheet(helpButton.dataset.term);
  });
});

programNextButton.addEventListener("click", (event) => {
  if (primaryPrograms.size !== 2) return;
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
    startLoading();
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion();
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

if (productSearchButton) {
  productSearchButton.addEventListener("click", () => {
    renderProductList(calculateFinalScores());
    showScreen(productScreen);
  });
}

if (productBackButton) {
  productBackButton.addEventListener("click", () => {
    showScreen(resultScreen);
  });
}

Object.entries(productListContainers).forEach(([category, container]) => {
  if (!container) return;
  container.addEventListener("scroll", () => {
    updateProductScrollIndicator(category);
  });
});

document.body.dataset.appReady = "true";
