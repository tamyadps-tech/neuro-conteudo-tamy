import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

export async function renderLegalDoc(fileName: string) {
  const filePath = path.join(process.cwd(), "docs", "legal", fileName);
  const raw = await readFile(filePath, "utf-8");
  return marked.parse(raw) as string;
}
