// Reads the local SQLite dev.db (pre-Neon) and reports the source breakdown.
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

(async () => {
  const SQL = await initSqlJs({
    locateFile: (f) => path.join(__dirname, "..", "node_modules", "sql.js", "dist", f),
  });
  const dbPath = process.argv[2] || path.join(__dirname, "..", "prisma", "dev.db");
  const db = new SQL.Database(fs.readFileSync(dbPath));

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables:", tables[0].values.map((r) => r[0]).join(", "));

  const bySource = db.exec("SELECT source, COUNT(*) c FROM Question GROUP BY source ORDER BY c DESC");
  console.log("\nQuestion count by source:");
  for (const [src, c] of bySource[0].values) console.log(`  ${src}: ${c}`);

  const aiBySubject = db.exec(
    "SELECT subject, COUNT(*) c FROM Question WHERE source IN ('AI','MANUAL') GROUP BY subject ORDER BY c DESC"
  );
  console.log("\nAI/MANUAL by subject:");
  if (aiBySubject[0]) for (const [s, c] of aiBySubject[0].values) console.log(`  ${s}: ${c}`);
  else console.log("  (none)");

  db.close();
})();
