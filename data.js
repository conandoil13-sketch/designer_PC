const questions = [
  "작업 중 디자인 툴, 브라우저, 참고자료, 메신저, 음악 앱 등을 동시에 켜두는 일이 얼마나 자주 있나요?",
  "하나의 프로젝트에서 여러 파일을 동시에 열고 오가는 일이 얼마나 자주 있나요?",
  "작업 파일이 진행될수록 레이어, 이미지, 효과가 쌓여 점점 무거워지는 일이 얼마나 자주 있나요?",
  "마감 직전에 수정, 변환, 저장, 업로드, 피드백 확인을 한꺼번에 처리하는 일이 얼마나 자주 있나요?",
  "하루 작업 중 컴퓨터를 오래 켜두고, 프로그램과 파일을 계속 열어둔 채 작업하는 편인가요?",
  "파일을 열거나 저장하는 데 시간이 오래 걸릴 때 작업에 얼마나 지장이 생기나요?",
  "확대/축소, 화면 이동, 레이어 전환 같은 기본 조작이 버벅일 때 얼마나 불편한가요?",
  "브러시, 필터, 효과, 마스크 적용이 늦게 반응하면 작업에 얼마나 영향을 주나요?",
  "미리보기 화면이 끊기거나 늦게 갱신되면 판단에 얼마나 방해가 되나요?",
  "렌더링, 인코딩, 내보내기, 대량 변환 시간이 길어질 때 얼마나 문제가 되나요?",
  "긴 작업이 중간에 멈추거나 실패하면 얼마나 치명적인가요?",
  "팬 소음이나 발열 때문에 집중이 깨지는 일이 생기면 얼마나 불편한가요?",
  "고해상도 이미지, 큰 캔버스, 대형 아트보드를 다루는 일이 얼마나 자주 있나요?",
  "복잡한 2D 파일을 다루는 일이 얼마나 자주 있나요?",
  "3D 화면을 돌려보며 재질, 조명, 카메라 구도를 실시간으로 확인하는 일이 얼마나 자주 있나요?",
  "로컬 AI 이미지 생성, GPU 렌더링, 업스케일링, 노이즈 제거 같은 GPU 기반 작업을 사용할 가능성이 어느 정도인가요?",
  "원본 파일, 작업본, 소스, 백업 파일이 빠르게 쌓이는 편인가요?",
  "파일을 복사, 이동, 백업하는 시간이 길어서 불편했던 일이 얼마나 자주 있나요?",
  "한 화면에 작업창, 참고자료, 피드백 문서, 메신저 등을 넓게 펼쳐두고 작업하는 일이 얼마나 자주 있나요?",
  "작은 글자, 얇은 선, 아이콘, 이미지 디테일이 흐릿하게 보여 작업이 불편했던 적이 얼마나 자주 있나요?",
  "색이 미묘하게 달라 보여 작업 결과에 문제가 생길까 불안했던 적이 얼마나 자주 있나요?",
  "장시간 화면을 보면서 눈 피로, 화면 반사, 자세 문제가 작업에 얼마나 영향을 주나요?",
  "같은 예산이라면 어느 쪽에 더 가깝나요?",
  "예산을 맞춰야 한다면 어느 쪽에 더 가깝나요?",
  "같은 예산이라면 어느 쪽에 더 가깝나요?",
];
const questionScaleLabels = [
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["거의 아님", "항상 그럼"],
  ["지장 적음", "지장 큼"],
  ["참을 만함", "매우 불편"],
  ["영향 적음", "영향 큼"],
  ["방해 적음", "방해 큼"],
  ["문제 적음", "문제 큼"],
  ["괜찮음", "치명적"],
  ["괜찮음", "매우 불편"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["전혀 없음", "매우 높음"],
  ["천천히 쌓임", "빠르게 쌓임"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["거의 없음", "매우 자주"],
  ["영향 적음", "영향 큼"],
  ["조작 부드러움", "출력 빠름"],
  ["지금 작업 중심", "오래 쓸 여유"],
  ["본체 성능", "모니터 품질"],
];

const weightFields = [
  "CS",
  "CM",
  "RAM",
  "GPU",
  "VRAM",
  "SSD_S",
  "SSD_C",
  "MON_S",
  "MON_C",
  "COOL",
];

const questionWeights = [
  { id: 1, weights: { CS: 1, CM: 2, RAM: 3, GPU: 0, VRAM: 0, SSD_S: 2, SSD_C: 0, MON_S: 2, MON_C: 0, COOL: 0 } },
  { id: 2, weights: { CS: 2, CM: 1, RAM: 3, GPU: 1, VRAM: 1, SSD_S: 2, SSD_C: 1, MON_S: 1, MON_C: 0, COOL: 0 } },
  { id: 3, weights: { CS: 2, CM: 1, RAM: 3, GPU: 1, VRAM: 1, SSD_S: 2, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 4, weights: { CS: 1, CM: 3, RAM: 3, GPU: 1, VRAM: 0, SSD_S: 2, SSD_C: 0, MON_S: 1, MON_C: 0, COOL: 2 } },
  { id: 5, weights: { CS: 0, CM: 1, RAM: 2, GPU: 0, VRAM: 0, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 3 } },
  { id: 6, weights: { CS: 1, CM: 1, RAM: 2, GPU: 0, VRAM: 0, SSD_S: 3, SSD_C: 1, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 7, weights: { CS: 3, CM: 0, RAM: 2, GPU: 2, VRAM: 1, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 8, weights: { CS: 3, CM: 0, RAM: 3, GPU: 2, VRAM: 1, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 9, weights: { CS: 1, CM: 1, RAM: 2, GPU: 3, VRAM: 3, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 10, weights: { CS: 0, CM: 3, RAM: 1, GPU: 2, VRAM: 2, SSD_S: 2, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 11, weights: { CS: 0, CM: 1, RAM: 2, GPU: 1, VRAM: 2, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 3 } },
  { id: 12, weights: { CS: 0, CM: 0, RAM: 0, GPU: 1, VRAM: 0, SSD_S: 0, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 3 } },
  { id: 13, weights: { CS: 2, CM: 0, RAM: 3, GPU: 1, VRAM: 2, SSD_S: 2, SSD_C: 1, MON_S: 1, MON_C: 2, COOL: 0 } },
  { id: 14, weights: { CS: 3, CM: 0, RAM: 3, GPU: 2, VRAM: 1, SSD_S: 2, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 15, weights: { CS: 2, CM: 0, RAM: 1, GPU: 3, VRAM: 3, SSD_S: 1, SSD_C: 0, MON_S: 1, MON_C: 1, COOL: 1 } },
  { id: 16, weights: { CS: 1, CM: 1, RAM: 1, GPU: 3, VRAM: 3, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 2 } },
  { id: 17, weights: { CS: 0, CM: 0, RAM: 0, GPU: 0, VRAM: 0, SSD_S: 0, SSD_C: 3, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 18, weights: { CS: 0, CM: 0, RAM: 0, GPU: 0, VRAM: 0, SSD_S: 3, SSD_C: 1, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 19, weights: { CS: 0, CM: 0, RAM: 1, GPU: 1, VRAM: 0, SSD_S: 0, SSD_C: 0, MON_S: 3, MON_C: 1, COOL: 0 } },
  { id: 20, weights: { CS: 0, CM: 0, RAM: 0, GPU: 1, VRAM: 0, SSD_S: 0, SSD_C: 0, MON_S: 1, MON_C: 3, COOL: 0 } },
  { id: 21, weights: { CS: 0, CM: 0, RAM: 0, GPU: 0, VRAM: 0, SSD_S: 0, SSD_C: 0, MON_S: 0, MON_C: 3, COOL: 0 } },
  { id: 22, weights: { CS: 0, CM: 0, RAM: 0, GPU: 0, VRAM: 0, SSD_S: 0, SSD_C: 0, MON_S: 1, MON_C: 3, COOL: 0 } },
  { id: 23, weights: { CS: -3, CM: 3, RAM: -1, GPU: 2, VRAM: 2, SSD_S: 1, SSD_C: 0, MON_S: 0, MON_C: 0, COOL: 0 } },
  { id: 24, weights: { CS: 0, CM: 1, RAM: 2, GPU: 1, VRAM: 1, SSD_S: 1, SSD_C: 2, MON_S: 0, MON_C: 0, COOL: 2 } },
  { id: 25, weights: { CS: -2, CM: -2, RAM: -1, GPU: -2, VRAM: -1, SSD_S: 0, SSD_C: 0, MON_S: 3, MON_C: 3, COOL: 0 } },
];

const programPresetWeights = {
  Photoshop: { CS: 3, CM: 1, RAM: 3, GPU: 2, VRAM: 1, SSD_S: 2, SSD_C: 1, MON_S: 1, MON_C: 3, COOL: 0 },
  Illustrator: { CS: 3, CM: 1, RAM: 2, GPU: 1, VRAM: 1, SSD_S: 1, SSD_C: 1, MON_S: 2, MON_C: 3, COOL: 0 },
  InDesign: { CS: 2, CM: 1, RAM: 2, GPU: 0, VRAM: 0, SSD_S: 1, SSD_C: 1, MON_S: 2, MON_C: 3, COOL: 0 },
  Figma: { CS: 2, CM: 1, RAM: 2, GPU: 1, VRAM: 0, SSD_S: 1, SSD_C: 0, MON_S: 3, MON_C: 2, COOL: 0 },
  "Premiere Pro": { CS: 1, CM: 3, RAM: 3, GPU: 2, VRAM: 3, SSD_S: 3, SSD_C: 3, MON_S: 2, MON_C: 2, COOL: 2 },
  "After Effects": { CS: 2, CM: 3, RAM: 3, GPU: 2, VRAM: 2, SSD_S: 3, SSD_C: 2, MON_S: 2, MON_C: 2, COOL: 2 },
  "DaVinci Resolve": { CS: 1, CM: 3, RAM: 3, GPU: 3, VRAM: 3, SSD_S: 3, SSD_C: 3, MON_S: 2, MON_C: 3, COOL: 2 },
  Blender: { CS: 2, CM: 2, RAM: 2, GPU: 3, VRAM: 3, SSD_S: 2, SSD_C: 2, MON_S: 2, MON_C: 2, COOL: 2 },
  "Cinema 4D": { CS: 2, CM: 2, RAM: 2, GPU: 3, VRAM: 3, SSD_S: 2, SSD_C: 2, MON_S: 2, MON_C: 2, COOL: 2 },
  "로컬 AI 이미지 생성": { CS: 1, CM: 1, RAM: 2, GPU: 3, VRAM: 3, SSD_S: 2, SSD_C: 2, MON_S: 1, MON_C: 1, COOL: 2 },
  "웹 기반 AI 이미지 생성": { CS: 1, CM: 0, RAM: 1, GPU: 0, VRAM: 0, SSD_S: 1, SSD_C: 1, MON_S: 1, MON_C: 2, COOL: 0 },
  "웹/레퍼런스 중심 작업": { CS: 1, CM: 0, RAM: 2, GPU: 0, VRAM: 0, SSD_S: 1, SSD_C: 0, MON_S: 3, MON_C: 2, COOL: 0 },
};

const termDescriptions = {
  cpu: {
    title: "CPU",
    description:
      "컴퓨터의 두뇌에 가까운 부품입니다. Photoshop에서 브러시가 바로 반응하는지, 파일을 변환하거나 영상을 내보낼 때 얼마나 기다리는지에 영향을 줍니다. 이름 숫자만 보기보다 내가 쓰는 프로그램에서 싱글·멀티 성능이 어떻게 쓰이는지 함께 보면 좋아요.",
  },
  graphicsCard: {
    title: "그래픽카드",
    description:
      "화면 출력과 그래픽 계산을 맡는 부품입니다. 디자인 작업에서는 미리보기, 영상 효과, 3D 화면, 로컬 AI 이미지 생성처럼 화면이나 그래픽 계산이 많은 작업에서 체감됩니다. 2D 중심이라면 최고급 모델보다 RAM, SSD, 모니터 예산과 균형을 보는 게 좋습니다.",
  },
  motherboard: {
    title: "메인보드",
    description:
      "CPU, RAM, SSD, 그래픽카드를 꽂아 서로 연결해주는 판입니다. 직접 속도를 크게 올리는 부품이라기보다, 원하는 부품을 꽂을 수 있는지와 나중에 RAM이나 SSD를 더 늘릴 수 있는지를 결정합니다.",
  },
  ddrMemory: {
    title: "DDR 메모리",
    description:
      "RAM의 세대 규격입니다. DDR4와 DDR5처럼 세대가 다르면 메인보드와 CPU 호환이 달라져 서로 섞어 쓸 수 없습니다. 초보자는 숫자보다 내가 고른 메인보드가 DDR4용인지 DDR5용인지 먼저 확인하면 됩니다.",
  },
  ssd: {
    title: "SSD",
    description:
      "작업 파일과 프로그램을 저장하는 빠른 저장장치입니다. 큰 PSD, 영상 소스, 캐시 파일을 열고 저장할 때 체감이 납니다. 용량이 부족하면 외장하드로 옮기거나 파일을 지우는 일이 잦아져 작업 흐름이 끊길 수 있어요.",
  },
  powerSupply: {
    title: "파워서플라이",
    description:
      "PC 안의 모든 부품에 전기를 공급하는 부품입니다. 고성능 CPU나 그래픽카드를 오래 쓰는 작업에서는 용량과 품질이 부족하면 꺼짐, 불안정, 소음 문제가 생길 수 있습니다. 무조건 큰 용량보다 검증된 브랜드와 여유 있는 용량을 보는 편이 좋습니다.",
  },
  cpuSocket: {
    title: "CPU 소켓",
    description:
      "CPU가 메인보드에 꽂히는 자리 규격입니다. 소켓이 맞지 않으면 CPU와 메인보드를 함께 사용할 수 없습니다. CPU를 먼저 고른 뒤 그 CPU를 지원하는 메인보드인지 확인하는 용어로 보면 됩니다.",
  },
  chipset: {
    title: "칩셋",
    description:
      "메인보드의 기능 등급을 나누는 기준입니다. SSD 슬롯 수, USB 포트, 확장성, CPU 지원 범위 같은 차이에 영향을 줍니다. 처음 조립 PC를 고를 때는 최고급 칩셋보다 필요한 슬롯과 호환성이 충분한지가 더 중요합니다.",
  },
  ramSlot: {
    title: "RAM 슬롯",
    description:
      "RAM을 꽂는 자리입니다. 슬롯이 2개인지 4개인지에 따라 나중에 메모리를 더 늘리기 쉬운지가 달라집니다. 큰 PSD, 영상 편집, 여러 앱 동시 사용이 많다면 추후 확장 여유도 확인하면 좋습니다.",
  },
  cooler: {
    title: "쿨러",
    description:
      "CPU나 그래픽카드의 열을 식혀주는 부품입니다. 긴 렌더링, 인코딩, 로컬 AI 작업처럼 오래 부하가 걸리는 작업에서는 성능 유지와 소음에 영향을 줍니다. 조용한 작업 환경이 중요하면 성능뿐 아니라 소음도 같이 봐야 합니다.",
  },
  gpuAccel: {
    title: "GPU 가속",
    description:
      "그래픽카드가 영상 효과, 미리보기, 일부 렌더 계산을 나눠 맡는 기능입니다. Premiere, DaVinci, Blender처럼 프리뷰와 화면 반응이 중요한 작업에서 끊김을 줄이는 데 체감될 수 있어요. 2D 중심 작업만 한다면 GPU 가속 하나 때문에 고급 그래픽카드까지 갈 필요는 낮습니다.",
  },
  cuda: {
    title: "CUDA 코어",
    description:
      "NVIDIA 그래픽카드가 반복 계산을 나눠 처리할 때 쓰는 연산 단위입니다. 로컬 AI, GPU 렌더링, 일부 업스케일링 작업에서는 처리 속도와 연결될 수 있어요. 다만 숫자만 외우기보다 내가 쓰는 프로그램의 실제 작업 벤치마크를 함께 보는 편이 안전합니다.",
  },
  vram: {
    title: "VRAM",
    description:
      "그래픽카드 안에 있는 전용 작업 공간입니다. 고해상도 영상, 3D 장면, 로컬 AI 이미지를 펼쳐놓는 자리라서 부족하면 속도 저하를 넘어 작업 자체가 답답해질 수 있어요.",
  },
  ram: {
    title: "RAM",
    description:
      "컴퓨터가 지금 켜둔 프로그램과 작업 파일을 임시로 펼쳐두는 공간입니다. 포토샵, 브라우저, 편집 툴, 참고 자료를 동시에 켜두는 편이라면 CPU나 GPU만큼 체감에 크게 영향을 줄 수 있어요.",
  },
  ssdCache: {
    title: "SSD 캐시",
    description:
      "영상 편집이나 모션 작업 중 임시 파일을 빠르게 읽고 쓰는 저장공간입니다. 캐시 공간이 느리거나 부족하면 미리보기, 저장, 불러오기 흐름이 끊기기 쉬워요.",
  },
  overclock: {
    title: "오버클럭",
    description:
      "부품을 기본 설정보다 더 높은 속도로 동작하게 만드는 설정입니다. 수치가 높아 보여도 발열, 소음, 안정성과 함께 봐야 해서 초보 구매자가 가장 먼저 볼 기준은 아닙니다.",
  },
  localAi: {
    title: "로컬 AI 이미지 생성",
    description:
      "내 컴퓨터에 Stable Diffusion, ComfyUI 같은 도구를 설치해서 이미지를 직접 생성하는 방식입니다. 그래픽카드와 VRAM 영향을 크게 받기 때문에 웹 AI보다 PC 사양이 중요해질 수 있어요.",
  },
  webAi: {
    title: "웹 기반 AI 이미지 생성",
    description:
      "Midjourney, Firefly, ChatGPT 이미지 생성처럼 웹사이트나 앱 서버에서 이미지를 만드는 방식입니다. 내 PC의 그래픽카드보다 브라우저 사용성, RAM, 모니터 확인 환경이 더 중요할 수 있어요.",
  },
  nvenc: {
    title: "NVENC",
    description:
      "NVIDIA 그래픽카드에 있는 영상 내보내기 전용 기능입니다. Premiere Pro 같은 앱에서 영상을 저장하거나 인코딩할 때 CPU 부담을 줄이고 시간을 단축하는 데 도움을 줄 수 있어요. 영상 작업이 적다면 이 기능만 보고 그래픽카드를 올릴 필요는 낮습니다.",
  },
  quickSync: {
    title: "Quick Sync",
    description:
      "Intel CPU나 내장 그래픽이 영상 인코딩을 도와주는 기능입니다. 영상 내보내기, 프록시 생성, 일부 코덱 처리에서 기다리는 시간을 줄이는 데 쓰일 수 있어요. 컷 편집이나 짧은 영상 위주라면 있으면 좋은 기능 정도로 보면 됩니다.",
  },
  av1: {
    title: "AV1",
    description:
      "최근 많이 쓰이는 영상 압축 방식 중 하나입니다. AV1 인코딩 지원이 있으면 웹 플랫폼용 영상을 더 효율적으로 만들 수 있어요. 모든 디자인 작업에 필수는 아니고, 영상 내보내기가 잦을 때 확인하면 좋은 항목입니다.",
  },
  tensor: {
    title: "Tensor",
    description:
      "NVIDIA GPU에서 AI 계산을 빠르게 처리하는 전용 기능입니다. 로컬 AI 이미지 생성, 업스케일링, 노이즈 제거처럼 AI 기반 작업을 자주 쓸 때 생성 속도와 처리 여유에 영향을 줍니다. 웹 기반 AI만 쓴다면 중요도가 크게 낮아집니다.",
  },
  nvme: {
    title: "NVMe SSD",
    description:
      "일반 SATA SSD보다 빠른 방식의 SSD입니다. 큰 PSD를 열고 저장하거나 영상 소스, After Effects 캐시처럼 저장장치를 자주 쓰는 작업에서 흐름이 덜 끊기게 해줍니다. 최고급 속도보다 충분한 용량과 안정성도 함께 봐야 합니다.",
  },
  m2: {
    title: "M.2 슬롯",
    description:
      "빠른 SSD를 추가로 꽂을 수 있는 메인보드의 자리입니다. 영상 소스, 큰 PSD, 캐시 파일이 많아질 때 내부 저장공간을 나중에 늘릴 수 있어 외장하드로 계속 옮기는 불편을 줄여줍니다. 당장 파일이 많지 않다면 슬롯 여유만 확인해도 충분합니다.",
  },
  pcie: {
    title: "PCIe",
    description:
      "그래픽카드나 NVMe SSD가 메인보드와 데이터를 주고받는 통로 규격입니다. 디자인 작업에서는 빠른 SSD나 그래픽카드가 제 성능을 낼 수 있는지와 연결됩니다. 초보자는 세대 숫자를 외우기보다, 원하는 SSD나 GPU를 제대로 지원하는지만 확인하면 됩니다.",
  },
  srgb: {
    title: "sRGB",
    description:
      "웹, UI, 일반 이미지 작업에서 가장 기본이 되는 색 범위입니다. Figma, 웹 포트폴리오, 브랜드 시안처럼 화면으로 보는 결과물이 많다면 sRGB를 정확하게 보여주는 모니터가 중요합니다. 인쇄나 전문 사진 작업이 아니라면 우선 sRGB 정확도부터 봐도 좋습니다.",
  },
  dcip3: {
    title: "DCI-P3",
    description:
      "sRGB보다 더 넓은 색 범위입니다. 영상, 모바일 화면, 최신 디스플레이 기준으로 색을 확인해야 할 때 의미가 커집니다. 색이 풍부하게 보이는 것과 정확한 것은 다르기 때문에 색 정확도 정보와 함께 봐야 합니다.",
  },
  adobeRgb: {
    title: "Adobe RGB",
    description:
      "인쇄와 사진 보정에서 의미가 커지는 넓은 색 범위입니다. 사진, 출판, 인쇄물 색을 많이 다룬다면 모니터 선택에서 확인할 만합니다. 웹/UI 중심이라면 Adobe RGB보다 sRGB 정확도가 먼저일 수 있습니다.",
  },
  deltaE: {
    title: "Delta E",
    description:
      "화면 색이 기준 색과 얼마나 차이 나는지 나타내는 수치입니다. 낮을수록 화면에서 보는 색과 기준 색의 차이가 적어, 브랜드 색상이나 인쇄 결과를 믿고 판단하기 쉬워집니다. 일반 작업자라면 공장 색보정 여부와 함께 참고하면 됩니다.",
  },
  ips: {
    title: "IPS 패널",
    description:
      "색 표현과 시야각이 비교적 안정적인 모니터 패널 종류입니다. 디자인 작업에서는 화면을 조금 비스듬히 봐도 색과 밝기가 크게 틀어지지 않는 점이 도움이 됩니다. 색과 디테일 확인이 중요하다면 저가 TN 패널보다 IPS 계열을 우선 보는 편이 좋습니다.",
  },
  airCooler: {
    title: "공랭 쿨러",
    description:
      "팬과 방열판으로 CPU 열을 식히는 쿨러입니다. 장시간 Photoshop, Premiere, 렌더링 작업을 할 때 CPU가 너무 뜨거워져 성능이 떨어지는 일을 줄여줍니다. 관리가 비교적 쉬워 중급 작업용 PC에서는 충분한 경우가 많습니다.",
  },
  liquidCooler: {
    title: "수랭 쿨러",
    description:
      "액체가 흐르는 라디에이터 구조로 CPU 열을 식히는 쿨러입니다. 고성능 CPU로 긴 렌더링을 자주 돌릴 때 온도 관리에 도움이 될 수 있어요. 하지만 관리 부담과 비용이 있어서 모든 디자이너에게 필요한 선택은 아닙니다.",
  },
  psuWattage: {
    title: "파워 정격 용량",
    description:
      "파워서플라이가 안정적으로 공급할 수 있는 전력 용량입니다. GPU 렌더링, 영상 인코딩처럼 CPU와 GPU가 오래 일하는 작업에서는 전력 여유가 부족하면 불안정해질 수 있습니다. 고성능 GPU를 쓰는 구성일수록 권장 용량보다 여유 있게 보는 편이 안전합니다.",
  },
  psuEfficiency: {
    title: "파워 효율 등급",
    description:
      "파워가 전기를 얼마나 효율적으로 쓰는지 나타내는 등급입니다. 장시간 작업하는 PC에서는 발열과 소음, 전기 낭비를 줄이는 데 간접적으로 도움이 됩니다. 무조건 최고 등급보다 검증된 브랜드와 적절한 효율 등급을 함께 보는 게 좋습니다.",
  },
  airflow: {
    title: "케이스 통풍",
    description:
      "케이스 안의 뜨거운 공기가 잘 빠지고 차가운 공기가 들어오는 구조입니다. 영상 인코딩, 3D 렌더링, 로컬 AI처럼 오래 부하가 걸리는 작업에서 소음과 발열을 줄이는 데 중요합니다. 통풍이 나쁘면 부품 성능이 좋아도 팬 소음이 커지고 성능이 떨어질 수 있어요.",
  },
};

const programDisplayLabels = {
  Photoshop: "Photoshop",
  Illustrator: "Illustrator",
  InDesign: "InDesign",
  Figma: "Figma",
  "Premiere Pro": "Premiere",
  "After Effects": "After FX",
  "DaVinci Resolve": "DaVinci",
  Blender: "Blender",
  "Cinema 4D": "Cinema 4D",
  "로컬 AI 이미지 생성": "로컬 AI",
  "웹 기반 AI 이미지 생성": "웹 AI",
  "웹/레퍼런스 중심 작업": "웹/레퍼런스",
};

const axisDescriptions = {
  CS: {
    title: "작업 중 조작감",
    checkTitle: "클릭하고 움직일 때 바로 반응하는 힘",
    checkDescription:
      "확대, 축소, 화면 이동, 레이어 전환처럼 작업 중 계속 반복하는 조작이 부드럽게 느껴지는 기준입니다.",
    holdDescription:
      "지금 답변 기준으로는 최고 수준의 조작 반응성보다 다른 부품 기준이 먼저 체감될 수 있습니다.",
    checkPoint: "체크 포인트: CPU 싱글 성능과 작업 프로그램의 실제 체감 벤치마크를 함께 보세요.",
  },
  CM: {
    title: "렌더링·인코딩 처리력",
    checkTitle: "내보내기와 변환 시간을 줄이는 처리력",
    checkDescription:
      "렌더링, 인코딩, 대량 변환처럼 컴퓨터가 오래 계산해야 하는 작업을 빠르게 끝내는 기준입니다.",
    holdDescription:
      "최종 출력 시간이 아주 큰 병목은 아니라면, 코어 수보다 작업 중 체감이나 저장장치 쪽이 더 중요할 수 있습니다.",
    checkPoint: "체크 포인트: CPU 멀티코어 성능과 인코더 지원 여부를 함께 확인하세요.",
  },
  RAM: {
    title: "큰 파일과 여러 프로그램을 버티는 여유",
    checkTitle: "여러 프로그램과 큰 파일을 버티는 메모리 여유",
    checkDescription:
      "디자인 툴, 브라우저, 참고 자료, 큰 PSD/AI 파일을 동시에 펼쳐도 버틸 수 있는 작업 공간입니다.",
    holdDescription:
      "동시에 여는 프로그램이나 파일이 많지 않다면, 과한 메모리보다 다른 기준에 예산을 둘 수 있습니다.",
    checkPoint: "체크 포인트: 여러 툴을 함께 쓰거나 큰 파일을 다룬다면 32GB 이상부터 비교해보세요.",
  },
  GPU: {
    title: "미리보기와 그래픽 처리 체감",
    checkTitle: "미리보기와 그래픽 작업을 받쳐주는 힘",
    checkDescription:
      "영상 프리뷰, 3D 뷰포트, 일부 효과 처리처럼 화면에서 바로 확인해야 하는 작업에 영향을 줍니다.",
    holdDescription:
      "현재 작업 흐름에서는 최상위 그래픽카드보다 RAM, SSD, 모니터가 먼저 체감될 가능성이 있습니다.",
    checkPoint: "체크 포인트: 게임 FPS보다 사용하는 디자인 프로그램의 GPU 가속 성능을 보세요.",
  },
  VRAM: {
    title: "3D·로컬 AI·GPU 작업 공간",
    checkTitle: "무거운 그래픽 작업을 올려둘 VRAM 여유",
    checkDescription:
      "고해상도 영상, 3D 장면, 로컬 AI 이미지 생성처럼 그래픽카드 안에 큰 작업 데이터를 올려두는 기준입니다.",
    holdDescription:
      "3D, 로컬 AI, GPU 렌더링이 주 작업이 아니라면 VRAM을 과하게 잡지 않아도 됩니다.",
    checkPoint: "체크 포인트: 로컬 AI나 3D 작업을 한다면 그래픽카드 이름보다 VRAM 용량을 먼저 확인하세요.",
  },
  SSD_S: {
    title: "파일 열기·저장·캐시 속도",
    checkTitle: "파일과 캐시가 막히지 않는 SSD 속도",
    checkDescription:
      "큰 파일을 열고 저장하거나 영상·모션 캐시를 읽고 쓸 때 작업 흐름이 끊기지 않게 해주는 기준입니다.",
    holdDescription:
      "파일 입출력이 큰 불편이 아니라면 최고급 SSD보다 용량이나 다른 부품 균형이 더 중요할 수 있습니다.",
    checkPoint: "체크 포인트: 메인 작업용 SSD는 NVMe 기반인지, 캐시 여유 공간이 충분한지 확인하세요.",
  },
  SSD_C: {
    title: "저장공간과 확장 여유",
    checkTitle: "소스와 작업본을 쌓아둘 저장공간",
    checkDescription:
      "원본, 작업본, 백업, 영상 소스가 빠르게 늘어나는 작업에서 용량 부족을 늦춰주는 기준입니다.",
    holdDescription:
      "파일이 빠르게 쌓이지 않는 편이라면 초기 저장공간을 과하게 잡기보다 추후 확장을 고려해도 됩니다.",
    checkPoint: "체크 포인트: 1TB 이상부터 보고, 영상·3D 작업은 2TB나 추가 저장장치 여지도 확인하세요.",
  },
  MON_S: {
    title: "넓게 펼쳐놓는 작업 화면",
    checkTitle: "창과 자료를 넓게 펼치는 화면 공간",
    checkDescription:
      "작업창, 참고자료, 피드백 문서, 메신저를 한 화면에 놓고 비교하기 쉽게 만드는 기준입니다.",
    holdDescription:
      "한 화면에 많은 창을 펼치는 편이 아니라면 모니터 크기보다 색 정확도나 본체 성능이 먼저일 수 있습니다.",
    checkPoint: "체크 포인트: 27인치 QHD, 4K, 듀얼 모니터, 울트라와이드 구성을 비교해보세요.",
  },
  MON_C: {
    title: "색 정확도와 선명도",
    checkTitle: "색과 디테일을 믿고 보는 화면 품질",
    checkDescription:
      "색 차이, 작은 글자, 얇은 선, 이미지 디테일을 확인해야 하는 작업에서 결과물을 믿고 판단하게 해줍니다.",
    holdDescription:
      "색 정확도가 작업 결과에 크게 영향을 주지 않는다면, 고가 색보정 모니터보다 다른 기준을 먼저 볼 수 있습니다.",
    checkPoint: "체크 포인트: sRGB, DCI-P3, Adobe RGB, IPS 패널, 공장 캘리브레이션 여부를 확인하세요.",
  },
  COOL: {
    title: "오래 작업해도 안정적인 환경",
    checkTitle: "발열과 소음을 버티는 안정성",
    checkDescription:
      "장시간 작업, 긴 렌더링, 팬 소음, 발열 때문에 집중이 깨지지 않게 만드는 기준입니다.",
    holdDescription:
      "긴 작업이나 소음 스트레스가 크지 않다면 과한 쿨링보다 핵심 성능에 예산을 둘 수 있습니다.",
    checkPoint: "체크 포인트: CPU 쿨러, 케이스 airflow, 파워 효율, 그래픽카드 전력 소모를 함께 보세요.",
  },
};

const specDiagnosisCopy = {
  CS: {
    title: "CPU 싱글 성능",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 작업 중 화면 이동, 확대·축소, 레이어 전환처럼 즉각적인 반응이 필요한 상황이 많은 편입니다.",
        impact:
          "이 기준이 부족하면 파일은 열려 있어도 조작이 한 박자씩 늦고, 세밀한 수정 과정에서 작업 흐름이 자주 끊길 수 있습니다.",
        buyingTip:
          "코어 수만 보지 말고 싱글코어 벤치마크와 Photoshop, Illustrator, Figma 같은 실제 앱 체감 리뷰를 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 작업 중 반응성도 중요하지만, 모든 예산을 CPU 체감 성능에 몰아야 할 정도는 아닙니다.",
        impact:
          "기본 조작이 답답하지 않은 수준은 필요하지만, 최상급 CPU보다 RAM, SSD, 모니터 같은 항목이 더 크게 체감될 수 있습니다.",
        buyingTip:
          "같은 가격대에서 싱글코어 성능이 안정적인 CPU를 고르고, 너무 오래된 세대는 피하는 편이 좋습니다.",
        guard:
          "최고급 CPU까지 올리기보다, 남는 예산을 RAM이나 SSD에 배분하는 구성이 더 효율적일 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 CPU의 순간 반응성보다 다른 항목이 더 큰 우선순위로 나타났습니다.",
        impact:
          "일반적인 디자인 작업을 처리할 기본 성능은 필요하지만, 싱글코어 성능만 보고 과하게 높은 CPU를 고를 필요는 낮습니다.",
        buyingTip:
          "최신 보급형 또는 중급형 CPU 기준을 충족하는지 확인하고, 예산을 더 중요한 항목에 남겨두세요.",
        guard:
          "CPU 이름이 더 높아 보여도 실제 작업에서는 RAM, SSD, GPU, 모니터 쪽 투자가 더 큰 차이를 만들 수 있습니다.",
      },
    },
  },
  CM: {
    title: "CPU 멀티 성능",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 렌더링, 인코딩, 내보내기, 대량 변환처럼 시간이 걸리는 작업 부담이 큰 편입니다.",
        impact:
          "멀티 성능이 부족하면 결과물을 뽑는 동안 오래 기다려야 하고, 동시에 다른 작업을 하기 어려워질 수 있습니다.",
        buyingTip:
          "코어·스레드 수, 멀티코어 벤치마크, 사용하는 프로그램의 렌더링·인코딩 테스트를 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 출력이나 변환 작업도 하지만, 모든 작업이 멀티코어 성능에 크게 의존하는 유형은 아닙니다.",
        impact:
          "일정 수준의 멀티 성능은 필요하지만, 코어 수만 높인 CPU보다 싱글 성능, RAM, SSD와의 균형이 더 중요할 수 있습니다.",
        buyingTip:
          "코어 수가 충분한 중급 CPU를 기준으로 보고, 실제 사용하는 앱에서 멀티코어 활용이 잘 되는지 확인하세요.",
        guard:
          "렌더링이 주 작업이 아니라면 최고 코어 수 제품보다 전체 구성 균형이 더 좋은 선택일 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 긴 렌더링이나 대량 인코딩보다 작업 중 조작감과 기본 처리 여유가 더 중요하게 나타났습니다.",
        impact:
          "멀티코어 성능이 아주 낮으면 불편할 수 있지만, 높은 코어 수에 많은 예산을 쓰는 것은 체감 효율이 낮을 수 있습니다.",
        buyingTip:
          "기본적인 최신 중급 CPU 수준을 충족하는지 확인하고, 남는 예산은 RAM, SSD, 모니터에 배분하세요.",
        guard:
          "코어 수가 많다고 항상 디자인 작업이 빨라지는 것은 아닙니다. 사용하는 프로그램의 작업 방식과 함께 봐야 합니다.",
      },
    },
  },
  RAM: {
    title: "RAM 용량",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 여러 프로그램과 파일을 동시에 열어두고, 작업 파일이 점점 무거워지는 상황이 많은 편입니다.",
        impact:
          "RAM이 부족하면 CPU나 GPU가 충분해도 파일 전환, 레이어 작업, 브라우저 병행, 미리보기 과정에서 버벅임이 생길 수 있습니다.",
        buyingTip:
          "최소 32GB 이상을 기준으로 보고, 영상·3D·대형 파일 작업이 많다면 64GB 확장 가능성도 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 기본적인 멀티태스킹과 파일 작업 여유가 필요한 편입니다.",
        impact:
          "RAM이 너무 적으면 여러 앱을 함께 켤 때 답답할 수 있지만, 모든 사용자에게 64GB 이상이 필요한 것은 아닙니다.",
        buyingTip:
          "32GB 구성을 우선 확인하고, 메인보드에 추후 RAM을 추가할 슬롯 여유가 있는지도 함께 보세요.",
        guard:
          "지금 작업 규모가 크지 않다면 64GB보다 32GB와 빠른 SSD 조합이 더 균형적일 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 대용량 파일이나 무거운 멀티태스킹 부담이 크게 나타나지 않았습니다.",
        impact:
          "기본적인 작업 여유는 필요하지만, RAM 용량을 과하게 늘려도 현재 작업에서는 체감 차이가 제한적일 수 있습니다.",
        buyingTip:
          "최소 16GB 이상을 기준으로 보되, 가능하면 32GB로 올리거나 추후 확장 가능한 구성을 확인하세요.",
        guard:
          "RAM을 무조건 크게 잡기보다, 실제로 큰 파일을 자주 다루는지 먼저 확인하는 편이 좋습니다.",
      },
    },
  },
  GPU: {
    title: "GPU 기본 성능",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 미리보기, 3D 화면 조작, 그래픽 가속처럼 GPU 성능이 작업 흐름에 영향을 주는 상황이 많은 편입니다.",
        impact:
          "GPU 성능이 부족하면 뷰포트 회전, 영상 프리뷰, 일부 효과 처리, 고해상도 화면 출력에서 끊김이 느껴질 수 있습니다.",
        buyingTip:
          "게임 FPS만 보지 말고, 사용하는 디자인 프로그램의 GPU 가속 성능과 작업용 벤치마크를 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 GPU 가속의 도움을 받을 수 있지만, 모든 예산을 그래픽카드에 집중해야 하는 유형은 아닙니다.",
        impact:
          "중급 GPU만으로도 많은 2D·UI·가벼운 영상 작업은 충분할 수 있고, 작업에 따라 RAM이나 SSD가 더 크게 체감될 수 있습니다.",
        buyingTip:
          "현재 사용하는 프로그램에서 GPU 가속을 얼마나 활용하는지 확인하고, 같은 예산 안에서 RAM과 SSD 구성을 함께 비교하세요.",
        guard:
          "그래픽 작업을 한다고 해서 항상 고급 GPU가 필요한 것은 아닙니다. 2D 중심이라면 과한 GPU보다 전체 균형이 더 중요할 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 고성능 GPU가 필요한 3D, 영상 프리뷰, 로컬 AI 작업 비중이 낮게 나타났습니다.",
        impact:
          "기본적인 화면 출력과 가벼운 그래픽 가속은 필요하지만, 고급 그래픽카드의 성능을 충분히 활용하지 못할 가능성이 있습니다.",
        buyingTip:
          "보급형 또는 중급형 GPU로 충분한지 먼저 확인하고, 예산을 RAM, SSD, 모니터 품질에 배분하는 선택지도 고려하세요.",
        guard:
          "이 경우 비싼 GPU는 성능이 나빠서가 아니라, 당신의 작업에서 가격 대비 체감 이득이 낮을 수 있습니다.",
      },
    },
  },
  VRAM: {
    title: "VRAM / CUDA",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 3D, GPU 렌더링, 로컬 AI 이미지 생성처럼 그래픽카드 메모리와 CUDA 성능이 중요한 작업을 고려하고 있습니다.",
        impact:
          "VRAM이 부족하면 GPU 성능이 높아도 큰 장면, 고해상도 생성, 복잡한 렌더링에서 작업이 느려지거나 실행 자체가 제한될 수 있습니다.",
        buyingTip:
          "그래픽카드 등급뿐 아니라 VRAM 용량, CUDA·Tensor 성능, 사용하는 프로그램의 권장 GPU 조건을 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 GPU 메모리와 CUDA 성능이 도움이 되는 작업을 일부 사용할 가능성이 있습니다.",
        impact:
          "가벼운 3D, 영상 효과, AI 보조 기능에서는 일정 수준의 VRAM이 있으면 작업 여유가 생기지만, 최상급 사양까지 필요하지는 않을 수 있습니다.",
        buyingTip:
          "8GB와 12GB 이상 모델의 차이를 확인하고, 앞으로 로컬 AI나 3D 작업을 늘릴 계획이 있는지도 함께 고려하세요.",
        guard:
          "현재 작업이 2D 중심이라면 VRAM을 과하게 올리기보다 RAM, SSD, 모니터에 예산을 남기는 편이 더 나을 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 VRAM이나 CUDA 성능이 직접적인 병목이 되는 작업 비중이 낮게 나타났습니다.",
        impact:
          "일반적인 2D 디자인, UI 작업, 웹 기반 AI 사용에서는 고용량 VRAM보다 작업 반응성, 메모리 여유, 화면 품질이 더 크게 체감될 수 있습니다.",
        buyingTip:
          "고용량 VRAM 모델을 무조건 우선하기보다, 현재 작업 프로그램이 CUDA나 GPU 메모리를 실제로 얼마나 쓰는지 확인하세요.",
        guard:
          "로컬 AI나 무거운 3D 작업을 하지 않는다면, VRAM이 큰 고가 GPU는 지금 단계에서 과한 선택일 수 있습니다.",
      },
    },
  },
  SSD_S: {
    title: "SSD 속도",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 큰 파일을 열고 저장하거나, 캐시와 임시 파일이 자주 생기는 작업 흐름에 가깝습니다.",
        impact:
          "SSD 속도가 부족하면 대용량 파일 열기, 저장, 미리보기 캐시 생성, 소스 불러오기에서 작업이 자주 끊길 수 있습니다.",
        buyingTip:
          "NVMe SSD인지, 읽기·쓰기 속도가 충분한지, 작업용 파일을 둘 여유 공간이 있는지 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 파일 입출력 속도도 체감에 영향을 주지만, 저장장치만으로 모든 병목이 해결되는 유형은 아닙니다.",
        impact:
          "일반 SSD보다 빠른 NVMe SSD를 쓰면 파일 열기와 저장이 안정적이지만, 작업 규모에 따라 RAM이나 CPU가 더 중요할 수 있습니다.",
        buyingTip:
          "기본형 NVMe SSD 이상을 기준으로 보고, 용량과 속도 중 어느 쪽이 더 부족한지도 함께 확인하세요.",
        guard:
          "최상급 SSD 속도에 과하게 투자하기보다, 충분한 RAM과 적절한 SSD 용량을 함께 맞추는 편이 더 균형적일 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 파일 열기·저장 속도가 가장 큰 불편으로 나타나지는 않았습니다.",
        impact:
          "기본적인 SSD 성능은 필요하지만, 매우 높은 읽기·쓰기 속도가 현재 작업에서 크게 체감되지 않을 수 있습니다.",
        buyingTip:
          "하드디스크가 아닌 NVMe SSD 구성을 확인하고, 너무 낮은 용량의 SSD만 피하세요.",
        guard:
          "초고속 SSD보다 RAM, 모니터, GPU처럼 더 직접적으로 부족한 항목에 예산을 두는 편이 좋을 수 있습니다.",
      },
    },
  },
  SSD_C: {
    title: "SSD 용량·확장성",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 원본 파일, 작업본, 소스, 백업 파일이 빠르게 쌓일 가능성이 높은 편입니다.",
        impact:
          "저장공간이 부족하면 파일을 계속 외장하드나 클라우드로 옮겨야 해서 작업 흐름이 끊기고, 캐시 공간 부족으로 성능도 떨어질 수 있습니다.",
        buyingTip:
          "최소 1TB 이상을 기준으로 보고, 영상·3D·사진 소스가 많다면 2TB 이상이나 추가 SSD 장착 가능 여부를 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 기본 작업 파일과 소스를 안정적으로 보관할 저장공간이 필요한 편입니다.",
        impact:
          "용량이 너무 작으면 프로젝트가 늘어날수록 정리 부담이 커지고, 작업 중 필요한 파일을 바로 불러오기 어려워질 수 있습니다.",
        buyingTip:
          "1TB 구성을 우선 확인하고, 메인보드의 M.2 슬롯 수나 추가 저장장치 장착 가능성도 함께 보세요.",
        guard:
          "아직 대용량 영상이나 3D 소스가 많지 않다면 처음부터 4TB 이상까지 갈 필요는 낮을 수 있습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 파일 축적이나 내부 저장공간 부족 문제가 크게 드러나지 않았습니다.",
        impact:
          "기본 작업과 프로그램 설치 공간은 필요하지만, 대용량 저장장치에 많은 예산을 먼저 배분할 필요는 낮습니다.",
        buyingTip:
          "500GB보다 1TB 구성을 우선 고려하고, 나중에 추가할 수 있는 확장성만 확인해두세요.",
        guard:
          "저장공간은 추후 증설이 비교적 쉬운 편이므로, 당장 부족하지 않다면 다른 핵심 성능을 먼저 맞추는 편이 좋습니다.",
      },
    },
  },
  MON_S: {
    title: "모니터 작업 공간",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 작업창, 참고 자료, 피드백 문서, 브라우저를 동시에 펼쳐두는 작업 방식에 가깝습니다.",
        impact:
          "화면 공간이 부족하면 창을 계속 전환해야 해서 집중이 끊기고, 레이아웃 비교나 레퍼런스 확인 속도가 느려질 수 있습니다.",
        buyingTip:
          "인치 수만 보지 말고, 해상도, 듀얼 모니터 가능성, 그래픽카드 출력 포트, 책상 공간까지 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 넓은 화면의 이점을 받을 수 있지만, 무조건 큰 모니터가 필요한 유형은 아닙니다.",
        impact:
          "적당한 해상도와 크기만 확보해도 작업창 배치가 편해지고, 브라우저나 참고 자료를 함께 보는 부담이 줄어듭니다.",
        buyingTip:
          "24인치 FHD보다 27인치 QHD 이상이 필요한지, 듀얼 모니터가 더 나은지 비교해보세요.",
        guard:
          "큰 화면이 항상 좋은 것은 아닙니다. 책상 거리, 해상도, 픽셀 밀도까지 맞아야 실제 작업 공간이 편해집니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 여러 창을 넓게 펼쳐두는 작업 부담이 크게 나타나지 않았습니다.",
        impact:
          "기본적인 작업 화면은 필요하지만, 울트라와이드나 고가 듀얼 모니터 구성이 필수는 아닐 수 있습니다.",
        buyingTip:
          "현재 작업에 맞는 기본 해상도와 크기를 확인하고, 남는 예산은 색 정확도나 본체 성능에 배분해도 좋습니다.",
        guard:
          "화면을 크게 늘리는 것보다 선명도, 색 정확도, 본체 반응성이 더 중요한 상황일 수 있습니다.",
      },
    },
  },
  MON_C: {
    title: "모니터 색·선명도",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 색감, 작은 글자, 얇은 선, 이미지 디테일을 정확히 확인해야 하는 작업 비중이 높은 편입니다.",
        impact:
          "모니터 품질이 부족하면 본체 성능이 좋아도 결과물의 색이나 디테일을 믿고 판단하기 어려울 수 있습니다.",
        buyingTip:
          "주사율보다 색역, 색 정확도, 해상도, 패널 종류, 캘리브레이션 여부를 우선 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 색과 선명도도 신경 써야 하지만, 전문가용 모니터가 항상 필요한 유형은 아닙니다.",
        impact:
          "기본 모니터 품질이 낮으면 포트폴리오 이미지, UI 디테일, 인쇄물 색감 확인에서 불편이 생길 수 있습니다.",
        buyingTip:
          "IPS 패널, sRGB 커버리지, QHD 이상 해상도, 눈 피로 관련 기능을 함께 확인하세요.",
        guard:
          "전문 색보정용 고가 모니터까지는 아니어도, 저가형 게이밍 모니터만 보고 고르는 것은 피하는 편이 좋습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 색 정확도나 미세한 선명도가 최우선 조건으로 나타나지는 않았습니다.",
        impact:
          "기본적인 화면 품질은 필요하지만, 고급 색역이나 캘리브레이션 기능에 많은 예산을 쓰는 것은 우선순위가 낮을 수 있습니다.",
        buyingTip:
          "최소한의 IPS 패널, 적절한 해상도, 눈 피로 기능을 확인하고, 필요한 경우에만 색 정확도형 모델을 고려하세요.",
        guard:
          "색보정이나 인쇄 중심 작업이 아니라면, 고가 전문가용 모니터보다 균형 잡힌 일반 디자인용 모니터가 더 적합할 수 있습니다.",
      },
    },
  },
  COOL: {
    title: "쿨링·파워·소음",
    levels: {
      high: {
        badge: "매우 중요",
        summary:
          "당신은 컴퓨터를 오래 켜두거나, 긴 작업을 안정적으로 끝내야 하는 상황이 많은 편입니다.",
        impact:
          "쿨링과 파워 여유가 부족하면 성능이 높아도 발열, 소음, 성능 저하, 작업 실패로 이어질 수 있습니다.",
        buyingTip:
          "CPU와 GPU만 보지 말고 파워 용량, 쿨러 성능, 케이스 통풍, 소음 관련 리뷰를 함께 확인하세요.",
        guard: "",
      },
      medium: {
        badge: "중요",
        summary:
          "당신은 안정적인 작업 환경이 필요하지만, 극단적인 저소음·고급 쿨링 구성이 필수는 아닙니다.",
        impact:
          "기본 쿨링이 부족하면 긴 작업 중 소음이 커지거나 성능이 떨어질 수 있으므로, 최소한의 안정성은 확보해야 합니다.",
        buyingTip:
          "권장 파워보다 여유 있는 용량, 기본 쿨러 성능, 케이스 통풍 구조를 함께 확인하세요.",
        guard:
          "고가 쿨러나 대형 케이스에 과하게 투자하기보다, 사용 부품의 전력과 발열에 맞는 균형형 구성이 좋습니다.",
      },
      low: {
        badge: "보류 기준",
        summary:
          "당신의 응답에서는 장시간 고부하 작업이나 소음 민감도가 크게 나타나지 않았습니다.",
        impact:
          "기본적인 안정성은 필요하지만, 저소음·고급 쿨링을 최우선으로 둘 필요는 낮습니다.",
        buyingTip:
          "부품 권장 파워를 충족하는지, 케이스 통풍이 기본 수준 이상인지 확인하세요.",
        guard:
          "다만 파워와 쿨링은 너무 낮추면 전체 안정성에 영향을 주므로, 최저가 부품만 고르는 것은 피하는 편이 좋습니다.",
      },
    },
  },
};

