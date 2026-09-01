import { NextRequest, NextResponse } from "next/server";
import { getFileContent } from "@/lib/github";

function todayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
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
    return NextResponse.json({ date: dateParam, content: file.content, found: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
