// Adds a curated, fact-checked Computer Knowledge question bank to SSC CGL Tier 2
// (examCode "ssc-cgl-tier2", section "computer"). Stored as source="MANUAL" so a
// reseed never deletes them. Idempotent: skips any stem+answer already present.
//
//   node scripts/add-computer-knowledge.cjs
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const EXAM = "ssc-cgl-tier2";
const SECTION = "computer";
const SUBJECT = "Computer Knowledge";

function contentHash(stem, correctAnswer) {
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  return crypto.createHash("sha256").update(`${norm(stem)}::${norm(correctAnswer)}`).digest("hex");
}

// Each: [topic, difficulty, stem, [optionA, optionB, optionC, optionD], correctIndex, explanation]
const Q = [
  // ---- Computer Basics ----
  ["Computer Basics","EASY","Which part of the computer is known as the brain of the computer?",["CPU","Monitor","Hard Disk","Keyboard"],0,"The CPU (Central Processing Unit) performs all processing and is called the brain of the computer."],
  ["Computer Basics","EASY","What does CPU stand for?",["Central Processing Unit","Central Programming Unit","Computer Personal Unit","Central Protection Unit"],0,"CPU stands for Central Processing Unit."],
  ["Computer Basics","EASY","The ALU part of the CPU stands for:",["Arithmetic Logic Unit","Automatic Logic Unit","Arithmetic Local Unit","Advanced Logic Unit"],0,"ALU stands for Arithmetic Logic Unit; it performs arithmetic and logical operations."],
  ["Computer Basics","EASY","What is the smallest unit of data in a computer?",["Bit","Byte","Nibble","Word"],0,"A bit (binary digit) is the smallest unit of data, holding a 0 or 1."],
  ["Computer Basics","EASY","How many bits make one byte?",["8","4","16","2"],0,"One byte equals 8 bits."],
  ["Computer Basics","EASY","1 Kilobyte (KB) is equal to:",["1024 bytes","1000 bytes","512 bytes","2048 bytes"],0,"1 KB = 1024 bytes (2^10)."],
  ["Computer Basics","MEDIUM","1 Gigabyte (GB) is equal to:",["1024 MB","1000 MB","1024 KB","512 MB"],0,"1 GB = 1024 megabytes."],
  ["Computer Basics","MEDIUM","1 Terabyte (TB) is equal to:",["1024 GB","1000 GB","1024 MB","512 GB"],0,"1 TB = 1024 gigabytes."],
  ["Computer Basics","EASY","Who is known as the Father of the Computer?",["Charles Babbage","Alan Turing","Bill Gates","Tim Berners-Lee"],0,"Charles Babbage designed the Analytical Engine and is called the Father of the Computer."],
  ["Computer Basics","MEDIUM","Which was the first electronic general-purpose computer?",["ENIAC","UNIVAC","EDSAC","IBM 701"],0,"ENIAC (Electronic Numerical Integrator and Computer) was the first general-purpose electronic computer."],
  ["Computer Basics","EASY","The binary number system uses which digits?",["0 and 1","1 and 2","0 to 9","0 and 2"],0,"The binary system uses only two digits: 0 and 1."],
  ["Computer Basics","EASY","'Bit' is a short form of:",["Binary digit","Binary term","Bytes in turn","Basic input"],0,"Bit is short for 'Binary digit'."],
  ["Computer Basics","MEDIUM","One nibble is equal to how many bits?",["4 bits","8 bits","2 bits","16 bits"],0,"A nibble equals 4 bits (half a byte)."],
  ["Computer Basics","EASY","The physical parts of a computer are collectively called:",["Hardware","Software","Firmware","Malware"],0,"Hardware refers to the tangible, physical components of a computer."],
  ["Computer Basics","EASY","A set of instructions that tells a computer what to do is called:",["Software","Hardware","A device","A port"],0,"Software is a set of programs/instructions that directs the hardware."],

  // ---- Computer Generations ----
  ["Computer Generations","MEDIUM","Which component was used in first-generation computers?",["Vacuum tubes","Transistors","Integrated circuits","Microprocessors"],0,"First-generation computers used vacuum tubes."],
  ["Computer Generations","MEDIUM","Second-generation computers were based on:",["Transistors","Vacuum tubes","Integrated circuits","Microprocessors"],0,"Second-generation computers used transistors."],
  ["Computer Generations","MEDIUM","Third-generation computers used:",["Integrated Circuits (IC)","Transistors","Vacuum tubes","Microprocessors"],0,"Third-generation computers used integrated circuits."],
  ["Computer Generations","MEDIUM","Fourth-generation computers are based on:",["Microprocessors","Integrated circuits","Transistors","Vacuum tubes"],0,"Fourth-generation computers use microprocessors (VLSI)."],
  ["Computer Generations","MEDIUM","Fifth-generation computers are associated with:",["Artificial Intelligence","Transistors","Vacuum tubes","Integrated circuits"],0,"Fifth-generation computing is based on Artificial Intelligence."],

  // ---- Hardware & Software ----
  ["Hardware & Software","EASY","RAM is an example of which type of memory?",["Volatile memory","Non-volatile memory","Permanent memory","Secondary memory"],0,"RAM is volatile — its contents are lost when power is switched off."],
  ["Hardware & Software","EASY","RAM stands for:",["Random Access Memory","Read Access Memory","Rapid Access Memory","Run Access Memory"],0,"RAM stands for Random Access Memory."],
  ["Hardware & Software","EASY","ROM stands for:",["Read Only Memory","Random Only Memory","Run Only Memory","Readable Open Memory"],0,"ROM stands for Read Only Memory and is non-volatile."],
  ["Hardware & Software","EASY","Which of the following is an input device?",["Keyboard","Monitor","Printer","Speaker"],0,"A keyboard is an input device used to enter data."],
  ["Hardware & Software","EASY","Which of the following is an output device?",["Printer","Keyboard","Mouse","Scanner"],0,"A printer is an output device that produces printed output."],
  ["Hardware & Software","EASY","A monitor is also known as:",["VDU","CPU","ALU","ROM"],0,"A monitor is also called a VDU (Visual Display Unit)."],
  ["Hardware & Software","MEDIUM","Which memory is non-volatile and retains data without power?",["ROM","RAM","Cache","Register"],0,"ROM is non-volatile and retains its contents even without power."],
  ["Hardware & Software","MEDIUM","USB stands for:",["Universal Serial Bus","Universal System Bus","Unique Serial Bus","United Serial Bus"],0,"USB stands for Universal Serial Bus."],
  ["Hardware & Software","EASY","CD stands for:",["Compact Disc","Computer Disc","Central Disc","Compact Drive"],0,"CD stands for Compact Disc."],
  ["Hardware & Software","MEDIUM","DVD stands for:",["Digital Versatile Disc","Digital Video Drive","Data Versatile Disc","Digital Visual Disc"],0,"DVD stands for Digital Versatile Disc."],
  ["Hardware & Software","HARD","Which memory is the fastest to access?",["Register","RAM","Hard disk","ROM"],0,"CPU registers are the fastest memory, followed by cache, then RAM."],
  ["Hardware & Software","MEDIUM","Cache memory sits between the CPU and:",["Main memory (RAM)","Hard disk","Monitor","Keyboard"],0,"Cache is a small, fast memory between the CPU and main memory (RAM)."],
  ["Hardware & Software","EASY","An Operating System is an example of:",["System software","Application software","Hardware","A peripheral"],0,"An OS is system software that manages hardware and other software."],
  ["Hardware & Software","EASY","Which of these is application software?",["MS Word","Windows","Linux","BIOS"],0,"MS Word is application software; the others are system software/firmware."],
  ["Hardware & Software","EASY","OS stands for:",["Operating System","Output System","Open Software","Online Service"],0,"OS stands for Operating System."],
  ["Hardware & Software","MEDIUM","GUI stands for:",["Graphical User Interface","General User Interface","Graphical Unit Interface","Global User Interface"],0,"GUI stands for Graphical User Interface."],
  ["Hardware & Software","MEDIUM","A device that converts digital signals to analog and vice versa is a:",["Modem","Router","Switch","Hub"],0,"A modem modulates/demodulates signals between digital and analog forms."],
  ["Hardware & Software","EASY","Which of the following is a pointing device?",["Mouse","Keyboard","Monitor","Printer"],0,"A mouse is a pointing input device."],

  // ---- MS Office ----
  ["MS Office","EASY","What is the default file extension of an MS Word (2007 and later) document?",[".docx",".xls",".ppt",".txt"],0,"Modern MS Word documents use the .docx extension."],
  ["MS Office","EASY","What is the default file extension of an MS Excel workbook?",[".xlsx",".docx",".pptx",".mdb"],0,"MS Excel workbooks use the .xlsx extension."],
  ["MS Office","EASY","What is the default file extension of an MS PowerPoint presentation?",[".pptx",".docx",".xlsx",".pdf"],0,"PowerPoint presentations use the .pptx extension."],
  ["MS Office","EASY","Which shortcut key is used to copy selected text?",["Ctrl+C","Ctrl+V","Ctrl+X","Ctrl+Z"],0,"Ctrl+C copies the selected content to the clipboard."],
  ["MS Office","EASY","Which shortcut key is used to paste?",["Ctrl+V","Ctrl+C","Ctrl+P","Ctrl+B"],0,"Ctrl+V pastes content from the clipboard."],
  ["MS Office","EASY","Which shortcut key is used to cut selected text?",["Ctrl+X","Ctrl+C","Ctrl+V","Ctrl+S"],0,"Ctrl+X cuts (removes and copies) the selected content."],
  ["MS Office","EASY","Which shortcut key is used to undo the last action?",["Ctrl+Z","Ctrl+Y","Ctrl+U","Ctrl+A"],0,"Ctrl+Z undoes the last action."],
  ["MS Office","EASY","Which shortcut key is used to save a document?",["Ctrl+S","Ctrl+D","Ctrl+N","Ctrl+O"],0,"Ctrl+S saves the current document."],
  ["MS Office","EASY","Which shortcut key selects all content?",["Ctrl+A","Ctrl+S","Ctrl+E","Ctrl+L"],0,"Ctrl+A selects all content in the document."],
  ["MS Office","EASY","Which shortcut makes selected text bold in MS Word?",["Ctrl+B","Ctrl+I","Ctrl+U","Ctrl+D"],0,"Ctrl+B applies bold formatting."],
  ["MS Office","EASY","Which shortcut underlines selected text in MS Word?",["Ctrl+U","Ctrl+B","Ctrl+I","Ctrl+L"],0,"Ctrl+U underlines the selected text."],
  ["MS Office","EASY","Which shortcut opens the Find dialog?",["Ctrl+F","Ctrl+G","Ctrl+H","Ctrl+R"],0,"Ctrl+F opens Find."],
  ["MS Office","EASY","Which shortcut is used to print a document?",["Ctrl+P","Ctrl+S","Ctrl+N","Ctrl+T"],0,"Ctrl+P opens the Print dialog."],
  ["MS Office","MEDIUM","In MS Excel, the intersection of a row and a column is called a:",["Cell","Range","Table","Field"],0,"The intersection of a row and column in Excel is a cell."],
  ["MS Office","MEDIUM","In MS Excel, a formula always begins with which symbol?",["= (equals sign)","+ (plus)","@ (at)","# (hash)"],0,"Excel formulas begin with the = sign."],
  ["MS Office","EASY","MS PowerPoint is mainly used to create:",["Presentations","Spreadsheets","Databases","Letters"],0,"PowerPoint is used to create slide-based presentations."],

  // ---- Internet ----
  ["Internet","EASY","WWW stands for:",["World Wide Web","World Wide Web Service","Web World Wide","Wide World Web"],0,"WWW stands for World Wide Web."],
  ["Internet","MEDIUM","HTTP stands for:",["HyperText Transfer Protocol","HyperText Transmission Protocol","High Transfer Text Protocol","HyperText Transfer Program"],0,"HTTP stands for HyperText Transfer Protocol."],
  ["Internet","MEDIUM","URL stands for:",["Uniform Resource Locator","Universal Resource Locator","Uniform Resource Link","Unique Resource Locator"],0,"URL stands for Uniform Resource Locator."],
  ["Internet","EASY","Which of the following is a web browser?",["Google Chrome","Windows","MS Word","Photoshop"],0,"Google Chrome is a web browser; the others are not."],
  ["Internet","MEDIUM","HTML stands for:",["HyperText Markup Language","HyperText Making Language","HighText Markup Language","HyperTransfer Markup Language"],0,"HTML stands for HyperText Markup Language."],
  ["Internet","MEDIUM","Who invented the World Wide Web?",["Tim Berners-Lee","Charles Babbage","Bill Gates","Vint Cerf"],0,"Tim Berners-Lee invented the World Wide Web in 1989."],
  ["Internet","EASY","Which symbol is always present in an email address?",["@","#","&","%"],0,"Every email address contains the @ symbol."],
  ["Internet","EASY","'Email' stands for:",["Electronic Mail","Electrical Mail","Easy Mail","Express Mail"],0,"Email stands for Electronic Mail."],
  ["Internet","MEDIUM","ISP stands for:",["Internet Service Provider","Internet System Provider","Internal Service Provider","Internet Service Program"],0,"ISP stands for Internet Service Provider."],
  ["Internet","EASY","Google is an example of a:",["Search engine","Web browser","Operating system","Spreadsheet"],0,"Google is a search engine."],
  ["Internet","MEDIUM","Wi-Fi stands for:",["Wireless Fidelity","Wired Fidelity","Wireless Field","Wide Fidelity"],0,"Wi-Fi is commonly expanded as Wireless Fidelity."],
  ["Internet","MEDIUM","IP (as in IP address) stands for:",["Internet Protocol","Internet Provider","Internal Protocol","Information Protocol"],0,"IP stands for Internet Protocol."],

  // ---- Networking ----
  ["Networking","EASY","LAN stands for:",["Local Area Network","Large Area Network","Local Access Network","Long Area Network"],0,"LAN stands for Local Area Network."],
  ["Networking","EASY","WAN stands for:",["Wide Area Network","Wireless Area Network","Wide Access Network","World Area Network"],0,"WAN stands for Wide Area Network."],
  ["Networking","MEDIUM","MAN stands for:",["Metropolitan Area Network","Main Area Network","Metro Access Network","Multiple Area Network"],0,"MAN stands for Metropolitan Area Network."],
  ["Networking","MEDIUM","A network confined to a small area like a single office is a:",["LAN","WAN","MAN","VPN"],0,"A LAN (Local Area Network) covers a small area such as an office or building."],
  ["Networking","MEDIUM","Which device is used to connect different networks together?",["Router","Monitor","Scanner","Printer"],0,"A router forwards data between different networks."],
  ["Networking","MEDIUM","VPN stands for:",["Virtual Private Network","Virtual Public Network","Verified Private Network","Visual Private Network"],0,"VPN stands for Virtual Private Network."],

  // ---- Security ----
  ["Security","EASY","A program designed to harm a computer or its data is called a:",["Virus","Browser","Compiler","Driver"],0,"A virus is malicious software that can damage data or disrupt a computer."],
  ["Security","EASY","Software used to detect and remove viruses is called:",["Antivirus","Spreadsheet","Browser","Compiler"],0,"Antivirus software detects and removes malware/viruses."],
  ["Security","EASY","Unwanted or junk email is commonly known as:",["Spam","Ham","Cookie","Cache"],0,"Unsolicited junk email is called spam."],
  ["Security","MEDIUM","OTP, used for secure verification, stands for:",["One Time Password","Online Time Password","One Tap Password","Open Time Password"],0,"OTP stands for One Time Password."],
  ["Security","MEDIUM","A firewall is mainly used for:",["Network security","Cooling the CPU","Increasing RAM","Printing documents"],0,"A firewall monitors and controls network traffic to protect against threats."],
  ["Security","EASY","A secret combination used to access an account is a:",["Password","Username","Hyperlink","Cookie"],0,"A password is a secret used to authenticate and access an account."],

  // ---- File Management ----
  ["File Management","EASY","PDF stands for:",["Portable Document Format","Personal Document Format","Printable Document File","Portable Data File"],0,"PDF stands for Portable Document Format."],
  ["File Management","EASY","A container used to organize and store files is called a:",["Folder","Cell","Pixel","Cursor"],0,"A folder (directory) holds and organizes files."],
  ["File Management","EASY","Which of the following is an image file extension?",[".jpg",".docx",".mp3",".exe"],0,".jpg is an image file format; the others are document, audio and executable."],
  ["File Management","MEDIUM","Which extension typically denotes an executable program in Windows?",[".exe",".txt",".jpg",".mp4"],0,".exe files are executable programs in Windows."],
];

