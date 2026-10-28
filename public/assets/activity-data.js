/* 사진 공개는 행사 정보·촬영자 출처·인물 동의·저작권·관리자 승인을 확인한 뒤 진행하세요.
   실제 사진은 approved 배열에 {id,title,category,description,date,location,image_url,alt,credit,approved:true,rights_confirmed:true} 형식으로 추가합니다.
   approved 항목이 4개 이상이면 예시 삽화는 자동으로 사라집니다. 현재 approved는 비어 있습니다. */
window.KMS_ACTIVITY_DATA = {
  "approved": [],
  "examples": [
    {
      "id": "sample-research",
      "title": "학술·연구 활동",
      "category": "research",
      "description": "마술 연구 발표, 세미나, 학술 교류의 기록을 소개할 자리입니다. 실제 사진과 행사 정보를 확인한 뒤 교체합니다.",
      "image_url": "./assets/magic-library.svg",
      "alt": "마법 서재를 표현한 예시 일러스트"
    },
    {
      "id": "sample-performance",
      "title": "공연과 무대의 기록",
      "category": "performance",
      "description": "갈라쇼, 시연, 무대 기술 교류의 현장 사진을 모을 자리입니다. 실제 행사를 재현한 이미지는 아닙니다.",
      "image_url": "./assets/magic-theater.svg",
      "alt": "무대 마술을 표현한 예시 일러스트"
    },
    {
      "id": "sample-education",
      "title": "마술 교육·워크숍",
      "category": "education",
      "description": "실습 교육, 강연, 코칭과 연구 모임의 사진을 소개할 자리입니다.",
      "image_url": "./assets/magic-cards.svg",
      "alt": "플레잉카드 마술을 표현한 예시 일러스트"
    },
    {
      "id": "sample-community",
      "title": "교류와 공동 프로젝트",
      "category": "community",
      "description": "마술사들의 만남, 협력 프로젝트, 국제 교류 활동을 기록할 자리입니다.",
      "image_url": "./assets/magic-portal.svg",
      "alt": "환상적인 빛의 포털 예시 일러스트"
    }
  ]
};
