const OWNER = "rfujiwara1203-hue";
const REPO = "seikatsu-okane-navi";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function authHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };
}

export async function getFileContent(
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFileContent failed: ${res.status}`);
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

export async function upsertFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  const existing = await getFileContent(path);
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: "main",
  };
  if (existing) body.sha = existing.sha;

  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub upsertFile failed: ${res.status} ${text}`);
  }
}

export async function appendToLog(
  path: string,
  entry: string
): Promise<void> {
  const existing = await getFileContent(path);
  const newContent = existing ? existing.content + "\n" + entry : entry;
  const body: Record<string, unknown> = {
    message: `SNS投稿ログ追記 ${new Date().toISOString()}`,
    content: Buffer.from(newContent, "utf-8").toString("base64"),
    branch: "main",
  };
  if (existing) body.sha = existing.sha;

  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub appendToLog failed: ${res.status} ${text}`);
  }
}
