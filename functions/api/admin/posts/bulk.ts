import { ensureAdminSchema, ensureUniquePostSlug } from "../_schema";

interface Env {
  DB: D1Database;
}

type PostStatus = "draft" | "published";

const BLOG_CATEGORIES = [
  "꿈해몽",
  "심리테스트",
  "심리상담",
  "운세",
  "사주오행",
  "수면",
  "불안",
  "우울",
  "집중",
  "음악치유",
];

const dreamSymbols = [
  "불안이 쌓인 마음",
  "변화를 앞둔 생활 리듬",
  "관계에서 느끼는 긴장",
  "책임감과 부담",
  "새로운 선택을 앞둔 기대",
  "회복이 필요한 몸과 마음",
  "감춰 둔 욕구와 소망",
  "정리되지 않은 감정",
];

const relatedDreams = [
  "물에 빠지는 꿈 해몽",
  "누군가에게 쫓기는 꿈 해몽",
  "집이 무너지는 꿈 해몽",
  "돈을 줍는 꿈 해몽",
  "이가 빠지는 꿈 해몽",
  "높은 곳에서 떨어지는 꿈 해몽",
  "고양이가 나오는 꿈 해몽",
  "돌아가신 가족이 나오는 꿈 해몽",
];

function getCategoryFromTitle(title: string): string {
  if (title.includes("꿈") || title.includes("해몽")) return "꿈해몽";
  if (title.includes("테스트") || title.includes("자가진단") || title.includes("성향")) return "심리테스트";
  if (["불안", "우울", "무기력", "퇴사", "걱정", "자존감", "관계"].some((keyword) => title.includes(keyword))) {
    return "심리상담";
  }
  if (["사주", "오행", "운세", "대운", "재물운", "연애운"].some((keyword) => title.includes(keyword))) {
    return title.includes("오행") ? "사주오행" : "운세";
  }
  if (["수면", "잠", "불면"].some((keyword) => title.includes(keyword))) return "수면";
  if (["집중", "공부", "업무"].some((keyword) => title.includes(keyword))) return "집중";
  return BLOG_CATEGORIES.includes("심리상담") ? "심리상담" : "꿈해몽";
}

function hashText(text: string) {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, " ");
}

function asDreamTitle(title: string) {
  return title.includes("꿈") ? title : `${title} 꿈`;
}

function makeRelatedLinks(title: string, seed: number) {
  const links = relatedDreams
    .filter((item) => item !== title)
    .sort((left, right) => (hashText(`${title}-${left}`) % 17) - (hashText(`${title}-${right}`) % 17))
    .slice(0, 4);

  return links
    .map((item) => `- ${item}: 비슷한 감정 흐름과 상징을 비교해 보면 현재 고민의 방향을 더 선명하게 볼 수 있습니다.`)
    .concat(`- ${pick(["감정일기 쓰는 법", "불안할 때 마음 정리하는 법", "잠들기 전 생각이 많을 때", "자존감이 낮아질 때 회복 루틴"], seed, 2)}: 꿈 해석 이후 실제 생활에서 적용할 수 있는 셀프케어 글입니다.`)
    .join("\n");
}

