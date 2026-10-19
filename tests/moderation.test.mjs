import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyPost,classifyFeed} from '../src/moderation.js';
import {parseFeed, createMonthlyIssue} from '../src/feeds.js';
test('마술 판매글은 승인대기',()=>assert.equal(classifyPost('marketplace','클로즈업 카드마술 덱 판매','상태 좋은 카드 덱을 판매합니다').status,'pending'));
test('비관련 판매글은 검토함',()=>assert.equal(classifyPost('marketplace','주방용 전자레인지','일반 가전제품을 저렴하게 판매합니다').status,'quarantined'));
test('도박광고는 비공개',()=>assert.equal(classifyPost('promotion','카지노 무료 홍보','가입하고 큰 혜택 받으세요').status,'deleted'));
test('마술피드 분류',()=>assert.equal(classifyFeed('현대 마술 공연 일정'),true));
test('RSS 항목 파싱',()=>{const a=parseFeed('<rss><channel><item><title>매직쇼</title><link>https://x.example/m</link><description>마술 공연</description></item></channel></rss>');assert.equal(a.length,1);assert.equal(a[0].title,'매직쇼')});
