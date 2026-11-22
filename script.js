const AVOGADRO=6.02214076e23, KW=1e-14;
let conceptData=[], diagnosisData=[];
const $=id=>document.getElementById(id);
function fmt(x, sig=4){if(!Number.isFinite(x))return "계산 불가"; if(x===0)return "0"; return Number(x.toPrecision(sig)).toExponential(Math.max(0,sig-1)).replace("e+","×10^").replace("e-","×10^-");}
function fixed(x,n=4){return Number(x).toFixed(n)}
function calculate(){
  $("error").textContent="";
  const pa=Number($("acidPh").value), va=Number($("acidVol").value), pb=Number($("basePh").value), vb=Number($("baseVol").value);
  if(![pa,va,pb,vb].every(Number.isFinite)||va<=0||vb<=0||pa<=0||pa>=7||pb<=7||pb>=14){$("error").textContent="산 pH는 0~7, 염기 pH는 7~14 사이여야 하며 부피는 0보다 커야 합니다.";return;}
  if(pa>6.5||pb<7.5){$("error").textContent="pH가 7에 너무 가까운 입력은 산·염기 용액 구분과 측정 오차의 영향이 큽니다. 산 pH ≤ 6.5, 염기 pH ≥ 7.5인 값을 입력해 주세요.";return;}
  const hA=10**(-pa), ohA=KW/hA, cA=hA-ohA;
  const ohB=10**(pb-14), hB=KW/ohB, cB=ohB-hB;
  const nA=cA*va/1000, nB=cB*vb/1000, total=(va+vb)/1000;
  const reacted=Math.min(nA,nB), net=nA-nB;
  let ph, state, leftover, finalIon, concentration;
  if(Math.abs(net)<=1e-14){ph=7;state="중화점 · 중성";leftover="남는 강산·강염기 없음";finalIon="";concentration=0;}
  else if(net>0){concentration=net/total;const h=(concentration+Math.sqrt(concentration**2+4*KW))/2;ph=-Math.log10(h);state="산성 · H⁺ 과량";leftover="남은 H⁺";finalIon="H⁺"; }
  else{concentration=(-net)/total;const oh=(concentration+Math.sqrt(concentration**2+4*KW))/2;ph=14+Math.log10(oh);state="염기성 · OH⁻ 과량";leftover="남은 OH⁻";finalIon="OH⁻";}
  const waterMolecules=reacted*AVOGADRO;
  $("finalPh").textContent=fixed(ph,4);$("waterMol").textContent=fmt(reacted);$("waterMolecules").textContent=fmt(waterMolecules,4);
  $("statePill").textContent=state;
  $("acidMol").textContent=fmt(nA)+" mol";$("baseMol").textContent=fmt(nB)+" mol";
  const max=Math.max(nA,nB,1e-30);$("acidBar").style.width=(nA/max*100)+"%";$("baseBar").style.width=(nB/max*100)+"%";
  const steps=[
   `산 용액: [H⁺] = 10⁻${pa} = ${fmt(hA)} mol/L. 물의 자동 이온화를 고려한 산의 분석 농도는 [H⁺]−[OH⁻] = ${fmt(cA)} mol/L입니다.`,
   `염기 용액: [OH⁻] = 10^(${pb}−14) = ${fmt(ohB)} mol/L. 염기의 분석 농도는 [OH⁻]−[H⁺] = ${fmt(cB)} mol/L입니다.`,
   `이온 몰: n(H⁺) = C×V = ${fmt(nA)} mol, n(OH⁻) = C×V = ${fmt(nB)} mol입니다. 부피는 mL에서 L로 바꿨습니다.`,
   `반응한 양은 작은 값인 ${fmt(reacted)} mol이므로 생성된 물도 ${fmt(reacted)} mol입니다.`,
   `${leftover}. 전체 부피 ${fixed(total,4)} L에서 물의 자동 이온화 평형을 고려한 최종 pH는 ${fixed(ph,4)}입니다.`,
   `물 분자 수 = ${fmt(reacted)} × 6.02214076×10²³ = ${fmt(waterMolecules,4)}개입니다.`
  ];
  $("stepList").innerHTML=steps.map(s=>`<li>${s}</li>`).join("");
  const warnings=[];
  if(Math.min(pa,14-pb)>5)warnings.push("매우 묽은 조건에서는 pH 측정 오차가 결과에 크게 영향을 줄 수 있습니다.");
  warnings.push("이 결과는 1가 강산·1가 강염기, 25℃, 부피 가산 가정에 따른 이론값입니다.");
  $("warning").textContent=warnings.join(" ");
  $("results").classList.remove("hidden");
}
function renderQA(query){
 const q=query.trim().toLowerCase(), results=conceptData.map(d=>{
   const hay=(d.topic+" "+d.question+" "+d.answer+" "+d.keywords.join(" ")).toLowerCase();
   const terms=q.split(/\s+/).filter(Boolean);let score=terms.reduce((s,t)=>s+(hay.includes(t)?1:0),0);
   return {...d,score};
 }).filter(d=>!q||d.score>0).sort((a,b)=>b.score-a.score);
 $("qaResults").innerHTML=results.length?results.slice(0,8).map(d=>`<article class="qa-card"><span class="tag">${d.topic}</span><h3>${d.question}</h3><p>${d.answer}</p></article>`).join(""):"<p>관련 내용을 찾지 못했어요. ‘pH’, ‘몰’, ‘중화점’처럼 핵심어로 검색해 보세요.</p>";
 $("qaCount").textContent=`포함된 개념 데이터 ${conceptData.length}건 · 검색 결과 ${results.length}건`;
}
const featureNames=["pH-농도 변환","부피 L 환산","H⁺와 OH⁻ 반응량 비교","남는 이온 판단","최종 pH 계산"];
function setupDiagnosis(){
 $("diagnosisForm").innerHTML=featureNames.map((name,i)=>`<div class="diagnosis-item"><b>${i+1}. ${name}</b><label><input type="radio" name="f${i}" value="1" checked> 이해했어요</label><label><input type="radio" name="f${i}" value="0"> 어려워요</label></div>`).join("");
}
function diagnose(){
 const features=featureNames.map((_,i)=>Number(document.querySelector(`input[name="f${i}"]:checked`).value));
 const ranked=diagnosisData.records.map(r=>({label:r.label,d:r.features.reduce((s,v,i)=>s+(v!==features[i]?1:0),0)})).sort((a,b)=>a.d-b.d);
 const votes={};ranked.slice(0,5).forEach(x=>votes[x.label]=(votes[x.label]||0)+1);
 const label=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0][0];
 const explain={
 "pH-농도 변환 이해 부족":"pH와 수소 이온·수산화 이온 농도의 관계를 먼저 복습하세요. pH는 농도의 로그 척도입니다.",
 "부피 단위 환산 오류":"농도 단위가 mol/L이므로 부피를 mL에서 L로 바꾼 뒤 C×V를 계산하는 연습이 필요합니다.",
 "중화 원리 이해 부족":"H⁺와 OH⁻가 1:1로 반응해 물을 만든다는 순이온 반응식을 먼저 확인하세요.",
 "남는 이온 판단 오류":"두 이온의 몰을 비교하고, 더 적은 쪽이 모두 반응한 뒤 어느 이온이 남는지 판단하세요.",
 "최종 pH 계산 오류":"남은 이온의 몰을 혼합 후 전체 부피로 나눠 농도를 구한 뒤 pH 또는 pOH를 계산하세요."
 };
 $("diagnosisResult").innerHTML=`<h3>가장 가까운 오답 유형: ${label}</h3><p>${explain[label]}</p><p class="tiny-note">KNN 방식 · 최근접 5개 예시의 다수결 · 거리(서로 다른 응답 항목 수): ${ranked[0].d}</p>`;
 $("diagnosisResult").classList.remove("hidden");
}
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));btn.classList.add("active");$(btn.dataset.tab).classList.add("active")}));
$("calculate").addEventListener("click",calculate);
$("searchBtn").addEventListener("click",()=>renderQA($("question").value));
$("question").addEventListener("keydown",e=>{if(e.key==="Enter")renderQA($("question").value)});
$("diagnose").addEventListener("click",diagnose);
Promise.all([fetch("data/concept_qa_dataset.json").then(r=>{if(!r.ok)throw Error("개념 데이터 파일을 불러오지 못했습니다.");return r.json()}),fetch("data/diagnosis_training_data.json").then(r=>{if(!r.ok)throw Error("진단 데이터 파일을 불러오지 못했습니다.");return r.json()})])
.then(([qa,data])=>{conceptData=qa;diagnosisData=data;renderQA("");setupDiagnosis();})
.catch(err=>{console.error(err);$("qaResults").textContent="데이터 파일을 불러오지 못했습니다. GitHub Pages 설정과 data 폴더 경로를 확인하세요.";});
calculate();
