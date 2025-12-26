const members = [
  { name: "신유", img: "https://i.imgur.com/5L6wDru.png" },
  { name: "도훈", img: "https://i.imgur.com/hPrDoAd.png" },
  { name: "영재", img: "https://i.imgur.com/jaBqdU9.png" },
  { name: "한진", img: "https://i.imgur.com/dlN47CT.png" },
  { name: "지훈", img: "https://i.imgur.com/3jElNXL.png" },
  { name: "경민", img: "https://i.imgur.com/0qLTCdv.png" }
];

const inputs = document.getElementById("inputs");
const resultList = document.getElementById("resultList");

/* 입력 UI 생성 */
members.forEach((m, i) => {
  inputs.innerHTML += `
    <div class="member-control">
      <div class="member-header">
        <img src="${m.img}">
        <strong>${m.name}</strong>
      </div>

      <div class="range-row">
        공
        <input type="range" min="0" max="100" value="50" id="range${i}">
        수
        <span id="value${i}">50 / 50</span>
      </div>

      <textarea id="text${i}" placeholder="텍스트 작성 부분"></textarea>
    </div>
  `;

  resultList.innerHTML += `
    <div class="card">
      <img src="${m.img}">
      <div class="content">
        <div class="bar-wrap">
          공
          <div class="bar">
            <div class="bar-inner" id="bar${i}"></div>
          </div>
          수
        </div>
        <div class="result-text" id="resultText${i}"></div>
      </div>
    </div>
  `;
});

/* 슬라이더 실시간 */
members.forEach((_, i) => {
  const r = document.getElementById(`range${i}`);
  const v = document.getElementById(`value${i}`);
  r.addEventListener("input", () => {
    v.innerText = `${r.value} / ${100 - r.value}`;
  });
});

/* 결과 생성 */
function generate() {
  members.forEach((_, i) => {
const g = Number(document.getElementById(`range${i}`).value);
const s = 100 - g;

const bar = document.getElementById(`bar${i}`);

// 색칠된 바의 길이 (공/수 중 더 작은 쪽 기준)
const fillWidth = Math.min(g, s) * 2;

// 가운데 기준 위치 계산
const left = 50 - fillWidth / 2;

bar.style.width = fillWidth + "%";
bar.style.left = left + "%";

    document.getElementById(`resultText${i}`).innerText =
      document.getElementById(`text${i}`).value || " ";
  });

  document.getElementById("controls").style.display = "none";
  document.getElementById("result").style.display = "block";
}

/* 이미지 저장 */
function saveImage() {
  html2canvas(document.getElementById("capture"), { scale: 2 }).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "gong_su_4x3.png";
    a.click();
  });
}

