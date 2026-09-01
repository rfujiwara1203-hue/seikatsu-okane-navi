"use client";

import { useState } from "react";

export default function AdminPostPage() {
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  async function loadDraft() {
    if (!password) {
      setStatus("パスワードを入力してください");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const url = draftDate
        ? `/api/get-draft?password=${encodeURIComponent(password)}&date=${draftDate}`
        : `/api/get-draft?password=${encodeURIComponent(password)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setStatus(`エラー: ${data.error || res.status}`);
        return;
      }
      if (!data.found) {
        setStatus(`${data.date} のドラフトが見つかりませんでした`);
        setText("");
        return;
      }
      setText(data.content);
      setStatus(`${data.date} のドラフトを読み込みました`);
    } catch (e) {
      setStatus(`エラー: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function post() {
    if (!password) {
      setStatus("パスワードを入力してください");
      return;
    }
    if (!text.trim()) {
      setStatus("投稿内容が空です");
      return;
    }
    if (!dryRun && !confirm("これは本番投稿です。この内容で本当にXに投稿しますか?\n\n" + text)) return;

    setLoading(true);
    setStatus(dryRun ? "お試し確認中(実際には投稿されません)..." : "投稿中...");
    try {
      const res = await fetch("/api/post-x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, text, dryRun }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`失敗: ${data.error || res.status}`);
        return;
      }
      if (data.dryRun) {
        setStatus(`お試しOK: 設定は正しく読み込まれています。実際には投稿していません。`);
      } else {
        setStatus(`投稿成功! ${data.tweetUrl}`);
        setText("");
      }
    } catch (e) {
      setStatus(`エラー: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>SNS投稿 管理画面</h1>

      <label style={{ display: "block", marginBottom: 8 }}>
        パスワード
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
        <label style={{ flex: 1 }}>
          日付 (空欄で今日)
          <input
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
        <button onClick={loadDraft} disabled={loading} style={{ padding: "8px 16px" }}>
          ドラフト読込
        </button>
      </div>

      <label style={{ display: "block", marginBottom: 8 }}>
        投稿内容 ({text.length}/280文字)
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={dryRun}
          onChange={(e) => setDryRun(e.target.checked)}
        />
        お試しモード(実際には投稿しない・設定確認のみ)
      </label>

      <button
        onClick={post}
        disabled={loading}
        style={{
          padding: "12px 24px",
          background: dryRun ? "#888" : "#2e6e3a",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {dryRun ? "お試し確認する" : "この内容で本当に投稿する"}
      </button>

      {status && (
        <p style={{ marginTop: 16, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{status}</p>
      )}
    </div>
  );
}
