export type PsychologyCategory =
  | "stress"
  | "anxiety"
  | "lowMood"
  | "selfEsteem"
  | "sociality"
  | "relationship"
  | "career"
  | "sleepBurnout";

export type PsychologyQuestion = {
  id: string;
  text: string;
  category: PsychologyCategory;
  source: "screening-reference" | "simsimplay";
  reverse?: boolean;
};

export type PsychologyScoreKey =
  | "stress"
  | "anxiety"
  | "lowMood"
  | "selfEsteem"
  | "sociality"
  | "relationship"
  | "career";

export type PsychologyResult = {
  scores: Record<PsychologyScoreKey, number>;
  levels: Record<PsychologyScoreKey, string>;
  dominantSignals: PsychologyScoreKey[];
  strengths: PsychologyScoreKey[];
};

const phqInspiredQuestions: PsychologyQuestion[] = [
  { id: "ref-mood-01", text: "최근 즐겁던 일에도 흥미가 쉽게 생기지 않았다.", category: "lowMood", source: "screening-reference" },
  { id: "ref-mood-02", text: "기분이 가라앉거나 마음이 무거운 시간이 있었다.", category: "lowMood", source: "screening-reference" },
  { id: "ref-mood-03", text: "잠들기 어렵거나, 자주 깨거나, 너무 오래 자는 편이었다.", category: "sleepBurnout", source: "screening-reference" },
  { id: "ref-mood-04", text: "피로감이 크고 에너지가 부족하게 느껴졌다.", category: "stress", source: "screening-reference" },
  { id: "ref-mood-05", text: "식욕이나 식사 리듬이 평소와 달라졌다.", category: "stress", source: "screening-reference" },
  { id: "ref-mood-06", text: "스스로를 좋게 보기 어렵거나 자책하는 생각이 들었다.", category: "selfEsteem", source: "screening-reference", reverse: true },
  { id: "ref-mood-07", text: "일이나 공부에 집중하기 어려웠다.", category: "stress", source: "screening-reference" },
  { id: "ref-mood-08", text: "몸이나 말의 속도가 평소와 다르다고 느꼈다.", category: "stress", source: "screening-reference" },
  { id: "ref-mood-09", text: "힘든 마음을 혼자 감당하기 버겁다고 느낀 적이 있다.", category: "lowMood", source: "screening-reference" },
];

const gadInspiredQuestions: PsychologyQuestion[] = [
  { id: "ref-anx-01", text: "걱정이 쉽게 시작되고 멈추기 어려웠다.", category: "anxiety", source: "screening-reference" },
  { id: "ref-anx-02", text: "긴장하거나 예민해진 상태가 자주 느껴졌다.", category: "anxiety", source: "screening-reference" },
  { id: "ref-anx-03", text: "여러 가지 일이 한꺼번에 걱정되었다.", category: "anxiety", source: "screening-reference" },
  { id: "ref-anx-04", text: "마음을 편하게 내려놓기 어려웠다.", category: "anxiety", source: "screening-reference" },
  { id: "ref-anx-05", text: "가만히 쉬고 있어도 초조함이 남아 있었다.", category: "anxiety", source: "screening-reference" },
  { id: "ref-anx-06", text: "작은 일에도 쉽게 짜증이 올라왔다.", category: "anxiety", source: "screening-reference" },
  { id: "ref-anx-07", text: "좋지 않은 일이 생길 것 같은 예감에 마음이 흔들렸다.", category: "anxiety", source: "screening-reference" },
];

function makeQuestions(prefix: string, category: PsychologyCategory, texts: string[]): PsychologyQuestion[] {
  return texts.map((text, index) => ({
    id: `${prefix}-${String(index + 1).padStart(2, "0")}`,
    text,
    category,
    source: "simsimplay",
  }));
}

