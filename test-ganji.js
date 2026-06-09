const heavenlyStems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const earthlyBranches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

function getGanjiByIndex(index) {
  const normalized = ((index % 60) + 60) % 60;
  return `${heavenlyStems[normalized % 10]}${earthlyBranches[normalized % 12]}`;
}

function daysBetweenUtc(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

const targetDate = new Date(Date.UTC(2026, 5, 10)); // 2026.06.10
const baseDate = new Date(Date.UTC(1984, 1, 2));

const baseGap = daysBetweenUtc(targetDate, baseDate);
const dayGanji = getGanjiByIndex(baseGap);

console.log(`Date: 2026.06.10`);
console.log(`baseGap: ${baseGap}`);
console.log(`baseGap % 60: ${baseGap % 60}`);
console.log(`dayGanji: ${dayGanji}`);

// Month and Year
const year = 2026;
const month = 6;
const yearGanji = getGanjiByIndex(year - 1984);
const monthGanji = getGanjiByIndex((year - 1984) * 12 + month + 1);

console.log(`yearGanji: ${yearGanji}`);
console.log(`monthGanji: ${monthGanji}`);
