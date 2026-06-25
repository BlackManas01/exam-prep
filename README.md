# ExamPrep — Government Exam Mock Test Platform

A realistic, AI-ready mock-test platform for major Indian government exams
(**SSC CGL**, **SSC CHSL**, **IBPS PO**, **RRB NTPC**, **UPSC Prelims**). It
reproduces the real exam environment — section order, timer, question palette,
marking scheme and instant result analysis.

For the full architecture, AI pipeline and anti-repetition design, see
[DESIGN.md](DESIGN.md).

## Quick start (zero setup — uses SQLite)

```powershell
npm install
npm run db:push    # create the local SQLite database from the schema
npm run db:seed    # seed 5 exams + ~1000 questions
npm run dev        # http://localhost:3000
```

Then open http://localhost:3000, pick an exam, choose a difficulty level and take
the mock test.

## Using PostgreSQL instead (production)

1. Start Postgres (a `docker-compose.yml` is provided):
   ```powershell
   docker compose up -d
   ```
2. In [prisma/schema.prisma](prisma/schema.prisma), set
   `datasource db { provider = "postgresql" }`.
3. In `.env`, set the Postgres `DATABASE_URL` (see `.env.example`).
4. Re-run:
   ```powershell
   npm run db:push
   npm run db:seed
   ```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:seed` | Seed the demo bank (~1k questions, fast) |
| `npm run db:seed:large` | Seed a large bank (~52k questions). Tune with `QPS`, e.g. `QPS=10000` |
| `npm run db:studio` | Open Prisma Studio to browse data |

## Admin panel & AI generation

- Visit [`/admin`](http://localhost:3000/admin) for the question-bank dashboard
  (per-section counts) and the **AI question generator**.
- The generator (`POST /api/admin/generate`, guarded by `ADMIN_KEY`) calls OpenAI
  to create questions, validates them, de-duplicates against the bank, and stores
  them as **inactive** (`source = AI`) pending review. Set `OPENAI_API_KEY` in
  `.env` to enable it. Inactive questions never appear in tests until activated.

## Exam patterns implemented

| Exam | Sections | Q / Marks | Time | Marking |
|---|---|---|---|---|
| SSC CGL Tier 1 | Reasoning, GA, Quant, English (25 each) | 100 / 200 | 60 min | +2 / −0.5 |
| SSC CHSL Tier 1 | Gen. Intelligence, GA, Quant, English (25 each) | 100 / 200 | 60 min | +2 / −0.5 |
| IBPS PO Prelims | English (30), Quant (35), Reasoning (35) | 100 / 100 | 60 min* | +1 / −0.25 |
| RRB NTPC CBT 1 | Maths (30), Reasoning (30), GA (40) | 100 / 100 | 90 min | +1 / −⅓ |
| UPSC Prelims GS-1 | General Studies (100) | 100 / 200 | 120 min | +2 / −⅓ |

\* IBPS PO uses sectional timing (20 min per section).

## Notes

- The MVP scope is the **core exam flow** (start → test → instant result), now
  with **sectional timing/locking**, an **adjustable timer**, a **~52k-question**
  procedurally-generated bank, and an **AI generator + admin panel**.
- Procedural math/reasoning questions are parameterized (genuinely-correct
  answers) and scale to tens of thousands. The GK / GS / English banks grow via
  the AI pipeline or imported question banks toward 50k–100k+.
