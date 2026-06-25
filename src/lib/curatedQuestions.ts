// Free, hand-written, factually-verified question bank for the subjects that
// can't be generated procedurally (General Knowledge, General Studies, English).
// These require no API key and are shared across all exams that use the subject.
// The procedural generators (generators.ts) cover Maths/Reasoning at scale.

export interface BankQ {
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  stem: string;
  options: string[];
  correct: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// General Knowledge / General Awareness (History, Geography, Polity, Economy,
// Science, Static GK, Sports, Awards) — used by SSC & RRB General Awareness.
// ---------------------------------------------------------------------------
export const GK_BANK: BankQ[] = [
  // --- History ---
  { topic: "History", difficulty: "EASY", stem: "Who was the first Prime Minister of India?", options: ["Sardar Patel", "Jawaharlal Nehru", "Rajendra Prasad", "B. R. Ambedkar"], correct: "Jawaharlal Nehru", explanation: "Jawaharlal Nehru served as India's first Prime Minister from 1947 to 1964." },
  { topic: "History", difficulty: "EASY", stem: "The Quit India Movement was launched in which year?", options: ["1930", "1942", "1945", "1947"], correct: "1942", explanation: "The Quit India Movement began on 8 August 1942." },
  { topic: "History", difficulty: "MEDIUM", stem: "Who is known as the 'Iron Man of India'?", options: ["Bhagat Singh", "Sardar Vallabhbhai Patel", "Subhas Chandra Bose", "Lal Bahadur Shastri"], correct: "Sardar Vallabhbhai Patel", explanation: "Sardar Patel earned the title for integrating princely states into India." },
  { topic: "History", difficulty: "MEDIUM", stem: "The Battle of Plassey was fought in:", options: ["1757", "1764", "1857", "1739"], correct: "1757", explanation: "The Battle of Plassey (1757) established British dominance in Bengal." },
  { topic: "History", difficulty: "MEDIUM", stem: "Who founded the Indian National Congress in 1885?", options: ["Dadabhai Naoroji", "A. O. Hume", "Gopal Krishna Gokhale", "W. C. Bonnerjee"], correct: "A. O. Hume", explanation: "Allan Octavian Hume founded the INC in 1885." },
  { topic: "History", difficulty: "MEDIUM", stem: "The first Battle of Panipat (1526) was fought between Babur and:", options: ["Rana Sanga", "Ibrahim Lodi", "Hemu", "Sher Shah Suri"], correct: "Ibrahim Lodi", explanation: "Babur defeated Ibrahim Lodi, founding the Mughal Empire." },
  { topic: "History", difficulty: "HARD", stem: "Who started the newspaper 'Kesari'?", options: ["Bal Gangadhar Tilak", "Mahatma Gandhi", "Bipin Chandra Pal", "Lala Lajpat Rai"], correct: "Bal Gangadhar Tilak", explanation: "Tilak started 'Kesari' (Marathi) in 1881." },
  { topic: "History", difficulty: "EASY", stem: "Who gave the slogan 'Do or Die'?", options: ["Subhas Chandra Bose", "Mahatma Gandhi", "Bhagat Singh", "Jawaharlal Nehru"], correct: "Mahatma Gandhi", explanation: "Gandhi gave the slogan during the Quit India Movement (1942)." },
  { topic: "History", difficulty: "MEDIUM", stem: "The Jallianwala Bagh massacre occurred in which city?", options: ["Lahore", "Amritsar", "Delhi", "Jallandhar"], correct: "Amritsar", explanation: "It took place on 13 April 1919 in Amritsar, Punjab." },
  { topic: "History", difficulty: "HARD", stem: "Who was the last Mughal Emperor?", options: ["Aurangzeb", "Bahadur Shah Zafar", "Akbar II", "Shah Alam II"], correct: "Bahadur Shah Zafar", explanation: "Bahadur Shah Zafar II was the last Mughal emperor, exiled in 1858." },

  // --- Geography ---
  { topic: "Geography", difficulty: "EASY", stem: "Which is the largest ocean in the world?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: "Pacific", explanation: "The Pacific Ocean is the largest and deepest ocean." },
  { topic: "Geography", difficulty: "EASY", stem: "Which is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: "Canberra", explanation: "Canberra is the capital city of Australia." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "The Sundarbans delta is formed by which rivers?", options: ["Ganga & Brahmaputra", "Godavari & Krishna", "Narmada & Tapi", "Mahanadi & Son"], correct: "Ganga & Brahmaputra", explanation: "The Sundarbans is formed by the Ganga, Brahmaputra and Meghna rivers." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "Which strait separates Asia from North America?", options: ["Palk Strait", "Bering Strait", "Strait of Malacca", "Strait of Gibraltar"], correct: "Bering Strait", explanation: "The Bering Strait separates Asia (Russia) and North America (Alaska)." },
  { topic: "Geography", difficulty: "EASY", stem: "Mount Everest lies in which mountain range?", options: ["Andes", "Himalayas", "Alps", "Rockies"], correct: "Himalayas", explanation: "Mount Everest, the highest peak, is in the Himalayas." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "Which is the smallest state in India by area?", options: ["Sikkim", "Goa", "Tripura", "Nagaland"], correct: "Goa", explanation: "Goa is the smallest Indian state by area." },
  { topic: "Geography", difficulty: "HARD", stem: "The Deccan Plateau is primarily made of which rock?", options: ["Granite", "Basalt", "Limestone", "Sandstone"], correct: "Basalt", explanation: "The Deccan Traps are formed of basaltic lava rock." },
  { topic: "Geography", difficulty: "EASY", stem: "Which river is known as the 'Sorrow of Bihar'?", options: ["Kosi", "Damodar", "Yamuna", "Son"], correct: "Kosi", explanation: "The Kosi river is called the 'Sorrow of Bihar' due to frequent floods." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "Which is the highest waterfall in India?", options: ["Jog Falls", "Kunchikal Falls", "Dudhsagar Falls", "Athirappilly Falls"], correct: "Kunchikal Falls", explanation: "Kunchikal Falls in Karnataka is the highest waterfall in India." },
  { topic: "Geography", difficulty: "EASY", stem: "The Tropic of Cancer passes through how many Indian states?", options: ["6", "8", "10", "5"], correct: "8", explanation: "It passes through 8 states including Gujarat, Rajasthan and Jharkhand." },

  // --- Polity ---
  { topic: "Polity", difficulty: "EASY", stem: "Who is called the 'Father of the Indian Constitution'?", options: ["Mahatma Gandhi", "B. R. Ambedkar", "Jawaharlal Nehru", "Rajendra Prasad"], correct: "B. R. Ambedkar", explanation: "Dr. B. R. Ambedkar chaired the drafting committee of the Constitution." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "How many schedules are there in the Indian Constitution?", options: ["10", "12", "8", "14"], correct: "12", explanation: "The Constitution currently has 12 schedules." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "The Right to Education was added by which amendment?", options: ["86th Amendment", "73rd Amendment", "42nd Amendment", "44th Amendment"], correct: "86th Amendment", explanation: "The 86th Amendment (2002) added Article 21A (Right to Education)." },
  { topic: "Polity", difficulty: "EASY", stem: "Who appoints the Prime Minister of India?", options: ["Lok Sabha", "President", "Chief Justice", "Vice President"], correct: "President", explanation: "The President appoints the leader of the majority party as PM." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "The Directive Principles of State Policy are borrowed from which country?", options: ["USA", "Ireland", "UK", "Canada"], correct: "Ireland", explanation: "The DPSP were inspired by the Irish Constitution." },
  { topic: "Polity", difficulty: "HARD", stem: "Which Article deals with the Emergency due to failure of constitutional machinery in a state?", options: ["Article 352", "Article 356", "Article 360", "Article 370"], correct: "Article 356", explanation: "Article 356 deals with President's Rule in states." },
  { topic: "Polity", difficulty: "EASY", stem: "The minimum age to become President of India is:", options: ["25 years", "30 years", "35 years", "40 years"], correct: "35 years", explanation: "A person must be at least 35 years old to be President." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "How many members are nominated to the Lok Sabha by the President?", options: ["12", "2", "0", "10"], correct: "0", explanation: "After the 104th Amendment, the President nominates no members to the Lok Sabha (Anglo-Indian nomination ended in 2020)." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "Which is the highest court in India?", options: ["High Court", "Supreme Court", "District Court", "Tribunal"], correct: "Supreme Court", explanation: "The Supreme Court of India is the apex judicial body." },
  { topic: "Polity", difficulty: "HARD", stem: "The concept of 'Single Citizenship' in India is borrowed from:", options: ["USA", "UK", "Australia", "Canada"], correct: "UK", explanation: "Single citizenship was borrowed from the British Constitution." },

  // --- Economy ---
  { topic: "Economy", difficulty: "EASY", stem: "What does GDP stand for?", options: ["Gross Domestic Product", "General Domestic Product", "Gross Development Plan", "Government Domestic Policy"], correct: "Gross Domestic Product", explanation: "GDP measures the total value of goods and services produced in a country." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "Who is known as the 'Father of Economics'?", options: ["Karl Marx", "Adam Smith", "J. M. Keynes", "David Ricardo"], correct: "Adam Smith", explanation: "Adam Smith is regarded as the father of modern economics." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "The headquarters of the Reserve Bank of India is in:", options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], correct: "Mumbai", explanation: "The RBI is headquartered in Mumbai." },
  { topic: "Economy", difficulty: "EASY", stem: "Which is the apex bank for agricultural credit in India?", options: ["RBI", "NABARD", "SBI", "SIDBI"], correct: "NABARD", explanation: "NABARD is the apex development bank for agriculture and rural development." },
  { topic: "Economy", difficulty: "HARD", stem: "The term 'Repo Rate' refers to the rate at which:", options: ["Banks lend to the public", "RBI lends to commercial banks", "Banks borrow from each other", "Government borrows from RBI"], correct: "RBI lends to commercial banks", explanation: "Repo rate is the rate at which the RBI lends to commercial banks against securities." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "GST was implemented in India on:", options: ["1 July 2017", "1 April 2016", "15 August 2017", "26 January 2018"], correct: "1 July 2017", explanation: "The Goods and Services Tax came into effect on 1 July 2017." },
  { topic: "Economy", difficulty: "EASY", stem: "In which year was the RBI nationalized?", options: ["1935", "1949", "1947", "1969"], correct: "1949", explanation: "The RBI, established in 1935, was nationalized in 1949." },

  // --- Science ---
  { topic: "Science", difficulty: "EASY", stem: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correct: "Mitochondria", explanation: "Mitochondria produce energy (ATP) and are called the cell's powerhouse." },
  { topic: "Science", difficulty: "EASY", stem: "Which planet is known as the 'Red Planet'?", options: ["Venus", "Mars", "Jupiter", "Mercury"], correct: "Mars", explanation: "Mars appears red due to iron oxide on its surface." },
  { topic: "Science", difficulty: "MEDIUM", stem: "The chemical formula of common salt is:", options: ["NaCl", "KCl", "CaCO3", "NaOH"], correct: "NaCl", explanation: "Common salt is sodium chloride (NaCl)." },
  { topic: "Science", difficulty: "MEDIUM", stem: "Which gas is most abundant in the Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"], correct: "Nitrogen", explanation: "Nitrogen makes up about 78% of the atmosphere." },
  { topic: "Science", difficulty: "EASY", stem: "How many bones are there in the adult human body?", options: ["206", "201", "210", "196"], correct: "206", explanation: "An adult human body has 206 bones." },
  { topic: "Science", difficulty: "MEDIUM", stem: "Which vitamin is known as ascorbic acid?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], correct: "Vitamin C", explanation: "Vitamin C is chemically ascorbic acid." },
  { topic: "Science", difficulty: "HARD", stem: "The speed of light in vacuum is approximately:", options: ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^5 m/s", "3 × 10^10 m/s"], correct: "3 × 10^8 m/s", explanation: "Light travels at about 3 × 10^8 metres per second in vacuum." },
  { topic: "Science", difficulty: "EASY", stem: "Which organ purifies blood in the human body?", options: ["Heart", "Liver", "Kidney", "Lungs"], correct: "Kidney", explanation: "The kidneys filter waste and purify the blood." },
  { topic: "Science", difficulty: "MEDIUM", stem: "The unit of electric resistance is:", options: ["Ampere", "Volt", "Ohm", "Watt"], correct: "Ohm", explanation: "Electrical resistance is measured in ohms (Ω)." },
  { topic: "Science", difficulty: "HARD", stem: "Which scientist proposed the theory of relativity?", options: ["Isaac Newton", "Albert Einstein", "Galileo", "Niels Bohr"], correct: "Albert Einstein", explanation: "Albert Einstein proposed the theories of special and general relativity." },

  // --- Static GK / Misc ---
  { topic: "Static GK", difficulty: "EASY", stem: "Which is the national flower of India?", options: ["Rose", "Lotus", "Sunflower", "Marigold"], correct: "Lotus", explanation: "The Lotus is the national flower of India." },
  { topic: "Static GK", difficulty: "EASY", stem: "The currency of Japan is the:", options: ["Yuan", "Won", "Yen", "Ringgit"], correct: "Yen", explanation: "The Japanese currency is the Yen." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: "Nile", explanation: "The Nile is generally regarded as the longest river in the world." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "The headquarters of the United Nations is in:", options: ["Geneva", "New York", "Paris", "Vienna"], correct: "New York", explanation: "The UN headquarters is in New York City, USA." },
  { topic: "Static GK", difficulty: "EASY", stem: "Which festival is known as the 'Festival of Lights'?", options: ["Holi", "Diwali", "Eid", "Onam"], correct: "Diwali", explanation: "Diwali is celebrated as the festival of lights." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "The 'Sun Temple' is located at:", options: ["Khajuraho", "Konark", "Hampi", "Madurai"], correct: "Konark", explanation: "The Sun Temple is at Konark, Odisha." },
  { topic: "Static GK", difficulty: "HARD", stem: "Who was the first woman President of India?", options: ["Indira Gandhi", "Pratibha Patil", "Sarojini Naidu", "Droupadi Murmu"], correct: "Pratibha Patil", explanation: "Pratibha Patil was India's first woman President (2007–2012)." },
  { topic: "Sports", difficulty: "EASY", stem: "How many players are there in a cricket team?", options: ["9", "10", "11", "12"], correct: "11", explanation: "A cricket team has 11 players on the field." },
  { topic: "Sports", difficulty: "MEDIUM", stem: "The term 'Bull's Eye' is associated with which sport?", options: ["Archery", "Boxing", "Chess", "Swimming"], correct: "Archery", explanation: "'Bull's Eye' refers to the centre of the target in archery (and shooting/darts)." },
  { topic: "Awards", difficulty: "MEDIUM", stem: "The Nobel Prize is NOT awarded in which field?", options: ["Physics", "Mathematics", "Chemistry", "Literature"], correct: "Mathematics", explanation: "There is no Nobel Prize in Mathematics." },
  { topic: "Static GK", difficulty: "EASY", stem: "Which is the largest planet in the solar system?", options: ["Saturn", "Jupiter", "Neptune", "Earth"], correct: "Jupiter", explanation: "Jupiter is the largest planet in the solar system." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "The Taj Mahal was built by which Mughal emperor?", options: ["Akbar", "Shah Jahan", "Aurangzeb", "Humayun"], correct: "Shah Jahan", explanation: "Shah Jahan built the Taj Mahal in memory of Mumtaz Mahal." },
  { topic: "Static GK", difficulty: "EASY", stem: "Which animal is the national aquatic animal of India?", options: ["Dolphin", "Whale", "Turtle", "Crocodile"], correct: "Dolphin", explanation: "The Ganges River Dolphin is India's national aquatic animal." },

  // --- Additional verified GK (high-yield SSC) ---
  { topic: "History", difficulty: "MEDIUM", stem: "Who was the first woman ruler of the Delhi Sultanate?", options: ["Chand Bibi", "Razia Sultana", "Nur Jahan", "Rani Durgavati"], correct: "Razia Sultana", explanation: "Razia Sultana (1236–1240) was the first and only woman to rule the Delhi Sultanate." },
  { topic: "History", difficulty: "MEDIUM", stem: "Who wrote the ancient treatise 'Arthashastra'?", options: ["Kalidasa", "Chanakya (Kautilya)", "Banabhatta", "Vishakhadatta"], correct: "Chanakya (Kautilya)", explanation: "The Arthashastra on statecraft and economics was written by Chanakya (Kautilya)." },
  { topic: "History", difficulty: "MEDIUM", stem: "Who is known as the 'Napoleon of India'?", options: ["Chandragupta Maurya", "Samudragupta", "Ashoka", "Harsha"], correct: "Samudragupta", explanation: "Samudragupta is called the 'Napoleon of India' for his military conquests." },
  { topic: "History", difficulty: "EASY", stem: "The Salt Satyagraha (Dandi March) was launched in which year?", options: ["1919", "1930", "1942", "1928"], correct: "1930", explanation: "Gandhi's Dandi March began on 12 March 1930." },
  { topic: "Polity", difficulty: "EASY", stem: "A Money Bill can be introduced only in which house?", options: ["Rajya Sabha", "Lok Sabha", "Either house", "Joint session"], correct: "Lok Sabha", explanation: "A Money Bill can be introduced only in the Lok Sabha (Article 110)." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "What is the term of a member of the Rajya Sabha?", options: ["4 years", "5 years", "6 years", "2 years"], correct: "6 years", explanation: "Rajya Sabha members serve a six-year term, with one-third retiring every two years." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "Which Part of the Constitution deals with Fundamental Rights?", options: ["Part II", "Part III", "Part IV", "Part V"], correct: "Part III", explanation: "Fundamental Rights are enshrined in Part III (Articles 12–35)." },
  { topic: "Polity", difficulty: "HARD", stem: "How many Articles were there in the original Constitution of India (1950)?", options: ["395", "448", "370", "356"], correct: "395", explanation: "The original Constitution had 395 Articles, 22 Parts and 8 Schedules." },
  { topic: "Geography", difficulty: "EASY", stem: "Which is the largest desert in India?", options: ["Thar", "Rann of Kutch", "Ladakh", "Spiti"], correct: "Thar", explanation: "The Thar Desert in Rajasthan is the largest desert in India." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "The Standard Meridian of India (82°30'E) passes through which city?", options: ["Allahabad (Prayagraj)", "Mirzapur", "Nagpur", "Bhopal"], correct: "Mirzapur", explanation: "India's Standard Meridian (82.5°E) passes near Mirzapur, Uttar Pradesh." },
  { topic: "Geography", difficulty: "MEDIUM", stem: "Which soil is most suitable for cotton cultivation?", options: ["Alluvial soil", "Black soil (Regur)", "Red soil", "Laterite soil"], correct: "Black soil (Regur)", explanation: "Black (Regur) soil retains moisture and is ideal for cotton." },
  { topic: "Geography", difficulty: "HARD", stem: "What is the southernmost point of the Indian territory?", options: ["Kanyakumari", "Indira Point", "Point Calimere", "Cape Comorin"], correct: "Indira Point", explanation: "Indira Point in the Andaman & Nicobar Islands is India's southernmost point." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "Which institution regulates the stock market in India?", options: ["RBI", "SEBI", "NABARD", "IRDAI"], correct: "SEBI", explanation: "The Securities and Exchange Board of India (SEBI) regulates the stock market." },
  { topic: "Economy", difficulty: "EASY", stem: "The first Five-Year Plan of India was launched in which year?", options: ["1947", "1950", "1951", "1956"], correct: "1951", explanation: "The First Five-Year Plan ran from 1951 to 1956." },
  { topic: "Economy", difficulty: "MEDIUM", stem: "The 'Blue Revolution' in India is associated with:", options: ["Milk production", "Fish production", "Foodgrain production", "Oilseed production"], correct: "Fish production", explanation: "The Blue Revolution refers to the development of fisheries and aquaculture." },
  { topic: "Economy", difficulty: "EASY", stem: "The 'White Revolution' in India is related to:", options: ["Wheat", "Milk", "Cotton", "Sugar"], correct: "Milk", explanation: "The White Revolution (Operation Flood) boosted milk production." },
  { topic: "Science", difficulty: "EASY", stem: "Which is the hardest natural substance known?", options: ["Gold", "Iron", "Diamond", "Platinum"], correct: "Diamond", explanation: "Diamond is the hardest naturally occurring substance." },
  { topic: "Science", difficulty: "MEDIUM", stem: "Deficiency of which vitamin causes night blindness?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin K"], correct: "Vitamin A", explanation: "Vitamin A deficiency causes night blindness." },
  { topic: "Science", difficulty: "MEDIUM", stem: "What is the pH value of pure water at 25°C?", options: ["0", "7", "14", "5"], correct: "7", explanation: "Pure water is neutral with a pH of 7." },
  { topic: "Science", difficulty: "HARD", stem: "Which is the smallest bone in the human body?", options: ["Stapes", "Femur", "Radius", "Phalanges"], correct: "Stapes", explanation: "The stapes, in the middle ear, is the smallest bone in the human body." },
  { topic: "Science", difficulty: "MEDIUM", stem: "The study of fungi is called:", options: ["Mycology", "Virology", "Phycology", "Entomology"], correct: "Mycology", explanation: "Mycology is the branch of biology dealing with fungi." },
  { topic: "Science", difficulty: "EASY", stem: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], correct: "Mercury", explanation: "Mercury is the planet nearest to the Sun." },
  { topic: "Static GK", difficulty: "EASY", stem: "What is the national song of India?", options: ["Jana Gana Mana", "Vande Mataram", "Saare Jahan Se Achha", "Sare Jahan"], correct: "Vande Mataram", explanation: "'Vande Mataram', written by Bankim Chandra Chatterjee, is the national song." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "Who wrote India's national anthem 'Jana Gana Mana'?", options: ["Bankim Chandra Chatterjee", "Rabindranath Tagore", "Sarojini Naidu", "Muhammad Iqbal"], correct: "Rabindranath Tagore", explanation: "Rabindranath Tagore wrote and composed 'Jana Gana Mana'." },
  { topic: "Static GK", difficulty: "EASY", stem: "The headquarters of the World Health Organization (WHO) is in:", options: ["New York", "Geneva", "Paris", "Rome"], correct: "Geneva", explanation: "The WHO is headquartered in Geneva, Switzerland." },
  { topic: "Static GK", difficulty: "MEDIUM", stem: "'Wings of Fire' is the autobiography of which personality?", options: ["A. P. J. Abdul Kalam", "Jawaharlal Nehru", "Mahatma Gandhi", "Vikram Sarabhai"], correct: "A. P. J. Abdul Kalam", explanation: "'Wings of Fire' is the autobiography of Dr. A. P. J. Abdul Kalam." },
  { topic: "Sports", difficulty: "EASY", stem: "After how many years are the Summer Olympic Games held?", options: ["2", "3", "4", "5"], correct: "4", explanation: "The Summer Olympic Games are held once every four years." },
  { topic: "Sports", difficulty: "MEDIUM", stem: "The 'Dronacharya Award' in India is given to:", options: ["Players", "Coaches", "Umpires", "Sports journalists"], correct: "Coaches", explanation: "The Dronacharya Award honours outstanding sports coaches." },
  { topic: "Polity", difficulty: "MEDIUM", stem: "Who was the first woman Prime Minister of India?", options: ["Sarojini Naidu", "Indira Gandhi", "Pratibha Patil", "Sucheta Kripalani"], correct: "Indira Gandhi", explanation: "Indira Gandhi was India's first (and so far only) woman Prime Minister." },
  { topic: "History", difficulty: "MEDIUM", stem: "Which Mughal emperor built the Red Fort (Lal Qila) in Delhi?", options: ["Akbar", "Shah Jahan", "Aurangzeb", "Jahangir"], correct: "Shah Jahan", explanation: "Shah Jahan built the Red Fort when he shifted the capital to Shahjahanabad (Delhi)." },
];


// ---------------------------------------------------------------------------
// General Studies (UPSC Prelims) — deeper Polity/Economy/Environment/History.
// Combined with GK_BANK to give UPSC GS a 100+ question non-repeating pool.
// ---------------------------------------------------------------------------
export const GS_BANK: BankQ[] = [
  { topic: "Indian Polity & Governance", difficulty: "HARD", stem: "Which writ is issued to produce a detained person before a court?", options: ["Mandamus", "Habeas Corpus", "Quo Warranto", "Certiorari"], correct: "Habeas Corpus", explanation: "Habeas Corpus orders that a detained person be brought before the court." },
  { topic: "Indian Polity & Governance", difficulty: "HARD", stem: "The Fundamental Duties were added to the Constitution on the recommendation of which committee?", options: ["Sarkaria Commission", "Swaran Singh Committee", "Balwant Rai Mehta Committee", "Kothari Commission"], correct: "Swaran Singh Committee", explanation: "The Swaran Singh Committee recommended Fundamental Duties, added by the 42nd Amendment." },
  { topic: "Indian Polity & Governance", difficulty: "MEDIUM", stem: "Who is the ex-officio Chairman of the Rajya Sabha?", options: ["President", "Vice President", "Prime Minister", "Speaker"], correct: "Vice President", explanation: "The Vice President of India is the ex-officio Chairman of the Rajya Sabha." },
  { topic: "Economic & Social Development", difficulty: "HARD", stem: "The 'Human Development Index' is published by:", options: ["World Bank", "UNDP", "IMF", "WTO"], correct: "UNDP", explanation: "The HDI is published annually by the UN Development Programme (UNDP)." },
  { topic: "Economic & Social Development", difficulty: "MEDIUM", stem: "MGNREGA guarantees how many days of employment per household per year?", options: ["50", "100", "150", "200"], correct: "100", explanation: "MGNREGA guarantees 100 days of wage employment per rural household per year." },
  { topic: "Environmental Ecology", difficulty: "HARD", stem: "The Kyoto Protocol is associated with:", options: ["Ozone depletion", "Greenhouse gas reduction", "Biodiversity", "Desertification"], correct: "Greenhouse gas reduction", explanation: "The Kyoto Protocol commits parties to reduce greenhouse gas emissions." },
  { topic: "Environmental Ecology", difficulty: "MEDIUM", stem: "Project Tiger was launched in India in which year?", options: ["1973", "1982", "1991", "1969"], correct: "1973", explanation: "Project Tiger was launched in 1973 to protect Bengal tigers." },
  { topic: "Environmental Ecology", difficulty: "MEDIUM", stem: "Which of these is a 'greenhouse gas'?", options: ["Nitrogen", "Oxygen", "Methane", "Argon"], correct: "Methane", explanation: "Methane (CH₄) is a potent greenhouse gas." },
  { topic: "History of India", difficulty: "HARD", stem: "The Harappan Civilization is also known as:", options: ["Vedic Civilization", "Indus Valley Civilization", "Mauryan Civilization", "Gupta Civilization"], correct: "Indus Valley Civilization", explanation: "The Harappan/Indus Valley Civilization flourished around 2500 BCE." },
  { topic: "History of India", difficulty: "MEDIUM", stem: "Which ruler is associated with the Edicts inscribed on pillars and rocks?", options: ["Chandragupta Maurya", "Ashoka", "Samudragupta", "Harsha"], correct: "Ashoka", explanation: "Emperor Ashoka inscribed his edicts on pillars and rocks across his empire." },
  { topic: "General Science", difficulty: "MEDIUM", stem: "Photosynthesis mainly takes place in which part of the plant?", options: ["Roots", "Stem", "Leaves", "Flowers"], correct: "Leaves", explanation: "Leaves contain chloroplasts where photosynthesis occurs." },
  { topic: "General Science", difficulty: "HARD", stem: "Which blood group is the universal donor?", options: ["A", "B", "AB", "O negative"], correct: "O negative", explanation: "O negative blood is the universal donor." },
  { topic: "Indian & World Geography", difficulty: "MEDIUM", stem: "The Western Ghats run parallel to which coast of India?", options: ["Eastern", "Western", "Northern", "Southern"], correct: "Western", explanation: "The Western Ghats run along India's western coast." },
  { topic: "Indian & World Geography", difficulty: "HARD", stem: "Which country has the largest area in the world?", options: ["Canada", "China", "Russia", "USA"], correct: "Russia", explanation: "Russia is the largest country by land area." },
  { topic: "Current Events", difficulty: "MEDIUM", stem: "ISRO's Chandrayaan missions are aimed at exploring the:", options: ["Sun", "Mars", "Moon", "Venus"], correct: "Moon", explanation: "The Chandrayaan series of missions explore the Moon." },
  { topic: "Indian Polity & Governance", difficulty: "MEDIUM", stem: "How many fundamental duties are listed in the Constitution?", options: ["10", "11", "9", "12"], correct: "11", explanation: "There are 11 Fundamental Duties (the 11th added by the 86th Amendment)." },
  { topic: "Economic & Social Development", difficulty: "HARD", stem: "The first Five-Year Plan of India was based on which model?", options: ["Mahalanobis model", "Harrod-Domar model", "Gandhian model", "Wage-goods model"], correct: "Harrod-Domar model", explanation: "The First Five-Year Plan (1951–56) was based on the Harrod-Domar model." },
  { topic: "Indian Polity & Governance", difficulty: "HARD", stem: "The Comptroller and Auditor General of India is appointed by:", options: ["Parliament", "President", "Prime Minister", "Supreme Court"], correct: "President", explanation: "The CAG is appointed by the President of India." },
];

// ---------------------------------------------------------------------------
// English — Synonyms, Antonyms, Idioms, One-word substitution, Error spotting,
// Fill in the blanks, Sentence improvement.
// ---------------------------------------------------------------------------
export const ENGLISH_BANK: BankQ[] = [
  // Synonyms
  { topic: "Synonyms", difficulty: "EASY", stem: "Choose the synonym of 'HAPPY'.", options: ["Sad", "Joyful", "Angry", "Tired"], correct: "Joyful", explanation: "'Happy' means feeling pleasure — joyful." },
  { topic: "Synonyms", difficulty: "EASY", stem: "Choose the synonym of 'BRAVE'.", options: ["Cowardly", "Courageous", "Weak", "Lazy"], correct: "Courageous", explanation: "'Brave' means having courage — courageous." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'DILIGENT'.", options: ["Careless", "Hardworking", "Slow", "Rude"], correct: "Hardworking", explanation: "'Diligent' means showing careful, persistent effort — hardworking." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'LUCID'.", options: ["Clear", "Confusing", "Dark", "Heavy"], correct: "Clear", explanation: "'Lucid' means easy to understand — clear." },
  { topic: "Synonyms", difficulty: "HARD", stem: "Choose the synonym of 'EPHEMERAL'.", options: ["Permanent", "Short-lived", "Strong", "Ancient"], correct: "Short-lived", explanation: "'Ephemeral' means lasting a very short time." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'OBSTINATE'.", options: ["Flexible", "Stubborn", "Gentle", "Honest"], correct: "Stubborn", explanation: "'Obstinate' means refusing to change — stubborn." },
  // Antonyms
  { topic: "Antonyms", difficulty: "EASY", stem: "Choose the antonym of 'ANCIENT'.", options: ["Old", "Modern", "Historic", "Aged"], correct: "Modern", explanation: "The opposite of 'ancient' is modern." },
  { topic: "Antonyms", difficulty: "EASY", stem: "Choose the antonym of 'VICTORY'.", options: ["Win", "Success", "Defeat", "Triumph"], correct: "Defeat", explanation: "The opposite of 'victory' is defeat." },
  { topic: "Antonyms", difficulty: "MEDIUM", stem: "Choose the antonym of 'GENEROUS'.", options: ["Kind", "Stingy", "Giving", "Warm"], correct: "Stingy", explanation: "The opposite of 'generous' is stingy." },
  { topic: "Antonyms", difficulty: "MEDIUM", stem: "Choose the antonym of 'HUMBLE'.", options: ["Modest", "Arrogant", "Shy", "Polite"], correct: "Arrogant", explanation: "The opposite of 'humble' is arrogant." },
  { topic: "Antonyms", difficulty: "HARD", stem: "Choose the antonym of 'FRUGAL'.", options: ["Thrifty", "Extravagant", "Careful", "Economical"], correct: "Extravagant", explanation: "'Frugal' means economical; its opposite is extravagant." },
  // Idioms
  { topic: "Idioms", difficulty: "MEDIUM", stem: "The idiom 'a piece of cake' means:", options: ["Very difficult", "Very easy", "Delicious food", "A small portion"], correct: "Very easy", explanation: "'A piece of cake' means something very easy to do." },
  { topic: "Idioms", difficulty: "MEDIUM", stem: "The idiom 'once in a blue moon' means:", options: ["Very often", "Never", "Very rarely", "At night"], correct: "Very rarely", explanation: "'Once in a blue moon' means very rarely." },
  { topic: "Idioms", difficulty: "HARD", stem: "The idiom 'to let the cat out of the bag' means:", options: ["To buy a pet", "To reveal a secret", "To make a mistake", "To run away"], correct: "To reveal a secret", explanation: "It means to accidentally reveal a secret." },
  { topic: "Idioms", difficulty: "MEDIUM", stem: "The idiom 'break the ice' means:", options: ["To start a conversation", "To break something", "To feel cold", "To win"], correct: "To start a conversation", explanation: "'Break the ice' means to initiate conversation in a social setting." },
  { topic: "Idioms", difficulty: "HARD", stem: "The idiom 'burn the midnight oil' means:", options: ["To waste money", "To work late at night", "To start a fire", "To sleep early"], correct: "To work late at night", explanation: "It means to study or work late into the night." },
  // One-word substitution
  { topic: "One Word Substitution", difficulty: "MEDIUM", stem: "One who cannot read or write is:", options: ["Literate", "Illiterate", "Scholar", "Novice"], correct: "Illiterate", explanation: "An illiterate person cannot read or write." },
  { topic: "One Word Substitution", difficulty: "MEDIUM", stem: "A place where birds are kept is an:", options: ["Aquarium", "Aviary", "Apiary", "Sanctuary"], correct: "Aviary", explanation: "An aviary is a large enclosure for birds." },
  { topic: "One Word Substitution", difficulty: "HARD", stem: "One who studies the weather is a:", options: ["Geologist", "Meteorologist", "Astronomer", "Botanist"], correct: "Meteorologist", explanation: "A meteorologist studies the weather and atmosphere." },
  { topic: "One Word Substitution", difficulty: "MEDIUM", stem: "A government by the people is called:", options: ["Monarchy", "Democracy", "Autocracy", "Oligarchy"], correct: "Democracy", explanation: "Democracy is government by the people." },
  { topic: "One Word Substitution", difficulty: "HARD", stem: "A medicine that kills germs is a/an:", options: ["Antiseptic", "Anaesthetic", "Antibiotic", "Antidote"], correct: "Antiseptic", explanation: "An antiseptic destroys germs/microbes." },
  // Error spotting
  { topic: "Error Spotting", difficulty: "MEDIUM", stem: "Spot the error: 'One of my friend is a doctor.'", options: ["One of", "my friend", "is", "a doctor"], correct: "my friend", explanation: "'One of' is followed by a plural noun: 'one of my friends'." },
  { topic: "Error Spotting", difficulty: "MEDIUM", stem: "Spot the error: 'She can sings very well.'", options: ["She", "can sings", "very", "well"], correct: "can sings", explanation: "After a modal verb 'can', use the base form: 'can sing'." },
  { topic: "Error Spotting", difficulty: "HARD", stem: "Spot the error: 'The news are very good today.'", options: ["The news", "are", "very good", "today"], correct: "are", explanation: "'News' is uncountable and singular: 'The news is...'." },
  // Fill in the blanks
  { topic: "Fill in the Blanks", difficulty: "EASY", stem: "He has been working here ____ 2010.", options: ["for", "since", "from", "at"], correct: "since", explanation: "'Since' is used with a point in time (2010)." },
  { topic: "Fill in the Blanks", difficulty: "MEDIUM", stem: "She is good ____ mathematics.", options: ["in", "at", "on", "with"], correct: "at", explanation: "'Good at' is the correct collocation for skills/subjects." },
  { topic: "Fill in the Blanks", difficulty: "MEDIUM", stem: "Please distinguish ____ right and wrong.", options: ["between", "among", "from", "with"], correct: "between", explanation: "Use 'between' when referring to two things." },
  // Sentence improvement
  { topic: "Sentence Improvement", difficulty: "MEDIUM", stem: "Improve: 'I have went to the market.'", options: ["have gone", "have go", "had went", "No improvement"], correct: "have gone", explanation: "The past participle of 'go' is 'gone': 'I have gone'." },
  { topic: "Sentence Improvement", difficulty: "MEDIUM", stem: "Improve: 'He is more cleverer than his brother.'", options: ["more clever", "cleverer", "most clever", "No improvement"], correct: "cleverer", explanation: "Avoid double comparatives; 'cleverer' is correct." },

  // --- Additional Synonyms ---
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'ABANDON'.", options: ["Keep", "Forsake", "Build", "Gather"], correct: "Forsake", explanation: "'Abandon' means to give up or desert — forsake." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'BENEVOLENT'.", options: ["Cruel", "Kind", "Greedy", "Harsh"], correct: "Kind", explanation: "'Benevolent' means well-meaning and kindly." },
  { topic: "Synonyms", difficulty: "HARD", stem: "Choose the synonym of 'GREGARIOUS'.", options: ["Sociable", "Solitary", "Selfish", "Silent"], correct: "Sociable", explanation: "'Gregarious' means fond of company — sociable." },
  { topic: "Synonyms", difficulty: "HARD", stem: "Choose the synonym of 'METICULOUS'.", options: ["Careless", "Precise", "Lazy", "Vague"], correct: "Precise", explanation: "'Meticulous' means very careful and precise." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'VIVID'.", options: ["Dull", "Bright", "Faint", "Pale"], correct: "Bright", explanation: "'Vivid' means producing strong, clear images — bright." },
  { topic: "Synonyms", difficulty: "MEDIUM", stem: "Choose the synonym of 'WEARY'.", options: ["Energetic", "Tired", "Happy", "Strong"], correct: "Tired", explanation: "'Weary' means feeling very tired." },

  // --- Additional Antonyms ---
  { topic: "Antonyms", difficulty: "MEDIUM", stem: "Choose the antonym of 'ABUNDANT'.", options: ["Plentiful", "Scarce", "Ample", "Full"], correct: "Scarce", explanation: "'Abundant' means plentiful; its opposite is scarce." },
  { topic: "Antonyms", difficulty: "MEDIUM", stem: "Choose the antonym of 'CONDEMN'.", options: ["Blame", "Praise", "Punish", "Accuse"], correct: "Praise", explanation: "'Condemn' means to criticise strongly; its opposite is praise." },
  { topic: "Antonyms", difficulty: "HARD", stem: "Choose the antonym of 'TRANSPARENT'.", options: ["Clear", "Opaque", "Plain", "Visible"], correct: "Opaque", explanation: "'Transparent' means see-through; its opposite is opaque." },
  { topic: "Antonyms", difficulty: "MEDIUM", stem: "Choose the antonym of 'OPTIMIST'.", options: ["Dreamer", "Pessimist", "Realist", "Believer"], correct: "Pessimist", explanation: "An optimist expects good; a pessimist expects bad." },
  { topic: "Antonyms", difficulty: "HARD", stem: "Choose the antonym of 'BARREN'.", options: ["Fertile", "Empty", "Dry", "Bare"], correct: "Fertile", explanation: "'Barren' means unproductive; its opposite is fertile." },

  // --- Additional Idioms ---
  { topic: "Idioms", difficulty: "MEDIUM", stem: "The idiom 'to hit the nail on the head' means:", options: ["To injure oneself", "To do exactly the right thing", "To build something", "To make noise"], correct: "To do exactly the right thing", explanation: "It means to describe or do something exactly right." },
  { topic: "Idioms", difficulty: "HARD", stem: "The idiom 'to cost an arm and a leg' means:", options: ["To be injured", "To be very expensive", "To work hard", "To be cheap"], correct: "To be very expensive", explanation: "Something that 'costs an arm and a leg' is extremely expensive." },
  { topic: "Idioms", difficulty: "MEDIUM", stem: "The idiom 'under the weather' means:", options: ["Feeling unwell", "Caught in rain", "Very happy", "Outdoors"], correct: "Feeling unwell", explanation: "'Under the weather' means feeling slightly ill." },
  { topic: "Idioms", difficulty: "HARD", stem: "The idiom 'a blessing in disguise' means:", options: ["A hidden curse", "A good thing that seemed bad at first", "A religious gift", "A costume"], correct: "A good thing that seemed bad at first", explanation: "It refers to something good that initially appeared bad." },

  // --- Additional One-word substitution ---
  { topic: "One Word Substitution", difficulty: "MEDIUM", stem: "One who loves books is a:", options: ["Bibliophile", "Philatelist", "Numismatist", "Connoisseur"], correct: "Bibliophile", explanation: "A bibliophile is a lover or collector of books." },
  { topic: "One Word Substitution", difficulty: "HARD", stem: "One who collects coins is a:", options: ["Philatelist", "Numismatist", "Bibliophile", "Archivist"], correct: "Numismatist", explanation: "A numismatist studies or collects coins and currency." },
  { topic: "One Word Substitution", difficulty: "MEDIUM", stem: "A speech made without preparation is:", options: ["Eloquent", "Extempore", "Verbose", "Rhetoric"], correct: "Extempore", explanation: "An 'extempore' speech is delivered without prior preparation." },
  { topic: "One Word Substitution", difficulty: "HARD", stem: "A person who does not believe in the existence of God is an:", options: ["Atheist", "Theist", "Agnostic", "Heretic"], correct: "Atheist", explanation: "An atheist disbelieves in the existence of God." },

  // --- Additional Error spotting ---
  { topic: "Error Spotting", difficulty: "MEDIUM", stem: "Spot the error: 'Each of the boys have a pen.'", options: ["Each of", "the boys", "have", "a pen"], correct: "have", explanation: "'Each' is singular, so it should be 'has a pen'." },
  { topic: "Error Spotting", difficulty: "HARD", stem: "Spot the error: 'He is taller than me.'", options: ["He is", "taller", "than", "me"], correct: "me", explanation: "In formal usage the comparison takes the nominative: 'taller than I (am)'." },
  { topic: "Error Spotting", difficulty: "MEDIUM", stem: "Spot the error: 'I am working here since 2015.'", options: ["I am working", "here", "since", "2015"], correct: "I am working", explanation: "With 'since', use the present perfect continuous: 'I have been working'." },

  // --- Additional Fill in the blanks ---
  { topic: "Fill in the Blanks", difficulty: "MEDIUM", stem: "He is married ____ a doctor.", options: ["with", "to", "of", "by"], correct: "to", explanation: "'Married to' is the correct collocation." },
  { topic: "Fill in the Blanks", difficulty: "EASY", stem: "The train is ____ time today.", options: ["in", "on", "at", "by"], correct: "on", explanation: "'On time' means punctual." },
  { topic: "Fill in the Blanks", difficulty: "MEDIUM", stem: "She insisted ____ paying the bill.", options: ["on", "in", "at", "for"], correct: "on", explanation: "'Insist on' is the correct phrasal usage." },

  // --- Additional Sentence improvement ---
  { topic: "Sentence Improvement", difficulty: "MEDIUM", stem: "Improve: 'He did not knew the answer.'", options: ["did not know", "do not know", "did not known", "No improvement"], correct: "did not know", explanation: "After 'did', use the base form: 'did not know'." },
  { topic: "Sentence Improvement", difficulty: "HARD", stem: "Improve: 'The teacher gave a lecture on the importance of discipline.'", options: ["about importance of", "on the importance of", "for the importance of", "No improvement"], correct: "No improvement", explanation: "'A lecture on the importance of' is already correct." },
  { topic: "Active/Passive", difficulty: "MEDIUM", stem: "Change to passive: 'She writes a letter.'", options: ["A letter is written by her", "A letter was written by her", "A letter writes by her", "A letter has written by her"], correct: "A letter is written by her", explanation: "Simple present passive: 'is written by her'." },
];

// Extra spelling words to enlarge the English spelling generator (free).
export const SPELLING_EXTRA: { correct: string; wrong: [string, string, string] }[] = [
  { correct: "Calendar", wrong: ["Calender", "Calandar", "Calander"] },
  { correct: "Cemetery", wrong: ["Cemetary", "Cemetry", "Semetery"] },
  { correct: "Committee", wrong: ["Comittee", "Commitee", "Committe"] },
  { correct: "Discipline", wrong: ["Disipline", "Dicipline", "Disciplin"] },
  { correct: "Embarrassment", wrong: ["Embarassment", "Embarrasment", "Embarasment"] },
  { correct: "Foreign", wrong: ["Foriegn", "Forein", "Foregin"] },
  { correct: "Guarantee", wrong: ["Garantee", "Guarentee", "Guranttee"] },
  { correct: "Harassment", wrong: ["Harrassment", "Harasment", "Harrasment"] },
  { correct: "Independent", wrong: ["Independant", "Independnt", "Indipendent"] },
  { correct: "Knowledge", wrong: ["Knowlege", "Knowladge", "Knoledge"] },
  { correct: "Mischievous", wrong: ["Mischievious", "Mischevous", "Mischivous"] },
  { correct: "Occasion", wrong: ["Ocassion", "Occassion", "Ocasion"] },
  { correct: "Parliament", wrong: ["Parliment", "Parlaiment", "Parliamment"] },
  { correct: "Receipt", wrong: ["Reciept", "Receit", "Recipt"] },
  { correct: "Restaurant", wrong: ["Restaurent", "Resturant", "Restraunt"] },
  { correct: "Tomorrow", wrong: ["Tommorow", "Tomorow", "Tommorrow"] },
  { correct: "Vacuum", wrong: ["Vaccum", "Vacume", "Vaccuum"] },
  { correct: "Wednesday", wrong: ["Wensday", "Wednsday", "Wednesdy"] },
  { correct: "Beautiful", wrong: ["Beutiful", "Beautifull", "Beautful"] },
  { correct: "Curiosity", wrong: ["Curiousity", "Curiosty", "Curriosity"] },
];

// ---------------------------------------------------------------------------
// Computer Knowledge (SSC CGL Tier 2 has a Computer Knowledge module).
// ---------------------------------------------------------------------------
export const COMPUTER_BANK: BankQ[] = [
  { topic: "Computer Basics", difficulty: "EASY", stem: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Control Processing Unit"], correct: "Central Processing Unit", explanation: "CPU = Central Processing Unit, the brain of the computer." },
  { topic: "Computer Basics", difficulty: "EASY", stem: "Which of these is an input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correct: "Keyboard", explanation: "A keyboard is used to input data into the computer." },
  { topic: "Computer Basics", difficulty: "EASY", stem: "1 Kilobyte (KB) is equal to:", options: ["1000 bytes", "1024 bytes", "1024 bits", "100 bytes"], correct: "1024 bytes", explanation: "1 KB = 1024 bytes (2^10)." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "Which memory is volatile?", options: ["ROM", "RAM", "Hard Disk", "Flash Drive"], correct: "RAM", explanation: "RAM is volatile — its contents are lost when power is off." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "Which of these is system software?", options: ["MS Word", "Operating System", "Photoshop", "VLC Player"], correct: "Operating System", explanation: "An operating system is system software that manages hardware and software." },
  { topic: "Hardware & Software", difficulty: "EASY", stem: "Which one is an output device?", options: ["Mouse", "Scanner", "Printer", "Joystick"], correct: "Printer", explanation: "A printer outputs data (printed documents)." },
  { topic: "Hardware & Software", difficulty: "MEDIUM", stem: "The brain of the computer is the:", options: ["RAM", "CPU", "Hard Disk", "Monitor"], correct: "CPU", explanation: "The CPU executes instructions and is called the brain of the computer." },
  { topic: "Hardware & Software", difficulty: "HARD", stem: "ALU, part of the CPU, stands for:", options: ["Arithmetic Logic Unit", "Algorithm Logic Unit", "Arithmetic Local Unit", "Advanced Logic Unit"], correct: "Arithmetic Logic Unit", explanation: "ALU = Arithmetic Logic Unit; it performs arithmetic and logical operations." },
  { topic: "MS Office", difficulty: "EASY", stem: "Which key combination is used to copy in MS Word?", options: ["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + P"], correct: "Ctrl + C", explanation: "Ctrl + C copies the selected content." },
  { topic: "MS Office", difficulty: "EASY", stem: "The shortcut to paste is:", options: ["Ctrl + V", "Ctrl + C", "Ctrl + Z", "Ctrl + B"], correct: "Ctrl + V", explanation: "Ctrl + V pastes copied/cut content." },
  { topic: "MS Office", difficulty: "MEDIUM", stem: "In MS Excel, a single box formed by the intersection of a row and column is a:", options: ["Cell", "Range", "Table", "Field"], correct: "Cell", explanation: "A cell is the intersection of a row and a column in a spreadsheet." },
  { topic: "MS Office", difficulty: "MEDIUM", stem: "Which file extension is used by MS Word documents (modern)?", options: [".xlsx", ".docx", ".pptx", ".txt"], correct: ".docx", explanation: "Modern Word documents use the .docx extension." },
  { topic: "MS Office", difficulty: "HARD", stem: "In MS Excel, which symbol begins a formula?", options: ["+", "=", "@", "#"], correct: "=", explanation: "Formulas in Excel begin with the equals sign (=)." },
  { topic: "Internet", difficulty: "EASY", stem: "WWW stands for:", options: ["World Wide Web", "World Web Wide", "Web World Wide", "Wide World Web"], correct: "World Wide Web", explanation: "WWW = World Wide Web." },
  { topic: "Internet", difficulty: "EASY", stem: "Which of these is a web browser?", options: ["Google Chrome", "MS Word", "Windows", "Linux"], correct: "Google Chrome", explanation: "Google Chrome is a web browser." },
  { topic: "Internet", difficulty: "MEDIUM", stem: "HTTP stands for:", options: ["HyperText Transfer Protocol", "HyperText Transmission Protocol", "HighText Transfer Protocol", "HyperTransfer Text Protocol"], correct: "HyperText Transfer Protocol", explanation: "HTTP = HyperText Transfer Protocol." },
  { topic: "Internet", difficulty: "MEDIUM", stem: "An email address must contain which symbol?", options: ["#", "@", "&", "*"], correct: "@", explanation: "Every email address contains the @ symbol." },
  { topic: "Networking", difficulty: "MEDIUM", stem: "LAN stands for:", options: ["Local Area Network", "Large Area Network", "Local Access Network", "Linked Area Network"], correct: "Local Area Network", explanation: "LAN = Local Area Network." },
  { topic: "Networking", difficulty: "HARD", stem: "Which device connects different networks together?", options: ["Hub", "Switch", "Router", "Repeater"], correct: "Router", explanation: "A router routes data between different networks." },
  { topic: "Networking", difficulty: "HARD", stem: "IP address stands for:", options: ["Internet Protocol address", "Internal Protocol address", "Internet Program address", "Interlinked Protocol address"], correct: "Internet Protocol address", explanation: "IP = Internet Protocol address, identifying a device on a network." },
  { topic: "Security", difficulty: "EASY", stem: "Software that protects against viruses is called:", options: ["Antivirus", "Spyware", "Malware", "Firewall driver"], correct: "Antivirus", explanation: "Antivirus software detects and removes viruses." },
  { topic: "Security", difficulty: "MEDIUM", stem: "A malicious program that replicates itself is a:", options: ["Firewall", "Virus", "Compiler", "Driver"], correct: "Virus", explanation: "A computer virus replicates itself and spreads to other files/systems." },
  { topic: "Security", difficulty: "MEDIUM", stem: "A firewall is used to:", options: ["Cool the CPU", "Block unauthorized network access", "Increase RAM", "Speed up the internet"], correct: "Block unauthorized network access", explanation: "A firewall monitors and controls network traffic to block unauthorized access." },
  { topic: "Computer Basics", difficulty: "HARD", stem: "Which number system does a computer use internally?", options: ["Decimal", "Binary", "Octal", "Hexadecimal"], correct: "Binary", explanation: "Computers use the binary number system (0s and 1s)." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "Which of the following is the smallest unit of data?", options: ["Byte", "Bit", "Nibble", "Word"], correct: "Bit", explanation: "A bit (binary digit) is the smallest unit of data." },
  { topic: "Hardware & Software", difficulty: "EASY", stem: "Which is a pointing device?", options: ["Keyboard", "Mouse", "Speaker", "Printer"], correct: "Mouse", explanation: "A mouse is a pointing input device." },
  { topic: "MS Office", difficulty: "MEDIUM", stem: "Which MS Office program is used to create presentations?", options: ["Excel", "Word", "PowerPoint", "Access"], correct: "PowerPoint", explanation: "MS PowerPoint is used for creating slide presentations." },
  { topic: "Computer Basics", difficulty: "EASY", stem: "Which of these stores data permanently?", options: ["RAM", "Cache", "Hard Disk", "Register"], correct: "Hard Disk", explanation: "A hard disk stores data permanently (non-volatile)." },
  { topic: "Internet", difficulty: "HARD", stem: "URL stands for:", options: ["Uniform Resource Locator", "Universal Resource Link", "Uniform Reference Locator", "Universal Reference Locator"], correct: "Uniform Resource Locator", explanation: "URL = Uniform Resource Locator, the address of a web resource." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "GUI stands for:", options: ["Graphical User Interface", "General User Interface", "Graphical Unified Interface", "Global User Interface"], correct: "Graphical User Interface", explanation: "GUI = Graphical User Interface." },

  // --- Additional verified Computer Knowledge ---
  { topic: "Computer Basics", difficulty: "EASY", stem: "ROM stands for:", options: ["Read Only Memory", "Random Output Memory", "Read Output Memory", "Run Only Memory"], correct: "Read Only Memory", explanation: "ROM = Read Only Memory; non-volatile memory that stores firmware." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "Which of the following is the correct ascending order of memory units?", options: ["KB < MB < GB < TB", "MB < KB < GB < TB", "KB < GB < MB < TB", "TB < GB < MB < KB"], correct: "KB < MB < GB < TB", explanation: "1 KB < 1 MB < 1 GB < 1 TB in increasing size." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "1 byte consists of how many bits?", options: ["4", "8", "16", "32"], correct: "8", explanation: "1 byte = 8 bits." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "ASCII stands for:", options: ["American Standard Code for Information Interchange", "American System Code for Internet Interchange", "Advanced Standard Code for Information Interchange", "American Standard Computer for Information Interchange"], correct: "American Standard Code for Information Interchange", explanation: "ASCII = American Standard Code for Information Interchange." },
  { topic: "Computer Basics", difficulty: "HARD", stem: "BIOS stands for:", options: ["Basic Input Output System", "Binary Input Output System", "Basic Internal Output System", "Basic Input Operating System"], correct: "Basic Input Output System", explanation: "BIOS = Basic Input/Output System; it initializes hardware at startup." },
  { topic: "Hardware & Software", difficulty: "MEDIUM", stem: "Which of the following is NOT an operating system?", options: ["Windows", "Linux", "Oracle", "macOS"], correct: "Oracle", explanation: "Oracle is a database management system, not an operating system." },
  { topic: "Hardware & Software", difficulty: "MEDIUM", stem: "A program that converts the entire high-level source code into machine code at once is a:", options: ["Interpreter", "Compiler", "Assembler", "Linker"], correct: "Compiler", explanation: "A compiler translates the whole source program into machine code in one go." },
  { topic: "Hardware & Software", difficulty: "HARD", stem: "Which language does a computer's processor directly understand?", options: ["High-level language", "Assembly language", "Machine language", "Natural language"], correct: "Machine language", explanation: "The CPU directly understands machine language (binary)." },
  { topic: "Hardware & Software", difficulty: "MEDIUM", stem: "Cache memory is located between the CPU and:", options: ["Hard Disk", "Main Memory (RAM)", "Monitor", "Keyboard"], correct: "Main Memory (RAM)", explanation: "Cache is fast memory between the CPU and RAM to speed up access." },
  { topic: "Computer Generations", difficulty: "MEDIUM", stem: "Which component was used in first-generation computers?", options: ["Transistors", "Vacuum Tubes", "Integrated Circuits", "Microprocessors"], correct: "Vacuum Tubes", explanation: "First-generation computers used vacuum tubes." },
  { topic: "Computer Generations", difficulty: "HARD", stem: "Second-generation computers were based on which technology?", options: ["Vacuum Tubes", "Transistors", "Integrated Circuits", "VLSI"], correct: "Transistors", explanation: "Second-generation computers used transistors." },
  { topic: "MS Office", difficulty: "EASY", stem: "The keyboard shortcut to cut selected content is:", options: ["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + Z"], correct: "Ctrl + X", explanation: "Ctrl + X cuts the selected content." },
  { topic: "MS Office", difficulty: "EASY", stem: "Which shortcut is used to undo the last action?", options: ["Ctrl + Y", "Ctrl + Z", "Ctrl + U", "Ctrl + R"], correct: "Ctrl + Z", explanation: "Ctrl + Z undoes the last action." },
  { topic: "MS Office", difficulty: "MEDIUM", stem: "The default file extension of an MS Excel workbook (modern) is:", options: [".docx", ".xlsx", ".pptx", ".accdb"], correct: ".xlsx", explanation: "Modern Excel workbooks use the .xlsx extension." },
  { topic: "MS Office", difficulty: "MEDIUM", stem: "In MS Excel, which function adds a range of numbers?", options: ["AVERAGE", "SUM", "COUNT", "MAX"], correct: "SUM", explanation: "The SUM function adds the values in a range." },
  { topic: "MS Office", difficulty: "HARD", stem: "In MS Word, which shortcut makes selected text bold?", options: ["Ctrl + B", "Ctrl + I", "Ctrl + U", "Ctrl + D"], correct: "Ctrl + B", explanation: "Ctrl + B applies bold formatting." },
  { topic: "Internet", difficulty: "EASY", stem: "Which of the following is a search engine?", options: ["Google", "Windows", "Excel", "Oracle"], correct: "Google", explanation: "Google is a web search engine." },
  { topic: "Internet", difficulty: "MEDIUM", stem: "HTML stands for:", options: ["HyperText Markup Language", "HighText Markup Language", "HyperText Making Language", "HyperTransfer Markup Language"], correct: "HyperText Markup Language", explanation: "HTML = HyperText Markup Language, used to build web pages." },
  { topic: "Internet", difficulty: "MEDIUM", stem: "What does 'www' refer to in a web address?", options: ["A protocol", "World Wide Web", "A search engine", "A web browser"], correct: "World Wide Web", explanation: "'www' denotes the World Wide Web." },
  { topic: "Internet", difficulty: "HARD", stem: "Which protocol is used to send email?", options: ["SMTP", "FTP", "HTTP", "TCP"], correct: "SMTP", explanation: "SMTP (Simple Mail Transfer Protocol) is used to send email." },
  { topic: "Networking", difficulty: "MEDIUM", stem: "WAN stands for:", options: ["Wide Area Network", "Wireless Area Network", "Wide Access Network", "Web Area Network"], correct: "Wide Area Network", explanation: "WAN = Wide Area Network, spanning large geographic areas." },
  { topic: "Networking", difficulty: "HARD", stem: "How many bits are there in an IPv4 address?", options: ["16", "32", "64", "128"], correct: "32", explanation: "An IPv4 address is 32 bits long." },
  { topic: "File Management", difficulty: "EASY", stem: "Which file extension is used for a Portable Document Format file?", options: [".pdf", ".txt", ".doc", ".png"], correct: ".pdf", explanation: ".pdf is the extension for Portable Document Format files." },
  { topic: "File Management", difficulty: "MEDIUM", stem: "Which of the following is an image file format?", options: [".mp3", ".jpeg", ".docx", ".exe"], correct: ".jpeg", explanation: ".jpeg (JPG) is a common image file format." },
  { topic: "Security", difficulty: "MEDIUM", stem: "A program that appears useful but harms the system is called a:", options: ["Trojan Horse", "Compiler", "Cookie", "Cache"], correct: "Trojan Horse", explanation: "A Trojan Horse disguises itself as legitimate software while causing harm." },
  { topic: "Security", difficulty: "HARD", stem: "Unsolicited bulk email is commonly known as:", options: ["Spam", "Phishing", "Cookie", "Cache"], correct: "Spam", explanation: "Spam refers to unsolicited bulk email messages." },
  { topic: "Computer Basics", difficulty: "MEDIUM", stem: "USB stands for:", options: ["Universal Serial Bus", "Universal System Bus", "Unified Serial Bus", "Universal Storage Bus"], correct: "Universal Serial Bus", explanation: "USB = Universal Serial Bus." },
  { topic: "Computer Basics", difficulty: "HARD", stem: "Which of the following is an example of an optical storage device?", options: ["Hard Disk", "DVD", "RAM", "SSD"], correct: "DVD", explanation: "A DVD is an optical storage medium read by laser." },
  { topic: "Hardware & Software", difficulty: "MEDIUM", stem: "The physical components of a computer are collectively called:", options: ["Software", "Hardware", "Firmware", "Malware"], correct: "Hardware", explanation: "Hardware refers to the tangible physical parts of a computer." },
  { topic: "Computer Basics", difficulty: "EASY", stem: "Which of the following is a volatile memory?", options: ["ROM", "RAM", "DVD", "Hard Disk"], correct: "RAM", explanation: "RAM loses its contents when the power is turned off (volatile)." },
];

