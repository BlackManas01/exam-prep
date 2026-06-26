const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
function tmpl(s){return s.replace(/₹?\d[\d.,/:]*/g,"#").replace(/[A-Z]{2,}/g,"@").replace(/\b[A-Z]\b/g,"@").replace(/\s+/g," ").trim().slice(0,70);}
(async()=>{
  for (const grp of [["quant","math","maths"],["reasoning","general-intelligence"]]){
    for (const diff of ["MEDIUM","HARD","EXPERT"]){
      const rows = await p.question.findMany({ where:{ sectionCode:{in:grp}, difficulty:diff }, select:{ stem:true, source:true } });
      const seed = rows.filter(r=>r.source!=="AI"); const ai = rows.filter(r=>r.source==="AI");
      const tSeed = new Set(seed.map(r=>tmpl(r.stem))); const tAi = new Set(ai.map(r=>tmpl(r.stem)));
      console.log(`${grp[0]}/${diff}: total=${rows.length}  SEED ${seed.length}q/${tSeed.size}tmpl  AI ${ai.length}q/${tAi.size}tmpl`);
    }
  }
  await p.$disconnect();
})();