(async () => {
  // Pre-load existing hashes in this section to skip duplicates.
  const existing = new Set(
    (
      await prisma.question.findMany({
        where: { examCode: EXAM, sectionCode: SECTION },
        select: { contentHash: true },
      })
    ).map((r) => r.contentHash)
  );

  let added = 0,
    skipped = 0;
  for (const [topic, difficulty, stem, opts, correctIdx, explanation] of Q) {
    const correct = opts[correctIdx];
    const hash = contentHash(stem, correct);
    if (existing.has(hash)) {
      skipped++;
      continue;
    }
    existing.add(hash);
    await prisma.question.create({
      data: {
        examCode: EXAM,
        sectionCode: SECTION,
        subject: SUBJECT,
        topic,
        difficulty,
        stem,
        explanation,
        source: "MANUAL",
        contentHash: hash,
        isActive: true,
        options: {
          create: opts.map((text, i) => ({
            text,
            isCorrect: i === correctIdx,
            displayOrder: i,
          })),
        },
      },
    });
    added++;
  }

  const sectionTotal = await prisma.question.count({
    where: { examCode: EXAM, sectionCode: SECTION },
  });
  console.log(`Computer Knowledge — added ${added}, skipped ${skipped} (already present).`);
  console.log(`Section "${SECTION}" now has ${sectionTotal} questions.`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
