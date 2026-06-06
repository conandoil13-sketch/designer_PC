const mockGpuProductCandidates = [
  {
    id: "mock_gpu_value_4070ti_super_16gb",
    category: "gpu",
    name: "GeForce RTX 4070 Ti SUPER 16GB",
    chipBrand: "NVIDIA",
    boardPartner: "AIB Partner",
    chipset: "RTX 4070 Ti SUPER",
    tier: "가격 조건부 가성비 후보",
    status: "previousGenHighValue",
    coreUseCase:
      "2D 디자인, UI 디자인, 가벼운 영상 편집, 모션 작업 입문, 로컬 AI 이미지 생성 입문",
    recommendedFor: [
      "Photoshop, Illustrator, Figma 중심 작업자",
      "Premiere Pro를 가끔 또는 중간 강도로 사용하는 디자이너",
      "After Effects를 입문~중간 수준으로 사용하는 사용자",
      "Stable Diffusion 등 로컬 AI를 가볍게 실험하려는 사용자",
      "최상급 GPU보다 RAM, SSD, 모니터에도 예산을 나누고 싶은 사용자",
    ],
    notRecommendedFor: [
      "Blender GPU 렌더링을 주력으로 오래 돌리는 사용자",
      "DaVinci Resolve에서 고해상도·고노드 컬러 작업을 자주 하는 사용자",
      "대형 로컬 AI 모델, LoRA 학습, 고해상도 생성 작업을 본격적으로 하려는 사용자",
      "최신 세대 기능과 장기 사용 여유를 최우선으로 보는 사용자",
    ],
    specSummary: {
      vram: "16GB GDDR6X / 256-bit",
      cudaTier: "상급 CUDA 여유 / 8448 CUDA cores",
      rawGpuPower:
        "상급. 2D·영상·모션·입문 3D까지 충분하지만 RTX 50세대 최상위권보다는 낮음",
      powerDemand: "약 285W급 GPU 전력 기준. 제품별 권장 파워는 보통 700W 이상 확인 필요",
      coolingDifficulty: "중간~높음. 3팬 모델 권장, 소형 케이스에서는 길이·두께 확인 필요",
    },
    axisScores: {
      GPU: 2.4,
      VRAM: 2.4,
      COOL: 1.9,
    },
    productTraits: {
      performanceFit: 2.4,
      vramFit: 2.4,
      stabilityFit: 2,
      coolingBurden: 2.1,
      overkillRiskFor2D: 2.2,
    },
    designerExplanation:
      "RTX 4070 Ti SUPER는 16GB VRAM을 갖춘 이전 세대 상급 GPU라서 2D 디자인 중심 사용자에게는 충분히 강하고, Premiere Pro·After Effects·Blender 입문·로컬 AI 이미지 생성까지 넓게 대응할 수 있습니다. 순수 2D 작업만 한다면 GPU보다 RAM, SSD, 모니터에 예산을 배분하는 편이 더 체감이 클 수 있지만, 여러 디자인 툴과 영상 작업을 함께 쓰는 사용자에게는 현실적인 균형점이 됩니다.",
    overkillWarning:
      "Photoshop, Illustrator, Figma만 주로 사용한다면 이 카드도 이미 과할 수 있습니다. 그 경우 한 단계 낮은 GPU를 고르고 RAM 32~64GB, 빠른 SSD, 색 정확도 좋은 모니터에 투자하는 편이 더 합리적일 수 있습니다.",
    buyingChecklist: [
      "VRAM 16GB 모델인지 확인",
      "케이스에 장착 가능한 그래픽카드 길이와 두께 확인",
      "권장 파워와 보조전원 커넥터 확인",
      "3팬 쿨링 모델 여부 확인",
      "중고 또는 재고 제품 구매 시 AS 기간 확인",
      "동일 GPU라도 OC 모델 가격 차이가 과도하면 피하기",
    ],
    danawaSearchKeywords: [
      "RTX 4070 Ti SUPER 16GB",
      "4070 Ti SUPER GDDR6X",
      "RTX4070Ti SUPER 16GB",
      "4070TiS 16GB",
    ],
    sourceNote:
      "초기 mock 데이터. 실제 가격, 판매 여부, 제품별 쿨링, 벤치마크로 검증 필요.",
    sources: [
      {
        label: "NVIDIA GeForce RTX 4070 Family 공식 스펙",
        url: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/",
      },
    ],
  },
  {
    id: "mock_gpu_balanced_5070ti_16gb",
    category: "gpu",
    name: "GeForce RTX 5070 Ti 16GB",
    chipBrand: "NVIDIA",
    boardPartner: "AIB Partner",
    chipset: "RTX 5070 Ti",
    tier: "균형형 후보",
    status: "currentGenBalanced",
    coreUseCase:
      "영상 편집, 모션그래픽, 3D 입문, GPU 가속 디자인 작업, 로컬 AI 이미지 생성 중간 수준",
    recommendedFor: [
      "Premiere Pro와 After Effects를 자주 함께 사용하는 사용자",
      "DaVinci Resolve를 입문~중간 수준으로 사용하는 디자이너",
      "Blender, Cinema 4D를 배우기 시작했거나 작업에 일부 포함하는 사용자",
      "2D 디자인뿐 아니라 영상·모션·3D·AI를 폭넓게 시도하는 사용자",
      "너무 과한 최상급 GPU는 부담스럽지만 오래 쓸 여유가 필요한 사용자",
    ],
    notRecommendedFor: [
      "Photoshop, Illustrator, Figma만 사용하는 순수 2D 사용자",
      "예산이 제한되어 RAM이나 모니터를 희생해야 하는 사용자",
      "AI 학습, 대형 로컬 모델, 장시간 GPU 렌더링을 주력으로 하는 사용자",
      "가성비만 최우선으로 보는 사용자",
    ],
    specSummary: {
      vram: "16GB GDDR7 / 256-bit",
      cudaTier: "상급 CUDA 여유 / 8960 CUDA cores / 5세대 Tensor cores",
      rawGpuPower:
        "상급~고성능 사이. 영상·모션·입문 3D·AI 작업을 넓게 커버하는 균형형",
      powerDemand:
        "RTX 5070 Ti급은 중상급 전력·발열 관리가 필요함. 제품별 권장 파워와 커넥터 확인 필요",
      coolingDifficulty:
        "중간~높음. 장시간 렌더링·AI 생성 작업을 고려하면 3팬 모델과 통풍 좋은 케이스 권장",
    },
    axisScores: {
      GPU: 2.6,
      VRAM: 2.7,
      COOL: 2.1,
    },
    productTraits: {
      performanceFit: 2.6,
      vramFit: 2.7,
      stabilityFit: 2.2,
      coolingBurden: 2.3,
      overkillRiskFor2D: 2.5,
    },
    designerExplanation:
      "RTX 5070 Ti는 16GB GDDR7 VRAM과 RTX 50세대 CUDA·Tensor 구성을 갖춘 균형형 후보로, 2D 디자인만이 아니라 영상 편집, 모션그래픽, Blender·Cinema 4D 입문, 로컬 AI 이미지 생성까지 한 장으로 넓게 커버하려는 사용자에게 맞습니다. RTX 5080처럼 고성능에 몰아붙이는 선택은 아니지만, 디자이너가 여러 툴을 오가며 오래 쓰기에는 충분한 여유가 있습니다.",
    overkillWarning:
      "Figma, Illustrator, Photoshop 위주의 순수 2D 작업자에게는 과한 선택일 수 있습니다. 이 경우 GPU보다 RAM, SSD, 모니터 색 정확도, CPU 싱글 성능이 더 큰 체감 차이를 만들 수 있습니다.",
    buyingChecklist: [
      "RTX 5070과 RTX 5070 Ti를 혼동하지 않기",
      "VRAM 16GB 모델인지 확인",
      "GDDR7 메모리 구성 확인",
      "권장 파워와 12V-2x6 또는 16핀 계열 전원 케이블 호환 확인",
      "케이스 장착 길이와 슬롯 두께 확인",
      "RTX 5080과 가격 차이가 작다면 실제 가격 대비 효율 재검토",
    ],
    danawaSearchKeywords: [
      "RTX 5070 Ti 16GB",
      "5070 Ti GDDR7",
      "RTX5070Ti 16GB",
      "GeForce RTX 5070 Ti",
    ],
    sourceNote:
      "초기 mock 데이터. 실제 가격, 판매 여부, 제품별 쿨링, 벤치마크로 검증 필요.",
    sources: [
      {
        label: "PNY GeForce RTX 5070 Ti 제품 자료",
        url: "https://www.pny.com/File%20Library/Company/Support/Product%20Brochures/GeForce%20Graphics/English/RTX-5070-Ti-16GB-Triple-Fan-OC-Brochure.pdf",
      },
    ],
  },
  {
    id: "mock_gpu_high_5080_16gb",
    category: "gpu",
    name: "GeForce RTX 5080 16GB",
    chipBrand: "NVIDIA",
    boardPartner: "AIB Partner",
    chipset: "RTX 5080",
    tier: "고성능 후보",
    status: "currentGenHighPerformance",
    coreUseCase:
      "Blender GPU 렌더링, DaVinci Resolve 고부하 작업, 로컬 AI 이미지 생성, 고해상도 영상·3D 작업",
    recommendedFor: [
      "Blender 또는 GPU 렌더링을 실제 작업에 자주 사용하는 사용자",
      "DaVinci Resolve에서 고해상도 영상, 노드 기반 컬러 작업, GPU 가속 효과를 자주 쓰는 사용자",
      "로컬 AI 이미지 생성을 자주 하고 생성 속도와 CUDA 성능이 중요한 사용자",
      "Premiere Pro, After Effects, 3D, AI를 복합적으로 사용하는 고부하 디자이너",
      "GPU 성능 여유를 우선하고 예산과 전력·발열 부담을 감수할 수 있는 사용자",
    ],
    notRecommendedFor: [
      "Photoshop, Illustrator, Figma 중심의 순수 2D 사용자",
      "가벼운 영상 편집만 하는 사용자",
      "예산 때문에 RAM, SSD, 모니터를 낮춰야 하는 사용자",
      "소형 케이스, 저소음 PC, 낮은 전력 소비를 원하는 사용자",
      "로컬 AI나 GPU 렌더링을 거의 하지 않는 사용자",
    ],
    specSummary: {
      vram: "16GB GDDR7 / 256-bit",
      cudaTier: "고성능 CUDA 여유 / 10752 CUDA cores / 5세대 Tensor cores",
      rawGpuPower: "고성능. Blender, DaVinci Resolve, 로컬 AI, GPU 렌더링에 강한 선택",
      powerDemand: "약 360W급 GPU 전력 기준. 고용량 파워와 안정적인 전원 케이블 관리 필요",
      coolingDifficulty: "높음. 발열·소음·케이스 통풍·파워 용량을 반드시 함께 봐야 함",
    },
    axisScores: {
      GPU: 3,
      VRAM: 2.7,
      COOL: 2.8,
    },
    productTraits: {
      performanceFit: 3,
      vramFit: 2.7,
      stabilityFit: 2.3,
      coolingBurden: 2.9,
      overkillRiskFor2D: 3,
    },
    designerExplanation:
      "RTX 5080은 Blender, DaVinci Resolve, 로컬 AI 이미지 생성, GPU 렌더링처럼 그래픽카드가 실제 작업 시간을 줄여주는 영역에서 강한 고성능 후보입니다. CUDA cores와 16GB GDDR7 VRAM을 기반으로 복합적인 고부하 디자인 작업에 대응할 수 있지만, 이 성능은 2D 디자인 사용자에게 항상 필요한 것은 아닙니다.",
    overkillWarning:
      "Photoshop, Illustrator, Figma, 웹 기반 AI 이미지 생성 중심 사용자에게는 명백히 과할 수 있습니다. RTX 5080을 선택하느라 RAM, SSD, CPU, 모니터 예산을 줄이면 오히려 실제 디자인 작업 체감은 나빠질 수 있습니다.",
    buyingChecklist: [
      "케이스에 장착 가능한 길이·두께인지 확인",
      "권장 파워 용량과 12V-2x6 또는 16핀 전원 케이블 호환 확인",
      "파워 품질과 여유 용량 확인",
      "장시간 렌더링 시 발열과 소음 리뷰 확인",
      "모니터, RAM, SSD 예산을 희생하지 않는지 확인",
      "로컬 AI 목적이라면 16GB VRAM으로 충분한 작업인지 확인",
    ],
    danawaSearchKeywords: [
      "RTX 5080 16GB",
      "5080 GDDR7",
      "RTX5080 16GB",
      "GeForce RTX 5080",
    ],
    sourceNote:
      "초기 mock 데이터. 실제 가격, 판매 여부, 제품별 쿨링, 벤치마크로 검증 필요.",
    sources: [
      {
        label: "NVIDIA GeForce RTX 5080 공식 스펙",
        url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/",
      },
    ],
  },
];

