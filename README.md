# Designer PC Guide

디자이너가 자신의 작업 방식에 맞는 조립 PC 기준을 이해하고, 부품별 우선순위와 제품 후보를 비교할 수 있도록 만든 모바일 우선 프로토타입입니다.

## 구성

- `index.html`: GitHub Pages 진입 파일
- `styles.css`: 모바일 화면 중심 스타일
- `app.js`: 진단 흐름, 결과 생성, 제품 후보 정렬 로직
- `data.js`: 설문 문항, 가중치, 결과 문구 데이터
- `programSpecs.js`: 프로그램별 설명용 스펙 가이드
- `productInterpreter.js`: 제품 데이터를 추천 축 점수로 해석하는 로직
- `shopDanawa*LiveData.js`: 프로토타입용 수집 제품 데이터
- `tools/`: 제품 데이터 수집/갱신용 스크립트

## GitHub Pages

정적 파일만으로 동작하므로 GitHub Pages에서 저장소 루트를 배포 대상으로 지정하면 됩니다.