function generateDreamContent(title: string, category: string): string {
  const cleanTitle = normalizeTitle(title);
  const dreamTitle = asDreamTitle(cleanTitle);
  const seed = hashText(cleanTitle);
  const coreSymbol = pick(dreamSymbols, seed);
  const secondarySymbol = pick(dreamSymbols, seed, 3);
  const relationship = pick(["가족", "연인", "친구", "직장 동료", "낯선 사람"], seed, 2);
  const place = pick(["집", "학교나 회사", "길거리", "물가", "낯선 공간"], seed, 4);
  const emotion = pick(["불안", "기대", "당황스러움", "안도감", "답답함"], seed, 5);

  return `
## 1. 서론

${dreamTitle}은 단순히 이상한 장면 하나로 끝나는 꿈이 아니라, 현재 마음이 어떤 방향으로 움직이고 있는지 보여 주는 상징으로 볼 수 있습니다. 꿈해몽에서 가장 중요한 것은 장면 자체보다 그 장면을 꾸는 동안 느꼈던 감정, 꿈에서 깬 뒤 남은 여운, 그리고 최근 현실에서 반복되고 있는 고민입니다. 같은 ${dreamTitle}이라도 어떤 사람에게는 좋은 변화의 신호가 되고, 어떤 사람에게는 피로와 압박을 알려 주는 경고처럼 느껴질 수 있습니다.

SimSimPlay에서는 꿈을 무조건 미래 예언으로 단정하지 않습니다. 꿈은 무의식이 정리하지 못한 감정과 기억을 이미지로 엮어 보여 주는 과정에 가깝습니다. 따라서 이 글에서는 ${cleanTitle}의 기본 의미, 상황별 해석, 심리학적 관점, 길몽과 흉몽의 기준을 함께 살펴봅니다. 읽으면서 "내가 꿈에서 가장 강하게 느낀 감정은 무엇이었는가", "최근 현실에서 이 장면과 닮은 압박이 있었는가"를 함께 떠올려 보면 해석의 정확도가 높아집니다.

## 2. 기본 의미

${cleanTitle}의 핵심 상징은 ${coreSymbol}입니다. 꿈속 장면이 선명했다면 현재 생활에서 특정한 문제를 오래 붙잡고 있거나, 마음 한쪽에서 결정을 미루고 있을 가능성이 있습니다. 특히 꿈에서 장면이 반복되거나 깨어난 뒤에도 감정이 오래 남았다면 그 꿈은 단순한 기억 조각보다 심리적 신호에 가깝게 볼 수 있습니다.

전통적인 꿈해몽에서는 꿈의 분위기와 결말을 중요하게 봅니다. 꿈의 끝이 편안하거나 무언가 정리되는 느낌이었다면 현실에서도 문제가 풀릴 실마리를 찾는 흐름으로 해석할 수 있습니다. 반대로 꿈이 갑자기 끊기거나 불쾌감이 강하게 남았다면 아직 마음속 긴장이 충분히 풀리지 않았다는 의미가 될 수 있습니다. 여기서 중요한 점은 꿈을 좋다, 나쁘다로 급하게 나누기보다 현재 나의 생활 리듬을 점검하는 것입니다.

${cleanTitle}은 또한 ${secondarySymbol}과도 연결됩니다. 최근 책임이 늘었거나, 관계에서 눈치를 많이 봤거나, 앞으로의 선택 때문에 머릿속이 복잡했다면 이런 상징이 꿈으로 나타날 수 있습니다. 꿈은 현실의 문제를 그대로 재현하기보다 상징으로 바꾸어 보여 주기 때문에, 장면만 보지 말고 그 장면이 나에게 어떤 감정을 남겼는지 살피는 것이 좋습니다.

## 3. 상황별 해석

첫째, ${place}에서 ${cleanTitle}을 꾸었다면 생활 기반과 안정감에 대한 메시지일 수 있습니다. 집이나 익숙한 장소가 배경이었다면 가족, 경제, 일상 루틴처럼 가까운 문제와 관련될 가능성이 큽니다. 낯선 장소였다면 새로운 환경에 대한 기대와 긴장이 함께 작용하고 있을 수 있습니다.

둘째, 꿈속에 ${relationship}이 함께 등장했다면 관계 해석이 중요합니다. 상대가 나를 도와주었다면 현실에서 도움을 받고 싶거나 이미 지지 자원이 있다는 신호일 수 있습니다. 반대로 상대와 거리가 멀거나 갈등이 있었다면 말하지 못한 서운함, 오해, 경계심이 꿈으로 표현되었을 수 있습니다.

셋째, 꿈에서 ${emotion}이 강했다면 그 감정이 현재 해석의 중심입니다. 불안이 컸다면 아직 해결되지 않은 걱정이 많다는 뜻이고, 안도감이 있었다면 어려운 상황 속에서도 회복 가능성을 감지하고 있다는 뜻입니다. 꿈해몽에서 감정은 장면보다 더 직접적인 단서입니다.

넷째, 꿈이 매우 생생하고 반복된다면 최근 몸과 마음이 피곤하다는 신호일 수 있습니다. 수면의 질이 낮거나 스트레스가 높은 시기에는 비슷한 꿈이 반복되기 쉽습니다. 이때는 꿈의 의미를 찾는 것과 동시에 생활 리듬, 수면 시간, 카페인 섭취, 자기 전 스마트폰 사용을 함께 점검해 보는 것이 좋습니다.

다섯째, 꿈속에서 내가 적극적으로 움직였다면 현실에서도 문제를 해결하려는 힘이 남아 있다는 의미로 볼 수 있습니다. 반대로 아무것도 하지 못하고 멈춰 있었다면 마음이 지쳐 있거나 선택지를 좁게 보고 있을 가능성이 있습니다. 이런 경우에는 큰 결정보다 작고 구체적인 행동부터 시작하는 편이 좋습니다.

## 4. 심리학적 해석

심리학적으로 ${cleanTitle}은 억눌린 감정, 미해결 과제, 자기보호 욕구가 섞여 나타난 이미지로 볼 수 있습니다. 꿈은 낮 동안 충분히 처리하지 못한 정보와 감정을 수면 중 다시 정리합니다. 그래서 현실에서 직접 말하지 못한 감정, 미뤄 둔 결정, 반복되는 걱정이 꿈속에서는 과장된 장면으로 등장합니다.

예를 들어 현실에서는 "괜찮다"고 넘겼던 일이 꿈에서는 훨씬 크게 느껴질 수 있습니다. 이는 마음이 약해서가 아니라 감정 처리 과정이 아직 끝나지 않았다는 뜻입니다. 특히 ${dreamTitle}처럼 상징성이 강한 꿈은 내가 놓치고 있던 욕구를 알려 줄 때가 많습니다. 인정받고 싶은 마음, 쉬고 싶은 마음, 관계에서 안전하고 싶은 마음이 서로 얽혀 하나의 꿈으로 구성될 수 있습니다.

또한 꿈은 통제감과 관련이 있습니다. 꿈속에서 상황을 통제할 수 있었다면 현재 문제를 다룰 힘이 남아 있음을 의미합니다. 통제하지 못했다면 현실에서 압박감이 커졌을 수 있습니다. 이때 필요한 것은 꿈을 무섭게 해석하는 일이 아니라, 현실에서 내가 다시 선택할 수 있는 작은 영역을 찾는 일입니다. 오늘 할 수 있는 한 가지 정리, 짧은 산책, 감정일기 한 문장만으로도 통제감은 조금씩 회복됩니다.

## 5. 길몽/흉몽

${cleanTitle}이 길몽으로 해석되는 경우는 꿈의 분위기가 비교적 안정적이고, 결말에서 문제가 정리되거나 누군가의 도움을 받거나 스스로 움직일 수 있었을 때입니다. 이런 흐름은 현실에서도 막힌 일이 풀리거나, 관계에서 대화의 실마리가 생기거나, 새로운 선택을 시작할 준비가 되었음을 나타낼 수 있습니다. 특히 꿈에서 밝은 빛, 깨끗한 공간, 편안한 호흡, 누군가의 지지가 함께 느껴졌다면 긍정적인 의미가 강해집니다.

반대로 흉몽으로 볼 수 있는 경우는 꿈이 지나치게 답답하고, 깨어난 뒤에도 불안이 오래 지속되며, 비슷한 장면이 반복될 때입니다. 이 경우 실제 나쁜 일이 생긴다는 뜻으로 단정하기보다 스트레스 누적, 수면 부족, 관계 피로, 미뤄 둔 문제를 알려 주는 신호로 해석하는 편이 안전합니다. 흉몽은 미래를 겁주기 위한 메시지가 아니라 지금의 나를 돌보라는 알림에 가깝습니다.

따라서 ${cleanTitle}의 길흉은 장면 하나로 결정되지 않습니다. 꿈의 결말, 감정의 강도, 현실의 상황, 반복 여부를 함께 봐야 합니다. 좋은 의미가 강해도 현실에서 준비가 필요하고, 불편한 의미가 있어도 생활을 조정하면 충분히 완화될 수 있습니다. 꿈해몽은 판단이 아니라 점검에 가까울 때 가장 도움이 됩니다.

## 6. 자주 묻는 질문

Q. ${cleanTitle}을 꾸면 실제로 나쁜 일이 생기나요?
A. 반드시 그렇지는 않습니다. 꿈은 현실 사건을 그대로 예언하기보다 현재의 감정과 긴장을 상징적으로 보여 주는 경우가 많습니다. 불안한 꿈일수록 현실에서 쉬어야 할 부분, 말해야 할 감정, 정리해야 할 생각을 알려 주는 신호로 보는 것이 좋습니다.

Q. 같은 꿈을 반복해서 꾸는 이유는 무엇인가요?
A. 반복되는 꿈은 마음이 같은 주제를 계속 처리하고 있다는 뜻일 수 있습니다. 해결되지 않은 걱정, 관계의 긴장, 수면 부족, 과로가 원인이 될 수 있으므로 꿈 내용과 함께 최근 생활 패턴을 점검해 보세요.

Q. 꿈에서 느낀 감정과 해몽 중 무엇이 더 중요한가요?
A. 감정이 더 중요한 단서가 되는 경우가 많습니다. 같은 장면이라도 편안했다면 회복과 정리의 의미가 강하고, 공포나 답답함이 컸다면 스트레스와 경계심을 살펴볼 필요가 있습니다.

Q. 꿈해몽을 현실에서 어떻게 활용하면 좋나요?
A. 꿈을 본 뒤 바로 결론을 내리기보다 "요즘 내가 가장 많이 걱정하는 것", "최근 미룬 대화", "몸이 보내는 피로 신호"를 적어 보세요. 꿈은 현실을 바꾸는 작은 행동으로 연결될 때 의미가 커집니다.

## 7. 관련 글

${makeRelatedLinks(cleanTitle, seed)}

## 8. SimSimPlay 추천

${cleanTitle}을 꾸고 마음이 복잡했다면 해몽을 읽는 데서 멈추지 말고 오늘의 감정을 짧게 기록해 보세요. "꿈에서 가장 강했던 감정", "현실에서 떠오르는 사람이나 상황", "오늘 나를 편하게 해 줄 작은 행동" 세 가지를 적으면 꿈의 메시지를 더 건강하게 정리할 수 있습니다.

SimSimPlay는 꿈해몽, 심리상담 Q&A, 감정일기, 힐링음악을 함께 제공하는 셀프케어 콘텐츠 서비스입니다. 꿈이 불안하게 느껴졌다면 차분한 피아노나 자연음 기반의 음악을 들으며 호흡을 낮춰 보세요. 꿈이 좋은 기운처럼 느껴졌다면 그 에너지를 하루의 작은 실행으로 옮겨 보는 것도 좋습니다. 다만 심리상담 결과와 꿈해몽은 의학적 진단이나 치료를 대체하지 않으며, 일상적인 자기이해를 돕는 참고용 콘텐츠로 활용하는 것이 가장 적절합니다.
`.trim();
}