const mockCpuProductCandidates = [
  {
    id: "mock_cpu_value_ryzen_7_9700x",
    category: "cpu",
    name: "AMD Ryzen 7 9700X",
    tier: "체감 반응 균형 후보",
    status: "mockAvailable",
    coreUseCase: "Photoshop, Illustrator, Figma, 가벼운 영상 편집, 멀티태스킹",
    specs: { cores: 8, threads: 16, boostGhz: 5.5, tdpW: 65 },
    specSummary: {
      cores: "8코어 / 16스레드",
      boost: "최대 5.5GHz급 부스트",
      power: "상대적으로 낮은 전력 부담",
    },
    axisScores: { CS: 2.55, CM: 2.05, COOL: 1.35 },
    productTraits: { responsivenessFit: 2.55, renderFit: 2.05, coolingBurden: 1.35 },
    designerExplanation:
      "작업 중 확대, 이동, 레이어 전환처럼 즉각적인 반응이 중요한 2D·UI 작업자에게 어울리는 CPU 후보입니다. 최고 코어 수보다 조작감과 전력 부담의 균형을 보는 샘플입니다.",
    overkillWarning:
      "긴 렌더링이나 인코딩이 주 작업이 아니라면 더 많은 코어 수에 예산을 크게 올리는 것보다 RAM, SSD, 모니터 예산을 함께 보는 편이 좋습니다.",
    recommendedFor: [
      "Photoshop, Illustrator, Figma 중심 작업자",
      "작업 중 반응성과 조용한 구성을 함께 보고 싶은 사용자",
      "가벼운 영상 편집까지 함께 하는 사용자",
    ],
    notRecommendedFor: [
      "렌더링과 인코딩 시간을 최우선으로 줄이고 싶은 사용자",
      "After Effects, 3D 렌더링을 오래 돌리는 사용자",
      "최대한 많은 코어 수가 필요한 워크스테이션 사용자",
    ],
    buyingChecklist: ["CPU 세대와 싱글코어 성능 확인", "메인보드 소켓 호환 확인", "기본 전력과 쿨러 구성 확인", "RAM 확장성과 함께 비교"],
    danawaSearchKeywords: ["Ryzen 7 9700X", "라이젠 9700X"],
    sourceNote: "초기 mock 데이터. 실제 가격과 벤치마크로 검증 필요.",
  },
  {
    id: "mock_cpu_balanced_core_ultra_7_265k",
    category: "cpu",
    name: "Intel Core Ultra 7 265K",
    tier: "영상·멀티 균형 후보",
    status: "mockAvailable",
    coreUseCase: "Premiere Pro, After Effects, 멀티태스킹, 인코딩",
    specs: { cores: 20, threads: 20, boostGhz: 5.5, tdpW: 125 },
    specSummary: {
      cores: "20코어급 하이브리드 구성",
      boost: "높은 부스트 클럭",
      power: "중간~높은 전력·쿨링 부담",
    },
    axisScores: { CS: 2.45, CM: 2.75, COOL: 2.15 },
    productTraits: { responsivenessFit: 2.45, renderFit: 2.75, coolingBurden: 2.15 },
    designerExplanation:
      "영상 편집, 내보내기, 여러 프로그램 병행처럼 멀티코어 여유가 작업 흐름에 영향을 주는 사용자를 위한 샘플 CPU입니다.",
    overkillWarning:
      "순수 2D 작업만 한다면 이 정도 멀티 성능은 과할 수 있습니다. CPU에 예산을 몰기 전에 RAM과 SSD, 모니터를 같이 보세요.",
    recommendedFor: ["Premiere Pro를 자주 쓰는 사용자", "인코딩과 다른 작업을 병행하는 사용자", "여러 앱을 동시에 켜두는 사용자"],
    notRecommendedFor: ["저소음·저전력 구성이 최우선인 사용자", "Figma와 2D 작업만 하는 사용자", "쿨링 예산을 줄여야 하는 사용자"],
    buyingChecklist: ["메인보드 칩셋과 소켓 확인", "쿨러 성능 확인", "Quick Sync 활용 여부 확인", "파워와 케이스 통풍 확인"],
    danawaSearchKeywords: ["Core Ultra 7 265K", "코어 울트라 7 265K"],
    sourceNote: "초기 mock 데이터. 실제 가격과 앱별 벤치마크로 검증 필요.",
  },
  {
    id: "mock_cpu_high_ryzen_9_9950x",
    category: "cpu",
    name: "AMD Ryzen 9 9950X",
    tier: "렌더링 고성능 후보",
    status: "mockAvailable",
    coreUseCase: "After Effects, CPU 렌더링, 인코딩, 무거운 멀티태스킹",
    specs: { cores: 16, threads: 32, boostGhz: 5.7, tdpW: 170 },
    specSummary: {
      cores: "16코어 / 32스레드",
      boost: "높은 싱글·멀티 성능",
      power: "높은 쿨링·파워 여유 필요",
    },
    axisScores: { CS: 2.7, CM: 3, COOL: 2.65 },
    productTraits: { responsivenessFit: 2.7, renderFit: 3, coolingBurden: 2.65 },
    designerExplanation:
      "긴 렌더링, 인코딩, 무거운 병렬 작업을 자주 돌리는 사용자에게 맞는 고성능 CPU 후보입니다.",
    overkillWarning:
      "작업 중 조작감이나 2D 파일 처리만 중요하다면 과한 선택일 수 있습니다. 이 CPU를 고르면 쿨러와 파워 예산도 같이 올라갑니다.",
    recommendedFor: ["렌더링과 인코딩 시간이 큰 병목인 사용자", "After Effects와 영상 작업이 많은 사용자", "오래 쓸 고성능 CPU를 원하는 사용자"],
    notRecommendedFor: ["예산이 제한적인 2D 중심 사용자", "저소음 소형 PC를 원하는 사용자", "GPU나 모니터가 더 중요한 사용자"],
    buyingChecklist: ["고성능 쿨러 필요 여부 확인", "메인보드 전원부 확인", "파워 여유 확인", "실제 사용하는 앱의 멀티코어 활용도 확인"],
    danawaSearchKeywords: ["Ryzen 9 9950X", "라이젠 9950X"],
    sourceNote: "초기 mock 데이터. 실제 가격과 렌더링 벤치마크로 검증 필요.",
  },
];

