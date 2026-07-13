import { spawn } from "node:child_process";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const commands = [
  { name: "moe", cmd: "npm.cmd", args: ["run", "crawl:moe"] },
  { name: "npopss", cmd: "npm.cmd", args: ["run", "crawl:npopss"] }
];
const SNAPSHOT_FILE = path.join(process.cwd(), "data", "projects.snapshot.json");

function runCommand(command) {
  return new Promise((resolve) => {
    const child = spawn(`${command.cmd} ${command.args.join(" ")}`, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true
    });

    child.on("close", (code) => {
      resolve({ name: command.name, code: code ?? 1 });
    });
  });
}

async function warmSnapshotLock() {
  try {
    const raw = await readFile(SNAPSHOT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    await writeFile(SNAPSHOT_FILE, JSON.stringify(parsed, null, 2), "utf8");
  } catch {}
}

async function removeSnapshotForFreshRun() {
  try {
    await unlink(SNAPSHOT_FILE);
  } catch {}
}

async function main() {
  const results = [];
  await warmSnapshotLock();
  await removeSnapshotForFreshRun();

  for (const command of commands) {
    const result = await runCommand(command);
    results.push(result);
  }

  console.log(JSON.stringify({ results }, null, 2));

  if (results.some((result) => result.code !== 0)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
