const members = [
  { name: "신유", img: "https://i.imgur.com/5L6wDru.png" },
  { name: "도훈", img: "https://i.imgur.com/hPrDoAd.png" },
  { name: "영재", img: "https://i.imgur.com/jaBqdU9.png" },
  { name: "한진", img: "https://i.imgur.com/dlN47CT.png" },
  { name: "지훈", img: "https://i.imgur.com/3jElNXL.png" },
  { name: "경민", img: "https://i.imgur.com/0qLTCdv.png" }
];

const STEP = 10;            // 10% 단위
const FIXED_WIDTH = 50;     // 결과 바 길이 항상 50%
const MAX_CHARS = 100;      // 한글 기준 100자 제한(띄어쓰기 포함)
const FONT_BASE = 12;       // 기본 12
const FONT_MIN = 10;        // 최소 10

const inputs = document.getElementById("inputs");
const resultList = document.getElementById("resultList");

// ====== 입력/결과 UI 생성 ======
members.forEach((m, i) => {
  inputs.innerHTML += `
    <div class="member-control">
      <div class="member-header">
        <img src="${m.img}" crossorigin="anonymous" referrerpolicy="no-referrer">
        <strong>${m.name}</strong>
      </div>

      <div class="range-row">
        <span class="side">공 <b id="gPct${i}">50%</b></span>
        <input type="range" min="0" max="100" value="50" step="${STEP}" id="range${i}" aria-label="${m.name} 공수 비율">
        <span class="side">수 <b id="sPct${i}">50%</b></span>
      </div>

      <textarea id="text${i}" placeholder="텍스트 작성" maxlength="${MAX_CHARS}"></textarea>
    </div>
  `;

  resultList.innerHTML += `
    <div class="card">
      <img src="${m.img}" crossorigin="anonymous" referrerpolicy="no-referrer">
      <div class="content">
        <div class="bar-wrap">
          공
          <div class="bar">
            <div class="bar-inner" id="bar${i}"></div>
          </div>
          수
        </div>
        <div class="result-text" id="resultText${i}">텍스트 작성 부분</div>
      </div>
    </div>
  `;
});

// ====== 입력 슬라이더 실시간 표시(좌/우 퍼센트) ======
members.forEach((_, i) => {
  const r = document.getElementById(`range${i}`);
  const gPct = document.getElementById(`gPct${i}`);
  const sPct = document.getElementById(`sPct${i}`);

  const sync = () => {
    // step=10이라 사실상 스냅 이미 됨. 그래도 안전하게 반올림
    const g = Math.round(Number(r.value) / STEP) * STEP;
    r.value = g;
    const s = 100 - g;
    gPct.textContent = `${g}%`;
    sPct.textContent = `${s}%`;
  };

  r.addEventListener("input", sync);
  sync();
});

// ====== 텍스트 폰트 자동 축소(12 -> 최소 10), 100자 제한 ======
function fitTextBox(el, text) {
  el.textContent = text || " ";
  el.style.fontSize = `${FONT_BASE}px`;

  // 박스 높이를 넘치면 폰트 줄임
  for (let size = FONT_BASE; size >= FONT_MIN; size--) {
    el.style.fontSize = `${size}px`;
    if (el.scrollHeight <= el.clientHeight + 1) break;
  }
}

// ====== 결과 생성 ======
function generate() {
  members.forEach((_, i) => {
    const r = document.getElementById(`range${i}`);
    let g = Math.round(Number(r.value) / STEP) * STEP;
    g = Math.max(0, Math.min(100, g));
    r.value = g;

    const s = 100 - g;

    // 입력 퍼센트 재동기화
    const gPct = document.getElementById(`gPct${i}`);
    const sPct = document.getElementById(`sPct${i}`);
    if (gPct && sPct) {
      gPct.textContent = `${g}%`;
      sPct.textContent = `${s}%`;
    }

    // ✅ 결과 바: 길이 고정 50% + 위치만 이동
    // g=100 -> left=0 (왼쪽 끝)
    // g=50  -> left=25 (중앙)
    // g=0   -> left=50 (오른쪽 끝)
    const bar = document.getElementById(`bar${i}`);
    const left = (100 - g) / 2;
    bar.style.width = `${FIXED_WIDTH}%`;
    bar.style.left = `${left}%`;

    // 텍스트 반영 + 자동 축소
    const raw = (document.getElementById(`text${i}`).value || "").slice(0, MAX_CHARS);
    const box = document.getElementById(`resultText${i}`);
    fitTextBox(box, raw);
  });

  // 결과 화면에 미리보기 래퍼가 없으면 자동으로 만들어줌(HTML 안 바꿔도 됨)
  ensurePreviewWrapper();

  document.getElementById("controls").style.display = "none";
  document.getElementById("result").style.display = "block";

  // 모바일 자동축소 갱신
  updatePreviewScale();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ====== 저장: 1200x900 “그대로” 저장 (scale=1) ======
function saveImage() {
  const node = document.getElementById("capture");

  html2canvas(node, {
    width: 1200,
    height: 900,
    scale: 1,                 // ✅ 1200x900으로 저장(용량 감소)
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#fff"
  }).then(canvas => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gong_su_1200x900.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }).catch(err => {
    alert("이미지 저장 실패: 이미지 호스팅(CORS) 문제일 수 있어요.");
    console.error(err);
  });
}

// ====== ✅ 모바일 자동축소(화면에서만) ======
function ensurePreviewWrapper() {
  const result = document.getElementById("result");
  const capture = document.getElementById("capture");

  // 이미 감싸져 있으면 스킵
  if (capture.parentElement && capture.parentElement.classList.contains("preview-wrap")) return;

  // preview-wrap 생성 후 capture를 그 안으로 이동
  const wrap = document.createElement("div");
  wrap.className = "preview-wrap";
  capture.parentNode.insertBefore(wrap, capture);
  wrap.appendChild(capture);

  // 버튼이 capture 안으로 들어가 있으면 결과 영역 아래로 빼기(사라지는 문제 방지)
  const buttons = result.querySelectorAll("button");
  buttons.forEach(btn => {
    if (capture.contains(btn)) result.appendChild(btn);
  });

  // actions 영역이 없으면 만들어서 버튼을 넣어줌
  let actions = result.querySelector(".actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "actions";
    result.appendChild(actions);
  }
  // result 내부 버튼들을 actions로 이동(정돈)
  const resultButtons = Array.from(result.querySelectorAll(":scope > button"));
  resultButtons.forEach(b => actions.appendChild(b));
}

function updatePreviewScale() {
  const capture = document.getElementById("capture");
  const wrap = capture?.parentElement;
  if (!capture || !wrap) return;

  const vw = Math.min(window.innerWidth, wrap.clientWidth || window.innerWidth);
  const scale = Math.min(1, vw / 1200);

  document.documentElement.style.setProperty("--preview-scale", scale);

  // 스케일 된 높이만큼 wrapper 높이를 잡아줘야 버튼이 아래로 밀리지 않음
  wrap.style.height = `${900 * scale}px`;
  wrap.style.margin = "0 auto";
}

window.addEventListener("resize", () => {
  // 결과 화면일 때만 동작
  const result = document.getElementById("result");
  if (result && getComputedStyle(result).display !== "none") updatePreviewScale();
});
