import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "crawler.log");

export async function logLine(message: string) {
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${new Date().toISOString()} ${message}\n`, "utf8");
}
