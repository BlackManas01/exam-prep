// Curated, PYQ-pattern Computer Knowledge bank for SSC CGL Tier 2 (and reusable).
// Covers the full official syllabus: Computer Basics & Organisation, Memory &
// Storage, Number Systems, I/O Devices, Generations, OS/Windows, Keyboard
// Shortcuts, MS Office (Word/Excel/PowerPoint), Internet & Email, Networking,
// and Cyber Security. Stored as source="MANUAL" (survives reseeds). Idempotent.
//
//   node scripts/add-ck-pyq.cjs
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

// [topic, difficulty, stem, [A,B,C,D], correctIndex, explanation]
const Q = [
  // ---------- Computer Organisation ----------
  ["Computer Organisation","MEDIUM","Which of the following are the three main components of the CPU?",["ALU, Control Unit and Registers","Monitor, Keyboard and Mouse","RAM, ROM and Cache","Hard disk, SSD and Pen drive"],0,"The CPU consists of the Arithmetic Logic Unit (ALU), the Control Unit (CU) and Registers."],
  ["Computer Organisation","MEDIUM","Which unit of the CPU directs and coordinates most of the operations in the computer?",["Control Unit","Arithmetic Logic Unit","Register","Cache"],0,"The Control Unit (CU) directs and coordinates operations; it does not perform calculations."],
  ["Computer Organisation","MEDIUM","The speed of a CPU (clock speed) is generally measured in:",["Gigahertz (GHz)","Megabytes (MB)","Bits per second (bps)","Dots per inch (DPI)"],0,"Clock speed is measured in hertz — modern CPUs in gigahertz (GHz)."],
  ["Computer Organisation","HARD","A set of parallel wires that carries memory addresses between the CPU and memory is called the:",["Address bus","Data bus","Control bus","System clock"],0,"The address bus carries memory addresses; the data bus carries the actual data."],
  ["Computer Organisation","MEDIUM","Which was the world's first microprocessor?",["Intel 4004","Intel Pentium","Intel 8085","Motorola 6800"],0,"The Intel 4004 (1971) was the first commercially available microprocessor."],
  ["Computer Organisation","HARD","The basic machine cycle of a CPU consists of which steps?",["Fetch, Decode, Execute","Input, Process, Output","Read, Write, Erase","Open, Edit, Save"],0,"A machine/instruction cycle is Fetch → Decode → Execute (then store)."],

  // ---------- Memory & Storage ----------
  ["Computer Memory","MEDIUM","Which of the following is a type of volatile memory?",["RAM","ROM","Hard Disk","DVD"],0,"RAM is volatile — it loses its contents when power is switched off."],
  ["Computer Memory","MEDIUM","What are the two main types of RAM?",["SRAM and DRAM","PROM and EPROM","CD and DVD","HDD and SSD"],0,"RAM is of two types: Static RAM (SRAM) and Dynamic RAM (DRAM)."],
  ["Computer Memory","HARD","Which type of RAM is faster and is typically used as cache memory?",["SRAM","DRAM","SDRAM","DDR RAM"],0,"SRAM (Static RAM) is faster and is used for cache; DRAM is slower but cheaper, used as main memory."],
  ["Computer Memory","HARD","An EPROM is erased using:",["Ultraviolet (UV) light","Electrical signals","A magnet","Heating"],0,"EPROM (Erasable Programmable ROM) is erased by exposure to ultraviolet light; EEPROM uses electrical signals."],
  ["Computer Memory","MEDIUM","Which of the following correctly arranges memory units in ascending order of size?",["Bit < Byte < KB < MB < GB","Byte < Bit < KB < GB < MB","KB < Byte < MB < Bit < GB","Bit < KB < Byte < MB < GB"],0,"Order: Bit < Byte < Kilobyte < Megabyte < Gigabyte < Terabyte."],
  ["Computer Memory","HARD","One Petabyte (PB) is equal to:",["1024 Terabytes","1024 Gigabytes","1024 Megabytes","1000 Terabytes"],0,"1 PB = 1024 TB."],
  ["Computer Memory","EASY","Which of the following is a secondary storage device?",["Hard Disk Drive","RAM","Cache","Register"],0,"Hard Disk Drive is secondary (non-volatile) storage; RAM, cache and registers are primary memory."],
  ["Computer Memory","MEDIUM","SSD, a modern storage device, stands for:",["Solid State Drive","Secondary Storage Disk","Static Storage Device","System Storage Drive"],0,"SSD stands for Solid State Drive — faster storage with no moving parts."],
  ["Computer Memory","MEDIUM","Which storage device uses a laser beam to read and write data?",["Optical disc (CD/DVD)","Hard disk","Pen drive","Floppy disk"],0,"Optical discs such as CDs, DVDs and Blu-ray use a laser to read/write data."],
  ["Computer Memory","MEDIUM","Cache memory is used to:",["Speed up the CPU by storing frequently used data","Permanently store the operating system","Provide backup storage","Connect to the internet"],0,"Cache is a small, very fast memory that stores frequently used data/instructions to speed up processing."],

  // ---------- Number Systems ----------
  ["Number Systems","MEDIUM","The binary number system has a base of:",["2","8","10","16"],0,"Binary uses base 2 (digits 0 and 1)."],
  ["Number Systems","MEDIUM","The hexadecimal number system uses a base of:",["16","8","10","2"],0,"Hexadecimal is base 16, using 0–9 and A–F."],
  ["Number Systems","MEDIUM","The octal number system uses which base?",["8","16","2","10"],0,"Octal is base 8 (digits 0–7)."],
  ["Number Systems","HARD","The decimal number 10 is represented in binary as:",["1010","1000","1100","1001"],0,"Decimal 10 = 1010 in binary (8+2)."],
  ["Number Systems","MEDIUM","ASCII, a character-encoding standard, stands for:",["American Standard Code for Information Interchange","Advanced Standard Code for Internet Information","American System Code for Information Interface","Automatic Standard Computer Information Index"],0,"ASCII = American Standard Code for Information Interchange."],
  ["Number Systems","HARD","The decimal number 8 in binary is:",["1000","1010","0111","1100"],0,"Decimal 8 = 1000 in binary."],

  // ---------- Input / Output Devices ----------
  ["Input and Output Devices","HARD","MICR, used by banks to process cheques, stands for:",["Magnetic Ink Character Recognition","Magnetic Internal Character Reader","Manual Ink Character Recognition","Magnetic Image Character Reader"],0,"MICR = Magnetic Ink Character Recognition, used to process cheques."],
  ["Input and Output Devices","MEDIUM","OCR stands for:",["Optical Character Recognition","Optical Code Reader","Output Character Recognition","Optical Computer Reader"],0,"OCR = Optical Character Recognition, converts printed/handwritten text into machine text."],
  ["Input and Output Devices","MEDIUM","OMR, often used to check multiple-choice answer sheets, stands for:",["Optical Mark Recognition","Optical Memory Reader","Output Mark Recognition","Optical Machine Reader"],0,"OMR = Optical Mark Recognition, reads marks (like filled bubbles) on answer sheets."],
  ["Input and Output Devices","EASY","Which of the following is an output device?",["Plotter","Scanner","Joystick","Light pen"],0,"A plotter is an output device used to print large drawings; the others are input devices."],
  ["Input and Output Devices","MEDIUM","Which of the following is an impact printer?",["Dot matrix printer","Laser printer","Inkjet printer","Thermal printer"],0,"A dot-matrix printer is an impact printer; laser and inkjet are non-impact."],
  ["Input and Output Devices","MEDIUM","A touchscreen is an example of which type of device?",["Both input and output","Only input","Only output","Storage"],0,"A touchscreen both displays output and accepts touch input."],
  ["Input and Output Devices","MEDIUM","Printer resolution is measured in DPI, which stands for:",["Dots Per Inch","Digits Per Inch","Data Per Image","Dots Per Image"],0,"DPI = Dots Per Inch — the higher the DPI, the better the print quality."],
  ["Input and Output Devices","EASY","Which of the following is NOT an input device?",["Monitor","Keyboard","Mouse","Scanner"],0,"A monitor is an output device; the others are input devices."],

  // ---------- Computer Types & Generations ----------
  ["Computer Generations","HARD","India's first indigenous supercomputer was:",["PARAM 8000","CRAY-1","Tianhe-1","Aditya"],0,"PARAM 8000, developed by C-DAC in 1991, was India's first supercomputer."],
  ["Computer Generations","MEDIUM","Which type of computer processes continuous (physical) data such as temperature and pressure?",["Analog computer","Digital computer","Hybrid computer","Super computer"],0,"Analog computers process continuous physical quantities; digital computers process discrete data."],
  ["Computer Generations","MEDIUM","A computer that combines features of both analog and digital computers is called a:",["Hybrid computer","Mainframe computer","Mini computer","Micro computer"],0,"A hybrid computer combines analog and digital features (e.g. used in hospitals)."],

  // ---------- Operating System / Windows ----------
  ["Operating System","MEDIUM","Which of the following is system software?",["Operating System","MS Word","VLC Media Player","Google Chrome"],0,"An Operating System is system software; the others are application software."],
  ["Operating System","MEDIUM","The process of starting or restarting a computer and loading the operating system is called:",["Booting","Formatting","Compiling","Installing"],0,"Booting is the process of starting a computer and loading the OS."],
  ["Operating System","HARD","Restarting a computer that is already on is known as:",["Warm booting","Cold booting","Hard booting","Dual booting"],0,"Warm booting = restarting an already-running computer; cold booting = starting from power off."],
  ["Operating System","MEDIUM","BIOS, which initialises hardware during booting, stands for:",["Basic Input Output System","Binary Input Output System","Basic Internal Operating System","Basic Integrated Output System"],0,"BIOS = Basic Input Output System."],
  ["Operating System","HARD","The core component of an operating system that manages hardware and resources is called the:",["Kernel","Shell","Compiler","Driver"],0,"The kernel is the core of the OS that manages memory, processes and hardware."],
  ["Operating System","MEDIUM","In Windows, the bar usually located at the bottom of the screen showing open programs is the:",["Taskbar","Menu bar","Title bar","Scroll bar"],0,"The Taskbar (at the bottom by default) shows open programs and the Start button."],
  ["Operating System","MEDIUM","In Windows, deleted files are temporarily stored in the:",["Recycle Bin","My Documents","Clipboard","Control Panel"],0,"Deleted files go to the Recycle Bin, from where they can be restored or permanently deleted."],
  ["Operating System","MEDIUM","The ability of an operating system to run multiple programs at the same time is called:",["Multitasking","Booting","Formatting","Encryption"],0,"Multitasking lets an OS run several programs/processes concurrently."],

  // ---------- Keyboard Shortcuts ----------
  ["Keyboard Shortcuts","MEDIUM","Which shortcut key is used to permanently delete a file without sending it to the Recycle Bin?",["Shift + Delete","Ctrl + Delete","Alt + Delete","Delete"],0,"Shift + Delete deletes a file permanently, bypassing the Recycle Bin."],
  ["Keyboard Shortcuts","MEDIUM","Which key is used to rename a selected file in Windows?",["F2","F1","F5","F12"],0,"F2 renames the selected file or folder."],
  ["Keyboard Shortcuts","MEDIUM","The F5 key is generally used to:",["Refresh the current window","Open Help","Rename a file","Close a window"],0,"F5 refreshes the active window (and starts a slideshow in PowerPoint)."],
  ["Keyboard Shortcuts","MEDIUM","Which shortcut closes the currently active program/window?",["Alt + F4","Ctrl + F4","Ctrl + W","Shift + F4"],0,"Alt + F4 closes the currently active program or window."],
  ["Keyboard Shortcuts","MEDIUM","Pressing Ctrl + Y in MS Word performs which action?",["Redo","Undo","Copy","Save"],0,"Ctrl + Y redoes the last undone action; Ctrl + Z undoes."],
  ["Keyboard Shortcuts","EASY","Which function key is commonly used to open the Help menu?",["F1","F2","F4","F10"],0,"F1 opens Help in most programs."],
  ["Keyboard Shortcuts","MEDIUM","In Windows, the shortcut Windows key + D is used to:",["Show the desktop","Lock the computer","Open Documents","Delete a file"],0,"Windows + D minimises all windows to show the desktop."],
  ["Keyboard Shortcuts","MEDIUM","The shortcut Windows key + L is used to:",["Lock the computer","Log off","Open the Library","Launch a browser"],0,"Windows + L locks the computer."],
  ["Keyboard Shortcuts","HARD","Ctrl + Home in a document moves the cursor to the:",["Beginning of the document","End of the document","Beginning of the line","End of the line"],0,"Ctrl + Home jumps to the very start of the document."],

  // ---------- MS Word ----------
  ["MS Word","MEDIUM","The MS Word feature used to create personalised letters by combining a document with a data source is called:",["Mail Merge","Macro","Hyperlink","Track Changes"],0,"Mail Merge combines a main document with a data source to produce personalised letters/labels."],
  ["MS Word","MEDIUM","In MS Word, a spelling mistake is typically indicated by a:",["Red wavy underline","Green wavy underline","Blue straight underline","Black double underline"],0,"Spelling errors are shown with a red wavy underline; grammar errors with a green/blue one."],
  ["MS Word","HARD","Text that appears at the top margin of every page in MS Word is called a:",["Header","Footer","Caption","Bookmark"],0,"A Header appears in the top margin of every page; a Footer appears at the bottom."],
  ["MS Word","MEDIUM","Which page orientation is taller than it is wide?",["Portrait","Landscape","Horizontal","Wide"],0,"Portrait orientation is vertical (taller than wide); Landscape is horizontal."],

  // ---------- MS Excel ----------
  ["MS Excel","MEDIUM","In MS Excel, a file is called a workbook and it contains one or more:",["Worksheets","Documents","Slides","Tables"],0,"An Excel workbook contains one or more worksheets (spreadsheets)."],
  ["MS Excel","MEDIUM","A cell address in Excel is written as:",["Column letter followed by row number (e.g. A1)","Row number followed by column letter (e.g. 1A)","Only a number","Only a letter"],0,"A cell reference is the column letter then the row number, e.g. A1, B5."],
  ["MS Excel","HARD","Which Excel function is used to add a range of numbers?",["=SUM()","=COUNT()","=AVERAGE()","=MAX()"],0,"=SUM() adds the values in a range, e.g. =SUM(A1:A10)."],
  ["MS Excel","HARD","In Excel, $A$1 is an example of which type of cell reference?",["Absolute reference","Relative reference","Mixed reference","Circular reference"],0,"$A$1 is an absolute reference — it does not change when the formula is copied."],
  ["MS Excel","MEDIUM","Which Excel function returns the average of a range of numbers?",["=AVERAGE()","=SUM()","=COUNT()","=MEDIAN()"],0,"=AVERAGE() returns the arithmetic mean of the given range."],
  ["MS Excel","HARD","In Excel, which function counts only the cells that contain numbers?",["=COUNT()","=COUNTA()","=SUM()","=NUM()"],0,"=COUNT() counts numeric cells; =COUNTA() counts all non-empty cells."],

  // ---------- MS PowerPoint ----------
  ["MS PowerPoint","EASY","In MS PowerPoint, each individual page is called a:",["Slide","Sheet","Page","Card"],0,"Each page of a PowerPoint presentation is called a slide."],
  ["MS PowerPoint","HARD","In PowerPoint, the visual effect applied when moving from one slide to the next is called a:",["Transition","Animation","Design","Layout"],0,"A transition is the effect between slides; animation is applied to objects within a slide."],
  ["MS PowerPoint","MEDIUM","Which key starts a PowerPoint slideshow from the beginning?",["F5","F2","Esc","Tab"],0,"F5 starts the slideshow from the first slide (Shift+F5 starts from the current slide)."],

  // ---------- Internet & WWW ----------
  ["Internet","MEDIUM","HTTPS differs from HTTP because it is:",["Secure (encrypted using SSL/TLS)","Faster","Free of cost","Older"],0,"HTTPS is the secure version of HTTP, encrypting data using SSL/TLS."],
  ["Internet","HARD","DNS, which translates domain names into IP addresses, stands for:",["Domain Name System","Data Network Service","Digital Naming System","Domain Network Server"],0,"DNS = Domain Name System; it resolves human-readable domains to IP addresses."],
  ["Internet","MEDIUM","In the address www.example.com, the part '.com' is called the:",["Top-level domain","Protocol","Sub-domain","Web page"],0,"'.com' is the top-level domain (TLD)."],
  ["Internet","EASY","The first/main page of a website is called the:",["Home page","Web server","Search page","Index card"],0,"The first page that loads for a website is its home page."],
  ["Internet","MEDIUM","Transferring a file from the internet to your computer is called:",["Downloading","Uploading","Streaming","Browsing"],0,"Downloading = bringing a file from a server to your device; uploading is the reverse."],
  ["Internet","MEDIUM","A unique numerical address assigned to each device on a network is called the:",["IP address","MAC code","URL","DNS"],0,"An IP (Internet Protocol) address uniquely identifies a device on a network."],

  // ---------- Email & e-Banking ----------
  ["Email","MEDIUM","In email, BCC stands for:",["Blind Carbon Copy","Black Carbon Copy","Blind Copy Code","Backup Carbon Copy"],0,"BCC = Blind Carbon Copy; recipients in BCC are hidden from other recipients."],
  ["Email","MEDIUM","Received emails are stored in which folder by default?",["Inbox","Sent","Drafts","Trash"],0,"Incoming mail is delivered to the Inbox."],
  ["Email","HARD","Which protocol is used to SEND emails?",["SMTP","POP3","IMAP","HTTP"],0,"SMTP (Simple Mail Transfer Protocol) is used to send email; POP3/IMAP are used to receive it."],
  ["Email","MEDIUM","A file sent along with an email is called a/an:",["Attachment","Hyperlink","Cookie","Macro"],0,"A file added to an email is called an attachment."],
  ["Email","HARD","In banking, RTGS stands for:",["Real Time Gross Settlement","Rapid Transfer Gateway System","Real Transaction Gross Service","Remote Transfer Gross Settlement"],0,"RTGS = Real Time Gross Settlement, used for high-value real-time fund transfers."],

  // ---------- Networking ----------
  ["Computer Networking","MEDIUM","A network that connects devices within a single building or small area is a:",["LAN","WAN","MAN","PAN"],0,"A LAN (Local Area Network) covers a small area such as a building."],
  ["Computer Networking","MEDIUM","PAN, the smallest type of network, stands for:",["Personal Area Network","Private Area Network","Public Access Network","Primary Area Network"],0,"PAN = Personal Area Network (e.g. Bluetooth devices around a person)."],
  ["Computer Networking","HARD","In which network topology are all devices connected to a single central hub or switch?",["Star","Bus","Ring","Mesh"],0,"In a star topology every device connects to a central hub/switch."],
  ["Computer Networking","MEDIUM","Which device simply broadcasts data to all connected devices on a network?",["Hub","Switch","Router","Bridge"],0,"A hub broadcasts incoming data to all ports; a switch sends it only to the intended device."],
  ["Computer Networking","HARD","FTP, a protocol used to transfer files over a network, stands for:",["File Transfer Protocol","Fast Transfer Protocol","File Transmission Process","Folder Transfer Protocol"],0,"FTP = File Transfer Protocol."],
  ["Computer Networking","HARD","The OSI reference model for networking has how many layers?",["7","5","4","8"],0,"The OSI (Open Systems Interconnection) model has 7 layers."],
  ["Computer Networking","MEDIUM","Network bandwidth (data transfer rate) is measured in:",["Bits per second (bps)","Hertz","Pixels","Dots per inch"],0,"Bandwidth is measured in bits per second (bps), e.g. Mbps, Gbps."],

  // ---------- Cyber Security ----------
  ["Cyber Security","MEDIUM","A self-replicating malicious program that spreads across networks without human help is a:",["Worm","Trojan horse","Cookie","Firewall"],0,"A worm self-replicates and spreads automatically; a virus usually needs a host file/user action."],
  ["Cyber Security","HARD","A program that appears useful but secretly performs malicious actions is called a:",["Trojan horse","Worm","Firewall","Compiler"],0,"A Trojan horse disguises itself as legitimate software while doing harm."],
  ["Cyber Security","MEDIUM","The fraudulent practice of sending fake emails/websites to steal sensitive information is called:",["Phishing","Spamming","Caching","Debugging"],0,"Phishing tricks users into revealing passwords, card numbers, etc. via fake messages/sites."],
  ["Cyber Security","HARD","Malware that locks a user's files and demands payment to unlock them is called:",["Ransomware","Spyware","Adware","Freeware"],0,"Ransomware encrypts/locks data and demands a ransom to restore access."],
  ["Cyber Security","MEDIUM","The process of converting data into a coded form to prevent unauthorised access is called:",["Encryption","Compression","Formatting","Buffering"],0,"Encryption encodes data so only authorised parties with the key can read it."],
  ["Cyber Security","MEDIUM","Software that secretly gathers a user's information without consent is called:",["Spyware","Freeware","Shareware","Firmware"],0,"Spyware secretly collects information about a user's activity."],
  ["Cyber Security","MEDIUM","Small text files stored by websites to remember a user's browsing information are called:",["Cookies","Caches","Crumbs","Cells"],0,"Cookies are small files that store browsing data such as login/session info."],

  // ---------- Abbreviations & File Formats ----------
  ["Abbreviations","MEDIUM","The image file format JPEG stands for:",["Joint Photographic Experts Group","Java Photographic Expert Group","Joint Picture Encoding Group","Joint Photo Editing Group"],0,"JPEG = Joint Photographic Experts Group, a common compressed image format."],
  ["Abbreviations","MEDIUM","The image format PNG stands for:",["Portable Network Graphics","Picture Network Graphics","Portable New Graphics","Pixel Network Graphics"],0,"PNG = Portable Network Graphics, a lossless image format."],
  ["Abbreviations","MEDIUM","GIF, an image format that supports animation, stands for:",["Graphics Interchange Format","General Image Format","Graphic Interface Format","Graphics Internet Format"],0,"GIF = Graphics Interchange Format, supports simple animations."],
  ["Abbreviations","EASY","ATM, used for banking transactions, stands for:",["Automated Teller Machine","Automatic Transaction Machine","Auto Teller Module","Automated Transfer Machine"],0,"ATM = Automated Teller Machine."],
  ["Abbreviations","MEDIUM","CD-ROM stands for:",["Compact Disc Read Only Memory","Computer Disc Read Only Memory","Compact Disc Random Online Memory","Compact Drive Read Only Memory"],0,"CD-ROM = Compact Disc Read Only Memory."],
  ["Abbreviations","MEDIUM","FTP and SMTP are examples of:",["Protocols","Storage devices","Programming languages","Operating systems"],0,"FTP (file transfer) and SMTP (email sending) are network protocols."],
];

(async () => {
  const existing = new Set(
    (
      await prisma.question.findMany({
        where: { examCode: EXAM, sectionCode: SECTION },
        select: { contentHash: true },
      })
    ).map((r) => r.contentHash)
  );

  let added = 0, skipped = 0;
  for (const [topic, difficulty, stem, opts, correctIdx, explanation] of Q) {
    const hash = contentHash(stem, opts[correctIdx]);
    if (existing.has(hash)) { skipped++; continue; }
    existing.add(hash);
    await prisma.question.create({
      data: {
        examCode: EXAM, sectionCode: SECTION, subject: SUBJECT, topic, difficulty,
        stem, explanation, source: "MANUAL", contentHash: hash, isActive: true,
        options: { create: opts.map((text, i) => ({ text, isCorrect: i === correctIdx, displayOrder: i })) },
      },
    });
    added++;
  }
  const total = await prisma.question.count({ where: { examCode: EXAM, sectionCode: SECTION } });
  console.log(`PYQ Computer Knowledge — added ${added}, skipped ${skipped} (already present).`);
  console.log(`Section "${SECTION}" now has ${total} questions.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
