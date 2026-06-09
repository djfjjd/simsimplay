const heavenlyStems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const earthlyBranches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

function getGanjiIndex(stem, branch) {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) return i;
  }
  return 0;
}

function getGanjiByIndex(index) {
  const normalized = ((index % 60) + 60) % 60;
  return `${heavenlyStems[normalized % 10]}${earthlyBranches[normalized % 12]}`;
}

function daysBetweenUtc(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000);
}

function test(year, month, day) {
  const yearStem = (year - 4 + 10) % 10;
  const yearBranch = (year - 4 + 12) % 12;
  const yearGanjiIndex = getGanjiIndex(yearStem, yearBranch);
  const yearGanji = getGanjiByIndex(yearGanjiIndex);

  const monthStemBase = (yearStem * 2 + 2) % 10;
  const monthStem = (monthStemBase + (month - 2 + 12) % 12) % 10;
  const monthBranch = (2 + (month - 2 + 12) % 12) % 12;
  const monthGanjiIndex = getGanjiIndex(monthStem, monthBranch);
  const monthGanji = getGanjiByIndex(monthGanjiIndex);

  const current = new Date(Date.UTC(year, month - 1, day));
  const base = new Date(Date.UTC(2024, 0, 1));
  const diffDays = daysBetweenUtc(current, base);
  const dayGanjiIndex = ((diffDays % 60) + 60) % 60;
  const dayGanji = getGanjiByIndex(dayGanjiIndex);

  console.log(`${year}.${month}.${day} -> ${yearGanji}년 ${monthGanji}월 ${dayGanji}일`);
}

test(2026, 6, 10);