const componentCriteria = {
  CS: {
    priority: [
      {
        title: "CPU 싱글 성능",
        importance: "매우 중요",
        description: "확대, 이동, 레이어 전환처럼 작업 중 계속 반복되는 조작감에 영향을 줍니다.",
        checkpoint: "같은 세대라면 싱글코어 벤치와 실제 앱 체감 리뷰를 함께 보세요.",
      },
      {
        title: "CPU 세대와 체급",
        importance: "중요",
        description: "너무 오래된 CPU나 저전력 제품은 숫자가 비슷해 보여도 작업 중 반응성이 떨어질 수 있습니다.",
        checkpoint: "최신 세대의 중급 이상 CPU인지, 같은 가격대에서 싱글 성능이 안정적인지 확인하세요.",
      },
      {
        title: "실제 디자인 앱 체감 리뷰",
        importance: "보조 지표",
        description: "CPU 종합 점수가 높아도 내가 쓰는 앱에서 확대, 이동, 브러시 반응이 답답하면 의미가 줄어듭니다.",
        checkpoint: "Photoshop, Illustrator, Figma 같은 실제 앱 테스트나 작업용 리뷰를 함께 보세요.",
      },
    ],
    hold: [
      {
        title: "최상위 CPU 라인업",
        importance: "보류 가능",
        description: "기본 조작감이 핵심이면 최상위 멀티코어 CPU가 항상 더 좋은 선택은 아닙니다.",
        checkpoint: "작업 중 반응성은 싱글 성능과 RAM, SSD 균형을 같이 보세요.",
      },
    ],
  },
  CM: {
    priority: [
      {
        title: "CPU 멀티코어 성능",
        importance: "매우 중요",
        description: "렌더링, 인코딩, 대량 변환처럼 오래 계산하는 작업 시간을 줄이는 기준입니다.",
        checkpoint: "코어 수와 실제 렌더링 벤치마크를 함께 확인하세요.",
      },
      {
        title: "하드웨어 인코더",
        importance: "중요",
        description: "영상 내보내기에서는 CPU만이 아니라 GPU나 내장 그래픽의 인코더 지원도 영향을 줍니다.",
        checkpoint: "NVENC, Quick Sync, AV1 지원 여부를 확인하세요.",
      },
    ],
    hold: [
      {
        title: "코어 수만 많은 CPU",
        importance: "보류 가능",
        description: "출력 작업이 많지 않다면 코어 수만 보고 예산을 크게 올릴 필요는 적습니다.",
        checkpoint: "조작감, RAM, SSD에서 체감이 더 클 수 있습니다.",
      },
    ],
  },
  RAM: {
    priority: [
      {
        title: "RAM 용량",
        importance: "매우 중요",
        description: "여러 프로그램과 큰 파일을 동시에 켜둘 때 가장 먼저 체감되는 작업 여유입니다.",
        checkpoint: "디자인 멀티태스킹은 32GB 이상부터 비교해보세요.",
      },
      {
        title: "확장 가능성",
        importance: "중요",
        description: "나중에 프로젝트 규모가 커졌을 때 64GB 이상으로 올릴 수 있는지가 중요합니다.",
        checkpoint: "메인보드 메모리 슬롯 수와 최대 지원 용량을 확인하세요.",
      },
      {
        title: "메모리 구성",
        importance: "보조 지표",
        description: "용량이 먼저이고, 그 다음에 듀얼채널과 클럭을 함께 보면 좋습니다.",
        checkpoint: "같은 용량이면 1개보다 2개 구성인지 확인하세요.",
      },
    ],
    hold: [
      {
        title: "고클럭 메모리",
        importance: "보조 지표",
        description: "디자인 작업에서는 극단적인 고클럭보다 충분한 용량이 먼저입니다.",
        checkpoint: "예산이 제한적이면 클럭보다 용량을 우선하세요.",
      },
    ],
  },
  GPU: {
    priority: [
      {
        title: "GPU 기본 성능",
        importance: "중요",
        description: "미리보기, 일부 효과, 3D 뷰포트처럼 화면에서 바로 확인하는 작업에 영향을 줍니다.",
        checkpoint: "게임 FPS보다 작업 프로그램 벤치마크를 우선 보세요.",
      },
      {
        title: "프로그램 GPU 가속",
        importance: "중요",
        description: "Premiere, DaVinci, Blender처럼 GPU 가속을 잘 쓰는 앱에서는 체감 차이가 커질 수 있습니다.",
        checkpoint: "사용 앱이 어떤 GPU 가속을 지원하는지 확인하세요.",
      },
      {
        title: "인코더 지원",
        importance: "보조 지표",
        description: "영상 작업에서는 그래픽카드의 인코더가 내보내기 속도와 품질 옵션에 영향을 줄 수 있습니다.",
        checkpoint: "NVENC, AV1 인코딩 지원 여부를 보세요.",
      },
    ],
    hold: [
      {
        title: "최상위 그래픽카드 등급",
        importance: "보류 가능",
        description: "3D, 로컬 AI, GPU 렌더링이 주 작업이 아니라면 과한 예산일 수 있습니다.",
        checkpoint: "RAM, SSD, 모니터에 예산을 나눠 쓰는 선택도 비교하세요.",
      },
    ],
  },
  VRAM: {
    priority: [
      {
        title: "VRAM 용량",
        importance: "매우 중요",
        description: "3D 장면, 고해상도 영상, 로컬 AI 이미지를 그래픽카드 안에 올려둘 공간입니다.",
        checkpoint: "로컬 AI나 3D 작업이 있다면 VRAM 용량을 먼저 확인하세요.",
      },
      {
        title: "CUDA / Tensor 성능",
        importance: "중요",
        description: "로컬 AI, GPU 렌더링, 업스케일링처럼 반복 계산이 많은 작업에 영향을 줍니다.",
        checkpoint: "NVIDIA GPU가 필요한 워크플로인지 먼저 확인하세요.",
      },
      {
        title: "GPU 세대",
        importance: "중요",
        description: "같은 등급처럼 보여도 세대에 따라 인코더, AI 연산, 전력 효율이 달라질 수 있습니다.",
        checkpoint: "가격만 보지 말고 세대와 지원 기능을 같이 보세요.",
      },
    ],
    hold: [
      {
        title: "메모리 규격 이름",
        importance: "보조 지표",
        description: "GDDR6 같은 이름보다 실제 VRAM 용량과 작업 벤치마크가 먼저입니다.",
        checkpoint: "규격명만 보고 판단하지 말고 용량과 실제 성능을 함께 보세요.",
      },
    ],
  },
  SSD_S: {
    priority: [
      {
        title: "NVMe SSD",
        importance: "매우 중요",
        description: "큰 파일 열기, 저장, 캐시 작업에서 흐름이 끊기지 않게 해주는 기본 기준입니다.",
        checkpoint: "메인 작업용 저장장치는 NVMe SSD인지 확인하세요.",
      },
      {
        title: "읽기·쓰기 속도",
        importance: "중요",
        description: "파일 복사, 저장, 영상 캐시, 대량 소스 이동에서 체감될 수 있습니다.",
        checkpoint: "순차 속도뿐 아니라 실제 작업 리뷰도 함께 보세요.",
      },
      {
        title: "캐시 여유 공간",
        importance: "중요",
        description: "After Effects, Premiere, Photoshop의 임시 파일이 쌓이면 여유 공간이 작업 안정성에 영향을 줍니다.",
        checkpoint: "작업 SSD를 너무 꽉 채우지 않도록 용량도 함께 봐야 합니다.",
      },
    ],
    hold: [
      {
        title: "최고급 SSD 라인업",
        importance: "보류 가능",
        description: "일반 디자인 작업에서는 최고 속도보다 충분한 용량과 안정성이 더 중요할 수 있습니다.",
        checkpoint: "가격 차이가 크면 한 단계 낮추고 용량을 늘리는 선택도 좋습니다.",
      },
    ],
  },
  SSD_C: {
    priority: [
      {
        title: "SSD 용량",
        importance: "매우 중요",
        description: "원본, 작업본, 소스, 백업이 빠르게 쌓이는 작업에서 저장공간 부족을 줄입니다.",
        checkpoint: "기본은 1TB 이상, 영상·3D는 2TB 이상도 고려하세요.",
      },
      {
        title: "M.2 슬롯 수",
        importance: "중요",
        description: "나중에 빠른 SSD를 추가할 수 있는지가 확장성에 영향을 줍니다.",
        checkpoint: "메인보드의 M.2 슬롯 개수와 PCIe 세대를 확인하세요.",
      },
      {
        title: "백업 드라이브 구성",
        importance: "보조 지표",
        description: "작업 데이터가 많다면 빠른 작업용 SSD와 백업용 저장장치를 분리하는 편이 안전합니다.",
        checkpoint: "외장 SSD나 추가 HDD/SSD 계획도 함께 세워보세요.",
      },
    ],
    hold: [
      {
        title: "처음부터 과한 용량",
        importance: "보류 가능",
        description: "파일이 빠르게 쌓이지 않는다면 초기 용량을 과하게 잡기보다 확장 여지를 남기는 편도 좋습니다.",
        checkpoint: "메인보드와 케이스 확장성을 먼저 확인하세요.",
      },
    ],
  },
  MON_S: {
    priority: [
      {
        title: "화면 크기",
        importance: "중요",
        description: "작업창, 참고자료, 피드백 문서를 동시에 펼쳐두는 효율에 영향을 줍니다.",
        checkpoint: "27인치 이상, 듀얼 모니터, 울트라와이드를 비교해보세요.",
      },
      {
        title: "해상도",
        importance: "중요",
        description: "같은 크기에서도 QHD나 4K는 더 넓고 선명한 작업 공간을 제공합니다.",
        checkpoint: "27인치 이상이라면 FHD보다 QHD 이상을 우선 비교하세요.",
      },
      {
        title: "출력 포트",
        importance: "보조 지표",
        description: "듀얼 모니터나 고해상도 모니터를 쓰려면 그래픽카드와 모니터 포트 구성이 맞아야 합니다.",
        checkpoint: "HDMI, DisplayPort 개수와 지원 해상도를 확인하세요.",
      },
    ],
    hold: [
      {
        title: "무조건 큰 화면",
        importance: "보류 가능",
        description: "책상 공간과 시야 거리보다 큰 화면은 오히려 피로할 수 있습니다.",
        checkpoint: "크기, 해상도, 책상 배치를 함께 보세요.",
      },
    ],
  },
  MON_C: {
    priority: [
      {
        title: "색역",
        importance: "매우 중요",
        description: "브랜드, 인쇄, 사진, 영상 색을 믿고 판단하기 위한 기본 기준입니다.",
        checkpoint: "sRGB, DCI-P3, Adobe RGB 지원 범위를 확인하세요.",
      },
      {
        title: "색 정확도",
        importance: "매우 중요",
        description: "화면에서 본 색과 결과물의 차이를 줄이는 기준입니다.",
        checkpoint: "Delta E, 공장 캘리브레이션 여부를 확인하세요.",
      },
      {
        title: "패널과 선명도",
        importance: "중요",
        description: "작은 글자, 얇은 선, 이미지 디테일을 또렷하게 보는 데 영향을 줍니다.",
        checkpoint: "IPS 패널, 해상도, 픽셀 밀도를 함께 보세요.",
      },
    ],
    hold: [
      {
        title: "고주사율 게이밍 스펙",
        importance: "보류 가능",
        description: "색과 선명도가 중요한 작업에서는 높은 주사율보다 패널 품질이 먼저일 수 있습니다.",
        checkpoint: "게이밍 문구보다 색 정확도 정보를 먼저 보세요.",
      },
    ],
  },
  COOL: {
    priority: [
      {
        title: "CPU 쿨러",
        importance: "중요",
        description: "긴 렌더링이나 장시간 작업에서 성능 유지와 소음에 영향을 줍니다.",
        checkpoint: "CPU 등급에 맞는 공랭/수랭 쿨러를 확인하세요.",
      },
      {
        title: "파워 용량과 효율",
        importance: "매우 중요",
        description: "GPU와 CPU가 안정적으로 전력을 공급받고, 장시간 작업에서 불안정해지지 않게 합니다.",
        checkpoint: "정격 용량, 효율 등급, 제조사 신뢰도를 함께 보세요.",
      },
      {
        title: "케이스 airflow",
        importance: "중요",
        description: "부품 열이 케이스 밖으로 잘 빠져나가야 소음과 발열을 줄일 수 있습니다.",
        checkpoint: "전면 흡기, 후면/상단 배기, 기본 팬 구성을 확인하세요.",
      },
    ],
    hold: [
      {
        title: "과한 수랭 구성",
        importance: "보류 가능",
        description: "필요 이상의 쿨링은 비용과 관리 부담을 늘릴 수 있습니다.",
        checkpoint: "CPU/GPU 발열에 맞는 충분한 쿨링이면 괜찮습니다.",
      },
    ],
  },
};