const mockRamProductCandidates = [
  {
    id: "mock_ram_value_ddr5_32gb",
    category: "ram",
    name: "DDR5 32GB Kit",
    tier: "기본 권장 후보",
    status: "mockAvailable",
    coreUseCase: "2D 디자인, UI 작업, 일반 멀티태스킹",
    specs: { capacityGb: 32, speedMt: 5600, modules: 2 },
    specSummary: { capacity: "32GB", speed: "DDR5 5600급", expand: "2개 모듈 구성" },
    axisScores: { RAM: 2.2 },
    productTraits: { memoryFit: 2.2, expansionBurden: 1.2 },
    designerExplanation:
      "여러 디자인 툴과 브라우저를 함께 켜는 사용자에게 현실적인 기본선이 되는 메모리 후보입니다.",
    overkillWarning:
      "큰 영상·3D·대형 PSD 작업이 많지 않다면 64GB 이상보다 32GB와 빠른 SSD 조합이 더 균형적일 수 있습니다.",
    recommendedFor: ["Figma, Photoshop, Illustrator 중심 사용자", "브라우저 탭이 많은 사용자", "예산 균형을 보는 사용자"],
    notRecommendedFor: ["After Effects RAM 프리뷰가 긴 사용자", "대형 3D 장면을 다루는 사용자", "64GB 이상이 필요한 전문 영상 작업자"],
    buyingChecklist: ["2개 모듈 구성인지 확인", "메인보드 DDR5 지원 확인", "추후 증설 슬롯 여유 확인", "너무 낮은 클럭 제품 피하기"],
    danawaSearchKeywords: ["DDR5 32GB 5600", "DDR5 16GBx2"],
    sourceNote: "초기 mock 데이터. 실제 가격과 호환성으로 검증 필요.",
  },
  {
    id: "mock_ram_balanced_ddr5_64gb",
    category: "ram",
    name: "DDR5 64GB Kit",
    tier: "대용량 균형 후보",
    status: "mockAvailable",
    coreUseCase: "대형 PSD, After Effects, 영상 편집, 여러 앱 동시 작업",
    specs: { capacityGb: 64, speedMt: 5600, modules: 2 },
    specSummary: { capacity: "64GB", speed: "DDR5 5600급", expand: "32GB x 2 구성" },
    axisScores: { RAM: 2.8 },
    productTraits: { memoryFit: 2.8, expansionBurden: 1.6 },
    designerExplanation:
      "큰 파일과 여러 프로그램을 오래 열어두는 작업 흐름에서 버벅임을 줄이는 대용량 메모리 후보입니다.",
    overkillWarning:
      "일반 2D·UI 작업만 한다면 64GB가 바로 체감되지 않을 수 있습니다. 파일 크기와 동시 실행 앱 수를 먼저 보세요.",
    recommendedFor: ["대형 PSD와 여러 레이어를 다루는 사용자", "After Effects RAM 프리뷰가 필요한 사용자", "영상 편집과 디자인 툴을 병행하는 사용자"],
    notRecommendedFor: ["가벼운 UI 작업만 하는 사용자", "예산이 빡빡한 입문 사용자", "저장장치가 더 부족한 사용자"],
    buyingChecklist: ["64GB가 2개 모듈인지 확인", "메인보드 QVL 또는 호환성 확인", "추후 128GB 확장 가능성 확인", "CPU/메인보드 지원 클럭 확인"],
    danawaSearchKeywords: ["DDR5 64GB 5600", "DDR5 32GBx2"],
    sourceNote: "초기 mock 데이터. 실제 가격과 메인보드 호환성으로 검증 필요.",
  },
  {
    id: "mock_ram_high_ddr5_128gb",
    category: "ram",
    name: "DDR5 128GB Kit",
    tier: "워크스테이션 후보",
    status: "mockAvailable",
    coreUseCase: "무거운 모션그래픽, 3D, 영상·AI 병행 작업",
    specs: { capacityGb: 128, speedMt: 5600, modules: 4 },
    specSummary: { capacity: "128GB", speed: "DDR5 5600급", expand: "대용량 풀뱅크 가능성" },
    axisScores: { RAM: 3 },
    productTraits: { memoryFit: 3, expansionBurden: 2.2 },
    designerExplanation:
      "대형 프로젝트를 장시간 유지하거나 여러 고부하 앱을 동시에 쓰는 사용자를 위한 고용량 메모리 후보입니다.",
    overkillWarning:
      "대부분의 2D 디자인 사용자에게는 과한 선택입니다. 128GB가 필요할 정도의 작업인지 먼저 확인해야 합니다.",
    recommendedFor: ["복잡한 After Effects 프로젝트 사용자", "3D와 영상 앱을 동시에 쓰는 사용자", "대형 파일을 오래 유지하는 사용자"],
    notRecommendedFor: ["일반 디자인 전공 학생", "Figma/Photoshop 중심 사용자", "예산 효율이 중요한 사용자"],
    buyingChecklist: ["메인보드 최대 RAM 용량 확인", "4개 장착 시 클럭 안정성 확인", "CPU 쿨러 간섭 확인", "실제 작업에서 64GB를 넘는지 확인"],
    danawaSearchKeywords: ["DDR5 128GB", "DDR5 32GBx4"],
    sourceNote: "초기 mock 데이터. 실제 호환성과 안정성 검증 필요.",
  },
];

