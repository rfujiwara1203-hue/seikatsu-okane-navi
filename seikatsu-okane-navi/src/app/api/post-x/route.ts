import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { appendToLog } from "@/lib/github";

function nowJSTLabel(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 16).replace("T", " ");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.text !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const text: string = body.text.trim();
  if (!text) {
    return NextResponse.json({ error: "empty text" }, { status: 400 });
  }
  if (text.length > 280) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const dryRun = body.dryRun === true;

  if (dryRun) {
    const missing = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET", "GITHUB_TOKEN"].filter(
      (k) => !process.env[k]
    );
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `環境変数が未設定です: ${missing.join(", ")}` },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      dryRun: true,
      tweetUrl: "(dry-run: 実際には投稿されていません)",
    });
  }

  const client = new TwitterApi({
    appKey: process.env.X_API_KEY as string,
    appSecret: process.env.X_API_SECRET as string,
    accessToken: process.env.X_ACCESS_TOKEN as string,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET as string,
  });

  try {
    let mediaIds: [string] | undefined;
    if (typeof body.imageBase64 === "string" && body.imageBase64.length > 0) {
      const match = body.imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "invalid image data" }, { status: 400 });
      }
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      const mediaId = await client.v1.uploadMedia(buffer, { mimeType });
      mediaIds = [mediaId];
    }

    const result = mediaIds
      ? await client.v2.tweet(text, { media: { media_ids: mediaIds } })
      : await client.v2.tweet(text);
    const tweetId = result.data.id;
    const tweetUrl = `https://x.com/seikatsunavi/status/${tweetId}`;

    try {
      const logEntry = `## ${nowJSTLabel()}\n${text}\n画像: ${mediaIds ? "あり" : "なし"}\n投稿URL: ${tweetUrl}\n`;
      await appendToLog("sns-posts-log.md", logEntry);
    } catch (logError) {
      console.error("log append failed", logError);
    }

    return NextResponse.json({ success: true, tweetUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