function generateGeneralContent(title: string, category: string): string {
  const cleanTitle = normalizeTitle(title);
  const seed = hashText(cleanTitle);
  const theme = pick(["감정정리", "자기이해", "생활 리듬", "관계 회복", "마음 관리"], seed);
  const action = pick(["감정일기 쓰기", "잠들기 전 호흡 낮추기", "해야 할 일 한 가지 줄이기", "가벼운 산책", "휴대폰을 잠시 내려놓기"], seed, 2);

  return `
## 1. 서론

${cleanTitle}은 많은 사람이 일상에서 한 번쯤 고민하는 주제입니다. 이 글은 ${category} 관점에서 ${theme}를 중심으로 내용을 정리합니다. 단순한 위로보다 실제로 생각을 정리하고 생활에 적용할 수 있는 기준을 제공하는 데 초점을 둡니다.

정보성 콘텐츠로서 가장 중요한 기준은 과장하지 않는 것입니다. ${cleanTitle}을 하나의 정답으로 설명하기보다, 어떤 상황에서 이런 마음이나 상징이 강해지는지 살피는 편이 더 현실적입니다. 같은 주제라도 누군가에게는 잠시 지나가는 고민일 수 있고, 다른 누군가에게는 생활 리듬을 바꿔야 한다는 신호일 수 있습니다.

## 2. 기본 의미

${cleanTitle}의 기본 의미는 현재 마음이 무엇을 중요하게 여기고 있는지 살피는 데 있습니다. 불안, 기대, 피로, 관계의 긴장처럼 겉으로는 서로 다른 감정도 결국은 안전감과 회복감의 문제로 이어질 때가 많습니다. 지금의 상태를 좋고 나쁨으로 단정하기보다 어떤 신호가 반복되는지 보는 것이 중요합니다.

특히 최근에 생각이 많아졌거나, 사소한 일에도 예민해졌거나, 해야 할 일을 끝내도 개운하지 않다면 이 주제는 단순한 호기심보다 마음의 피로와 관련될 수 있습니다. 반대로 새로운 계획을 세우는 시기라면 ${cleanTitle}은 변화에 대한 기대와 부담이 함께 나타난 것으로 볼 수 있습니다. 핵심은 지금 내 마음이 어떤 방향으로 에너지를 쓰고 있는지 확인하는 것입니다.

## 3. 상황별 해석

상황이 일이나 공부와 관련되어 있다면 책임감과 성과 압박을 함께 점검해야 합니다. 관계와 관련되어 있다면 표현하지 못한 감정이나 경계 설정이 핵심일 수 있습니다. 수면과 관련되어 있다면 몸의 피로가 마음의 해석을 더 부정적으로 만들 수 있으므로 생활 리듬부터 회복하는 것이 좋습니다.

첫째, 혼자 있을 때 이 고민이 강해진다면 자기평가와 관련이 있을 가능성이 큽니다. 내가 충분히 잘하고 있는지, 뒤처지고 있지는 않은지, 누군가에게 실망을 주지는 않았는지 같은 생각이 반복될 수 있습니다. 이때는 생각을 더 밀어붙이기보다 실제 사실과 추측을 나누어 적는 것이 도움이 됩니다.

둘째, 사람을 만난 뒤 이 주제가 떠오른다면 관계 피로를 살펴봐야 합니다. 대화에서 내가 지나치게 맞춰 주고 있지는 않은지, 거절해야 할 일을 계속 미루고 있지는 않은지, 인정받고 싶은 마음이 과하게 커지지는 않았는지 확인해 보세요.

셋째, 밤이나 새벽에 유독 강해진다면 수면 전 각성 상태와 연결될 수 있습니다. 어두운 시간에는 같은 문제도 더 크게 느껴지기 쉽습니다. 이럴 때는 중요한 판단을 밤에 끝내려고 하기보다 내일 확인할 목록만 짧게 남겨 두는 편이 좋습니다.

## 4. 심리학적 해석

심리학적으로 ${cleanTitle}은 통제감, 안정감, 자기효능감과 연결됩니다. 사람은 예측하기 어려운 상황이 길어질수록 생각이 많아지고 몸이 먼저 긴장합니다. 이때 필요한 것은 완벽한 해결책이 아니라 내가 선택할 수 있는 작은 행동을 다시 찾는 일입니다.

인지적으로 보면 마음은 불확실한 상황을 싫어합니다. 그래서 아직 일어나지 않은 일을 미리 걱정하거나, 이미 지나간 장면을 반복해서 떠올리며 의미를 찾으려 합니다. 이런 과정은 문제 해결에 도움이 될 때도 있지만, 오래 반복되면 피로를 키우고 현실 행동을 늦출 수 있습니다.

정서적으로는 감정을 억누를수록 다른 방식으로 표현되는 경우가 많습니다. 말로 정리하지 못한 서운함은 예민함으로 나타나고, 쉬고 싶은 욕구는 무기력으로 나타나며, 인정받고 싶은 마음은 과도한 비교로 나타날 수 있습니다. ${cleanTitle}을 해석할 때는 겉으로 보이는 현상보다 그 아래의 욕구를 찾는 것이 중요합니다.

## 5. 길몽/흉몽

이 주제를 꿈이나 상징으로 본다면 길몽은 정리, 도움, 밝은 분위기, 편안한 결말과 연결됩니다. 흉몽은 반복되는 불안, 답답함, 도망치는 느낌, 깨어난 뒤 오래 남는 긴장과 연결됩니다. 길흉은 미래 예언보다 현재 상태를 점검하는 언어로 보는 편이 적절합니다.

길몽으로 볼 수 있는 흐름은 문제를 직면했지만 결국 해결의 실마리가 보이는 경우입니다. 현실에서는 아직 완전히 끝나지 않았더라도 마음속에서는 이미 다음 단계로 넘어갈 준비가 되어 있을 수 있습니다. 이런 때에는 작은 실행을 시작하면 생각보다 빠르게 안정감을 회복할 가능성이 있습니다.

흉몽 또는 불편한 상징으로 볼 수 있는 흐름은 같은 불안이 반복되고, 아무것도 선택하지 못한 채 멈춰 있는 느낌이 강할 때입니다. 하지만 이것도 나쁜 일이 생긴다는 뜻은 아닙니다. 오히려 지금의 과부하를 줄이고 몸과 마음을 회복해야 한다는 신호에 가깝습니다.

## 6. 자주 묻는 질문

Q. 이 내용을 그대로 내 상황에 적용해도 되나요?
A. 개인의 환경과 감정은 모두 다르므로 참고용으로 활용하는 것이 좋습니다. 다만 반복되는 감정이 있다면 기록하고 패턴을 보는 데 도움이 됩니다.

Q. 바로 해 볼 수 있는 방법은 무엇인가요?
A. 오늘은 ${action}부터 시작해 보세요. 작고 구체적인 행동이 마음의 부담을 낮추는 데 도움이 됩니다.

Q. 생각이 너무 많을 때는 어떻게 해야 하나요?
A. 머릿속으로만 정리하려고 하면 같은 생각이 반복되기 쉽습니다. 종이에 걱정, 사실, 내가 할 수 있는 행동을 세 칸으로 나누어 적어 보세요. 생각의 양이 줄어들지는 않아도 다룰 수 있는 형태로 바뀝니다.

Q. 이 주제가 반복해서 떠오르는 이유는 무엇인가요?
A. 아직 해결되지 않은 감정이 있거나 생활 리듬이 무너졌을 때 반복될 수 있습니다. 특히 피로, 수면 부족, 관계 스트레스가 겹치면 같은 문제를 더 크게 해석하는 경향이 생깁니다.

Q. 전문가 도움이 필요한 경우도 있나요?
A. 불안, 우울, 수면 문제가 오래 지속되거나 일상 기능에 큰 영향을 준다면 전문가 상담이나 의료기관의 도움을 받는 것이 좋습니다.

## 7. 관련 글

${makeRelatedLinks(cleanTitle, seed)}

## 8. SimSimPlay 추천

SimSimPlay에서는 심리상담 Q&A, 감정일기, 힐링음악, 꿈해몽 콘텐츠를 통해 자기이해를 돕습니다. ${cleanTitle}이 마음에 남는다면 오늘의 감정을 한 문장으로 적고, 그 감정에 맞는 음악을 들어 보세요. 본 콘텐츠는 의학적 진단이나 치료를 대체하지 않는 참고용 정보입니다.

추천 루틴은 간단합니다. 먼저 지금 감정을 한 단어로 고르고, 그 감정이 생긴 상황을 한 문장으로 적습니다. 그다음 오늘 내가 바꿀 수 있는 아주 작은 행동을 하나만 정합니다. 마지막으로 차분한 음악을 틀고 호흡을 천천히 낮추면 생각이 조금씩 정리됩니다. 이런 작은 루틴은 거창한 해결책보다 오래 지속되기 쉽습니다.
`.trim();
}

