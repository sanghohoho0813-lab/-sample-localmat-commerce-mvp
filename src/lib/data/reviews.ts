import type { Review } from "@/lib/types";

/**
 * 글로 남긴 후기 — 상품의 reviewCount(별점 포함 전체) 중 최근 글 후기 일부입니다.
 * 날짜는 출하 시기에 맞춥니다: 지금 시즌이 아닌 딸기·봄동·한라봉은 지난 시즌(봄) 후기입니다.
 */
export const reviews: Review[] = [
  // p01 해남 봄동 (지난 시즌)
  { id: "r05", productId: "p01", author: "정*아", rating: 5, date: "2026-03-12", content: "봄동 겉절이 해먹었는데 단맛이 진짜 나요. 잎도 두껍고 싱싱합니다." },
  { id: "r06", productId: "p01", author: "한*미", rating: 5, date: "2026-02-27", content: "된장국에 넣었더니 국물이 달아요. 흙내 없이 깨끗하게 손질되어 왔어요." },
  { id: "r07", productId: "p01", author: "송*진", rating: 4, date: "2026-02-18", content: "양이 넉넉하고 신선해요. 조금 시든 잎이 두어 장 있었지만 만족합니다." },

  // p02 평창 고랭지 감자
  { id: "r25", productId: "p02", author: "허*정", rating: 5, date: "2026-10-08", content: "찐 감자가 포슬포슬 갈라져요. 고랭지 감자 명성 그대로입니다." },
  { id: "r26", productId: "p02", author: "구*민", rating: 4, date: "2026-09-29", content: "크기가 고르고 상태가 좋아요. 흙 묻은 채로 와서 오히려 믿음이 갑니다." },
  { id: "r33", productId: "p02", author: "이*숙", rating: 5, date: "2026-09-21", content: "3kg이면 넷이서 일주일 넘게 먹어요. 싹 난 것 하나 없이 단단했어요." },

  // p03 평창 고랭지 양배추
  { id: "r34", productId: "p03", author: "김*경", rating: 5, date: "2026-10-06", content: "속이 꽉 차서 묵직해요. 채 썰어 샐러드 했더니 아삭하고 달아요." },
  { id: "r35", productId: "p03", author: "최*호", rating: 4, date: "2026-09-24", content: "주문 다음 날 수확해서 보낸다더니 겉잎까지 생생해요. 크기는 생각보다 조금 작았어요." },

  // p04 해남 황토 배추
  { id: "r36", productId: "p04", author: "박*란", rating: 5, date: "2026-10-10", content: "겉절이 하려고 한 포기 샀는데 고소하고 단맛이 좋아요. 김장도 여기서 할 생각입니다." },
  { id: "r37", productId: "p04", author: "윤*희", rating: 4, date: "2026-10-02", content: "속이 노랗고 잎이 연해요. 겉잎 몇 장은 떼어 냈지만 상태 좋았습니다." },

  // p05 논산 설향 딸기 (지난 시즌)
  { id: "r01", productId: "p05", author: "김*연", rating: 5, date: "2026-04-20", option: "1kg (2팩)", content: "딸기가 정말 달고 향이 진해요. 아이들이 앉은 자리에서 한 팩을 다 먹었어요. 12월에 또 주문할게요." },
  { id: "r02", productId: "p05", author: "박*수", rating: 5, date: "2026-04-11", option: "500g (1팩)", content: "마트 딸기랑 차원이 달라요. 무르지 않고 단단한데 과즙은 가득합니다." },
  { id: "r03", productId: "p05", author: "이*정", rating: 4, date: "2026-03-28", option: "500g (1팩)", content: "맛은 최고인데 몇 개는 크기가 좀 작았어요. 그래도 신선도는 확실합니다." },
  { id: "r04", productId: "p05", author: "최*희", rating: 5, date: "2026-03-15", option: "1kg (2팩)", content: "새벽 수확이라더니 정말 싱싱해요. 배송도 하루 만에 왔습니다." },

  // p06 제주 노지 감귤
  { id: "r14", productId: "p06", author: "신*래", rating: 5, date: "2026-10-11", option: "5kg", content: "올해 첫 노지귤이라 그런지 새콤달콤 딱 좋아요. 껍질이 얇고 과즙이 팡 터져요." },
  { id: "r15", productId: "p06", author: "문*빈", rating: 4, date: "2026-10-07", option: "3kg", content: "새콤한 맛이 조금 더 강하지만 이 시기 귤다워요. 크기는 들쭉날쭉해도 상한 건 없었어요." },
  { id: "r38", productId: "p06", author: "장*영", rating: 5, date: "2026-10-04", option: "3kg", content: "통풍 박스에 완충지까지 깔려 와서 눌린 게 하나도 없었어요." },

  // p07 제주 한라봉 (지난 시즌)
  { id: "r27", productId: "p07", author: "홍*라", rating: 5, date: "2026-03-09", content: "향이 방 안에 가득 퍼져요. 과즙 많고 속껍질도 얇아요. 선물용으로도 좋을 듯." },
  { id: "r39", productId: "p07", author: "서*진", rating: 5, date: "2026-02-22", content: "숙성을 충분히 해서 보내셨는지 신맛 없이 달아요. 1월에 다시 주문하려고 찜해 뒀어요." },

  // p08 청송 꿀사과 부사
  { id: "r21", productId: "p08", author: "권*희", rating: 5, date: "2026-10-09", content: "아삭하고 꿀이 박혀 있어요. 청송 사과는 믿고 먹습니다." },
  { id: "r22", productId: "p08", author: "안*수", rating: 4, date: "2026-10-01", content: "당도가 높고 식감이 좋아요. 개당 크기도 실합니다." },
  { id: "r40", productId: "p08", author: "류*경", rating: 5, date: "2026-09-26", content: "트레이에 하나씩 담겨 와서 멍든 게 없어요. 아침마다 하나씩 깎아 먹어요." },

  // p09 무항생제 한돈 삼겹살
  { id: "r11", productId: "p09", author: "강*민", rating: 5, date: "2026-10-09", option: "구이용 (두께 1.5cm)", content: "잡내가 정말 없어요. 소금만 찍어 먹어도 고소합니다. 두께도 딱 좋아요." },
  { id: "r12", productId: "p09", author: "임*경", rating: 4, date: "2026-10-03", option: "구이용 (두께 1.5cm)", content: "육질이 부드럽고 신선해요. 가격이 조금 있지만 그만한 가치가 있습니다." },
  { id: "r13", productId: "p09", author: "서*우", rating: 5, date: "2026-09-25", option: "수육용 (통삼겹)", content: "수육용으로 주문했는데 냄새 없이 깔끔하게 삶아졌어요. 가족들 반응 최고." },

  // p10 무항생제 한돈 목살
  { id: "r41", productId: "p10", author: "조*현", rating: 5, date: "2026-10-07", content: "두툼하게 썰어 구웠더니 육즙이 그대로예요. 진공 포장이라 핏물도 거의 없었어요." },
  { id: "r42", productId: "p10", author: "배*아", rating: 4, date: "2026-09-27", content: "고기 질은 좋은데 500g이면 둘이 먹기 딱이라 다음엔 두 팩 시키려고요." },

  // p11 자연방사 유정란
  { id: "r08", productId: "p11", author: "윤*서", rating: 5, date: "2026-10-10", option: "30구", content: "노른자 색이 다르네요. 탱글하고 비린내가 전혀 없어요. 계속 시켜 먹을 것 같아요." },
  { id: "r09", productId: "p11", author: "장*호", rating: 5, date: "2026-10-05", option: "15구", content: "아이 이유식용으로 샀는데 산란일이 찍혀 있어서 믿고 먹일 수 있어 좋습니다." },
  { id: "r10", productId: "p11", author: "오*름", rating: 4, date: "2026-09-28", option: "15구", content: "맛은 확실히 좋아요. 한 알이 살짝 금 가서 왔는데 완충재 덕에 깨지진 않았어요." },

  // p12 완도 활전복
  { id: "r16", productId: "p12", author: "황*진", rating: 5, date: "2026-10-08", option: "특대 (5~6미)", content: "전복이 살아서 움직이며 도착했어요. 버터구이 했는데 쫄깃함이 남달라요." },
  { id: "r17", productId: "p12", author: "조*연", rating: 5, date: "2026-09-30", option: "대 (7~8미)", content: "죽 끓였더니 내장 향이 진하게 우러나요. 크기도 사진 그대로입니다." },

  // p13 완도 돌미역
  { id: "r30", productId: "p13", author: "양*희", rating: 5, date: "2026-10-02", content: "미역국이 뽀얗게 우러나요. 향부터 다릅니다. 친정엄마도 주문해 달라고 하셨어요." },
  { id: "r43", productId: "p13", author: "남*정", rating: 5, date: "2026-09-19", content: "불리니 양이 엄청 늘어나요. 200g으로 한 달 넘게 먹었어요." },

  // p14 완도 건다시마
  { id: "r44", productId: "p14", author: "변*수", rating: 5, date: "2026-10-04", content: "두툼하고 하얀 분이 잘 올라 있어요. 육수가 확실히 진해요." },
  { id: "r45", productId: "p14", author: "엄*미", rating: 4, date: "2026-09-16", content: "지퍼 봉투라 보관이 편해요. 크기가 고르지는 않지만 맛은 좋아요." },

  // p15 논산 수제 딸기잼
  { id: "r29", productId: "p15", author: "고*은", rating: 5, date: "2026-10-06", content: "과육이 씹히는 진짜 딸기잼이에요. 시판 잼은 이제 못 먹을 것 같아요." },
  { id: "r46", productId: "p15", author: "하*린", rating: 4, date: "2026-09-22", content: "덜 달고 딸기 맛이 진해요. 병이 작아서 금방 먹는 게 아쉬워요." },

  // p16 청송 사과즙
  { id: "r23", productId: "p16", author: "심*아", rating: 5, date: "2026-10-09", content: "아침마다 한 포씩 마시는데 맛이 진하고 깔끔해요. 첨가물 없는 게 느껴져요." },
  { id: "r24", productId: "p16", author: "노*현", rating: 5, date: "2026-09-29", content: "부모님 드리려고 샀다가 저도 마시고 있어요. 세 번째 재구매입니다." },
  { id: "r47", productId: "p16", author: "우*진", rating: 4, date: "2026-09-18", content: "아이가 잘 마셔요. 파우치라 들고 다니기 편해요." },

  // p17 제주 감귤청
  { id: "r48", productId: "p17", author: "민*아", rating: 5, date: "2026-10-03", content: "따뜻한 물에 타 마시면 귤 향이 확 올라와요. 껍질째라 쌉싸름한 맛도 좋아요." },
  { id: "r49", productId: "p17", author: "길*수", rating: 4, date: "2026-09-20", content: "탄산수에 타서 에이드로 먹어요. 단맛이 조금 강해서 양을 조절해서 먹어요." },

  // p18 보성 녹돈 수제 소시지
  { id: "r50", productId: "p18", author: "추*영", rating: 5, date: "2026-10-05", content: "고기가 꽉 차 있고 짜지 않아요. 아이 반찬으로 마음 놓고 줘요." },
  { id: "r51", productId: "p18", author: "석*희", rating: 4, date: "2026-09-23", content: "맛있는데 주문 후 만든다고 해서 하루 더 걸려 왔어요. 기다릴 만합니다." },

  // p19 평창 찰옥수수 (냉동)
  { id: "r28", productId: "p19", author: "전*석", rating: 5, date: "2026-09-25", content: "전자레인지에 데웠는데 찰기가 대단해요. 냉동인데도 갓 찐 맛이에요." },
  { id: "r52", productId: "p19", author: "봉*희", rating: 4, date: "2026-09-12", content: "드라이아이스까지 넣어서 꽁꽁 언 채로 왔어요. 하나씩 꺼내 먹기 좋아요." },

  // p20 해남 꿀 고구마
  { id: "r18", productId: "p20", author: "배*원", rating: 5, date: "2026-10-11", content: "에어프라이어에 구웠더니 진짜 꿀이 흘러요. 숙성 잘 된 고구마 맛." },
  { id: "r19", productId: "p20", author: "나*영", rating: 5, date: "2026-10-04", content: "크기가 고르고 상처 없는 것만 왔어요. 아이 간식으로 최고예요." },
  { id: "r20", productId: "p20", author: "유*진", rating: 4, date: "2026-09-30", content: "달고 촉촉해요. 배송 중 하나가 살짝 눌렸지만 전체적으로 만족." },

  // p21 해남 햅쌀 새청무
  { id: "r53", productId: "p21", author: "왕*숙", rating: 5, date: "2026-10-10", content: "햅쌀이라 밥 지을 때 냄새부터 달라요. 도정일이 적혀 있어서 좋네요." },
  { id: "r54", productId: "p21", author: "탁*민", rating: 5, date: "2026-10-03", content: "윤기가 흐르고 찰져요. 4kg이라 둘이 먹기 부담 없는 양이에요." },

  // p22 청송 사과칩
  { id: "r32", productId: "p22", author: "표*리", rating: 4, date: "2026-10-01", content: "바삭하고 사과 향이 은은해요. 아이 간식으로 죄책감 없이 좋아요." },
  { id: "r55", productId: "p22", author: "피*연", rating: 5, date: "2026-09-21", content: "설탕 없이 이렇게 달 수 있나 싶어요. 봉지가 작아서 한 번에 먹기 좋아요." },

  // p23 양평 구운 계란
  { id: "r56", productId: "p23", author: "제*호", rating: 5, date: "2026-10-07", content: "흰자가 갈색으로 쫀득하게 구워졌어요. 찜질방 계란보다 훨씬 맛있어요." },
  { id: "r57", productId: "p23", author: "도*은", rating: 4, date: "2026-09-26", content: "간이 살짝 되어 있어 그냥 먹기 좋아요. 아이스팩 넣어 보내 주셔서 안심." },

  // p24 완도 전복 선물세트
  { id: "r31", productId: "p24", author: "백*준", rating: 5, date: "2026-09-27", content: "추석 선물로 보냈는데 받으신 분이 감동하셨대요. 포장 퀄리티가 좋습니다." },
  { id: "r58", productId: "p24", author: "곽*정", rating: 5, date: "2026-09-24", content: "보자기 포장이 고급스러워요. 전복도 하나하나 크고 싱싱했다고 하네요." },

  // p25 청송 꿀사과 선물세트
  { id: "r59", productId: "p25", author: "선*아", rating: 5, date: "2026-09-26", content: "추석 선물로 보냈어요. 사과 크기가 정말 크고 고르다고 연락 왔어요." },
  { id: "r60", productId: "p25", author: "모*철", rating: 4, date: "2026-09-22", content: "포장은 깔끔하고 맛도 좋아요. 배송 날짜를 지정할 수 없는 건 조금 아쉬워요." },

  // p26 논산 딸기 프리미엄 세트 (지난 시즌)
  { id: "r61", productId: "p26", author: "진*희", rating: 5, date: "2026-04-03", content: "특대 딸기만 골라 담겨 와서 선물 받은 분이 정말 좋아하셨어요." },
  { id: "r62", productId: "p26", author: "공*수", rating: 5, date: "2026-03-14", content: "화이트데이 선물로 보냈는데 포장이 예쁘고 딸기 상태도 완벽했대요." },
];

/** 최신순 */
export function getProductReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId).sort((a, b) => b.date.localeCompare(a.date));
}
