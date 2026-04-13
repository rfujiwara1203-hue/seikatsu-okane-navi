# 生活お金ナビ — Next.js動的サイト

物価高・負担増に負けない家計術を、年収・家族構成に合わせて毎日お届けするWebアプリ。

## 🚀 機能

- **今日の身近なお金ニュース** — NHK・総務省等のRSSを自動取得、Claude AIが家計影響を分析
- **ふるさと納税 控除限度額計算** — 入力した寄付済み額から残り枠をリアルタイム表示
- **給付金マッチング** — 年収・家族構成に基づいて対象給付金を自動抽出
- **NISA・iDeCoシミュレーター** — 積立額・期間で運用結果を計算
- **固定費見直しチェックリスト** — 節約可能額を積み上げ表示

## ⚙️ セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして値を設定：

```bash
cp .env.local.example .env.local
```

```env
ANTHROPIC_API_KEY=sk-ant-...    # Anthropic APIキー（必須：AIニュース分析に使用）
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 🌐 Vercelデプロイ

### 方法1：Vercel CLIでデプロイ

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 方法2：GitHubと連携（推奨）

1. GitHubにリポジトリを作成してpush
2. [Vercel](https://vercel.com) でGitHubアカウントでログイン
3. "Import Project" → GitHubリポジトリを選択
4. 環境変数を設定：
   - `ANTHROPIC_API_KEY` = AnthropicのAPIキー
   - `NEXT_PUBLIC_SITE_URL` = `https://あなたのドメイン.vercel.app`
5. "Deploy" をクリック → 自動でビルド・公開

### 環境変数の設定（Vercel管理画面）

Vercelダッシュボード → Settings → Environment Variables で追加

## 📁 ディレクトリ構成

```
src/
├── app/
│   ├── (home)/          # ホームページ（メインエントリー）
│   ├── news/            # ニュース一覧ページ
│   ├── dashboard/       # マイ家計ダッシュボード
│   └── api/news/        # ニュース取得APIルート
├── components/
│   ├── ui/              # 共通UIコンポーネント（ナビ・フォーム・コンテキスト）
│   ├── news/            # ニュース関連コンポーネント
│   └── dashboard/       # ダッシュボード関連
├── lib/
│   ├── news-fetcher.ts  # RSS取得・フォールバック
│   ├── ai-analyzer.ts   # Claude APIによるニュース分析
│   └── profile.ts       # ユーザープロフィール計算
└── types/
    └── index.ts         # 型定義・定数（FS_LIMITS等）
public/
└── data/
    └── fallback-news.json  # RSS取得失敗時のフォールバックデータ
```

## 💡 広告・収益化のカスタマイズ

`src/app/dashboard/DashboardContent.tsx` の `AdBanner` コンポーネントのリンクを  
アフィリエイトURLに差し替えるだけで収益化できます。

推奨アフィリエイト：
- **SBI証券・楽天証券**（NISA口座開設）：1件5,000〜10,000円
- **楽天モバイル・UQモバイル**：1件3,000〜8,000円
- **ほけんの窓口**（保険相談）：1件3,000〜5,000円
- **エネチェンジ**（電力比較）：1件500〜2,000円

登録先：[A8.net](https://www.a8.net/) / [バリューコマース](https://www.valuecommerce.ne.jp/)

## 📊 ニュースの自動更新について

- ISR（`revalidate: 3600`）により、約1時間ごとにバックグラウンドでニュースを再取得
- RSS取得が失敗した場合は `public/data/fallback-news.json` のデータを使用
- `fallback-news.json` を定期的に手動更新することで常に有効な情報を提供できます

## 🔑 APIキーなしでも動く
<!-- updated -->

`ANTHROPIC_API_KEY` が未設定の場合、AIによる分析はスキップされ、  
ルールベースの簡易分析（フォールバック）で代替されます。  
ニュース取得・表示自体は問題なく動作します。
