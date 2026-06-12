import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const appJs = await readFile(new URL("../app.js", import.meta.url), "utf8");
const dataJs = await readFile(new URL("../data.js", import.meta.url), "utf8");
const stylesCss = await readFile(new URL("../styles.css", import.meta.url), "utf8");

const programNames = [
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Figma",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Blender",
  "Cinema 4D",
  "로컬 AI 이미지 생성",
  "웹 기반 AI 이미지 생성",
  "웹/레퍼런스 중심 작업",
];

assert.match(indexHtml, /program-rating-list/);
assert.match(indexHtml, /4분 만에 내 작업에 맞는 조립 PC 부품 추천/);
assert.match(indexHtml, /다나와에 존재하는 상품을 실제 후보로 추천합니다/);
assert.doesNotMatch(indexHtml, /4분 만에 내 작업에 맞는 PC 기준 찾기/);
assert.doesNotMatch(indexHtml, /어떤 부품을 먼저 봐야 하는지 정리해드립니다/);
assert.match(indexHtml, /사용률/);
assert.doesNotMatch(indexHtml, /주력 프로그램을 2개/);
assert.doesNotMatch(indexHtml, /가장 많이 쓰는 것 2개/);
assert.match(indexHtml, /용어가 낯설다면/);
assert.match(indexHtml, /예시처럼/);
assert.match(indexHtml, /term-guide-example/);
assert.match(dataJs, /motherboard:\s*{/);
assert.match(dataJs, /title:\s*"메인보드"/);
assert.match(dataJs, /ddrMemory:\s*{/);
assert.match(dataJs, /title:\s*"DDR 메모리"/);
assert.match(dataJs, /graphicsCard:\s*{/);
assert.match(dataJs, /powerSupply:\s*{/);
assert.match(dataJs, /cpuSocket:\s*{/);
assert.match(dataJs, /chipset:\s*{/);
assert.match(appJs, /pattern:\s*\/DDR5\|DDR4\|DDR\/g/);
assert.match(appJs, /pattern:\s*\/메인보드\/g/);
assert.match(appJs, /pattern:\s*\/그래픽카드\/g/);
assert.match(appJs, /pattern:\s*\/CPU\/g/);
assert.match(indexHtml, /id="chipPreferenceModal"/);
assert.match(indexHtml, /styles\.css\?v=101/);
assert.match(indexHtml, /추천받을 부품 계열을 선택해주세요/);
assert.match(indexHtml, /Intel \+ NVIDIA 중심으로 보기/);
assert.match(indexHtml, /전체 계열로 추천받기/);
assert.match(indexHtml, /사용자 사례가 많습니다/);
assert.doesNotMatch(indexHtml, /href="https?:\/\/[^"]*reddit/i);
assert.doesNotMatch(indexHtml, /href="https?:\/\/[^"]*dcinside/i);
assert.match(appJs, /chipPreference/);
assert.match(appJs, /openChipPreferenceModal/);
assert.match(appJs, /closeChipPreferenceModal/);
assert.match(appJs, /chipPreferenceModal\.hidden = false/);
assert.match(appJs, /chipPreferenceModal\.hidden = true/);
assert.match(indexHtml, /data-chip-preference="intel-nvidia"/);
assert.match(indexHtml, /data-chip-preference="all"/);
assert.match(appJs, /filterProductsByChipPreference/);
assert.match(appJs, /isIntelProduct/);
assert.match(appJs, /isNvidiaProduct/);
assert.match(appJs, /currentQuestionIndex === surveyQuestions\.length - 1[\s\S]*openChipPreferenceModal\(\);/);
assert.doesNotMatch(appJs, /currentQuestionIndex === surveyQuestions\.length - 1[\s\S]{0,120}startLoading\(\);/);
assert.doesNotMatch(indexHtml, /용어가 낯설면 눌러보세요\./);
assert.doesNotMatch(indexHtml, /예: <button/);
assert.doesNotMatch(indexHtml, /밑줄 표시된 단어를 누르면 디자이너가 이해하기 쉬운 설명/);
assert.doesNotMatch(indexHtml, /resultProductPreview/);
assert.doesNotMatch(indexHtml, /resultProductPreviewList/);
assert.doesNotMatch(indexHtml, /제품 추천 먼저 보기/);
const productScreenIndex = indexHtml.indexOf('<section id="productScreen"');
assert.match(indexHtml, /href="https:\/\/shop\.danawa\.com\/virtualestimate/);
assert.doesNotMatch(indexHtml, /id="simpleResultButton"/);
assert.doesNotMatch(indexHtml, /간단 결과 보기/);
assert.match(indexHtml, /productDanawaButton/);
assert.match(indexHtml, /다나와에서 보기/);
assert.match(indexHtml, /id="resultBackButton"/);
assert.match(indexHtml, /data-action="show-product-result"/);
assert.match(indexHtml, /제품 후보로 돌아가기/);
assert.match(indexHtml, /id="productProfileTitle"/);
assert.match(indexHtml, /id="productProfileDescription"/);
assert.match(indexHtml, /id="productProfileTags"/);
assert.match(indexHtml, /제품 후보를 계산 중입니다/);
assert.match(indexHtml, /판단 기준/);
assert.match(indexHtml, /criteriaSourceNote/);
assert.match(indexHtml, /평가 기준은 어떻게 만들었나요/);
assert.match(indexHtml, /공식 권장 사양/);
assert.match(indexHtml, /Reddit/);
assert.match(indexHtml, /디시인사이드 조립PC 갤러리/);
assert.match(indexHtml, /반복적으로 언급되는 병목 사례/);
assert.doesNotMatch(indexHtml, /앞선 진단에서 이어진 기준/);
assert.match(indexHtml, /product-term-guide/);
assert.match(indexHtml, /data-product-category="gpu"/);
assert.match(indexHtml, /data-product-category="cpu"/);
assert.match(indexHtml, /data-product-category="ram"/);
assert.match(indexHtml, /data-product-category="ssd"/);
assert.match(indexHtml, /data-product-category="monitor"/);
assert.ok(
  indexHtml.indexOf('<p class="eyebrow">진단 완료</p>', productScreenIndex) > productScreenIndex,
  "product screen should start with the diagnosis complete copy",
);
assert.doesNotMatch(indexHtml, /다나와 PC 견적에서 비교하기/);
assert.doesNotMatch(indexHtml, /이 기준으로 제품 찾아보기/);
assert.doesNotMatch(indexHtml, /product-scroll-indicator/);

for (const program of programNames) {
  assert.match(indexHtml, new RegExp(`data-program="${program}"`));
}

for (const score of [1, 2, 3, 4, 5]) {
  assert.match(indexHtml, new RegExp(`data-score="${score}"`));
}

assert.match(appJs, /programUsageScores/);
assert.match(appJs, /getProgramUsageMultiplier/);
assert.match(appJs, /getHighUsagePrograms/);
assert.match(appJs, /helpButton\.addEventListener\("click"/);
assert.match(appJs, /programNextButton\.disabled = false/);
assert.doesNotMatch(appJs, /renderResultProductPreview/);
assert.doesNotMatch(appJs, /getTopProductRecommendations/);
assert.doesNotMatch(appJs, /primaryPrograms\.size !== 2/);

assert.match(indexHtml, /loadingStepList/);
assert.match(indexHtml, /loadingStepText/);
assert.match(appJs, /getDatabaseProductCounts/);
assert.match(appJs, /getLoadingSteps/);
assert.match(appJs, /다나와 기반 CPU 데이터베이스/);
assert.match(appJs, /setInterval[\s\S]*?,\s*1400\)/);
assert.match(appJs, /},\s*11000\)/);
assert.match(appJs, /steps\s*\.\s*slice\(0,\s*safeIndex \+ 1\)/);
assert.match(appJs, /function renderResult\(scores = calculateFinalScores\(\)\)/);
assert.match(appJs, /renderResult\(scores\);\s*renderProductList\(scores\);\s*showScreen\(productScreen\);/s);
assert.doesNotMatch(appJs, /renderResult\(\);\s*showScreen\(resultScreen\);/s);
assert.match(appJs, /simpleResultButtons/);
assert.match(appJs, /showSimpleResultScreen/);
assert.match(appJs, /const ENABLE_SIMPLE_RESULT_SCREEN = false/);
assert.match(appJs, /if \(ENABLE_SIMPLE_RESULT_SCREEN\)/);
assert.match(appJs, /productResultButtons/);
assert.match(appJs, /function showProductResultScreen/);
assert.match(appJs, /showScreen\(productScreen\);/);
assert.match(appJs, /productProfileTitle/);
assert.match(appJs, /productProfileDescription/);
assert.match(appJs, /productProfileTags/);
assert.match(appJs, /productProfileTitle\.textContent = profile\.title/);
assert.match(appJs, /productProfileDescription\.textContent = profile\.description/);
assert.match(appJs, /productProfileTags\.innerHTML = tags\.map/);
assert.match(appJs, /productSectionContainers/);
assert.match(appJs, /function getProductCategoryPriorityScore/);
assert.match(appJs, /function updateProductSectionPriority/);
assert.match(appJs, /classList\.toggle\("is-priority"/);
assert.match(appJs, /product-section-priority-badge/);
assert.match(appJs, /insertBefore\(section,\s*estimateLinkSection\)/);
assert.doesNotMatch(appJs, /각 섹션은 판단 기준과 제품 스펙이 어떻게 연결되는지 확인하기 위한 후보입니다/);
assert.match(appJs, /productBasisDescription\.textContent = ""/);
assert.doesNotMatch(appJs, /각 부품 후보는 위 기준이 실제 제품 스펙으로 어떻게 바뀌는지 보여줍니다/);
assert.doesNotMatch(appJs, /앞선 진단 기준과 제품 스펙/);
assert.doesNotMatch(appJs, /goToProductScreen/);
assert.match(appJs, /<details class="product-card"/);
assert.match(appJs, /<div class="product-table-head"/);
assert.match(appJs, /제품명/);
assert.match(appJs, /가격/);
assert.match(appJs, /적합도/);
assert.match(appJs, /상세/);
assert.match(appJs, /<summary class="product-table-row">/);
assert.match(appJs, /class="product-summary-price"/);
assert.match(appJs, /class="product-summary-fit"/);
assert.match(appJs, /자세히 보기/);
assert.match(appJs, /function getProductSpecInsightItems/);
assert.match(appJs, /getProductSpecInsightDescription/);
assert.match(appJs, /getProductSpecCheckpoint/);
assert.match(appJs, /getSpecNeedLevel/);
assert.match(appJs, /getFrequentProgramNames/);
assert.match(appJs, /getProductSpecInsightDescription\(product,\s*label,\s*recommendation,\s*finalScore\)/);
assert.match(appJs, /getProductSpecCheckpoint\(product,\s*label,\s*recommendation,\s*finalScore\)/);
assert.match(appJs, /renderTermText\(item\.description\)/);
assert.match(appJs, /renderTermText\(item\.checkpoint\)/);
assert.match(appJs, /로컬 AI 이미지 생성이나 영상 편집처럼/);
assert.match(appJs, /지금 답변 기준에서는 VRAM을 과하게 올리기보다/);
assert.match(appJs, /function getProductProgramFitGroups/);
assert.match(appJs, /getProgramProductFitScore/);
assert.match(appJs, /잘 맞는 프로그램/);
assert.match(appJs, /덜 맞는 프로그램/);
assert.match(appJs, /product-program-points/);
assert.doesNotMatch(appJs, /<h3>잘 맞는 경우<\/h3>/);
assert.doesNotMatch(appJs, /<h3>주의\/과잉<\/h3>/);
assert.match(appJs, /product-detail-reason/);
assert.match(appJs, /product-spec-insights/);
assert.match(appJs, /product-spec-insight-card/);
assert.match(appJs, /체크 포인트/);
assert.doesNotMatch(appJs, /<div class="product-score-debug">/);

assert.match(stylesCss, /\.program-rating-row\s*{[^}]*min-height:\s*48px/s);
assert.match(stylesCss, /\.program-rating-button\s*{[^}]*width:\s*32px/s);
assert.match(stylesCss, /\.program-rating-button\s*{[^}]*height:\s*32px/s);
assert.match(stylesCss, /\.program-label\s*{[^}]*font-size:\s*13px/s);
assert.match(stylesCss, /\.term-guide\s*{[^}]*padding:\s*10px 12px/s);
assert.match(stylesCss, /\.term-guide\s*{[^}]*display:\s*block/s);
assert.match(stylesCss, /\.term-guide-example\s*{[^}]*margin:\s*0/s);
assert.match(stylesCss, /\.term-guide-example\s*{[^}]*font-size:\s*13px/s);
assert.match(stylesCss, /\.floating-action\s*{[^}]*display:\s*flex/s);
assert.match(stylesCss, /\.floating-action\s*{[^}]*align-items:\s*center/s);
assert.match(stylesCss, /\.floating-action\s*{[^}]*justify-content:\s*center/s);
assert.match(stylesCss, /\.floating-action\s*{[^}]*text-align:\s*center/s);
assert.match(stylesCss, /\.product-list\s*{[^}]*display:\s*grid/s);
assert.match(stylesCss, /\.criteria-source-note\s*{[^}]*border:\s*1px solid #dbe4ef/s);
assert.match(stylesCss, /\.criteria-source-note summary\s*{[^}]*cursor:\s*pointer/s);
assert.match(stylesCss, /\.product-section\.is-priority\s*{[^}]*background:\s*#f0fdf4/s);
assert.match(stylesCss, /\.product-section-priority-badge\s*{[^}]*border-radius:\s*999px/s);
assert.doesNotMatch(stylesCss, /\.product-list\s*{[^}]*overflow-x:\s*auto/s);
assert.match(stylesCss, /\.product-table-head\s*{[^}]*display:\s*grid/s);
assert.match(stylesCss, /\.product-table-row\s*{[^}]*display:\s*grid/s);
assert.match(stylesCss, /\.product-table-head\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+78px\s+66px\s+68px/s);
assert.match(stylesCss, /\.product-table-row\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+78px\s+66px\s+68px/s);
assert.match(stylesCss, /\.product-table-head\s*{[^}]*padding:\s*7px 8px/s);
assert.match(stylesCss, /\.product-table-row\s*{[^}]*min-height:\s*42px/s);
assert.match(stylesCss, /\.product-table-row\s*{[^}]*padding:\s*7px 8px/s);
assert.match(stylesCss, /\.product-card-detail\s*{[^}]*padding:\s*10px/s);
assert.match(stylesCss, /\.product-summary-toggle\s*{[^}]*white-space:\s*nowrap/s);
assert.match(stylesCss, /\.product-summary-toggle\s*{[^}]*background:\s*var\(--accent\)/s);
assert.match(stylesCss, /\.product-summary-toggle\s*{[^}]*color:\s*#fff/s);
assert.match(stylesCss, /\.product-card\[open\] \.product-summary-toggle\s*{[^}]*background:\s*var\(--accent-dark\)/s);
assert.match(stylesCss, /\.product-detail-reason\s*{[^}]*border:\s*1px solid #dbeafe/s);
assert.match(stylesCss, /\.product-spec-insights\s*{[^}]*display:\s*grid/s);
assert.match(stylesCss, /\.product-spec-insight-card\s*{[^}]*display:\s*grid/s);
assert.match(stylesCss, /\.product-spec-insight-head\s*{[^}]*grid-template-columns:\s*34px minmax\(0,\s*1fr\) auto/s);
assert.doesNotMatch(appJs, /product-spec-dots/);
assert.doesNotMatch(appJs, /dots:\s*importance\.dots/);
assert.doesNotMatch(stylesCss, /\.product-spec-dots\s*{/);
assert.match(stylesCss, /\.product-spec-checkpoint\s*{[^}]*border-top:\s*1px solid/s);
assert.match(appJs, /tone:\s*"critical"/);
assert.match(appJs, /tone:\s*"warning"/);
assert.match(appJs, /tone:\s*"support"/);
assert.match(appJs, /tone:\s*"reference"/);
assert.match(appJs, /class="product-importance product-importance-\$\{item\.importanceTone\}"/);
assert.match(stylesCss, /\.product-importance-critical\s*{[^}]*#fee2e2/s);
assert.match(stylesCss, /\.product-importance-warning\s*{[^}]*#ffedd5/s);
assert.match(stylesCss, /\.product-importance-medium\s*{[^}]*#fef9c3/s);
assert.match(stylesCss, /\.product-importance-good\s*{[^}]*#dcfce7/s);
assert.match(stylesCss, /\.product-importance-support\s*{[^}]*#dbeafe/s);
assert.match(stylesCss, /\.product-importance-reference\s*{[^}]*#f1f5f9/s);
assert.match(stylesCss, /\.product-program-points\s*{[^}]*display:\s*grid/s);
assert.match(stylesCss, /\.program-fit-list\s*{[^}]*display:\s*flex/s);
assert.match(stylesCss, /\.program-fit-chip\s*{[^}]*border-radius:\s*999px/s);
assert.doesNotMatch(stylesCss, /\.product-summary-main\s*{/);
assert.doesNotMatch(stylesCss, /\.product-summary-meta\s*{/);
assert.doesNotMatch(stylesCss, /\.result-product-preview\s*{/);
assert.doesNotMatch(stylesCss, /\.result-product-preview-list\s*{/);