const profilePatterns = {
  GPU_3D_AI: {
    priority: 1,
    axisWeights: { VRAM: 0.35, GPU: 0.3, COOL: 0.2, SSD_C: 0.15 },
    programBoosts: {
      Blender: 0.4,
      "Cinema 4D": 0.4,
      "로컬 AI 이미지 생성": 0.45,
    },
    names: [
      {
        title: "로컬 AI를 직접 돌리고 싶은 GPU 중심 사용자",
        description:
          "로컬 이미지 생성이나 GPU 기반 작업 가능성이 있어, 그래픽카드 성능뿐 아니라 VRAM 용량과 전력·쿨링 여유가 중요합니다.",
        when: { anyProgram: ["로컬 AI 이미지 생성"] },
      },
      {
        title: "3D 장면을 실시간으로 확인하는 크리에이터",
        description:
          "3D 뷰포트와 GPU 작업 비중이 높아, 화면에서 장면을 부드럽게 확인할 수 있는 그래픽 성능과 VRAM 여유를 함께 봐야 합니다.",
        when: { anyProgram: ["Blender", "Cinema 4D"] },
      },
      {
        title: "무거운 그래픽 작업을 여유 있게 다루는 크리에이터",
        description:
          "GPU와 VRAM 점수가 높게 나와, 그래픽카드의 기본 성능과 작업 데이터를 올려둘 공간을 우선 확인하는 편이 좋습니다.",
      },
    ],
  },
  VIDEO_MOTION: {
    priority: 2,
    axisWeights: { CM: 0.3, RAM: 0.25, SSD_S: 0.2, GPU: 0.15, VRAM: 0.1 },
    programBoosts: {
      "Premiere Pro": 0.35,
      "After Effects": 0.35,
      "DaVinci Resolve": 0.35,
    },
    names: [
      {
        title: "미리보기를 끊김 없이 확인해야 하는 모션 크리에이터",
        description:
          "작업 중 프리뷰와 효과 확인이 중요해, RAM, SSD 캐시, CPU 멀티 성능, GPU 가속을 균형 있게 봐야 합니다.",
        when: { anyProgram: ["After Effects"] },
      },
      {
        title: "내보내기 시간을 줄이고 싶은 영상 작업자",
        description:
          "렌더링과 인코딩 시간이 작업 흐름에 영향을 줄 가능성이 높아, CPU 멀티 성능과 GPU 가속, 빠른 SSD를 함께 보는 편이 좋습니다.",
        when: { anyProgram: ["Premiere Pro", "DaVinci Resolve"] },
      },
      {
        title: "미리보기와 출력 속도를 함께 보는 모션 크리에이터",
        description:
          "프리뷰와 최종 출력 모두 중요하게 나타나, 한 부품에 몰기보다 RAM, SSD, CPU, GPU 균형이 중요합니다.",
      },
    ],
  },
  SCREEN_MONITOR: {
    priority: 3,
    axisWeights: { MON_C: 0.45, MON_S: 0.35, CS: 0.1, RAM: 0.1 },
    programBoosts: {
      Figma: 0.25,
      Photoshop: 0.2,
      Illustrator: 0.2,
      InDesign: 0.2,
      "웹/레퍼런스 중심 작업": 0.25,
    },
    names: [
      {
        title: "색을 믿고 작업해야 하는 그래픽 디자이너",
        description:
          "색 차이와 디테일 확인이 결과물에 영향을 줄 수 있어, 본체 성능뿐 아니라 색 정확도와 선명도가 좋은 모니터를 함께 봐야 합니다.",
        when: { axisAtLeast: { MON_C: 2.15 } },
      },
      {
        title: "여러 창을 넓게 펼쳐 쓰는 UI 디자이너",
        description:
          "작업창과 참고자료를 동시에 펼쳐 쓰는 흐름이 강해, 넓은 화면과 적절한 해상도가 작업 효율에 크게 작용할 수 있습니다.",
        when: { anyProgram: ["Figma", "웹/레퍼런스 중심 작업"] },
      },
      {
        title: "작은 디테일을 꼼꼼히 확인하는 디자이너",
        description:
          "작은 글자, 얇은 선, 이미지 디테일을 확인하는 비중이 있어 화면 선명도와 작업 공간을 같이 보는 편이 좋습니다.",
      },
    ],
  },
  TWO_D_HEAVY: {
    priority: 4,
    axisWeights: { RAM: 0.35, CS: 0.3, SSD_S: 0.25, MON_C: 0.1 },
    programBoosts: {
      Photoshop: 0.3,
      Illustrator: 0.25,
      InDesign: 0.25,
    },
    names: [
      {
        title: "큰 파일을 부드럽게 다루는 2D 디자이너",
        description:
          "큰 PSD/AI 파일과 여러 레이어를 다루는 흐름이 있어, 고가 그래픽카드보다 RAM, SSD, CPU 반응성이 먼저 체감될 수 있습니다.",
      },
      {
        title: "복잡한 파일을 안정적으로 다루는 편집 디자이너",
        description:
          "레이어, 이미지, 효과가 쌓인 파일을 다루는 편이라 메모리 여유와 파일 입출력 속도를 함께 봐야 합니다.",
        when: { anyProgram: ["InDesign", "Illustrator"] },
      },
    ],
  },
  STABILITY_LONG_WORK: {
    priority: 5,
    axisWeights: { COOL: 0.48, RAM: 0.2, CM: 0.19, SSD_C: 0.13 },
    programBoosts: {},
    names: [
      {
        title: "오래 켜두고 안정적으로 작업하는 디자이너",
        description:
          "긴 작업과 장시간 사용에서 멈춤, 발열, 소음이 문제가 될 수 있어 안정적인 파워와 쿨링, 메모리 여유를 함께 봐야 합니다.",
      },
      {
        title: "조용한 환경에서 집중해서 작업하는 크리에이터",
        description:
          "팬 소음과 발열이 집중을 방해할 가능성이 있어, 성능뿐 아니라 저소음 쿨링과 전력 효율도 중요한 기준입니다.",
        when: { axisAtLeast: { COOL: 2.25 } },
      },
    ],
  },
  BALANCED: {
    priority: 6,
    axisWeights: { CS: 0.15, CM: 0.15, RAM: 0.2, GPU: 0.1, SSD_S: 0.15, MON_S: 0.1, MON_C: 0.1, COOL: 0.05 },
    programBoosts: {},
    names: [
      {
        title: "성능과 작업 환경을 균형 있게 보는 디자이너",
        description:
          "특정 부품 하나로 치우치기보다 작업 반응성, 메모리, 저장장치, 화면 품질을 균형 있게 맞추는 구성이 어울립니다.",
      },
    ],
  },
};

