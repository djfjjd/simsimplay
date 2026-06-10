import { earthlyBranches, getFiveElements, heavenlyStems, type SajuResult } from "./ganji";

export type DaewoonGender = "여성" | "남성";
export type DaewoonDirection = "순행" | "역행";
export type ElementKey = "목" | "화" | "토" | "금" | "수";

export type DaewoonItem = {
  age: number;
  ganji: string;
  keywords: string[];
  description: string;
};

const branchElements: Record<string, ElementKey> = {
  인: "목",
  묘: "목",
  사: "화",
  오: "화",
  진: "토",
  술: "토",
  축: "토",
  미: "토",
  신: "금",
  유: "금",
  자: "수",
  해: "수",
};

const keywordsByElement: Record<ElementKey, string[]> = {
  목: ["성장", "배움", "시작", "확장"],
  화: ["표현", "활력", "인기", "도전"],
  토: ["안정", "현실", "책임", "자산"],
  금: ["정리", "결단", "기술", "규칙"],
  수: ["이동", "감정", "지혜", "휴식"],
};

const descriptionByElement: Record<ElementKey, string> = {
  목: "새로운 배움과 관계 확장이 중요해질 수 있습니다. 시작은 작게 잡고 꾸준히 키우는 방식이 흐름을 안정시킵니다.",
  화: "표현과 도전의 기운이 살아날 수 있습니다. 속도를 올리되 과열되지 않도록 휴식 리듬을 함께 챙기는 것이 좋습니다.",
  토: "현실 감각과 책임이 강조될 수 있습니다. 생활 기반, 자산 관리, 신뢰를 차분히 쌓는 흐름과 잘 맞습니다.",
  금: "정리와 결단이 필요한 시기로 볼 수 있습니다. 기준을 세우고 불필요한 선택지를 줄이면 실속을 챙기기 쉽습니다.",
  수: "이동, 탐색, 회복의 흐름이 커질 수 있습니다. 감정과 체력을 돌보며 깊이 있는 공부나 준비에 시간을 쓰기 좋습니다.",
};

function normalizeElement(value: string): ElementKey {
  return value.slice(0, 1) as ElementKey;
}

function getGanjiByIndex(index: number) {
  const normalized = ((index % 60) + 60) % 60;
  return `${heavenlyStems[normalized % 10]}${earthlyBranches[normalized % 12]}`;
}

function getGanjiIndex(ganji: string) {
  const stem = ganji[0];
  const branch = ganji[1];
  for (let index = 0; index < 60; index += 1) {
    if (heavenlyStems[index % 10] === stem && earthlyBranches[index % 12] === branch) {
      return index;
    }
  }
  return 0;
}

function getGanjiElements(ganji: string): ElementKey[] {
  const stem = ganji[0];
  const branch = ganji[1];
  return [
    normalizeElement(getFiveElements(stem)),
    branchElements[branch] ?? "토",
  ];
}

export function getDaewoonDirection(gender: DaewoonGender, birthYear: number): DaewoonDirection {
  const isYangYear = birthYear % 2 === 0;
  return gender === "남성" ? (isYangYear ? "순행" : "역행") : (isYangYear ? "역행" : "순행");
}

export function getDaewoonStartAge(direction: DaewoonDirection) {
  return direction === "역행" ? 1 : 11;
}

export function calculateDaewoonTimeline(
  saju: SajuResult,
  gender: DaewoonGender,
  birthYear: number,
): DaewoonItem[] {
  const direction = getDaewoonDirection(gender, birthYear);
  const startAge = getDaewoonStartAge(direction);
  const baseIndex = getGanjiIndex(saju.month);
  const step = direction === "순행" ? 1 : -1;

  return Array.from({ length: 8 }, (_, index) => {
    const age = startAge + index * 10;
    const ganji = getGanjiByIndex(baseIndex + step * (index + 1));
    const ganjiElements = getGanjiElements(ganji);
    const keywords = Array.from(
      new Set(ganjiElements.flatMap((element) => keywordsByElement[element])),
    ).slice(0, 3);
    const mainElement = ganjiElements[0];

    return {
      age,
      ganji,
      keywords,
      description: `${descriptionByElement[mainElement]} ${age}세 전후의 큰 흐름을 참고용으로 살펴보세요.`,
    };
  });
}
