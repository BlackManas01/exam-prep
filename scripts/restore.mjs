// Restores the question bank from a backup snapshot.
//   npm run db:restore            (restores the most recent backup)
//   npm run db:restore <file.db>  (restores a specific backup)
//
// IMPORTANT: stop the dev server first (the database file is locked while it
// runs). Restart it after restoring.

import { copyFileSync, existsSync, readdirSync } from "fs";
import { resolve, join } from "path";

const arg = process.argv[2];
let file = arg;

if (!file) {
  const dir = "backups";
  if (!existsSync(dir)) {
    console.error("No backups/ folder found. Run `npm run db:backup` first.");
    process.exit(1);
  }
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".db"))
    .sort();
  if (files.length === 0) {
    console.error("No backup files found in backups/.");
    process.exit(1);
  }
  file = join(dir, files[files.length - 1]); // most recent (timestamped names sort chronologically)
}

if (!existsSync(file)) {
  console.error(`Backup file not found: ${file}`);
  process.exit(1);
}

const target = resolve("prisma/dev.db");
try {
  copyFileSync(resolve(file), target);
  console.log(`✅ Restored ${file} → prisma/dev.db`);
  console.log("   Now restart the dev server: npm run dev");
} catch (e) {
  console.error(
    "Restore failed. If the dev server is running, stop it first (the DB file is locked).\n  ",
    e.message
  );
  process.exit(1);
}
