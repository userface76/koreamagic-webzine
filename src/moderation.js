// 규칙 기반 1차 분류 (AI 모델 아님). 운영 중 지속 조정 필요.
const spamTerms = ['카지노','바카라','토토','스포츠베팅','대출상담','성인만남','비아그라','불법도박','코인리딩','고수익보장'];
const magicTerms = ['마술','매직','magician','magic','일루전','illusion','멘탈리즘','mentalism','카드마술','마술도구','클로즈업','공연','무대','버스킹','마술사','매직쇼','동전마술','마술책','소품','마술교육','컨저링','conjuring','퍼포먼스'];
const marketTerms = ['카드','덱','트릭','지팡이','테이블','의상','마술','무대','클로즈업','공연','일루전','소품','서적','마술책','마술도구','coin','magic','deck'];
export function classifyPost(type, title, body = '') {
  const s = `${title} ${body}`.toLowerCase();
  const links = (s.match(/https?:\/\//g)||[]).length;
  if (spamTerms.some(t=>s.includes(t)) || links >= 3) return {status:'deleted',reason:'명백한 비관련 광고/링크 도배 탐지(자동 비공개)'};
  if (s.length < 12) return {status:'quarantined',reason:'내용 부족 - 사람 검토 필요'};
  const relevant = (type === 'marketplace' ? marketTerms : magicTerms).some(t=>s.includes(t));
  if (!relevant) return {status:'quarantined',reason:'마술 관련성 미확인 - 편집진 검토'};
  return {status:'pending',reason:'마술 관련으로 분류 - 관리자 승인 대기'};
}
export function classifyFeed(text) {
  return magicTerms.some(t => (text||'').toLowerCase().includes(t));
}
