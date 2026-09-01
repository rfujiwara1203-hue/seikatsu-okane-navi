import { NextRequest, NextResponse } from "next/server";
import { getFileContent } from "@/lib/github";

function todayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

interface ParsedPost {
  label: string;
  text: string;
  image: string | null;
}

// "## 投稿案N" 見出しごとに区切り、本文末尾の "画像: filename.png" 行を画像指定として抽出する
function parseDraftPosts(content: string): ParsedPost[] {
  const sections = content.split(/(?=^##\s+投稿案\d+)/m).filter((s) => /^##\s+投稿案\d+/.test(s.trim()));
  return sections.map((section) => {
    const lines = section.trim().split("\n");
    const label = lines[0].replace(/^##\s+/, "").trim();
    const body = lines.slice(1).join("\n").trim();

    const imageMatch = body.match(/^画像[:：]\s*(\S+)\s*$/m);
    const image = imageMatch ? imageMatch[1] : null;
    const text = body.replace(/^画像[:：]\s*\S+\s*$/m, "").trim();

    return { label, text, image };
  });
}

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dateParam = req.nextUrl.searchParams.get("date") || todayJST();
  const path = `sns-drafts/${dateParam}.md`;

  try {
    const file = await getFileContent(path);
    if (!file) {
      return NextResponse.json({ date: dateParam, content: "", found: false });
    }
    const posts = parseDraftPosts(file.content);
    return NextResponse.json({ date: dateParam, content: file.content, posts, found: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
