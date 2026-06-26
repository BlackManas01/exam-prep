const fs = require("fs");
const { PDFParse } = require("pdf-parse");
(async () => {
  const file = process.argv[2];
  const buf = fs.readFileSync(file);
  const parser = new PDFParse({ data: buf });
  const data = await parser.getText();
  const text = data.text || (data.pages ? data.pages.map((p) => p.text).join("\n") : "");
  console.log("TEXT LENGTH:", text.length);
  console.log("----- first 2000 chars -----");
  console.log(text.slice(0, 2000));
})().catch((e) => console.error("ERR:", e.message));