const mockSsdProductCandidates = [
  {
    id: "mock_ssd_value_nvme_1tb",
    category: "ssd",
    name: "NVMe SSD 1TB",
    tier: "기본 작업용 후보",
    status: "mockAvailable",
    coreUseCase: "디자인 파일, 앱 설치, 일반 캐시, 포트폴리오 작업",
    specs: { capacityTb: 1, readMb: 5000, writeMb: 4000, formFactor: "M.2 NVMe" },
    specSummary: { capacity: "1TB", speed: "읽기 5000MB/s급", form: "M.2 NVMe" },
    axisScores: { SSD_S: 2.15, SSD_C: 2 },
    productTraits: { speedFit: 2.15, capacityFit: 2, expansionBurden: 1.2 },
    designerExplanation:
      "큰 디자인 파일을 열고 저장하는 흐름에서 HDD나 저속 SSD보다 체감 차이를 만들 수 있는 기본 작업용 SSD 후보입니다.",
    overkillWarning:
      "대용량 영상이나 3D 소스가 많지 않다면 처음부터 4TB까지 갈 필요는 낮을 수 있습니다.",
    recommendedFor: ["2D 디자인과 UI 작업자", "작업 파일을 내부 SSD에 두고 싶은 사용자", "예산 균형을 보는 사용자"],
    notRecommendedFor: ["영상 원본과 캐시가 빠르게 쌓이는 사용자", "로컬 AI 모델을 많이 보관하는 사용자", "2TB 이상이 필요한 사용자"],
    buyingChecklist: ["M.2 NVMe인지 확인", "메인보드 M.2 슬롯 확인", "1TB 용량이 충분한지 확인", "방열판 필요 여부 확인"],
    danawaSearchKeywords: ["NVMe SSD 1TB", "M.2 SSD 1TB"],
    sourceNote: "초기 mock 데이터. 실제 속도와 보증 조건으로 검증 필요.",
  },
  {
    id: "mock_ssd_balanced_nvme_2tb",
    category: "ssd",
    name: "NVMe SSD 2TB",
    tier: "작업·캐시 균형 후보",
    status: "mockAvailable",
    coreUseCase: "영상 편집, After Effects 캐시, 대형 이미지 파일, 소스 관리",
    specs: { capacityTb: 2, readMb: 7000, writeMb: 6500, formFactor: "M.2 NVMe" },
    specSummary: { capacity: "2TB", speed: "읽기 7000MB/s급", form: "M.2 NVMe" },
    axisScores: { SSD_S: 2.75, SSD_C: 2.6 },
    productTraits: { speedFit: 2.75, capacityFit: 2.6, expansionBurden: 1.5 },
    designerExplanation:
      "영상 소스, 캐시, 대형 PSD가 함께 쌓이는 작업 흐름에서 속도와 용량을 모두 확보하는 균형형 SSD 후보입니다.",
    overkillWarning:
      "파일이 많지 않은 사용자에게는 2TB보다 1TB와 다른 부품 예산 배분이 더 효율적일 수 있습니다.",
    recommendedFor: ["Premiere Pro와 After Effects 사용자", "대형 이미지와 소스를 많이 저장하는 사용자", "캐시 공간 부족을 자주 겪는 사용자"],
    notRecommendedFor: ["문서·웹 중심 가벼운 사용자", "외장/클라우드 저장을 주로 쓰는 사용자", "용량보다 모니터가 더 급한 사용자"],
    buyingChecklist: ["읽기/쓰기 속도 확인", "TBW와 보증 기간 확인", "작업용·캐시용 분리 여부 확인", "메인보드 PCIe 세대 확인"],
    danawaSearchKeywords: ["NVMe SSD 2TB", "PCIe 4.0 SSD 2TB"],
    sourceNote: "초기 mock 데이터. 실제 지속 쓰기 성능과 보증 조건으로 검증 필요.",
  },
  {
    id: "mock_ssd_high_nvme_4tb",
    category: "ssd",
    name: "NVMe SSD 4TB",
    tier: "대용량 확장 후보",
    status: "mockAvailable",
    coreUseCase: "영상 원본, 3D 애셋, 로컬 AI 모델, 장기 프로젝트 저장",
    specs: { capacityTb: 4, readMb: 7000, writeMb: 6500, formFactor: "M.2 NVMe" },
    specSummary: { capacity: "4TB", speed: "고속 NVMe급", form: "M.2 NVMe" },
    axisScores: { SSD_S: 2.65, SSD_C: 3 },
    productTraits: { speedFit: 2.65, capacityFit: 3, expansionBurden: 2 },
    designerExplanation:
      "영상 원본, 3D 텍스처, AI 모델 파일처럼 저장공간이 빠르게 쌓이는 사용자에게 맞는 대용량 SSD 후보입니다.",
    overkillWarning:
      "저장공간 부족을 아직 겪지 않는 사용자라면 4TB는 과할 수 있습니다. 용량은 나중에 증설하기 쉬운 편입니다.",
    recommendedFor: ["영상 원본이 많은 사용자", "3D 애셋과 렌더 결과물이 많은 사용자", "로컬 AI 모델을 많이 보관하는 사용자"],
    notRecommendedFor: ["일반 2D·UI 중심 사용자", "예산이 제한적인 사용자", "추가 저장장치 증설이 쉬운 데스크톱 사용자"],
    buyingChecklist: ["M.2 슬롯 여유 확인", "방열판과 온도 리뷰 확인", "가격/TB 비교", "백업 드라이브 구성 확인"],
    danawaSearchKeywords: ["NVMe SSD 4TB", "M.2 SSD 4TB"],
    sourceNote: "초기 mock 데이터. 실제 가격/TB와 온도 특성으로 검증 필요.",
  },
];