function generateContent(title: string, category: string): string {
  return category === "꿈해몽" ? generateDreamContent(title, category) : generateGeneralContent(title, category);
}

function makeDescription(title: string, category: string) {
  const cleanTitle = normalizeTitle(title);
  return `${cleanTitle}의 기본 의미, 상황별 해석, 심리학적 관점, 길몽과 흉몽 기준을 ${category} 콘텐츠로 자세히 정리했습니다.`.slice(0, 140);
}

function makeTags(title: string, category: string) {
  const tags = new Set([category, "꿈해몽", "심리", "마음건강", "SimSimPlay"]);
  normalizeTitle(title)
    .split(/\s+/)
    .filter((word) => word.length >= 2)
    .slice(0, 3)
    .forEach((word) => tags.add(word.replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, "")));
  return [...tags].filter(Boolean);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const db = env.DB;

  await ensureAdminSchema(db);

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { titles, status = "draft" } = (await request.json()) as { titles: string[]; status?: PostStatus };

  if (!titles || !Array.isArray(titles)) {
    return Response.json({ error: "제목 목록이 필요합니다." }, { status: 400 });
  }

  if (!["draft", "published"].includes(status)) {
    return Response.json({ error: "생성 상태가 올바르지 않습니다." }, { status: 400 });
  }

  const results = [];
  for (const rawTitle of titles) {
    const title = normalizeTitle(rawTitle);
    if (!title) continue;

    const category = getCategoryFromTitle(title);
    const content = generateContent(title, category);
    const slug = await ensureUniquePostSlug(db, title);
    const description = makeDescription(title, category);
    const tags = makeTags(title, category);

    try {
      await db
        .prepare(
          `
            INSERT INTO posts (title, slug, category, description, content, tags, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .bind(title, slug, category, description, content, JSON.stringify(tags), status)
        .run();

      results.push({
        title,
        status: "success",
        slug,
        category,
        contentLength: content.length,
      });
    } catch (error: any) {
      results.push({ title, status: "error", error: error.message });
    }
  }

  return Response.json({ results });
};
