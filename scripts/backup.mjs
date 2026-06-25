// Creates a consistent snapshot backup of the question bank database.
// Uses SQLite "VACUUM INTO", which is safe even while the app/generation is
// running (it copies a transactionally-consistent image).
//
//   npm run db:backup

import { PrismaClient } from "@prisma/client";
import { mkdirSync, statSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

(async () => {
  mkdirSync("backups", { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const rel = `backups/dev-${ts}.db`;
  const absForSqlite = resolve(rel).replace(/\\/g, "/").replace(/'/g, "''");

  const questions = await prisma.question.count();
  await prisma.$executeRawUnsafe(`VACUUM INTO '${absForSqlite}'`);

  const sizeMb = (statSync(rel).size / 1024 / 1024).toFixed(1);
  console.log(`✅ Backup saved: ${rel}`);
  console.log(`   ${questions} questions · ${sizeMb} MB`);
  console.log(`   To restore later:  npm run db:restore`);
  await prisma.$disconnect();
})().catch((e) => {
  console.error("Backup failed:", e.message);
  process.exit(1);
});