const tagRules = [
  { tag: "체감 반응형", axes: { CS: 2.05 } },
  { tag: "출력 단축형", axes: { CM: 2.05 } },
  { tag: "멀티태스킹형", axes: { RAM: 2.05 } },
  { tag: "GPU 가속형", axes: { GPU: 2.05 } },
  { tag: "VRAM 중시형", axes: { VRAM: 2.05 } },
  { tag: "SSD 캐시 중시형", axes: { SSD_S: 2.05 } },
  { tag: "저장공간 확장형", axes: { SSD_C: 2.05 } },
  { tag: "넓은 화면형", axes: { MON_S: 2.05 } },
  { tag: "색감 확인형", axes: { MON_C: 2.05 } },
  { tag: "안정성 중시형", axes: { COOL: 2.05 } },
  { tag: "저소음 중시형", axes: { COOL: 2.3 } },
  { tag: "모니터 투자형", axes: { MON_S: 1.9, MON_C: 1.9 } },
  { tag: "파일 축적형", axes: { SSD_C: 1.95 } },
  { tag: "장기 사용형", axes: { COOL: 1.9, SSD_C: 1.8 } },
];

const motherboardSupportCriteria = {
  RAM: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "RAM이 중요한 결과라면, 메모리 자체만 고르기보다 메인보드가 얼마나 더 꽂고 늘릴 수 있는지도 함께 봐야 합니다.",
    holdDescription:
      "RAM이 최우선이 아니라면 고급 메인보드보다 현재 필요한 메모리 용량과 호환성만 먼저 확인해도 충분할 수 있습니다.",
    points: ["RAM 슬롯 수", "최대 지원 용량", "DDR4/DDR5 세대"],
    checkpoint:
      "32GB 이상이나 추후 64GB 확장을 생각한다면 슬롯 4개 구성인지, 내가 고르는 RAM 세대와 맞는지 확인하세요.",
  },
  SSD_C: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "저장공간이 빠르게 늘어날 가능성이 높다면, SSD 용량뿐 아니라 나중에 SSD를 더 꽂을 자리도 중요합니다.",
    holdDescription:
      "저장공간 확장이 당장 급하지 않다면 M.2 슬롯을 과하게 많이 볼 필요는 없고, 기본 NVMe SSD 장착 가능 여부부터 확인하면 됩니다.",
    points: ["M.2 슬롯 수", "PCIe 4.0/5.0 지원", "추가 SSD 장착 여유"],
    checkpoint:
      "작업용 SSD와 캐시/백업용 SSD를 나눌 계획이 있다면 M.2 슬롯 2개 이상인지 확인하세요.",
  },
  SSD_S: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "SSD 속도가 중요한 결과라면, 빠른 SSD를 사도 메인보드가 그 속도 규격을 지원해야 체감이 살아납니다.",
    holdDescription:
      "파일 입출력이 최우선이 아니라면 최고급 PCIe 5.0 지원보다 기본 NVMe 지원과 안정성을 먼저 봐도 됩니다.",
    points: ["NVMe 지원", "PCIe 4.0/5.0 지원", "M.2 방열판"],
    checkpoint:
      "고속 NVMe SSD를 쓸 예정이면 메인보드의 M.2 슬롯 규격과 방열판 제공 여부를 함께 확인하세요.",
  },
  GPU: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "GPU가 중요한 결과라면, 그래픽카드 자체 성능뿐 아니라 보드와 케이스가 큰 그래픽카드를 안정적으로 받아줄 수 있어야 합니다.",
    holdDescription:
      "GPU가 최우선이 아니라면 고급 PCIe 구성보다 기본 x16 슬롯과 케이스 호환만 확인해도 충분한 경우가 많습니다.",
    points: ["PCIe x16 슬롯", "그래픽카드 장착 간섭", "보드/케이스 규격"],
    checkpoint:
      "두꺼운 3팬 그래픽카드를 쓴다면 슬롯 위치, 케이스 폭, 다른 장치와의 간섭을 함께 확인하세요.",
  },
  VRAM: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "VRAM이 중요한 3D·로컬 AI 작업은 대형 GPU를 고를 가능성이 높아, 메인보드와 케이스 호환을 같이 확인해야 합니다.",
    holdDescription:
      "VRAM이 낮게 나온 경우에는 대형 GPU 장착 여유보다 RAM, SSD, 모니터 같은 다른 기준을 먼저 보는 편이 좋습니다.",
    points: ["PCIe x16 슬롯", "그래픽카드 장착 여유", "보조전원 케이블 공간"],
    checkpoint:
      "고용량 VRAM GPU는 카드가 크고 두꺼운 경우가 많으니, 보드 슬롯 위치와 케이스 장착 길이를 함께 보세요.",
  },
  COOL: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "오래 작업해도 안정적인 환경이 중요하다면, 메인보드의 전원부와 팬 연결 여유도 전체 안정성에 영향을 줍니다.",
    holdDescription:
      "쿨링·소음이 낮게 나왔다면 고급 전원부 메인보드까지 갈 필요는 낮지만, 최저가 보드로 안정성을 지나치게 줄이지는 않는 편이 좋습니다.",
    points: ["전원부 방열판", "팬 헤더 수", "전원부 리뷰"],
    checkpoint:
      "고성능 CPU나 GPU를 오래 돌릴 계획이면 전원부 방열판이 있는지, 케이스 팬을 충분히 연결할 수 있는지 확인하세요.",
  },
  MON_S: {
    title: "메인보드에서 같이 볼 것",
    priorityDescription:
      "여러 모니터를 쓰거나 내장그래픽으로 화면을 출력할 계획이라면, 메인보드의 화면 출력 포트도 확인할 필요가 있습니다.",
    holdDescription:
      "그래픽카드를 따로 쓰는 구성이라면 모니터 출력은 대부분 GPU에서 담당하므로, 메인보드 출력 포트는 우선순위가 낮을 수 있습니다.",
    points: ["HDMI/DP 출력 포트", "USB-C 디스플레이 출력", "내장그래픽 사용 조건"],
    checkpoint:
      "그래픽카드 없이 내장그래픽으로 듀얼 모니터를 쓰려면, CPU 내장그래픽 지원과 보드 출력 포트를 함께 확인하세요.",
  },
};

