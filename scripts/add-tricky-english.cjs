// Hand-authored HARD/EXPERT English "trap" questions for SSC CGL & similar exams.
// Advanced vocabulary, subtle grammar errors, confusable pairs and tricky idioms —
// designed to confuse even strong students while remaining 100% unambiguous.
// Inserted source="MANUAL". ssc-cgl-tier1 is listed FIRST (priority).
//
//   node scripts/add-tricky-english.cjs            (insert)
//   node scripts/add-tricky-english.cjs --verify   (print only)
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const ENGLISH_TARGETS = [
  { examCode: "ssc-cgl-tier1", sectionCode: "english", subject: "English" },   // PRIORITY
  { examCode: "ssc-chsl-tier1", sectionCode: "english", subject: "English" },
  { examCode: "ssc-cgl-tier2", sectionCode: "english", subject: "English" },
  { examCode: "ibps-po-prelims", sectionCode: "english", subject: "English" },
];

// q: stem, o: options, c: correctIndex, e: explanation, t: topic, d: difficulty
const Q = [
  // ---- Advanced SYNONYMS (trap = look/sound-alike or near-miss) ----
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: PERFIDIOUS", o: ["Treacherous", "Thorough", "Persistent", "Courageous"], c: 0, e: "Perfidious = deceitful, disloyal → treacherous." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: EPHEMERAL", o: ["Short-lived", "Eternal", "Spiritual", "Heavenly"], c: 0, e: "Ephemeral = lasting a very short time; 'eternal' is the opposite trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: LACONIC", o: ["Concise", "Talkative", "Relaxed", "Lazy"], c: 0, e: "Laconic = using very few words → concise. 'Relaxed' (sounds like lax) is the trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: OBSEQUIOUS", o: ["Servile", "Obstinate", "Obscure", "Aggressive"], c: 0, e: "Obsequious = excessively obedient → servile. 'Obstinate' (similar sound) is the trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: PERNICIOUS", o: ["Harmful", "Permanent", "Precise", "Curious"], c: 0, e: "Pernicious = having a harmful effect, especially gradually." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: INSIDIOUS", o: ["Stealthy", "Obvious", "Foolish", "Internal"], c: 0, e: "Insidious = proceeding harmfully in a stealthy way; 'obvious' is the opposite trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: TRUCULENT", o: ["Aggressive", "Truthful", "Trusting", "Tired"], c: 0, e: "Truculent = eager to fight, defiant → aggressive. 'Truthful' is a sound-alike trap." },
  { t: "Synonyms", d: "EXPERT", q: "Select the most appropriate synonym of: MENDACIOUS", o: ["Untruthful", "Generous", "Beggarly", "Repairable"], c: 0, e: "Mendacious = lying. 'Beggarly' confuses it with 'mendicant'." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: UBIQUITOUS", o: ["Omnipresent", "Unique", "Rare", "Unusual"], c: 0, e: "Ubiquitous = present everywhere → omnipresent. 'Unique' is the trap." },
  { t: "Synonyms", d: "HARD", q: "Select the most appropriate synonym of: CIRCUMSPECT", o: ["Cautious", "Suspicious", "Indirect", "Surrounding"], c: 0, e: "Circumspect = wary, prudent → cautious. 'Suspicious' is the trap." },

  // ---- Advanced ANTONYMS (trap = a synonym, not antonym) ----
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: PARSIMONIOUS", o: ["Generous", "Stingy", "Cautious", "Poor"], c: 0, e: "Parsimonious = mean/stingy; antonym is generous. 'Stingy' is a synonym trap." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: TRANSIENT", o: ["Permanent", "Temporary", "Moving", "Brief"], c: 0, e: "Transient = short-lived; antonym permanent. 'Temporary' is a synonym trap." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: GREGARIOUS", o: ["Reclusive", "Sociable", "Friendly", "Outgoing"], c: 0, e: "Gregarious = sociable; antonym reclusive. The other three are synonyms (traps)." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: VERBOSE", o: ["Concise", "Wordy", "Talkative", "Lengthy"], c: 0, e: "Verbose = using too many words; antonym concise. Others are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: AUGMENT", o: ["Diminish", "Increase", "Expand", "Enlarge"], c: 0, e: "Augment = increase; antonym diminish. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: BENIGN", o: ["Malignant", "Kind", "Gentle", "Harmless"], c: 0, e: "Benign = harmless/kind; antonym malignant. Others are synonyms." },
  { t: "Antonyms", d: "EXPERT", q: "Select the most appropriate antonym of: CANDID", o: ["Evasive", "Frank", "Honest", "Open"], c: 0, e: "Candid = frank/open; antonym evasive. The rest are synonyms." },
  { t: "Antonyms", d: "HARD", q: "Select the most appropriate antonym of: FRUGAL", o: ["Extravagant", "Thrifty", "Economical", "Careful"], c: 0, e: "Frugal = economical; antonym extravagant. The rest are synonyms." },

  // ---- ONE-WORD SUBSTITUTION (advanced; trap = close cousin) ----
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'A person who speaks many languages'", o: ["Polyglot", "Linguist", "Bilingual", "Orator"], c: 0, e: "Polyglot. A linguist studies languages; bilingual = two only." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'An abnormal fear of enclosed spaces'", o: ["Claustrophobia", "Agoraphobia", "Acrophobia", "Xenophobia"], c: 0, e: "Claustrophobia. Agoraphobia = open spaces (trap), acrophobia = heights." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'A person indifferent to pleasure or pain'", o: ["Stoic", "Cynic", "Sceptic", "Ascetic"], c: 0, e: "Stoic. An ascetic abstains from pleasure but is not indifferent to pain." },
  { t: "One Word Substitution", d: "EXPERT", q: "One-word substitution: 'Words inscribed on a tomb'", o: ["Epitaph", "Epigram", "Epilogue", "Epithet"], c: 0, e: "Epitaph. Epigram = witty saying; epithet = descriptive term (traps)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'Government by the wealthy'", o: ["Plutocracy", "Aristocracy", "Oligarchy", "Autocracy"], c: 0, e: "Plutocracy (pluto = wealth). Oligarchy = rule by a few." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'One who hates all mankind'", o: ["Misanthrope", "Misogynist", "Philanthropist", "Pessimist"], c: 0, e: "Misanthrope. Misogynist hates women only (trap)." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'The act of killing one's brother'", o: ["Fratricide", "Patricide", "Regicide", "Genocide"], c: 0, e: "Fratricide. Patricide = father, regicide = king." },
  { t: "One Word Substitution", d: "HARD", q: "One-word substitution: 'That which cannot be corrected'", o: ["Incorrigible", "Incurable", "Inevitable", "Illegible"], c: 0, e: "Incorrigible. Incurable = cannot be cured (trap)." },

  // ---- IDIOMS (less common; trap = literal or near meaning) ----
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To bell the cat'", o: ["To undertake a risky task for the common good", "To make a loud noise", "To frighten someone", "To act selfishly"], c: 0, e: "From the fable: someone must take the dangerous step of belling the cat." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'A storm in a teacup'", o: ["Great excitement over a trivial matter", "A sudden disaster", "A refreshing change", "A heated argument that turns violent"], c: 0, e: "Much fuss over something unimportant." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: 'To carry coals to Newcastle'", o: ["To do something pointless/superfluous", "To work very hard", "To trade profitably", "To travel a long distance"], c: 0, e: "Newcastle was a coal-mining hub — supplying what is already abundant is pointless." },
  { t: "Idioms and Phrases", d: "EXPERT", q: "Meaning of the idiom: \"Hobson's choice\"", o: ["An apparent choice with no real alternative", "A wise and careful decision", "A choice between two evils", "A lucky pick"], c: 0, e: "Take the one offered or none at all — no real choice." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'To throw in the towel'", o: ["To admit defeat / give up", "To start a fight", "To clean up a mess", "To waste resources"], c: 0, e: "A boxing metaphor for surrendering." },
  { t: "Idioms and Phrases", d: "HARD", q: "Meaning of the idiom: 'A wild goose chase'", o: ["A hopeless, futile pursuit", "An exciting adventure", "A long hunting trip", "A clever trick"], c: 0, e: "A foolish and hopeless search for something unattainable." },

  // ---- ERROR SPOTTING (subtle grammar) ----
  { t: "Error Spotting", d: "EXPERT", q: "Identify the part with the error: One of the most important factor (A) / that affects our success (B) / is consistent hard work. (C) / No error (D)", o: ["A", "B", "C", "D"], c: 0, e: "After 'one of the most important', a plural noun is required: 'factors'." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: The number of students (A) / in the class are increasing (B) / every single year. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'The number of' takes a singular verb: 'is increasing'." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: Neither of the boys (A) / have completed (B) / the assigned work. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'Neither' is singular → 'has completed'." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: He is much senior (A) / than me (B) / in the office. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'Senior' is followed by 'to', not 'than': 'senior to me'." },
  { t: "Error Spotting", d: "EXPERT", q: "Identify the part with the error: She is one of those (A) / who always helps (B) / the poor and needy. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'One of those who' takes a plural verb: 'help'." },
  { t: "Error Spotting", d: "HARD", q: "Identify the part with the error: Each of the players (A) / were given (B) / a gold medal. (C) / No error (D)", o: ["B", "A", "C", "D"], c: 0, e: "'Each' is singular → 'was given'." },

  // ---- SENTENCE IMPROVEMENT ----
  { t: "Sentence Improvement", d: "HARD", q: "Improve the underlined part: 'If I would have known about the meeting, I would have attended it.'", o: ["If I had known", "If I would knew", "If I have known", "No improvement"], c: 0, e: "Third conditional: 'If + had + past participle' → 'If I had known'." },
  { t: "Sentence Improvement", d: "HARD", q: "Improve the underlined part: 'The reason he was late is because his car broke down.'", o: ["is that his car broke down", "is because of his car broke down", "was because his car broke down", "No improvement"], c: 0, e: "'The reason ... is because' is redundant; use 'the reason ... is that'." },
  { t: "Sentence Improvement", d: "EXPERT", q: "Improve the sentence: 'No sooner did I reach home than it started to rain.' Choose the best version.", o: ["No improvement", "No sooner I reached home than it started", "No sooner did I reach home when it started", "No sooner had I reach home than it started"], c: 0, e: "'No sooner ... than' with inversion is already correct." },

  // ---- FILL IN THE BLANKS / CONFUSABLES ----
  { t: "Fill in the Blanks", d: "EXPERT", q: "Fill in the blank: 'After their easy victory, the team grew ______ and lost the very next match.'", o: ["complacent", "complaisant", "compliant", "competent"], c: 0, e: "Complacent = smugly self-satisfied. 'Complaisant' = eager to please (trap)." },
  { t: "Fill in the Blanks", d: "EXPERT", q: "Fill in the blank: 'Her ______ smile convinced everyone that she was hiding nothing.'", o: ["ingenuous", "ingenious", "genuine", "generous"], c: 0, e: "Ingenuous = innocent, frank. 'Ingenious' = clever (trap)." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'Though innocent, he was wrongly ______ and sent to prison.'", o: ["prosecuted", "persecuted", "executed", "prospered"], c: 0, e: "Prosecuted = tried in court. 'Persecuted' = harassed (trap)." },
  { t: "Fill in the Blanks", d: "HARD", q: "Fill in the blank: 'The committee will ______ a major reform in the coming session.'", o: ["bring about", "bring up", "bring out", "bring in"], c: 0, e: "'Bring about' = cause to happen." },

  // ---- HOMOPHONES / SPELLING ----
  { t: "Spelling", d: "HARD", q: "Select the correctly spelt word.", o: ["Liaison", "Liason", "Liaision", "Liasion"], c: 0, e: "Correct spelling: Liaison." },
  { t: "Spelling", d: "HARD", q: "Select the correctly spelt word.", o: ["Embarrassment", "Embarassment", "Embarrasment", "Embarrasement"], c: 0, e: "Correct: Embarrassment (double r, double s)." },
  { t: "Spelling", d: "HARD", q: "Select the correctly spelt word.", o: ["Millennium", "Milennium", "Millenium", "Milenium"], c: 0, e: "Correct: Millennium (double l, double n)." },
  { t: "Homonyms", d: "HARD", q: "Choose the correct word: 'A man of strong moral ______ never compromises with corruption.'", o: ["principles", "principals", "principal", "princple"], c: 0, e: "Principles = moral rules. 'Principal' = head/chief (trap)." },
  { t: "Homonyms", d: "HARD", q: "Choose the correct word: 'The vehicle remained ______ at the red signal.'", o: ["stationary", "stationery", "stationaries", "stationeries"], c: 0, e: "Stationary = not moving. 'Stationery' = writing materials (trap)." },

  // ---- VOICE ----
  { t: "Active and Passive Voice", d: "HARD", q: "Change to passive voice: 'Who taught you French?'", o: ["By whom were you taught French?", "By whom you were taught French?", "Whom were taught French by you?", "By whom was you taught French?"], c: 0, e: "Interrogative passive: 'By whom were you taught French?'" },
  { t: "Active and Passive Voice", d: "HARD", q: "Change to passive voice: 'Someone has stolen my purse.'", o: ["My purse has been stolen.", "My purse has stolen.", "My purse was been stolen.", "My purse is being stolen."], c: 0, e: "Present perfect passive: 'has been stolen'." },
];

function contentHash(stem, correct) {
  const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correct)}`).digest("hex");
}
function shuffled(opts, correctIdx) {
  const arr = opts.map((text, i) => ({ text, correct: i === correctIdx }));
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

(async () => {
  if (process.argv.includes("--verify")) {
    Q.forEach((q, i) => {
      console.log(`\n${i + 1}. [${q.t} · ${q.d}] ${q.q}`);
      console.log(`   Options: ${q.o.join("  |  ")}`);
      console.log(`   correct: ${q.o[q.c]}`);
    });
    console.log(`\nTotal: ${Q.length} English trap questions.`);
    await prisma.$disconnect();
    return;
  }
  const qRows = [], oRows = [];
  for (const t of ENGLISH_TARGETS) {
    for (const q of Q) {
      const id = crypto.randomUUID();
      qRows.push({
        id, examCode: t.examCode, sectionCode: t.sectionCode, subject: t.subject,
        topic: q.t, difficulty: q.d, stem: q.q, explanation: q.e,
        source: "MANUAL", contentHash: contentHash(q.q, q.o[q.c]), isActive: true,
      });
      shuffled(q.o, q.c).forEach((opt, i) =>
        oRows.push({ questionId: id, text: opt.text, isCorrect: opt.correct, displayOrder: i }));
    }
  }
  const chunk = async (arr, size, fn) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)); };
  await chunk(qRows, 1000, (b) => prisma.question.createMany({ data: b, skipDuplicates: true }));
  // Some questions may be skipped (duplicate of an existing one) — only insert
  // options for questions that actually landed, to avoid FK violations.
  const insertedIds = new Set(
    (await prisma.question.findMany({ where: { id: { in: qRows.map((q) => q.id) } }, select: { id: true } })).map((r) => r.id)
  );
  const liveOpts = oRows.filter((o) => insertedIds.has(o.questionId));
  await chunk(liveOpts, 2000, (b) => prisma.option.createMany({ data: b, skipDuplicates: true }));
  console.log(`Inserted ${insertedIds.size} English trap questions (of ${qRows.length} attempted; rest were duplicates of existing ones).`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
