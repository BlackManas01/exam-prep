// Automatic backup daemon. Start it once and it keeps making consistent
// snapshots on a schedule — but only when the question count has changed, and
// it auto-prunes old auto-backups so your disk doesn't fill up.
//
//   npm run db:backup:auto
//
// Tune with env vars:
//   BACKUP_INTERVAL_MIN  (default 30)   how often to check/backup
//   MAX_BACKUPS          (default 6)    how many auto-backups to keep

import { PrismaClient } from "@prisma/client";
import { mkdirSync, statSync, readdirSync, rmSync } from "fs";
import { resolve, join } from "path";

const prisma = new PrismaClient();
const INTERVAL_MIN = Number(process.env.BACKUP_INTERVAL_MIN) || 30;
const MAX_BACKUPS = Number(process.env.MAX_BACKUPS) || 6;

function prune() {
  const files = readdirSync("backups")
    .filter((f) => f.startsWith("auto-") && f.endsWith(".db"))
    .sort();
  while (files.length > MAX_BACKUPS) {
    const old = files.shift();
    rmSync(join("backups", old));
    console.log("   pruned old backup:", old);
  }
}

let lastCount = -1;

async function backupOnce() {
  const count = await prisma.question.count();
  const time = new Date().toLocaleTimeString();
  if (count === lastCount) {
    console.log(`${time}  no change (${count} questions) — skipped`);
    return;
  }
  mkdirSync("backups", { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const rel = `backups/auto-${ts}.db`;
  const abs = resolve(rel).replace(/\\/g, "/").replace(/'/g, "''");
  await prisma.$executeRawUnsafe(`VACUUM INTO '${abs}'`);
  const mb = (statSync(rel).size / 1024 / 1024).toFixed(1);
  console.log(`${time}  ✅ backup saved: ${rel} (${count} questions, ${mb} MB)`);
  lastCount = count;
  prune();
}

console.log(
  `Auto-backup running: every ${INTERVAL_MIN} min, keeping the last ${MAX_BACKUPS}. Leave this running; Ctrl+C to stop.`
);
await backupOnce();
setInterval(
  () => backupOnce().catch((e) => console.error("backup error:", e.message)),
  INTERVAL_MIN * 60 * 1000
);