export const questionsPool: Record<string, PsychologyQuestion[]> = {
  stress: makeQuestions("stress", "stress", [
    "해야 할 일이 많아도 어디서부터 시작할지 막막했다.",
    "작은 변수에도 하루 전체가 흔들리는 느낌이 들었다.",
    "쉬는 중에도 해야 할 일이 계속 떠올랐다.",
    "마감이나 약속이 가까워지면 몸이 먼저 긴장했다.",
    "평소보다 사소한 일에 압박을 크게 느꼈다.",
    "내가 감당하는 책임이 많다고 느꼈다.",
    "일정을 끝내도 개운함보다 다음 걱정이 먼저 왔다.",
    "주변 기대에 맞추느라 내 속도를 놓친 것 같았다.",
    "해야 하는 일과 하고 싶은 일 사이에서 갈등했다.",
    "최근 집중력이 떨어져 같은 일을 오래 붙잡았다.",
    "몸이 쉬어도 머릿속은 계속 바쁘게 움직였다.",
    "예상치 못한 연락이나 요청이 부담스럽게 느껴졌다.",
    "결정해야 할 일이 쌓이면 피하고 싶어졌다.",
    "감정이 올라온 뒤 진정되는 데 시간이 오래 걸렸다.",
    "하루가 끝나면 긴장이 풀리기보다 더 지치는 편이었다.",
    "내 상황을 설명할 힘이 부족하다고 느꼈다.",
    "작은 실수도 오래 마음에 남았다.",
    "주변의 속도와 내 속도를 자주 비교했다.",
    "휴식 시간을 가져도 죄책감이 들 때가 있었다.",
    "최근 몸의 긴장이나 두통, 소화 불편을 느꼈다.",
  ]),
  selfEsteem: makeQuestions("esteem", "selfEsteem", [
    "나는 실수해도 다시 회복할 수 있다고 느낀다.",
    "내가 가진 장점을 비교적 분명히 알고 있다.",
    "나의 속도와 방식에도 의미가 있다고 생각한다.",
    "어려운 상황에서도 스스로를 완전히 탓하지 않으려 한다.",
    "칭찬을 받으면 어느 정도 받아들일 수 있다.",
    "내 의견이 작더라도 표현할 가치가 있다고 느낀다.",
    "타인의 평가와 내 가치를 구분하려고 한다.",
    "최근 나를 돌보는 선택을 한 적이 있다.",
    "완벽하지 않아도 충분히 해낼 수 있다고 생각한다.",
    "내가 지켜온 노력을 인정할 수 있다.",
    "거절당해도 내 전체가 부정된 것은 아니라고 느낀다.",
    "나에게 맞는 환경을 찾는 일이 중요하다고 생각한다.",
    "비교가 올라와도 내 기준으로 돌아오려 한다.",
    "내 감정을 무시하지 않고 확인하려고 한다.",
    "새로운 일을 배울 능력이 있다고 느낀다.",
    "내가 관계 안에서 존중받을 자격이 있다고 생각한다.",
    "힘든 날에도 나를 조금은 이해하려고 한다.",
    "작은 성취를 기록하거나 기억하는 편이다.",
    "나의 약점만큼 강점도 현실적으로 볼 수 있다.",
    "내 삶의 방향을 조금씩 선택할 수 있다고 느낀다.",
  ]),
  relationship: makeQuestions("rel", "relationship", [
    "가까운 사람에게 내 마음을 설명하기 어렵지 않다.",
    "상대의 기분을 살피느라 내 감정을 뒤로 미룬다.",
    "관계에서 갈등이 생기면 피하고 싶어진다.",
    "내가 원하는 거리감을 비교적 잘 표현한다.",
    "상대의 말 속 의도를 오래 생각하는 편이다.",
    "관계에서 먼저 연락하거나 제안하는 것이 부담스럽다.",
    "내 이야기를 들어주는 사람이 있다고 느낀다.",
    "상대에게 맞추다가 지친 적이 있다.",
    "오해가 생기면 확인하려고 노력한다.",
    "관계에서 인정받고 싶은 마음이 크다.",
    "가까워질수록 실망할까 봐 조심스러워진다.",
    "나는 관계 속에서 경계를 세울 수 있다.",
    "상대의 부탁을 거절하는 것이 어렵다.",
    "대화 후 내가 잘못 말했는지 자주 되짚는다.",
    "관계가 안정되면 일상 에너지도 좋아진다.",
    "내가 불편한 상황을 말로 표현하려고 한다.",
    "서운함을 오래 쌓아두는 편이다.",
    "상대와 다르게 생각해도 관계가 유지될 수 있다고 느낀다.",
    "혼자 있는 시간과 함께 있는 시간의 균형이 필요하다.",
    "최근 관계에서 나를 더 이해하게 된 순간이 있었다.",
  ]),
  sociality: makeQuestions("social", "sociality", [
    "새로운 모임에서도 분위기를 파악하는 편이다.",
    "처음 만난 사람과 대화를 시작하는 것이 어렵지 않다.",
    "여러 사람 앞에서 내 생각을 말할 수 있다.",
    "모임 뒤에는 에너지 회복 시간이 필요하다.",
    "상대의 표정이나 분위기 변화를 잘 알아차린다.",
    "팀 안에서 내가 맡을 역할을 비교적 빨리 찾는다.",
    "낯선 환경에서는 관찰한 뒤 움직이는 편이다.",
    "사람들과 함께할 때 활력이 생긴다.",
    "갈등 상황에서 중간 지점을 찾으려 한다.",
    "나와 다른 성향의 사람도 이해하려고 한다.",
    "대화 주제를 자연스럽게 이어갈 수 있다.",
    "주목받는 상황이 부담스럽게 느껴질 때가 있다.",
    "협업할 때 일정과 기대치를 맞추는 편이다.",
    "필요하면 도움을 요청할 수 있다.",
    "새로운 사람에게 다가가는 속도를 조절한다.",
    "분위기가 어색할 때 작은 말을 건넬 수 있다.",
    "혼자 일할 때보다 함께할 때 더 잘 풀리는 일이 있다.",
    "내가 속한 모임에서 책임감을 느끼는 편이다.",
    "타인의 반응을 지나치게 의식할 때가 있다.",
    "사회적 상황에서 나만의 회복 루틴이 필요하다.",
  ]),
  career: makeQuestions("career", "career", [
    "나는 목표가 분명할수록 에너지가 잘 난다.",
    "반복적인 일보다 변화가 있는 일이 잘 맞는다.",
    "안정적인 구조가 있을 때 실력이 잘 발휘된다.",
    "사람을 돕거나 조율하는 일에서 의미를 느낀다.",
    "분석하고 정리하는 과정이 비교적 편하다.",
    "새로운 아이디어를 제안하는 일이 즐겁다.",
    "정해진 기준과 절차가 있으면 안심된다.",
    "성과가 숫자나 결과로 보일 때 동기부여가 된다.",
    "혼자 깊이 몰입하는 시간이 필요하다.",
    "협업과 소통이 많은 환경에서도 역할을 찾을 수 있다.",
    "불확실한 상황에서도 시도해보는 편이다.",
    "장기적인 성장 가능성을 중요하게 본다.",
    "현재 하는 일이 내 성향과 맞는지 자주 점검한다.",
    "일에서 인정받고 싶은 마음이 있다.",
    "세부 사항을 놓치지 않으려는 편이다.",
    "빠른 실행보다 충분한 준비가 먼저 필요하다.",
    "사람들의 반응을 읽어 방향을 조정할 수 있다.",
    "경제적 안정과 일의 의미 사이에서 균형을 찾고 싶다.",
    "나만의 전문성을 쌓고 싶다는 욕구가 있다.",
    "일이 많아도 우선순위를 세우면 움직일 수 있다.",
  ]),
  sleepBurnout: makeQuestions("burnout", "sleepBurnout", [
    "자고 일어나도 몸이 무겁게 느껴졌다.",
    "잠들기 전 생각이 많아지는 편이다.",
    "해야 할 일을 떠올리면 쉬는 시간이 끊긴다.",
    "최근 하고 싶은 일에 대한 의욕이 줄었다.",
    "작은 일도 시작하기까지 시간이 오래 걸렸다.",
    "휴대폰이나 화면을 보다가 수면 시간이 늦어진다.",
    "주말이나 쉬는 날에도 회복이 충분하지 않았다.",
    "감정적으로 소진되어 대화가 부담스러웠다.",
    "일상 루틴이 자주 밀리거나 깨졌다.",
    "내 몸이 보내는 피로 신호를 늦게 알아차린다.",
    "쉬어야 한다는 것을 알면서도 멈추기 어렵다.",
    "최근 즐거운 일도 의무처럼 느껴진 적이 있다.",
    "하루 중 멍해지는 시간이 늘었다.",
    "내가 해내는 양보다 소모되는 에너지가 크다.",
    "잠을 자도 마음의 긴장이 남아 있다.",
    "일정이 비면 오히려 불안해질 때가 있다.",
    "최근 나를 위한 시간이 부족했다.",
    "감각이 예민해져 소음이나 연락이 부담스럽다.",
    "회복을 위해 생활 리듬을 다시 잡고 싶다.",
    "작은 루틴부터 다시 시작하는 것이 필요하다고 느낀다.",
  ]),
};