const mockMonitorProductCandidates = [
  {
    id: "mock_monitor_value_27qhd_srgb",
    category: "monitor",
    name: "27인치 QHD IPS sRGB 모니터",
    tier: "디자인 기본 후보",
    status: "mockAvailable",
    coreUseCase: "UI 디자인, 2D 그래픽, 포트폴리오 작업, 레퍼런스 확인",
    specs: { sizeInch: 27, resolution: "2560x1440", panel: "IPS", srgb: 99, dcip3: 90, deltaE: 2 },
    specSummary: { size: "27인치 QHD", color: "sRGB 99%급", panel: "IPS 패널" },
    axisScores: { MON_S: 2.25, MON_C: 2.25 },
    productTraits: { workspaceFit: 2.25, colorFit: 2.25, eyeComfortFit: 1.8 },
    designerExplanation:
      "작업창과 레퍼런스를 넓게 펼치면서도 색과 선명도를 기본 이상으로 확보하는 디자인 작업용 모니터 후보입니다.",
    overkillWarning:
      "인쇄·사진 색보정이 주 작업이 아니라면 고가 전문가용 모니터보다 이 정도 균형형이 더 실용적일 수 있습니다.",
    recommendedFor: ["Figma와 UI 작업자", "2D 그래픽과 포트폴리오 작업자", "FHD 화면이 좁게 느껴지는 사용자"],
    notRecommendedFor: ["전문 인쇄 색보정 사용자", "4K 디테일 확인이 꼭 필요한 사용자", "초저가 예산 사용자"],
    buyingChecklist: ["QHD 해상도 확인", "IPS 패널 확인", "sRGB 커버리지 확인", "스탠드 조절과 VESA 지원 확인"],
    danawaSearchKeywords: ["27인치 QHD IPS sRGB", "27 QHD 디자인 모니터"],
    sourceNote: "초기 mock 데이터. 실제 패널 품질과 색 정확도 리뷰로 검증 필요.",
  },
  {
    id: "mock_monitor_balanced_27_4k_p3",
    category: "monitor",
    name: "27인치 4K IPS DCI-P3 모니터",
    tier: "색·선명도 균형 후보",
    status: "mockAvailable",
    coreUseCase: "사진 보정, 그래픽 디자인, 영상 확인, 작은 디테일 검수",
    specs: { sizeInch: 27, resolution: "3840x2160", panel: "IPS", srgb: 99, dcip3: 95, deltaE: 2 },
    specSummary: { size: "27인치 4K", color: "DCI-P3 95%급", panel: "IPS 패널" },
    axisScores: { MON_S: 2.45, MON_C: 2.8 },
    productTraits: { workspaceFit: 2.45, colorFit: 2.8, eyeComfortFit: 2 },
    designerExplanation:
      "작은 글자와 이미지 디테일, 색 차이를 정확히 확인해야 하는 사용자에게 맞는 선명도·색 균형형 모니터 후보입니다.",
    overkillWarning:
      "브라우저·문서·가벼운 UI 작업만 한다면 4K와 넓은 색역이 바로 체감되지 않을 수 있습니다.",
    recommendedFor: ["사진·그래픽 보정이 있는 사용자", "색과 디테일 검수가 중요한 사용자", "영상 결과물을 함께 확인하는 사용자"],
    notRecommendedFor: ["저가형 듀얼 모니터가 더 필요한 사용자", "색 정확도가 중요하지 않은 사용자", "GPU 출력 여유가 낮은 사용자"],
    buyingChecklist: ["색역과 Delta E 확인", "공장 캘리브레이션 여부 확인", "4K 배율 사용성 확인", "그래픽카드 출력 포트 확인"],
    danawaSearchKeywords: ["27인치 4K IPS DCI-P3", "27 4K 디자인 모니터"],
    sourceNote: "초기 mock 데이터. 실제 색 정확도와 캘리브레이션 정보로 검증 필요.",
  },
  {
    id: "mock_monitor_high_32_4k_adobergb",
    category: "monitor",
    name: "32인치 4K 전문가용 색 정확도 모니터",
    tier: "전문 색 작업 후보",
    status: "mockAvailable",
    coreUseCase: "인쇄, 사진, 브랜드 색상, 영상 컬러 확인, 넓은 작업 공간",
    specs: { sizeInch: 32, resolution: "3840x2160", panel: "IPS", srgb: 100, dcip3: 98, adobeRgb: 99, deltaE: 1 },
    specSummary: { size: "32인치 4K", color: "Adobe RGB / DCI-P3급", panel: "전문가용 IPS" },
    axisScores: { MON_S: 2.85, MON_C: 3 },
    productTraits: { workspaceFit: 2.85, colorFit: 3, eyeComfortFit: 2.3 },
    designerExplanation:
      "색을 믿고 작업해야 하는 인쇄·사진·브랜드 작업자에게 맞는 고급 모니터 후보입니다. 본체 성능만큼 화면 품질이 결과 판단에 직접 연결됩니다.",
    overkillWarning:
      "웹/UI 중심이라면 이 정도 전문가용 색역은 과할 수 있습니다. sRGB 정확도가 좋은 QHD/4K 모니터가 더 현실적일 수 있습니다.",
    recommendedFor: ["인쇄와 사진 보정 사용자", "브랜드 색상 판단이 중요한 사용자", "넓은 화면과 색 정확도를 모두 원하는 사용자"],
    notRecommendedFor: ["예산이 제한적인 학생", "Figma와 웹 중심 사용자", "고급 GPU나 RAM이 더 급한 사용자"],
    buyingChecklist: ["Adobe RGB와 DCI-P3 커버리지 확인", "Delta E와 캘리브레이션 확인", "스탠드 조절과 눈 피로 기능 확인", "책상 거리와 크기 확인"],
    danawaSearchKeywords: ["32인치 4K Adobe RGB 모니터", "전문가용 색보정 모니터"],
    sourceNote: "초기 mock 데이터. 실제 색 정확도와 패널 리뷰로 검증 필요.",
  },
];

window.cpuMasterMockProducts = {
  products: {
    gpu: mockGpuProductCandidates,
    cpu: mockCpuProductCandidates,
    ram: mockRamProductCandidates,
    ssd: mockSsdProductCandidates,
    monitor: mockMonitorProductCandidates,
  },
  mockGpuCandidates: mockGpuProductCandidates,
};
