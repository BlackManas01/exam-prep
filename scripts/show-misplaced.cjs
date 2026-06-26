const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
function classify(topic, stem) {
  const t = `${topic} ${stem}`.toLowerCase();
  const computer = /\b(cpu|ram\b|rom\b|microprocessor|operating system|ms[- ]?(word|excel|power ?point|office)|motherboard|binary|byte|kilobyte|megabyte|gigabyte|url|html|http|hyperlink|spreadsheet|keyboard shortcut|ctrl\+|dbms|sql|booting|antivirus|malware|lan\b|wan\b|modem|router|ethernet|usb\b|firmware|gui\b)\b/;
  const english = /\b(synonym|antonym|idiom|one[- ]word substitution|spelling|error spot|sentence improvement|cloze|phrasal verb|homophone|narration|active and passive|direct and indirect|preposition|fill in the blank|para ?jumble|sentence rearrangement|vocabulary)\b/;
  const reasoning = /\b(coding[- ]decoding|blood relation|syllogism|odd one out|mirror image|water image|seating arrangement|direction sense|number series|letter series|analogy)\b/;
  if (computer.test(t)) return "computer";
  if (english.test(t)) return "english";
  if (reasoning.test(t)) return "reasoning";
  return null;
}
function secSub(s){if(/general-awareness|general-studies/.test(s))return"gk";if(s==="english")return"english";if(s==="computer")return"computer";if(/reasoning|intelligence/.test(s))return"reasoning";if(/quant|math/.test(s))return"quant";return"other";}
(async () => {
  const all = await prisma.question.findMany({ select: { id:true, examCode:true, sectionCode:true, topic:true, stem:true } });
  for (const q of all) {
    const d = classify(q.topic, q.stem);
    if (d && d !== secSub(q.sectionCode)) {
      console.log(`[${q.examCode}/${q.sectionCode} →${d}] (${q.topic}) ${q.stem.slice(0,95)}`);
    }
  }
  await prisma.$disconnect();
})();