export const answerOptions = [
  { label: "매우 그렇다", value: 5 },
  { label: "그렇다", value: 4 },
  { label: "보통이다", value: 3 },
  { label: "아니다", value: 2 },
  { label: "전혀 아니다", value: 1 },
] as const;

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function createPsychologySessionQuestions(): PsychologyQuestion[] {
  const baseQuestions = Object.values(questionsPool).flatMap((pool) => shuffle(pool).slice(0, 5));
  const baseIds = new Set(baseQuestions.map((question) => question.id));
  const remainingQuestions = Object.values(questionsPool)
    .flat()
    .filter((question) => !baseIds.has(question.id));
  const customQuestions = [...baseQuestions, ...shuffle(remainingQuestions).slice(0, 4)];
  return shuffle([...phqInspiredQuestions, ...gadInspiredQuestions, ...customQuestions]);
}

function levelFor(score: number) {
  if (score <= 20) return "낮음";
  if (score <= 40) return "약간 낮음";
  if (score <= 60) return "보통";
  if (score <= 80) return "높음";
  return "매우 높음";
}

function averageToScore(values: number[]) {
  if (values.length === 0) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(((average - 1) / 4) * 100);
}

export function calculatePsychologyResult(
  questions: PsychologyQuestion[],
  answers: Record<string, number>,
): PsychologyResult {
  const grouped: Record<PsychologyScoreKey, number[]> = {
    stress: [],
    anxiety: [],
    lowMood: [],
    selfEsteem: [],
    sociality: [],
    relationship: [],
    career: [],
  };

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (!answer) return;
    const value = question.reverse ? 6 - answer : answer;
    if (question.category === "sleepBurnout") {
      grouped.stress.push(value);
      return;
    }
    if (question.category in grouped) {
      grouped[question.category as PsychologyScoreKey].push(value);
    }
  });

  const scores = Object.fromEntries(
    Object.entries(grouped).map(([key, values]) => [key, averageToScore(values)]),
  ) as Record<PsychologyScoreKey, number>;

  const levels = Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, levelFor(value)]),
  ) as Record<PsychologyScoreKey, string>;

  const dominantSignals = (["stress", "anxiety", "lowMood"] as PsychologyScoreKey[])
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 2);
  const strengths = (["selfEsteem", "sociality", "relationship", "career"] as PsychologyScoreKey[])
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 2);

  return { scores, levels, dominantSignals, strengths };
}
