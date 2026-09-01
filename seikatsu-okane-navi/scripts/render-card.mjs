#!/usr/bin/env node
// SNS投稿用の画像カードをHTML→PNGでレンダリングする
// 使い方: node scripts/render-card.mjs <spec.json> <output.png>
// spec.json の形式: { "type": "stat"|"bars"|"list", "data": {...}, "props": {...} }
// props は sns-card-templates.mjs の各関数に渡す引数

import fs from "node:fs";
import path from "node:path";
import { statCard, barsCard, listCard } from "./sns-card-templates.mjs";

async function loadPuppeteer() {
  try {
    // Vercel/サーバーレス系サンドボックス向け（軽量Chromium同梱）
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return {
      launch: async () =>
        puppeteer.launch({
          args: chromium.args,
          executablePath: chromium.executablePath ? await chromium.executablePath() : undefined,
          headless: true,
        }),
    };
  } catch {
    // ローカル開発機にフルpuppeteerが入っている場合のフォールバック
    const puppeteer = await import("puppeteer");
    return { launch: () => puppeteer.launch({ headless: "new" }) };
  }
}

async function main() {
  const [, , specPath, outPath] = process.argv;
  if (!specPath || !outPath) {
    console.error("usage: node scripts/render-card.mjs <spec.json> <output.png>");
    process.exit(1);
  }

  const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
  let html;
  if (spec.type === "stat") html = statCard(spec.props);
  else if (spec.type === "bars") html = barsCard(spec.props);
  else if (spec.type === "list") html = listCard(spec.props);
  else throw new Error(`unknown type: ${spec.type}`);

  const { launch } = await loadPuppeteer();
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 675 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, type: "png" });
    console.log(`wrote ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