const programKnowledge = {
  Photoshop: {
    CS: "Photoshop은 브러시, 확대/축소, 레이어 조작처럼 짧고 반복적인 반응성이 작업 흐름을 좌우합니다.",
    RAM: "큰 PSD와 많은 레이어를 열어두면 메모리 여유가 부족할 때 작업이 점점 무거워질 수 있습니다.",
    SSD_S: "스크래치 디스크와 임시 저장을 자주 쓰기 때문에 빠른 SSD가 큰 파일 작업 흐름을 덜 끊기게 합니다.",
    MON_C: "이미지 보정과 색 확인이 들어가면 모니터의 색 정확도와 선명도가 결과 판단에 영향을 줍니다.",
  },
  Illustrator: {
    CS: "Illustrator는 벡터 오브젝트 이동, 확대, 정렬처럼 즉각적인 조작 반응이 중요합니다.",
    RAM: "복잡한 아트보드와 여러 파일을 열어두면 메모리 여유가 체감 안정성에 영향을 줍니다.",
    MON_C: "얇은 선, 작은 글자, 색 면을 확인하는 일이 많아 선명도와 색 정확도가 중요해질 수 있습니다.",
    MON_S: "여러 아트보드와 참고자료를 함께 보는 흐름에서는 넓은 작업 화면이 효율을 높입니다.",
  },
  InDesign: {
    RAM: "긴 문서, 이미지가 많은 편집 파일, PDF 내보내기를 함께 다루면 메모리 여유가 안정성에 영향을 줍니다.",
    SSD_S: "이미지 링크와 출력용 파일을 자주 불러오기 때문에 저장장치 반응성이 작업 흐름에 영향을 줍니다.",
    MON_C: "인쇄와 편집 결과를 확인하는 작업에서는 색과 글자 선명도를 믿고 볼 수 있어야 합니다.",
    MON_S: "페이지, 패널, 참고자료를 함께 펼쳐두는 편집 흐름에서는 화면 공간이 중요합니다.",
  },
  Figma: {
    RAM: "Figma는 브라우저와 참고자료를 함께 켜두는 경우가 많아 메모리 여유가 멀티태스킹에 영향을 줍니다.",
    MON_S: "프레임, 컴포넌트, 레퍼런스, 코멘트를 한 화면에 펼쳐두면 넓은 화면이 작업 속도를 도와줍니다.",
    MON_C: "UI 디테일, 작은 글자, 아이콘을 확인해야 하므로 선명도와 적절한 해상도가 중요합니다.",
    CS: "복잡한 파일에서 이동과 줌이 잦기 때문에 기본 조작 반응성도 작업 흐름에 영향을 줍니다.",
  },
  "Premiere Pro": {
    CM: "Premiere Pro는 인코딩과 내보내기에서 CPU 멀티 성능과 하드웨어 인코더의 도움을 받습니다.",
    RAM: "긴 타임라인, 여러 소스, 다른 앱 동시 사용이 많으면 RAM 여유가 프리뷰 안정성에 영향을 줍니다.",
    GPU: "색 보정, 일부 효과, 재생 가속에서 그래픽카드가 계산을 나눠 맡으면 미리보기가 덜 끊길 수 있습니다.",
    VRAM: "고해상도 소스와 효과가 쌓이면 그래픽카드 안에 올려둘 작업 공간이 필요해집니다.",
    SSD_S: "원본 소스와 캐시를 계속 읽고 쓰기 때문에 빠른 SSD가 타임라인 작업 흐름을 받쳐줍니다.",
    SSD_C: "영상 소스와 캐시는 빠르게 쌓이므로 저장공간 여유가 부족하면 작업 관리가 어려워집니다.",
  },
  "After Effects": {
    RAM: "After Effects는 프리뷰를 메모리에 쌓아두는 특성이 있어 RAM 여유가 미리보기 길이와 안정성에 직접 영향을 줍니다.",
    CM: "렌더링과 프리컴프 계산에서는 CPU 멀티 성능이 작업 시간을 줄이는 데 도움을 줍니다.",
    GPU: "일부 효과와 프리뷰에서는 그래픽카드 가속이 화면 갱신과 효과 처리 체감에 영향을 줍니다.",
    SSD_S: "디스크 캐시를 많이 쓰기 때문에 빠른 SSD와 캐시 여유 공간이 미리보기 흐름을 덜 막히게 합니다.",
    VRAM: "GPU 효과나 고해상도 컴프가 많아질수록 그래픽카드 작업 공간 여유가 도움이 됩니다.",
  },
  "DaVinci Resolve": {
    GPU: "DaVinci Resolve는 색 보정, 효과, 재생에서 GPU 활용도가 높아 그래픽카드 성능이 체감에 크게 연결됩니다.",
    VRAM: "고해상도 영상과 노드가 많아질수록 VRAM 부족이 프리뷰와 처리 안정성에 영향을 줄 수 있습니다.",
    CM: "인코딩과 일부 처리에서는 CPU 멀티 성능도 함께 작동해 전체 출력 시간을 줄입니다.",
    SSD_S: "고해상도 영상 소스를 부드럽게 읽기 위해 빠른 SSD가 중요합니다.",
    MON_C: "색 보정 작업에서는 색 정확도와 모니터 품질이 결과 판단에 직접 연결됩니다.",
  },
  Blender: {
    GPU: "Blender는 뷰포트 확인과 GPU 렌더링에서 그래픽카드 성능이 장면 확인 속도에 큰 영향을 줍니다.",
    VRAM: "복잡한 장면, 텍스처, 렌더링 데이터를 그래픽카드에 올려야 해서 VRAM 여유가 중요합니다.",
    COOL: "긴 렌더링에서는 GPU와 CPU가 오래 높은 부하를 받기 때문에 쿨링과 파워 안정성이 필요합니다.",
    SSD_C: "텍스처, 애셋, 렌더 결과물이 쌓이기 쉬워 저장공간 확장성도 함께 봐야 합니다.",
  },
  "Cinema 4D": {
    GPU: "Cinema 4D는 뷰포트와 렌더 워크플로에서 GPU 성능이 장면을 확인하는 속도에 영향을 줄 수 있습니다.",
    VRAM: "재질, 텍스처, 복잡한 장면이 커질수록 그래픽카드 작업 공간이 필요해집니다.",
    CM: "시뮬레이션이나 CPU 기반 렌더링을 함께 쓴다면 CPU 멀티 성능도 중요합니다.",
    COOL: "긴 렌더링과 고부하 작업에서는 발열과 전력 안정성이 작업 실패를 줄이는 데 도움을 줍니다.",
  },
  "로컬 AI 이미지 생성": {
    VRAM: "로컬 AI는 모델과 이미지를 그래픽카드 안에 올려서 처리하기 때문에 VRAM 부족이 바로 작업 한계가 될 수 있습니다.",
    GPU: "이미지 생성 속도는 그래픽카드의 연산 성능에 크게 영향을 받습니다.",
    SSD_C: "모델 파일과 결과물이 빠르게 쌓이기 때문에 저장공간 여유도 중요합니다.",
    COOL: "반복 생성 작업은 GPU를 오래 사용하므로 발열과 전력 여유가 안정성에 영향을 줍니다.",
  },
  "웹 기반 AI 이미지 생성": {
    RAM: "웹 기반 AI는 서버에서 이미지를 만들지만, 브라우저와 디자인 툴을 함께 쓰면 RAM 여유가 필요합니다.",
    MON_C: "생성된 이미지를 고르고 수정 방향을 판단하려면 화면 선명도와 색 확인 환경이 중요합니다.",
    MON_S: "프롬프트, 레퍼런스, 생성 결과, 편집 툴을 함께 펼쳐두면 넓은 화면이 유리합니다.",
  },
  "웹/레퍼런스 중심 작업": {
    RAM: "브라우저 탭과 참고자료가 많아질수록 메모리 여유가 작업 안정성에 영향을 줍니다.",
    MON_S: "레퍼런스와 작업창을 동시에 비교하는 흐름에서는 넓은 화면이 가장 직접적으로 체감됩니다.",
    MON_C: "이미지와 UI 디테일을 판단해야 하므로 선명도와 색 표현이 작업 판단에 영향을 줍니다.",
  },
};

window.cpuMasterData = {
  questions,
  questionScaleLabels,
  weightFields,
  questionWeights,
  programPresetWeights,
  programDisplayLabels,
  termDescriptions,
  axisDescriptions,
  specDiagnosisCopy,
  componentCriteria,
  profilePatterns,
  tagRules,
  motherboardSupportCriteria,
  programKnowledge,
};

window.cpuMasterWeightConfig = {
  fields: weightFields,
  questionWeights,
  programPresetWeights,
};
