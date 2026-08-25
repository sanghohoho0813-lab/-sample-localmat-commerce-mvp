import type { Farm } from "@/lib/types";

export const farms: Farm[] = [
  {
    id: "farm-nonsan",
    slug: "nonsan-ttalgi",
    name: "논산 딸기 농장",
    region: "충남 논산",
    owner: "박정호",
    items: ["설향 딸기", "딸기잼"],
    quote: "새벽에 딴 딸기가 가장 답니다.",
    intro:
      "논산 양촌면에서 3대째 딸기 농사를 짓고 있습니다. 하우스 온도를 밤낮으로 살피며 설향 품종 본연의 단맛을 끌어올립니다.",
    method: "저농약 관리 · 수확 당일 새벽 선별 · 냉장 출고",
    story: [
      "아버지에게 물려받은 하우스 여섯 동에서 딸기 농사를 시작한 지 벌써 18년이 되었습니다. 딸기는 예민한 과일이라 하루만 게을러도 맛이 달라집니다.",
      "저희 농장은 새벽 4시에 수확을 시작합니다. 해가 뜨기 전에 딴 딸기가 가장 단단하고 향이 진하기 때문입니다. 그날 딴 딸기는 그날 바로 포장해 보내드립니다.",
    ],
    since: 2007,
    certifications: ["GAP 인증", "저탄소 인증"],
    image: "/images/farms/nonsan-ttalgi.jpg",
  },
  {
    id: "farm-haenam",
    slug: "haenam-nokdu",
    name: "해남 앞들 농부",
    region: "전남 해남",
    owner: "김영수",
    items: ["봄동", "배추", "감자"],
    quote: "좋은 흙이 맛있는 농사를 만듭니다.",
    intro:
      "땅끝 해남의 붉은 황토밭에서 계절 채소를 기릅니다. 흙을 먼저 살리는 농사를 원칙으로 삼습니다.",
    method: "무농약 재배 · 유기질 퇴비 · 아침 수확 당일 출고",
    story: [
      "해남 황토는 미네랄이 풍부해서 채소 맛이 다릅니다. 저희는 화학비료 대신 직접 만든 퇴비로 땅심을 키웁니다.",
      "겨울을 난 봄동은 해풍을 맞고 자라 단맛이 진합니다. 밭에서 아침에 거둔 채소를 그날 바로 상자에 담습니다.",
    ],
    since: 1998,
    certifications: ["무농약 인증"],
    image: "/images/farms/haenam-nokdu.jpg",
  },
  {
    id: "farm-happy",
    slug: "happy-hen",
    name: "행복한 닭 농장",
    region: "경기 양평",
    owner: "이수진",
    items: ["자연방사 유정란"],
    quote: "닭이 행복해야 좋은 알을 낳습니다.",
    intro:
      "양평 산자락 넓은 방사장에서 닭을 키웁니다. 좁은 케이지 없이 흙을 밟고 자란 닭이 낳은 유정란만 선별합니다.",
    method: "자연방사 · 무항생제 사료 · 산란 당일 선별 포장",
    story: [
      "케이지 없는 양계를 하겠다고 마음먹고 양평으로 내려온 지 12년입니다. 닭들은 해가 뜨면 방사장으로 나가 흙목욕을 하고 풀을 쪼며 하루를 보냅니다.",
      "스트레스가 적은 닭이 낳은 알은 노른자 탄력부터 다릅니다. 산란 당일 선별한 알만 산지에서 바로 보내드립니다.",
    ],
    since: 2013,
    certifications: ["동물복지 인증", "무항생제 인증"],
    image: "/images/farms/happy-hen.jpg",
  },
  {
    id: "farm-boseong",
    slug: "boseong-handon",
    name: "보성 녹돈 농장",
    region: "전남 보성",
    owner: "정민철",
    items: ["무항생제 한돈"],
    quote: "정직하게 키운 고기는 맛으로 증명합니다.",
    intro:
      "보성 녹차밭 인근 청정 지역에서 한돈을 사육합니다. 녹차 부산물을 배합한 사료로 잡내 없는 깔끔한 육질을 만듭니다.",
    method: "무항생제 사육 · 녹차 배합 사료 · 당일 발골 냉장 배송",
    story: [
      "좋은 돼지고기는 사료와 환경에서 나온다고 믿습니다. 녹차 부산물을 섞은 사료를 먹인 녹돈은 지방이 고소하고 잡내가 없습니다.",
      "주문이 들어오면 당일 발골해 진공 포장합니다. 정직하게 키운 고기는 구워보면 압니다.",
    ],
    since: 2010,
    certifications: ["무항생제 인증", "HACCP"],
    image: "/images/farms/boseong-handon.jpg",
  },
  {
    id: "farm-jeju",
    slug: "jeju-seogwipo",
    name: "제주 서귀포 감귤원",
    region: "제주 서귀포",
    owner: "고미영",
    items: ["노지 감귤", "한라봉"],
    quote: "제주 햇살을 그대로 담았습니다.",
    intro:
      "서귀포 남향 언덕의 노지 과수원에서 감귤과 한라봉을 재배합니다. 바닷바람과 햇살이 만든 새콤달콤함을 전합니다.",
    method: "노지 재배 · 완숙 수확 · 산지 직송",
    story: [
      "하우스 대신 노지를 고집하는 이유는 맛 때문입니다. 제주 햇살과 바닷바람을 온전히 맞고 자란 감귤은 향부터 다릅니다.",
      "완전히 익은 뒤에만 수확합니다. 덜 익은 귤을 미리 따서 후숙시키지 않는 것이 저희 원칙입니다.",
    ],
    since: 2001,
    certifications: ["GAP 인증"],
    image: "/images/farms/jeju-seogwipo.jpg",
  },
  {
    id: "farm-wando",
    slug: "wando-badasori",
    name: "완도 바다소리 수산",
    region: "전남 완도",
    owner: "김태훈",
    items: ["전복", "미역", "다시마"],
    quote: "신선한 바다의 맛을 그대로 보내드립니다.",
    intro:
      "완도 청정 해역에서 전복을 양식하고 미역과 다시마를 채취합니다. 새벽 조업 후 당일 출고를 원칙으로 합니다.",
    method: "청정 해역 양식 · 새벽 조업 · 당일 산소 포장 출고",
    story: [
      "완도 바다는 물살이 좋아 전복이 단단하게 자랍니다. 다시마를 먹여 키운 전복은 살이 차지고 향이 깊습니다.",
      "새벽에 건져 올린 전복을 산 채로 산소 포장해 보내드립니다. 바다에서 식탁까지 하루면 충분합니다.",
    ],
    since: 2005,
    certifications: ["친환경 수산물 인증"],
    image: "/images/farms/wando-badasori.jpg",
  },
  {
    id: "farm-cheongsong",
    slug: "cheongsong-apple",
    name: "청송 꿀사과 과수원",
    region: "경북 청송",
    owner: "최병준",
    items: ["부사 사과", "사과즙"],
    quote: "일교차가 만든 단단한 단맛입니다.",
    intro:
      "해발 400m 청송 산간에서 사과를 재배합니다. 큰 일교차가 과육을 단단하게, 당도를 높게 만듭니다.",
    method: "고지대 재배 · 완숙 수확 · 저온 저장 후 주문 선별",
    story: [
      "청송의 밤은 여름에도 서늘합니다. 이 일교차 덕분에 사과가 밀도 있게 여물고 꿀이 차오릅니다.",
      "수확한 사과는 저온 창고에서 보관하다 주문이 들어오면 하나하나 선별해 보냅니다.",
    ],
    since: 1995,
    certifications: ["GAP 인증"],
    image: "/images/farms/cheongsong-apple.jpg",
  },
  {
    id: "farm-gangwon",
    slug: "pyeongchang-highland",
    name: "평창 고랭지 농원",
    region: "강원 평창",
    owner: "김영호",
    items: ["감자", "옥수수", "양배추"],
    quote: "좋은 흙이 맛있는 농사를 만듭니다.",
    intro:
      "해발 700m 평창 고랭지에서 감자와 옥수수를 재배합니다. 서늘한 기후가 만드는 포슬포슬한 식감이 자랑입니다.",
    method: "고랭지 재배 · 아침 수확 · 흙 묻은 그대로 산지 직송",
    story: [
      "고랭지 감자는 낮과 밤의 온도차 속에서 전분을 가득 채웁니다. 쪄보면 포슬포슬 갈라지는 식감이 다릅니다.",
      "흙을 씻지 않고 보내는 이유는 신선함 때문입니다. 흙이 감자의 수분과 맛을 지켜줍니다.",
    ],
    since: 2003,
    certifications: ["GAP 인증"],
    image: "/images/farms/pyeongchang-highland.jpg",
  },
];

export function getFarm(idOrSlug: string): Farm | undefined {
  return farms.find((f) => f.id === idOrSlug || f.slug === idOrSlug);
}
