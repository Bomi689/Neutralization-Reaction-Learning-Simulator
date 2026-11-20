# Chem-Guide — 중화반응 학습 시뮬레이터

GitHub Pages에서 실행할 수 있는 정적 웹 프로젝트입니다. 서버·Python 설치 없이 `index.html`, `style.css`, `script.js`, `data/` 폴더를 같은 저장소에 올리면 됩니다.

## 포함 기능
- pH와 부피를 이용한 강산-강염기 중화 계산
- H⁺/OH⁻ 몰 비교, 생성된 물의 몰·분자 수, 최종 pH 계산
- 계산 단계 설명 및 이온 몰 막대 그래프
- JSON 개념 데이터 검색
- JSON 진단 데이터에 대한 KNN 최근접 이웃 분류 시연

## GitHub Pages 배포
1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더 안의 파일과 `data` 폴더를 저장소 최상위(root)에 업로드합니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Deploy from a branch**를 선택하고 `main` 브랜치의 `/ (root)`를 선택한 뒤 저장합니다.
5. 몇 분 뒤 표시되는 GitHub Pages 주소로 접속합니다.

주의: `index.html`을 파일 탐색기에서 직접 열면 브라우저 보안 정책 때문에 JSON `fetch`가 차단될 수 있습니다. GitHub Pages 주소에서 실행하세요.

## 데이터 출처와 정직한 사용 안내
이 저장소에는 세 가지 JSON 데이터 파일이 포함되어 있습니다.

- `data/concept_qa_dataset.json`: 중화반응의 기초 개념을 본 프로젝트용으로 정리한 12건의 참고 데이터입니다. AI Hub 원본 데이터가 아닙니다.
- `data/diagnosis_training_data.json`: KNN 분류 기능 시연을 위한 25건의 합성 데이터입니다. 실제 학생 답안이 아닙니다.
- `data/neutralization_test_cases.json`: 계산 검증용으로 생성한 시뮬레이션 사례 8건입니다. 실험 측정값이 아닙니다.

**중요:** AI Hub의 ‘교과 단계별 교과 데이터’는 별도의 신청·승인 및 데이터 선별이 필요합니다. 본 프로젝트 파일에는 AI Hub 원본 파일이 포함되어 있지 않으며, AI Hub 데이터를 사용했다고 보고서에 쓰면 안 됩니다. 원본을 실제로 승인받아 내려받고 중화반응 관련 항목을 확인한 뒤, 사용 조건에 따라 해당 데이터를 별도로 추가해야 합니다.

AI Hub 공식 페이지:
https://www.aihub.or.kr/aihubdata/data/view.do?aihubDataSe=data&currMenu=115&dataSetSn=71855&topMenu=100

## 계산 가정
- 25℃, 묽은 수용액
- 1가 강산 + 1가 강염기
- 산 pH < 7, 염기 pH > 7
- `Kw = 1.0×10^-14`, `pH + pOH = 14`
- 분석 농도는 물의 자동 이온화를 고려해 산은 `[H+] - [OH-]`, 염기는 `[OH-] - [H+]`로 계산
- 혼합 부피는 두 부피의 합으로 근사
- 약산·약염기, 다가산·다가염기, 완충 용액, 활동도 효과는 미포함

계산은 이상적인 모델의 이론값입니다. 특히 pH 측정 오차와 용액의 실제 성질에 따라 결과가 달라질 수 있습니다.

## 파일 구조
```text
chem-neutralization-github/
├── index.html
├── style.css
├── script.js
├── README.md
└── data/
    ├── concept_qa_dataset.json
    ├── diagnosis_training_data.json
    └── neutralization_test_cases.json
```
