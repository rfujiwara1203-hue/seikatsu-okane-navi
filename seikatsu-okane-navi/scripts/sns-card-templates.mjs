// 生活お金ナビ SNS投稿画像の共通デザインシステム
// ブランド一貫性を保つため、色・フォント・ロゴ配置はここでのみ定義する

export const BRAND = {
  green: "#2e6e3a",
  greenDark: "#1f4d29",
  greenLight: "#3a8f4e",
  gold: "#f0c060",
  white: "#ffffff",
  textSub: "#d6eed8",
  textFaint: "#c8e6c0",
  up: "#e85a1a",
  down: "#7fd08a",
};

const BASE_STYLE = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:675px;overflow:hidden}
  body{
    font-family:'Hiragino Sans','Noto Sans JP',sans-serif;
    background:linear-gradient(135deg,${BRAND.greenDark} 0%,${BRAND.green} 60%,${BRAND.greenLight} 100%);
    position:relative;
    color:${BRAND.white};
  }
  .badge{
    position:absolute; top:48px; left:56px;
    display:flex; align-items:center; gap:10px;
    font-size:26px; font-weight:700; color:${BRAND.gold};
  }
  .footer{
    position:absolute; bottom:44px; left:56px; right:56px;
    font-size:22px; color:${BRAND.textFaint}; letter-spacing:.03em;
  }
`;

function wrap(bodyHtml, extraStyle = "") {
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>${BASE_STYLE}${extraStyle}</style></head>
<body>
  <div class="badge">💚 生活お金ナビ</div>
  ${bodyHtml}
  <div class="footer">seikatsu-okane-navi.vercel.app</div>
</body></html>`;
}

// タイプ1: 大きな数字を強調するカード（例: ふるさと納税の限度額）
export function statCard({ label, amount, unit = "", sub = "" }) {
  const style = `
    .card{
      position:absolute; top:50%; left:56px; right:56px; transform:translateY(-50%);
      text-align:center;
    }
    .label{ font-size:32px; color:${BRAND.textSub}; font-weight:500; margin-bottom:12px; }
    .amount{ font-size:150px; font-weight:900; line-height:1; display:flex; align-items:baseline; justify-content:center; gap:14px; }
    .amount .unit{ font-size:52px; font-weight:700; color:${BRAND.gold}; }
    .sub{ margin-top:24px; font-size:28px; color:${BRAND.textSub}; font-weight:500; }
  `;
  const body = `
    <div class="card">
      <div class="label">${label}</div>
      <div class="amount">${amount}${unit ? `<span class="unit">${unit}</span>` : ""}</div>
      ${sub ? `<div class="sub">${sub}</div>` : ""}
    </div>
  `;
  return wrap(body, style);
}

// タイプ2: 複数期間の推移を棒グラフで見せるカード（例: 物価の推移）
export function barsCard({ title, bars }) {
  // bars: [{ label, value, display, direction: 'up'|'down' }]
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.value)));
  const style = `
    h1{ position:absolute; top:130px; left:56px; right:56px; font-size:42px; font-weight:700; line-height:1.4; }
    .chart{ position:absolute; top:260px; left:56px; right:56px; height:280px; display:flex; align-items:flex-end; gap:26px; }
    .bar-wrap{ display:flex; flex-direction:column; align-items:center; gap:12px; flex:1; }
    .bar{ width:100%; border-radius:8px 8px 0 0; }
    .bar.up{ background:${BRAND.up}; }
    .bar.down{ background:${BRAND.down}; }
    .val{ font-size:25px; font-weight:900; }
    .mo{ font-size:19px; color:${BRAND.textSub}; }
  `;
  const barsHtml = bars
    .map((b) => {
      const height = Math.max(30, Math.round((Math.abs(b.value) / maxAbs) * 200));
      return `<div class="bar-wrap"><div class="val">${b.display}</div><div class="bar ${b.direction}" style="height:${height}px"></div><div class="mo">${b.label}</div></div>`;
    })
    .join("");
  const body = `<h1>${title}</h1><div class="chart">${barsHtml}</div>`;
  return wrap(body, style);
}

// タイプ3: ランキング/一覧形式のカード（例: 節約額トップ3）
export function listCard({ title, items }) {
  // items: [{ rank, label, value }]
  const style = `
    h1{ position:absolute; top:120px; left:56px; right:56px; font-size:40px; font-weight:700; }
    .list{ position:absolute; top:230px; left:56px; right:56px; display:flex; flex-direction:column; gap:22px; }
    .row{ display:flex; align-items:center; gap:24px; background:rgba(255,255,255,.08); border-radius:14px; padding:20px 28px; }
    .rank{ font-size:34px; font-weight:900; color:${BRAND.gold}; width:56px; }
    .rlabel{ flex:1; font-size:28px; font-weight:600; }
    .rvalue{ font-size:32px; font-weight:900; color:${BRAND.gold}; }
  `;
  const rows = items
    .map((it) => `<div class="row"><div class="rank">${it.rank}</div><div class="rlabel">${it.label}</div><div class="rvalue">${it.value}</div></div>`)
    .join("");
  const body = `<h1>${title}</h1><div class="list">${rows}</div>`;
  return wrap(body, style);
}
