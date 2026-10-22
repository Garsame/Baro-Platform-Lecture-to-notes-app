// Static sample shown in the hero card and the sample study pack. It is an
// illustration of the output, not data from any real lecture.
export const sampleTranscript: [string, string][] = [
  ["00:12", "Good morning everyone. Today we start our unit on database systems."],
  ["00:31", "A database is an organized collection of data that we can store, search and update efficiently."],
  ["01:05", "The software that manages a database is called a database management system, or DBMS."],
  ["01:42", "Examples you will meet in this course are MySQL and PostgreSQL."],
  ["02:20", "First, let's separate data from information. Data are raw facts, like a list of numbers."],
];

export const sampleNotes = {
  title: "Casharka 1: Hordhaca Kaydka Xogta (Database Systems)",
  summary:
    "Casharkan wuxuu sharxayaa waxa uu yahay kaydka xogta (database), sida loo maareeyo, iyo farqiga u dhexeeya xogta iyo macluumaadka.",
  detail: [
    "Kaydka xogta waa meel xogta lagu ururiyo si nidaamsan. DBMS-ku wuxuu u oggolaanayaa isticmaalaha inuu xogta ku daro, wax ka beddelo, tirtiro, oo raadiyo.",
  ],
  points: [
    "Kaydka xogta waa xog si habaysan loo kaydiyay oo si fudud loo raadin karo, loona cusbooneysiin karo.",
    "DBMS waa barnaamijka maamula kaydka xogta, sida MySQL iyo PostgreSQL.",
    "Xogtu waa xaqiiqooyin cayriin ah; macluumaadku waa xog la habeeyay oo micno leh.",
    "Kaydka xogta ee xiriirka ah (relational), xogta waxaa lagu kaydiyaa jadwallo ka kooban safaf iyo tiirar.",
  ],
  terms: [
    ["Database", "Kaydka xogta"],
    ["DBMS", "Nidaamka maamulka kaydka xogta"],
    ["Table", "Jadwal"],
    ["Primary key", "Furaha koowaad"],
    ["Query", "Weydiin (su'aal la weydiiyo kaydka)"],
  ] as [string, string][],
};
