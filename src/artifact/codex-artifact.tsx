/**
 * Claude Artifacts 전용 단일 파일 번들.
 * - 이 파일 내용을 통째로 Claude 채팅에 붙여넣고 "아티팩트로 만들어줘" 라고 요청하면 됩니다.
 * - 아티팩트는 localStorage 를 쓸 수 없어 데이터는 새로고침 시 초기화됩니다(세션 한정).
 * - 영구 보관이 필요하면 📋 내보내기 버튼으로 JSON 을 복사해 두세요.
 *
 * 프로젝트의 FSD 구조(src/entities, src/features …) 는 그대로 두고
 * 이 파일만 아티팩트 배포용으로 별도 관리됩니다.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, MouseEvent, ReactNode } from 'react';

/* ═════════════════════ 색상 / 상수 ═════════════════════ */

const C = {
  textPrimary: '#111',
  textSecondary: '#555',
  textTertiary: '#888',
  bgPrimary: '#fff',
  bgSecondary: '#f5f5f5',
  borderSecondary: '#ccc',
  borderTertiary: '#ddd',
};

const FALLBACK_TAG = '#888780';
const TAG_COLORS: Record<string, string> = {
  정파: '#1D9E75', 마교: '#D85A30', '마교/사파': '#D85A30', 사파: '#BA7517', 혈교: '#791F1F',
  세외: '#534AB7', 무소속: '#888780', 특수: '#7F77DD', 생명력: '#085041', '획득 방법': '#633806',
  선천: '#085041', '기연/도구': '#1D9E75', '지식/전승': '#633806', 수련: '#085041',
  '문파/가문': '#D85A30', 난치병: '#D85A30', 체질: '#1D9E75', 증상: '#BA7517',
  '무림의 중심': '#1D9E75', '강호의 실질적 지배자': '#BA7517', '절대악의 세력': '#D85A30',
  '금기 세력': '#791F1F', '중원 밖': '#534AB7', 독립: '#888780', '개인 이명': '#D85A30',
  '악명 기준': '#791F1F', '강함 기준': '#534AB7', 경지: '#378ADD', 검도: '#534AB7',
  성취: '#534AB7', 방어: '#1D9E75', 공격: '#D85A30', 소림사: '#BA7517', 무당파: '#534AB7',
  화산파: '#D85A30', 개방: '#085041', 사천당가: '#7F77DD', 남궁세가: '#378ADD',
  식물계: '#1D9E75', 동물계: '#D85A30', 광물계: '#534AB7', '제조/소림': '#BA7517',
  '제조/화산파': '#D85A30', '제조/도가': '#085041', 수계: '#378ADD', 독계: '#7F77DD',
  산계: '#1D9E75', 심법: '#1D9E75', 병기법: '#378ADD', 권각법: '#D85A30', 신보법: '#5DCAA5',
  호신법: '#085041', 암기법: '#791F1F', 특수법: '#7F77DD', '정파 공통': '#1D9E75',
  '사파 공통': '#BA7517', '마교 공통': '#D85A30', '흡공 계열': '#BA7517', '독 계열': '#7F77DD',
  '방중술 계열': '#BA7517', '변장 계열': '#534AB7', 일반: '#888780', 최상급: '#EF9F27',
  '최상급 경공': '#EF9F27', '특수 체술': '#085041', 고급: '#EF9F27', 기본: '#888780',
  전술: '#085041', 체술: '#085041', 운기: '#AFA9EC', '내공 이론': '#534AB7',
  '무공 범주': '#633806', 직위: '#085041', 금속: '#888780', 섬유: '#BA7517',
  영약: '#1D9E75', 영물: '#D85A30', 신병이기: '#534AB7',
};
const colorOfTag = (t: string | undefined | null) => (t && TAG_COLORS[t]) || FALLBACK_TAG;
const RANK_COLORS = ['#B4B2A9', '#B4B2A9', '#888780', '#85B7EB', '#378ADD', '#5DCAA5', '#1D9E75', '#0F6E56', '#AFA9EC', '#7F77DD', '#534AB7', '#EF9F27'];

const createId = () => '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const matches = (text: string, q: string) => !q || text.toLowerCase().includes(q.toLowerCase());
const joinSearchable = (parts: Array<string | undefined | null>) => parts.filter(Boolean).join(' ');

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fallthrough */ }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch { return false; }
};

/* ═════════════════════ 타입 ═════════════════════ */

interface DetailEntry { l: string; t: string; }
interface MemberEntry { n: string; d: string; }
interface MemberGroup { label: string; members: MemberEntry[]; }
interface HasId { id: string; }

const LEVEL_SUBS = ['경지', '검도', '성취', '방어', '공격'] as const;
type LevelSub = (typeof LEVEL_SUBS)[number];
interface Level extends HasId { sub: LevelSub; rank: string; name: string; aliases: string[]; desc: string; conditions: string; notes: string; }
const LEVEL_SUB_LABELS: Record<LevelSub, string> = { 경지: '무림 경지', 검도: '검도 경지', 성취: '성취', 방어: '방어', 공격: '공격' };

const ART_FACTIONS = ['정파', '사파', '마교', '혈교', '세외', '무소속'] as const;
type ArtFaction = (typeof ART_FACTIONS)[number];
const ART_FACTION_FILTERS = ['전체', ...ART_FACTIONS] as const;
type ArtFactionFilter = (typeof ART_FACTION_FILTERS)[number];
const ART_TYPES = ['심법', '병기법', '권각법', '신보법', '호신법', '암기법', '특수법'] as const;
type ArtType = (typeof ART_TYPES)[number];
const ART_TYPE_FILTERS = ['전체', ...ART_TYPES] as const;
type ArtTypeFilter = (typeof ART_TYPE_FILTERS)[number];
interface Art extends HasId { faction: ArtFaction; type: ArtType; name: string; tag: string; desc: string; traits: string[]; merits: string; demerits: string; details: DetailEntry[]; notes: string; }
const ART_FACTION_LABELS: Record<ArtFactionFilter, string> = { 전체: '전체', 정파: '正 정파', 사파: '邪 사파', 마교: '魔 마교', 혈교: '血 혈교', 세외: '塞外 세외', 무소속: '浪 무소속' };
const ART_TYPE_LABELS: Record<ArtTypeFilter, string> = { 전체: '전체', 심법: '心法 심법', 병기법: '兵器 병기법', 권각법: '拳脚 권각법', 신보법: '身步 신보법', 호신법: '護身 호신법', 암기법: '暗器 암기법', 특수법: '特殊 특수법' };

interface Faction extends HasId { name: string; tag: string; desc: string; groups: MemberGroup[]; notes: string; }
interface Title extends HasId { name: string; tag: string; desc: string; members: MemberEntry[]; notes: string; }

const MISC_SUBS = ['내공 이론', '무공 범주', '증상', '기타'] as const;
type MiscSub = (typeof MISC_SUBS)[number];
interface Misc extends HasId { sub: MiscSub; name: string; tag: string; desc: string; details: DetailEntry[]; notes: string; }

const FORTUNE_SUBS = ['영약', '영물', '신병이기'] as const;
type FortuneSub = (typeof FORTUNE_SUBS)[number];
interface Fortune extends HasId { sub: FortuneSub; name: string; tag: string; desc: string; details: DetailEntry[]; notes: string; }

const TAB_IDS = ['levels', 'arts', 'factions', 'titles', 'fortune', 'misc'] as const;
type TabId = (typeof TAB_IDS)[number];
interface TabDef { id: TabId; label: string; icon: string; }
const TABS: TabDef[] = [
  { id: 'levels', label: '경지', icon: '⛰' },
  { id: 'arts', label: '무공', icon: '⚔' },
  { id: 'factions', label: '세력', icon: '旗' },
  { id: 'titles', label: '칭호', icon: '冠' },
  { id: 'fortune', label: '기연', icon: '寶' },
  { id: 'misc', label: '기타', icon: '卷' },
];

/* ═════════════════════ 초기 데이터 ═════════════════════ */

const DEFAULT_LEVELS: Level[] = [
  { id: 'l1', sub: '경지', rank: '1', name: '삼류', aliases: [], desc: '무공에 막 입문한 수준. 내공을 담아 운기할 수 있는 정도.', conditions: '', notes: '' },
  { id: 'l2', sub: '경지', rank: '2', name: '이류', aliases: [], desc: '내공심법을 익혔으나 실전 적용은 미숙한 수준. 초식의 형을 어느 정도 구사할 수 있으며 일반 성인 장정보다 훨씬 강함.', conditions: '', notes: '' },
  { id: 'l3', sub: '경지', rank: '3', name: '일류', aliases: [], desc: '무공을 제대로 익히고 능숙하게 펼칠 수 있는 수준. 검기 구사가 가능한 단계. 이류와는 격이 다름.', conditions: '', notes: '' },
  { id: 'l4', sub: '경지', rank: '4', name: '절정', aliases: [], desc: '대문파의 장문인이나 원로급이 도달하는 경지. 강기 구사가 가능한 단계.', conditions: '', notes: '초입 → 완숙 → 극으로 세분화. 1갑자(60년) 이상의 내공이 절정 고수의 기준.' },
  { id: 'l5', sub: '경지', rank: '5', name: '초절정', aliases: [], desc: '절정을 넘어선 초인의 입문 단계. 검강이 검기를 압도하며 절정 고수는 일격에 격퇴되기도 함.', conditions: '초절정 전후부터 육감이 발달하여 상대의 허점을 통찰하는 능력이 생김.', notes: '초입 → 완숙 → 극으로 세분화.' },
  { id: 'l6', sub: '경지', rank: '6', name: '화경', aliases: ['극마', '팔성', '조화경', '천위'], desc: '벽을 넘은 자. 무공이 몸에 완전히 스며든 경지. 검강에 제한이 없고 이기어검술과 격공섭물을 자유자재로 펼치며 손짓만으로도 무공을 구사할 수 있음.', conditions: '주요 문파의 장문인, 가주, 궁주 등 거대 세력 수장급이 도달하는 경지. 단신으로 대문파 하나를 상대할 수 있는 수준.', notes: '보통 우내십존(천하십대고수)을 화경의 경지로 설정하는 경우가 많음.' },
  { id: 'l7', sub: '경지', rank: '7', name: '현경', aliases: ['조율경', '탈마', '육천', '입신경'], desc: '현묘한 경지. 진기와 강기에 완전히 통달하여 무의 이치를 벗어나 마음이 가는 대로 최상의 묘수를 펼치는 경지.', conditions: '초입~완숙: 오대고수급. 중원 전체를 통틀어 10명 채 되지 않음.\n극: 전설적 인물로 표현되는 수준.', notes: '화경의 고수 둘 이상이 모여야 겨우 상대 가능한 수준.' },
  { id: 'l8', sub: '경지', rank: '8', name: '생사경', aliases: ['초마경', '외경', '신화경'], desc: '삶과 죽음을 초월하는 경지. 수명의 한계를 초월하며 먹지 않아도 숨만 쉬면 살 수 있고 늙지 않고 병들지 않음.', conditions: '초입: 무림 세력 일부를 단독으로 상대 가능. 무형검 사용 가능.\n완숙~극: 인간의 범주를 완전히 벗어난 존재로 취급됨.', notes: '천년에 한번 나올까 말까 한 전설의 경지.' },
  { id: 'l9', sub: '경지', rank: '9', name: '자연경', aliases: ['신화경', '초월경'], desc: '무림에서 상상의 경지로 취급되는 단계. 도달한 자가 극소수에 불과하며 전설로만 내려오는 무위의 끝.', conditions: '자연의 기를 몸에 담아 무한에 가까운 내공 보유. 심검, 심권, 심도 사용 가능.\n완숙~극: 타인이 죽이지 않는 이상 수명으로 죽지 않고 늙지 않음.', notes: '' },
  { id: 'l10', sub: '경지', rank: '10', name: '공허경', aliases: [], desc: '자연경을 뛰어넘은 경지. 공허, 우주의 기운을 다루며 몸에 담을 수 있는 단계. 완벽한 무한의 내공을 보유.', conditions: '공간검, 공간이동술 사용 가능. 특정 공간을 소멸시킬 수 있음.', notes: '' },
  { id: 'l11', sub: '경지', rank: '11', name: '여의경', aliases: [], desc: '완전한 신의 경지. 도달한 자가 거의 존재하지 않는 궁극의 무위.', conditions: '우주의 경지를 깨달아 의지대로 자유로이 다룸. 공간의 제약이 일체 없음. 시간을 멈출 수 있는 것으로 추정.', notes: '여의: 무한한 의지로 못하는 것이 없음.' },
  { id: 'l12', sub: '경지', rank: '12', name: '탈각 / 등선 / 우화등선', aliases: [], desc: '인간의 경계를 넘어서는 것. 무로써 도를 이뤄 등선하는 궁극의 경지. 육신을 버리고 선계로 나아감.', conditions: '', notes: '' },
  { id: 's1', sub: '검도', rank: '1', name: '검기', aliases: ['검기'], desc: '검에서 뿜어져 나오는 기운으로 상대에게 상처를 입히는 단계. 일류 고수부터 구사 가능.', conditions: '', notes: '' },
  { id: 's2', sub: '검도', rank: '2', name: '검사', aliases: [], desc: '검기가 실처럼 가늘고 길게 이어지는 단계.', conditions: '', notes: '' },
  { id: 's3', sub: '검도', rank: '3', name: '검강', aliases: ['검강'], desc: '검기가 강철처럼 굳어지는 단계. 초절정~화경의 상징적인 기술.', conditions: '', notes: '' },
  { id: 's4', sub: '검도', rank: '4', name: '검환', aliases: ['검환'], desc: '검강을 압축하여 구슬 형태로 방출하는 단계. 화경 고수의 상징적 기술.', conditions: '', notes: '' },
  { id: 's5', sub: '검도', rank: '5', name: '이기어검술', aliases: [], desc: '기로 검을 부려 검 없이도 검술을 펼치는 단계.', conditions: '', notes: '' },
  { id: 's6', sub: '검도', rank: '6', name: '이기어검강', aliases: [], desc: '기로 검강을 부리는 단계. 이기어검술보다 한 단계 높은 경지.', conditions: '', notes: '' },
  { id: 's7', sub: '검도', rank: '7', name: '신검합일', aliases: [], desc: '몸과 검이 하나가 되는 경지. 검을 매개체로 하는 무공의 정점.', conditions: '', notes: '' },
  { id: 's8', sub: '검도', rank: '8', name: '심검 / 무형검', aliases: [], desc: '마음으로 검을 다루는 궁극의 경지. 현경~생사경부터 구사 가능.', conditions: '', notes: '' },
  { id: 'c3', sub: '성취', rank: '', name: '만류귀종', aliases: [], desc: '모든 흐름이 하나의 근원으로 돌아감.', conditions: '', notes: '' },
  { id: 'c4', sub: '성취', rank: '', name: '반로환동', aliases: [], desc: '무공이 경지에 이르러 몸이 최적화되며 어린아이처럼 젊어지는 현상.', conditions: '', notes: '' },
  { id: 'c5', sub: '성취', rank: '', name: '환골탈태', aliases: [], desc: '뼈와 근육이 무예에 최적화되어 완전히 새롭게 바뀌는 과정.', conditions: '', notes: '' },
  { id: 'c8', sub: '방어', rank: '', name: '금강불괴', aliases: [], desc: '어떤 검이나 무기를 맞아도 다치지 않는 경지.', conditions: '', notes: '' },
  { id: 'c9', sub: '방어', rank: '', name: '만독불침', aliases: [], desc: '모든 독이 침범하지 못함.', conditions: '', notes: '' },
  { id: 'c10', sub: '방어', rank: '', name: '도검불침', aliases: [], desc: '칼과 검이 침범하지 못함.', conditions: '', notes: '' },
  { id: 'c11', sub: '방어', rank: '', name: '한서불침', aliases: [], desc: '춥고 더움이 침범하지 못함.', conditions: '', notes: '' },
  { id: 'c13', sub: '성취', rank: '', name: '삼화취정', aliases: [], desc: '정, 기, 신 세 가지 꽃이 정수리에 모이는 경지.', conditions: '', notes: '' },
  { id: 'c14', sub: '성취', rank: '', name: '오기조원', aliases: [], desc: '오장의 다섯 기운이 근원으로 조화되는 경지.', conditions: '', notes: '' },
  { id: 'c16', sub: '성취', rank: '', name: '반박귀진', aliases: [], desc: '꾸밈을 버리고 본래의 진실로 돌아감.', conditions: '', notes: '' },
  { id: 'c15', sub: '성취', rank: '', name: '무극', aliases: [], desc: '극이 없는 경지. 어떠한 한계도 없는 상태.', conditions: '', notes: '' },
];

const DEFAULT_ARTS: Art[] = [
  { id: 'ma9', faction: '정파', type: '병기법', name: '태극혜검', tag: '무당파', desc: '무당파의 대표 검법. 태극의 원리를 검에 담아 부드러움으로 강함을 꺾는 무공.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma8', faction: '정파', type: '권각법', name: '태극권', tag: '무당파', desc: '무당파의 대표 권법. 부드러움으로 강함을 제압하는 이유극강의 원리.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma10', faction: '정파', type: '병기법', name: '이십사수매화검법', tag: '화산파', desc: '화산파의 대표 검법. 매화가 피어나듯 화려하고 정밀한 24수의 검초.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma14', faction: '정파', type: '병기법', name: '천뢰검법', tag: '남궁세가', desc: '뇌기를 검에 실어 내리치는 가전검법. 고통을 줄이는 구결이 없어 극도로 익히기 까다로움. 대성 시 눈동자가 금색으로 변함.', traits: [], merits: '', demerits: '', details: [], notes: '세가 내에서도 사양 추세.' },
  { id: 'ma15', faction: '정파', type: '병기법', name: '제왕검형', tag: '남궁세가', desc: '내공으로 상대가 운신할 공간 자체를 막아버리는 가전검법. 유력 후계자부터 전수.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma16', faction: '정파', type: '병기법', name: '천뢰제왕검형', tag: '남궁세가', desc: '천뢰검법과 제왕검형을 하나로 합친 합일검법. 제왕검형으로 가두고 뇌기로 마무리.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma11', faction: '정파', type: '병기법', name: '타구봉법', tag: '개방', desc: '개방 방주만이 전수받는 봉법. 개의 머리를 때리는 듯한 독특한 궤적.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma12', faction: '정파', type: '권각법', name: '항룡십팔장', tag: '개방', desc: '개방의 최강 장법. 18초식으로 구성된 강맹한 장력의 무공.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma13', faction: '정파', type: '암기법', name: '만천화우', tag: '사천당가', desc: '사천당가의 대표 암기술. 꽃비처럼 쏟아지는 수백 개의 암기로 범위를 제압.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma3', faction: '무소속', type: '신보법', name: '이형환위', tag: '최상급 경공', desc: '단순히 빨리 뛰는 경공을 넘어선 순간이동에 가까운 상급 신법. 잔상을 남기며 위치를 바꿔치기하는 기술.', traits: [], merits: '', demerits: '', details: [], notes: '역골공과 병행하면 변장과 이동을 동시에 활용 가능.' },
  { id: 'ma4', faction: '무소속', type: '신보법', name: '허공답보', tag: '최상급 경공', desc: '허공을 밟으며 이동하는 최상위 경공. 화경 이상에서 구사 가능한 전설적 신법.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'n5', faction: '무소속', type: '특수법', name: '흡성대법', tag: '흡공 계열', desc: '상대의 내공을 강제로 흡수하여 자신의 것으로 만드는 절학. 특정 세력에 속하지 않는 금기의 무공.', traits: ['타인의 내공을 직접 흡수', '빠른 축적이 가능하나 뒤엉킬 위험'], merits: '축적 속도가 매우 빠름.', demerits: '이질적 내공 충돌 시 주화입마 위험.', details: [], notes: '' },
  { id: 'ma5', faction: '무소속', type: '특수법', name: '격공섭물', tag: '운기', desc: '진기를 발출하여 먼 거리의 물건을 끌어당기거나 밀어내는 기술. 화경 이상에서 구사 가능.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma2', faction: '무소속', type: '특수법', name: '축골술', tag: '특수 체술', desc: '역골공의 하위 개념. 뼈와 근육을 압축해 몸집을 줄이는 기술. 잠입과 암살의 필수 무공.', traits: [], merits: '', demerits: '', details: [], notes: '' },
  { id: 'ma1', faction: '무소속', type: '특수법', name: '역골공', tag: '특수 체술', desc: '인체의 뼈 마디마디를 탈구시키거나 수축시켜 체형을 자유자재로 변형하는 무공.', traits: [], merits: '', demerits: '', details: [{ l: '탈출', t: '포박 시 뼈를 어긋나게 해 빠져나옴.' }, { l: '공격', t: '팔 길이를 순간 늘려 타격.' }, { l: '방어', t: '급소 위치를 비틀어 치명상을 면함.' }], notes: '하위 개념으로 축골술이 있음.' },
];

const DEFAULT_FACTIONS: Faction[] = [
  {
    id: 'f1', name: '정파', tag: '무림의 중심', desc: '도덕과 규율을 중시하며 중원무림의 주류 세력.',
    groups: [
      { label: '구파일방', members: [{ n: '소림사', d: '[하남성 숭산] 무림의 태두. 불가 계통.' }, { n: '무당파', d: '[호북성 무당산] 도가 계통.' }, { n: '화산파', d: '[섬서성 화산] 도가 계통.' }, { n: '해남파', d: '[해남성] 해적 퇴치를 위한 연합체.' }, { n: '곤륜파', d: '[청해성 곤륜산] 도가 계통.' }, { n: '점창파', d: '[운남성 점창산] 빠른 쾌검.' }, { n: '종남파', d: '[섬서성 종남산] 천하삼십육검.' }, { n: '공동파', d: '[감숙성 공동산] 복마검법.' }, { n: '개방', d: '[중원 전역] 거지 조직. 최대 정보망.' }] },
      { label: '오대세가', members: [{ n: '남궁세가', d: '정파 맹주를 자주 맡는 검의 명가.' }, { n: '하북팽가', d: '[하북성] 도법의 명가.' }, { n: '사천당가', d: '[사천성] 암기와 독술의 명가.' }, { n: '모용세가', d: '검술과 의술, 책략.' }, { n: '제갈세가', d: '진법과 기문둔갑의 명가.' }] },
    ],
    notes: '구파일방 고정: 소림, 무당, 화산, 해남, 개방.\n무림맹: 정파 연합 조직.\n후기지수: 다음 세대 수장급 젊은 고수.',
  },
  { id: 'f2', name: '사파', tag: '강호의 실질적 지배자', desc: '힘의 논리와 이익을 추구하는 집단.', groups: [{ label: '주요 구성', members: [{ n: '녹림', d: '산적 집단.' }, { n: '장강수로채', d: '강 기반 수적.' }, { n: '하오문', d: '정보와 소규모 범죄.' }, { n: '살막', d: '암살 전문.' }, { n: '흑점', d: '불법 무기 거래.' }] }], notes: '내공심법이 부족. 실전 기술 발달.' },
  { id: 'f3', name: '마교', tag: '절대악의 세력', desc: '중원 이외 지역에 근거지를 두며 마공을 숭상.', groups: [{ label: '대표 세력', members: [{ n: '천마신교', d: '교주 천마가 절대적 권력.' }] }, { label: '충성 맹세', members: [{ n: '천마재림 만마앙복', d: '천마가 재림하면 만 마가 엎드린다.' }] }], notes: '정파에 필적하는 수준.' },
  { id: 'f4', name: '혈교', tag: '금기 세력', desc: '마교에서 파생. 극도로 사악한 술법을 사용.', groups: [{ label: '금기 무공', members: [{ n: '흡혈술', d: '피를 흡수하여 내공.' }, { n: '강시술', d: '시체를 조종.' }, { n: '실혼인', d: '정신을 빼앗아 조종.' }] }, { label: '충성 맹세', members: [{ n: '혈세천하 혈마앙복', d: '혈마의 세상이 천하를 덮는다.' }] }], notes: '마교조차 배척.' },
  { id: 'f5', name: '세외 세력', tag: '중원 밖', desc: '중원 밖에서 활동하는 고수나 문파.', groups: [{ label: '주요 세력', members: [{ n: '북해빙궁', d: '북쪽 얼음 동굴.' }, { n: '남만야수궁', d: '남쪽 밀림. 맹수.' }, { n: '동해용궁', d: '바다 건너.' }, { n: '포달라궁', d: '서장 불교 계열.' }] }], notes: '' },
  { id: 'f6', name: '무소속', tag: '독립', desc: '특정 세력에 속하지 않는 무인들.', groups: [{ label: '주요 분류', members: [{ n: '낭인', d: '문파 없이 강호를 떠도는 무사.' }] }], notes: '' },
];

const DEFAULT_TITLES: Title[] = [
  { id: 't5', name: '천하제일인', tag: '강함 기준', desc: '무림 전체에서 가장 강한 한 명.', members: [], notes: '' },
  { id: 't12', name: '천하삼대검수', tag: '강함 기준', desc: '천하에서 검술이 가장 뛰어난 세 명.', members: [], notes: '' },
  { id: 't4', name: '무림십존', tag: '강함 기준', desc: '무림에서 가장 강한 10명.', members: [], notes: '정사마 구분 없이 선정.' },
  { id: 't8', name: '무림맹주', tag: '직위', desc: '무림맹의 수장. 정파 무림을 대표하는 최고 지도자.', members: [], notes: '남궁세가가 자주 맡음.' },
  { id: 't7', name: '사도제일인', tag: '강함 기준', desc: '사파와 마교를 통틀어 가장 강한 한 명.', members: [], notes: '' },
  { id: 't2', name: '사대악인', tag: '악명 기준', desc: '세계관 내에서 가장 악명 높은 4명.', members: [], notes: '강함이 아닌 악명 + 위험도 기준.' },
  { id: 't3', name: '십대악인', tag: '악명 기준', desc: '악명 높은 10명 리스트.', members: [], notes: '사대악인 포함.' },
  { id: 't9', name: '사도맹주', tag: '직위', desc: '사도맹의 수장. 사파와 마교 연합 세력의 최고 지도자.', members: [], notes: '' },
  { id: 't1', name: '○○마', tag: '개인 이명', desc: '특정 분야에서 극에 도달한 인간에게 붙는 별명. 사람이 아닌 것 같은 수준이라는 의미로 마(魔)를 붙임.', members: [{ n: '검마', d: '검의 정점에 오른 존재.' }, { n: '독마', d: '독술의 끝. 싸움 자체가 불가능한 타입.' }, { n: '광마', d: '예측 불가한 전투 스타일.' }, { n: '도마', d: '도(刀) 계열 최강자.' }, { n: '극마', d: '극한까지 밀어붙인 존재.' }, { n: '살마', d: '살인에 특화. 암살, 전투 둘 다 가능.' }, { n: '천마', d: '천마신교(마교)의 교주. 마교 내 절대적 권력의 상징.' }, { n: '혈마', d: '혈마신교(혈교)의 교주. 피를 다루는 금단의 존재.' }], notes: '분야별 인간 최종 진화형. ○○마는 공식 직책이 아닌 강호에서 붙여주는 이명.' },
  { id: 't6', name: '생사신의', tag: '개인 이명', desc: '살리고 죽이는 것 모두 신의 경지에 이른 달인.', members: [], notes: '' },
];

const DEFAULT_MISC: Misc[] = [
  { id: 'n1', sub: '내공 이론', name: '정기 (正氣)', tag: '내공 이론', desc: '순수한 에너지나 정종 무공을 통해 쌓은 맑고 바른 내공. 정파 무공의 핵심 내력.', details: [{ l: '순양내공', t: '양기가 강하고 올바른 기운.' }, { l: '음유내공', t: '부드럽고 차가운 기운.' }, { l: '장점', t: '축적 한계점이 가장 높고 절정 이상의 벽을 넘기 가장 쉬움.' }, { l: '단점', t: '축적 속도가 가장 느림.' }], notes: '' },
  { id: 'n3', sub: '내공 이론', name: '사기 (邪氣)', tag: '내공 이론', desc: '사파 계열의 수련법으로 쌓은 기운. 탁기의 하위 분류.', details: [{ l: '장점', t: '정파보다 축적 속도가 빠름.' }, { l: '단점', t: '축적 한도가 적음. 절정의 벽을 넘기 가장 어려움.' }], notes: '' },
  { id: 'n2b', sub: '내공 이론', name: '마기 (魔氣)', tag: '내공 이론', desc: '마교 계열의 수련법으로 쌓은 기운. 탁기의 하위 분류이나 독자적 성질이 강함.', details: [{ l: '장점', t: '빠른 내공 축적. 순간적 내력 증폭.' }, { l: '단점', t: '정신건강에 매우 해로움. 잠식 시 영혼이 구원받지 못함.' }, { l: '탁기와의 차이', t: '탁기는 혼탁한 기운의 총칭, 마기는 마교 특유의 파괴적 기운.' }], notes: '' },
  { id: 'n2a', sub: '내공 이론', name: '탁기 (濁氣)', tag: '내공 이론', desc: '정기의 반대. 맑지 못하고 혼탁한 기운의 총칭.', details: [{ l: '특징', t: '정기보다 축적은 빠르나 제어가 어려움.' }, { l: '위험성', t: '과도하게 쌓이면 경맥을 오염시키고 주화입마의 원인이 됨.' }], notes: '' },
  { id: 'n7a', sub: '내공 이론', name: '선천진기 (先天眞氣)', tag: '내공 이론', desc: '태어날 때부터 가지고 있는 생명력의 근원. 사용하면 최대치 자체가 깎여 회복 불가.', details: [{ l: '장점', t: '일반 내공보다 훨씬 강력.' }, { l: '단점', t: '소모 시 회복 불가. 전부 소모 시 사망.' }], notes: '60년 수련 = 1갑자.' },
  { id: 'n7b', sub: '내공 이론', name: '선천지기 (先天之氣)', tag: '내공 이론', desc: '천지가 개벽하기 이전부터 존재하는 근원적인 자연의 기운.', details: [{ l: '선천진기와의 차이', t: '선천진기(眞氣)는 개인의 생명력, 선천지기(之氣)는 천지자연의 근원적 기운.' }, { l: '활용', t: '자연경 이상의 경지에서 자연의 기를 몸에 담아 무한에 가까운 내공을 보유하는 근거.' }], notes: '' },
  { id: 'n4x', sub: '무공 범주', name: '독공', tag: '무공 범주', desc: '독물을 섭취하거나 독을 다루며 내공과 전투에 활용하는 수련 체계의 총칭.', details: [{ l: '특징', t: '수련할수록 만독불침에 가까워짐.' }, { l: '장점', t: '살상력이 높음.' }, { l: '단점', t: '절정 전 정신 흐릿해지고 수명 단축.' }], notes: '' },
  { id: 'n6x', sub: '무공 범주', name: '색공', tag: '무공 범주', desc: '방중술을 기반으로 파트너와의 수련을 통해 내공을 얻는 수련 체계.', details: [{ l: '장점', t: '파트너가 있을 때 축적 속도가 빠름.' }, { l: '단점', t: '색마로 낙인 찍힐 위험.' }], notes: '' },
  { id: 'mx1', sub: '무공 범주', name: '경공', tag: '무공 범주', desc: '가볍고 빠르게 이동하는 신법의 총칭.', details: [{ l: '예시', t: '초영보, 능파미보, 사해풍운보, 허공답보, 이형환위 등.' }], notes: '' },
  { id: 'mx2', sub: '무공 범주', name: '진법', tag: '무공 범주', desc: '특정 진형을 구성하여 전투력을 극대화하는 전술 무공의 총칭.', details: [{ l: '예시', t: '백팔나한진(소림), 천라지망진, 오행진 등.' }], notes: '제갈세가가 으뜸.' },
  { id: 'mx3', sub: '무공 범주', name: '외공', tag: '무공 범주', desc: '외부 신체(피부, 근육, 뼈)를 직접 단련하여 강화하는 무공 체계의 총칭.', details: [{ l: '특징', t: '내공 없이도 일정 수준까지 수련 가능.' }, { l: '장점', t: '방어력이 높고 근력 강화에 특화.' }, { l: '단점', t: '순수 외공만으로는 절정의 벽을 넘기 어려움.' }], notes: '' },
  { id: 'mx4', sub: '무공 범주', name: '음공', tag: '무공 범주', desc: '음기(陰氣)를 활용하여 수련하는 무공 체계의 총칭. 차갑고 어두운 성질의 내공을 축적.', details: [{ l: '특징', t: '음습한 환경에서 수련 효율이 극대화됨.' }, { l: '장점', t: '상대의 양기를 잠식하여 내력을 약화시키는 데 탁월.' }, { l: '단점', t: '양기가 강한 정종무공에 상성이 약함.' }], notes: '' },
  { id: 'x7', sub: '증상', name: '절맥증', tag: '난치병', desc: '선천적으로 기의 순환이 불가능하여 무공을 익히면 단명.', details: [], notes: '무공 수련 자체가 독이 되는 체질.' },
  { id: 'x8', sub: '증상', name: '음양지체', tag: '체질', desc: '양과 음의 기운이 부조화하여 내공 수련이 극히 더딘 신체.', details: [], notes: '' },
  { id: 'x9', sub: '증상', name: '주화입마', tag: '증상', desc: '내공 운기 중 기혈이 역류. 경미하면 내공 손실, 심하면 폐인 또는 사망.', details: [{ l: '원인', t: '이질적 내공 충돌, 비급 오독, 수련 중 외부 방해.' }], notes: '' },
  { id: 'x5', sub: '기타', name: '폐관수련', tag: '수련', desc: '외부와의 접촉을 끊고 수련에만 정진하는 행위.', details: [{ l: '목적', t: '내공 돌파, 영약 흡수, 비급 소화, 부상 회복.' }, { l: '위험성', t: '방해 시 주화입마 위험.' }], notes: '' },
  { id: 'x6', sub: '기타', name: '독문무공', tag: '문파/가문', desc: '그 문파나 가문에서만 전해 내려오는 고유의 비기.', details: [{ l: '외문무공', t: '문하생 누구나 배울 수 있는 기초.' }, { l: '입실제자 진전', t: '핵심 제자에게만 전수.' }, { l: '단전지설', t: '후계자 한 명에게만 전수하는 최고 비기.' }, { l: '파해법', t: '독문무공의 약점을 무력화시키는 방법.' }], notes: '' },
];

const DEFAULT_FORTUNE: Fortune[] = [
  { id: 'e5', sub: '영약', name: '대환단', tag: '제조/소림', desc: '소림사에서 제조하는 최고급 환단. 내공 회복과 증진에 효과적.', details: [], notes: '' },
  { id: 'e6', sub: '영약', name: '소환단', tag: '제조/소림', desc: '대환단의 하위 버전. 부상 치료에도 효과적.', details: [], notes: '' },
  { id: 'e7', sub: '영약', name: '자소단', tag: '제조/화산파', desc: '화산파에서 제조하는 영약. 자하시공의 수련을 돕는 효능.', details: [], notes: '' },
  { id: 'e8', sub: '영약', name: '태청단', tag: '제조/도가', desc: '도가 계열에서 제조하는 영약. 정기를 맑게 하고 내공 순환을 돕는 효능.', details: [], notes: '' },
  { id: 'e9', sub: '영약', name: '만년화리 내단', tag: '동물계', desc: '만 년 이상 살아온 잉어의 내단. 막대한 내공을 얻을 수 있으나 가공 필요.', details: [], notes: '날것은 독성이 강해 반드시 가공 후 섭취.' },
  { id: 'e10', sub: '영약', name: '만년금구 내단', tag: '동물계', desc: '만 년 이상 살아온 거북의 내단. 방어적 성향의 내공을 증진.', details: [], notes: '' },
  { id: 'e11', sub: '영약', name: '천년금사 내단', tag: '동물계', desc: '천 년 이상 살아온 뱀의 내단. 독공 수련자에게 최고의 영약.', details: [], notes: '' },
  { id: 'e1', sub: '영약', name: '만년설삼', tag: '식물계', desc: '만 년 이상 자란 설삼. 극한지에서 자라며 복용 시 막대한 내공을 얻을 수 있음.', details: [], notes: '' },
  { id: 'e2', sub: '영약', name: '천년하수오', tag: '식물계', desc: '천 년 이상 묵은 하수오. 복용 시 백발이 검어지고 내공이 크게 증진됨.', details: [], notes: '' },
  { id: 'e4', sub: '영약', name: '공청석유', tag: '광물계', desc: '동굴 깊은 곳에 한두 방울 고여있는 극희귀 광물 영약.', details: [], notes: '' },
  { id: 'cr1', sub: '영물', name: '만년화리', tag: '수계', desc: '만 년 이상 살아온 잉어. 수중에서 영기를 축적하며 내단을 품고 있음.', details: [{ l: '내단', t: '섭취 시 막대한 내공 획득. 가공 필요.' }, { l: '서식지', t: '깊은 호수나 강의 심연.' }], notes: '' },
  { id: 'cr2', sub: '영물', name: '만년금구', tag: '수계', desc: '만 년 이상 살아온 거북. 등껍질에 천연 진법이 새겨져 있다는 전설.', details: [{ l: '내단', t: '방어적 성향의 내공 증진.' }, { l: '특징', t: '극도의 인내심과 지혜.' }], notes: '' },
  { id: 'cr3', sub: '영물', name: '천년금사', tag: '독계', desc: '천 년 이상 살아온 뱀. 맹독과 영기를 동시에 품고 있어 극도로 위험하면서 귀중.', details: [{ l: '내단', t: '독공 수련자에게 최고의 영약.' }, { l: '독', t: '만독불침이 아닌 이상 즉사.' }], notes: '' },
  { id: 'cr4', sub: '영물', name: '영수', tag: '산계', desc: '산속에서 수백 년 이상 살아온 짐승의 총칭.', details: [{ l: '활용', t: '길들여 이동수단이나 소환수로 활용.' }, { l: '지성', t: '높은 지성을 가진 영물은 인간 세계에 섞여 살기도 함.' }], notes: '최소 수백~천 년의 세월이 필요.' },
  { id: 'x3b', sub: '신병이기', name: '만년한철', tag: '금속', desc: '수만 년 이상 묵은 한철. 강도와 냉기가 일반 한철과 차원이 다름.', details: [], notes: '' },
  { id: 'x3', sub: '신병이기', name: '한철', tag: '금속', desc: '극한지에서 채취되는 냉기를 머금은 철.', details: [], notes: '' },
  { id: 'x3c', sub: '신병이기', name: '운철', tag: '금속', desc: '하늘에서 떨어진 운석으로 만든 금속. 극도의 경도와 특수한 기운.', details: [], notes: '' },
  { id: 'x3d', sub: '신병이기', name: '백련정강', tag: '금속', desc: '수백 번 단련하여 불순물을 제거한 최고급 강철.', details: [], notes: '' },
  { id: 'x3e', sub: '신병이기', name: '천잠사', tag: '섬유', desc: '천잠이 뽑아내는 실. 강철보다 질기며 무기, 방어구 제작에 활용.', details: [], notes: '' },
];

/* ═════════════════════ 공통 UI 원자 ═════════════════════ */

type TagShape = 'pill' | 'square';
const Tag = ({ color, shape = 'square', children }: { color: string; shape?: TagShape; children: ReactNode }) => (
  <span style={{
    fontSize: '10.5px', padding: shape === 'pill' ? '2px 8px' : '2px 9px',
    borderRadius: shape === 'pill' ? '20px' : '6px',
    background: color + '18', color, border: `1px solid ${color}33`,
    whiteSpace: 'nowrap', fontWeight: 500,
  }}>{children}</span>
);

const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,17,17,0.55)' }}>
      <div style={{ background: '#fafafa', borderRadius: '12px', border: '1px solid #ddd', width: 'min(560px,92vw)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', color: '#111' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>{title}</p>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666', padding: '4px' }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ message, onConfirm, onCancel }: { message: string; onConfirm: (() => void) | null; onCancel: () => void }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,17,17,0.55)' }}>
    <div style={{ background: '#fafafa', borderRadius: '12px', border: '1px solid #ddd', width: 'min(400px,85vw)', padding: '24px', color: '#111', textAlign: 'center' }}>
      <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{message}</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {onConfirm && <button type="button" onClick={onCancel} style={{ padding: '8px 24px', borderRadius: '6px', border: '1px solid #bbb', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#555' }}>취소</button>}
        <button type="button" onClick={() => (onConfirm ? onConfirm() : onCancel())} style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', background: '#111', cursor: 'pointer', fontSize: '13px', color: '#fff', fontWeight: 500 }}>{onConfirm ? '확인' : '닫기'}</button>
      </div>
    </div>
  </div>
);

const EditIconButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" title="수정" aria-label="수정" onClick={(e: MouseEvent) => { e.stopPropagation(); onClick(); }}
    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: C.textTertiary, padding: '4px 8px' }}>✎</button>
);

/* ─ form fields ─ */
const fieldInput: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', color: '#111', fontSize: '13px', fontFamily: 'inherit', outline: 'none' };
const fieldLabel: CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '4px' };
const fieldWrap: CSSProperties = { marginBottom: '12px' };

const TextField = ({ label, value, onChange, placeholder, multiline }: { label: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) => (
  <div style={fieldWrap}>
    <label style={fieldLabel}>{label}</label>
    {multiline
      ? <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...fieldInput, resize: 'vertical' }} />
      : <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldInput} />}
  </div>
);

const TagField = ({ label, value, onChange }: { label: string; value: string[] | undefined; onChange: (v: string[]) => void }) => {
  const [draft, setDraft] = useState('');
  const tags = value ?? [];
  const add = () => { const t = draft.trim(); if (!t) return; onChange([...tags, t]); setDraft(''); };
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}</label>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
        {tags.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Tag color="#534AB7" shape="pill">{t}
              <span onClick={() => onChange(tags.filter((_, j) => j !== i))} style={{ cursor: 'pointer', opacity: 0.6, fontSize: '12px', marginLeft: '4px' }}>✕</span>
            </Tag>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="입력 후 Enter" style={{ ...fieldInput, flex: 1 }} />
        <button type="button" onClick={add} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #ccc', background: '#e8e8e8', cursor: 'pointer', fontSize: '12px', color: '#111' }}>추가</button>
      </div>
    </div>
  );
};

function PairListField<K1 extends string, K2 extends string>({ label, keyLeft, keyRight, value, onChange, placeholderLeft, placeholderRight }: { label: string; keyLeft: K1; keyRight: K2; value: Array<Record<K1 | K2, string>> | undefined; onChange: (v: Array<Record<K1 | K2, string>>) => void; placeholderLeft: string; placeholderRight: string }) {
  const entries = value ?? [];
  const update = (i: number, k: K1 | K2, n: string) => { const c = entries.slice(); c[i] = { ...c[i], [k]: n }; onChange(c); };
  const empty = { [keyLeft]: '', [keyRight]: '' } as Record<K1 | K2, string>;
  return (
    <div style={fieldWrap}>
      <label style={{ ...fieldLabel, marginBottom: '6px' }}>{label}</label>
      {entries.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input value={item[keyLeft] ?? ''} onChange={(e) => update(i, keyLeft, e.target.value)} placeholder={placeholderLeft} style={{ ...fieldInput, flex: '0 0 28%' }} />
          <input value={item[keyRight] ?? ''} onChange={(e) => update(i, keyRight, e.target.value)} placeholder={placeholderRight} style={{ ...fieldInput, flex: 1 }} />
          <button type="button" onClick={() => onChange(entries.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D85A30', fontSize: '16px', padding: '6px', flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...entries, { ...empty }])} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px dashed #ccc', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#666' }}>+ 항목</button>
    </div>
  );
}

const GroupField = ({ label, value, onChange }: { label: string; value: MemberGroup[] | undefined; onChange: (v: MemberGroup[]) => void }) => {
  const groups = value ?? [];
  const upG = (gi: number, p: Partial<MemberGroup>) => { const c = groups.slice(); c[gi] = { ...c[gi], ...p }; onChange(c); };
  const upM = (gi: number, mi: number, p: Partial<MemberEntry>) => { const c = groups.slice(); const m = c[gi].members.slice(); m[mi] = { ...m[mi], ...p }; c[gi] = { ...c[gi], members: m }; onChange(c); };
  return (
    <div style={fieldWrap}>
      <label style={{ ...fieldLabel, marginBottom: '6px' }}>{label}</label>
      {groups.map((g, gi) => (
        <div key={gi} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px', background: '#f0f0f0' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input value={g.label} onChange={(e) => upG(gi, { label: e.target.value })} placeholder="그룹명" style={{ ...fieldInput, fontWeight: 600, flex: 1 }} />
            <button type="button" onClick={() => onChange(groups.filter((_, j) => j !== gi))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D85A30', fontSize: '14px' }}>✕</button>
          </div>
          {g.members.map((m, mi) => (
            <div key={mi} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              <input value={m.n} onChange={(e) => upM(gi, mi, { n: e.target.value })} placeholder="이름" style={{ ...fieldInput, flex: '0 0 28%' }} />
              <input value={m.d} onChange={(e) => upM(gi, mi, { d: e.target.value })} placeholder="설명" style={{ ...fieldInput, flex: 1 }} />
              <button type="button" onClick={() => { const c = groups.slice(); c[gi] = { ...c[gi], members: c[gi].members.filter((_, j) => j !== mi) }; onChange(c); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D85A30', fontSize: '14px', flexShrink: 0 }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={() => { const c = groups.slice(); c[gi] = { ...c[gi], members: [...c[gi].members, { n: '', d: '' }] }; onChange(c); }} style={{ padding: '3px 10px', borderRadius: '4px', border: '1px dashed #ccc', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: '#666', marginTop: '4px' }}>+ 구성원</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...groups, { label: '', members: [{ n: '', d: '' }] }])} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px dashed #ccc', background: 'transparent', cursor: 'pointer', fontSize: '12px', color: '#666' }}>+ 그룹</button>
    </div>
  );
};

/* ═════════════════════ 카드 공통 스타일 ═════════════════════ */

const cardStyle: CSSProperties = { border: `1px solid ${C.borderTertiary}`, borderRadius: '10px', background: C.bgPrimary, overflow: 'hidden' };
const cardHeader: CSSProperties = { display: 'flex', alignItems: 'center', cursor: 'pointer' };
const cardBody: CSSProperties = { flex: 1, padding: '11px 14px' };
const cardExpand: CSSProperties = { borderTop: `1px solid ${C.borderTertiary}`, padding: '12px 16px', background: C.bgSecondary, display: 'flex', flexDirection: 'column', gap: '10px' };
const rankBadge = (c: string): CSSProperties => ({ width: '42px', background: c + '14', borderRight: `1px solid ${c}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', flexShrink: 0 });
const memberItem = (c: string): CSSProperties => ({ background: C.bgPrimary, border: `1px solid ${C.borderTertiary}`, borderRadius: '6px', padding: '8px 12px', borderLeft: `3px solid ${c}` });

const ExpandChevron = ({ expanded }: { expanded: boolean }) => (
  <div style={{ padding: '0 12px', color: C.textTertiary, fontSize: '10px', userSelect: 'none', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</div>
);

const NotesBlock = ({ notes }: { notes: string }) => (
  <div>
    <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textSecondary, fontWeight: 600 }}>메모</p>
    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: C.textSecondary, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{notes}</p>
  </div>
);

/* ═════════════════════ 엔티티 카드 ═════════════════════ */

const LevelCard = ({ level, expanded, onToggle, onEdit }: { level: Level; expanded: boolean; onToggle: () => void; onEdit: () => void }) => {
  const pickColor = () => {
    if (level.sub === '검도') return '#534AB7';
    if (level.sub === '경지') {
      const idx = DEFAULT_LEVELS.findIndex((x) => x.id === level.id);
      return RANK_COLORS[idx] ?? colorOfTag(level.sub);
    }
    return colorOfTag(level.sub);
  };
  const hasRank = level.sub === '경지' || level.sub === '검도';
  const color = pickColor();
  const showDetails = expanded && (level.conditions || level.notes);
  return (
    <div style={cardStyle}>
      <div onClick={onToggle} style={cardHeader}>
        {hasRank && level.rank
          ? <div style={rankBadge(color)}><p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color }}>{level.rank}</p></div>
          : <div style={{ ...rankBadge(color), width: '6px', padding: 0 }} />}
        <div style={cardBody}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{level.name}</p>
            <Tag color={color}>{level.sub}</Tag>
            {level.aliases.map((a, i) => <Tag key={i} color={color} shape="pill">{a}</Tag>)}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: C.textSecondary, lineHeight: 1.6 }}>{level.desc}</p>
        </div>
        <EditIconButton onClick={onEdit} />
        <ExpandChevron expanded={expanded} />
      </div>
      {showDetails && (
        <div style={cardExpand}>
          {level.conditions && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textSecondary, fontWeight: 600 }}>조건 / 특이사항</p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{level.conditions}</p>
            </div>
          )}
          {level.notes && <NotesBlock notes={level.notes} />}
        </div>
      )}
    </div>
  );
};

const ArtCard = ({ art, expanded, onToggle, onEdit }: { art: Art; expanded: boolean; onToggle: () => void; onEdit: () => void }) => {
  const cf = colorOfTag(art.faction);
  const ct = colorOfTag(art.type);
  const hasTraits = art.traits.length > 0;
  const hasDetails = art.details.length > 0;
  const showExpand = expanded && (hasTraits || hasDetails || art.merits || art.demerits || art.notes);
  return (
    <div style={cardStyle}>
      <div onClick={onToggle} style={{ ...cardHeader, padding: '12px 16px', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{art.name}</p>
            <Tag color={cf}>{art.faction}</Tag>
            <Tag color={ct} shape="pill">{art.type}</Tag>
            {art.tag && <span style={{ fontSize: '10px', color: C.textTertiary }}>{art.tag}</span>}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: C.textSecondary, lineHeight: 1.6 }}>{art.desc}</p>
        </div>
        <EditIconButton onClick={onEdit} />
        <ExpandChevron expanded={expanded} />
      </div>
      {showExpand && (
        <div style={cardExpand}>
          {hasTraits && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textSecondary, fontWeight: 600 }}>특징</p>
              {art.traits.map((t, j) => (
                <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '3px' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: cf, marginTop: 8, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7 }}>{t}</p>
                </div>
              ))}
            </div>
          )}
          {(art.merits || art.demerits) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {art.merits && (
                <div style={{ background: C.bgPrimary, borderRadius: '6px', padding: '10px 12px', borderLeft: '3px solid #1D9E75' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#1D9E75', fontWeight: 600 }}>장점</p>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: C.textSecondary }}>{art.merits}</p>
                </div>
              )}
              {art.demerits && (
                <div style={{ background: C.bgPrimary, borderRadius: '6px', padding: '10px 12px', borderLeft: '3px solid #D85A30' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#D85A30', fontWeight: 600 }}>단점</p>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: C.textSecondary }}>{art.demerits}</p>
                </div>
              )}
            </div>
          )}
          {hasDetails && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textSecondary, fontWeight: 600 }}>상세</p>
              {art.details.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: '2px' }}><Tag color={ct}>{d.l}</Tag></span>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>{d.t}</p>
                </div>
              ))}
            </div>
          )}
          {art.notes && <NotesBlock notes={art.notes} />}
        </div>
      )}
    </div>
  );
};

const FactionCard = ({ faction, expanded, onToggle, onEdit }: { faction: Faction; expanded: boolean; onToggle: () => void; onEdit: () => void }) => {
  const color = colorOfTag(faction.tag);
  return (
    <div style={cardStyle}>
      <div onClick={onToggle} style={{ ...cardHeader, padding: '12px 16px', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>{faction.name}</p>
            {faction.tag && <Tag color={color}>{faction.tag}</Tag>}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: C.textSecondary, lineHeight: 1.6 }}>{faction.desc}</p>
        </div>
        <EditIconButton onClick={onEdit} />
        <ExpandChevron expanded={expanded} />
      </div>
      {expanded && (
        <div style={cardExpand}>
          {faction.groups.map((g, gi) => (
            <div key={gi}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: C.textSecondary }}>{g.label}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '6px' }}>
                {g.members.map((m, mi) => (
                  <div key={mi} style={memberItem(color)}>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px' }}>{m.n}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: 1.5 }}>{m.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {faction.notes && (
            <div style={{ borderTop: `1px solid ${C.borderTertiary}`, paddingTop: '8px' }}>
              <NotesBlock notes={faction.notes} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TitleCard = ({ title, expanded, onToggle, onEdit }: { title: Title; expanded: boolean; onToggle: () => void; onEdit: () => void }) => {
  const color = colorOfTag(title.tag);
  const hasMembers = title.members.length > 0;
  return (
    <div style={cardStyle}>
      <div onClick={onToggle} style={{ ...cardHeader, padding: '14px 16px', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>{title.name}</p>
            <Tag color={color}>{title.tag}</Tag>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: 1.6 }}>{title.desc}</p>
        </div>
        <EditIconButton onClick={onEdit} />
        <ExpandChevron expanded={expanded} />
      </div>
      {expanded && (hasMembers || title.notes) && (
        <div style={cardExpand}>
          {hasMembers && (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '11px', color: C.textSecondary, fontWeight: 600 }}>구성</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '6px' }}>
                {title.members.map((m, i) => (
                  <div key={i} style={memberItem(color)}>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '13px' }}>{m.n}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: C.textSecondary, lineHeight: 1.5 }}>{m.d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {title.notes && <NotesBlock notes={title.notes} />}
        </div>
      )}
    </div>
  );
};

const DetailCard = ({ data, expanded, onToggle, onEdit }: { data: { id: string; name: string; tag: string; desc: string; details: DetailEntry[]; notes: string }; expanded: boolean; onToggle: () => void; onEdit: () => void }) => {
  const color = colorOfTag(data.tag);
  const hasDetails = data.details.length > 0;
  const show = expanded && (hasDetails || data.notes);
  return (
    <div style={cardStyle}>
      <div onClick={onToggle} style={{ ...cardHeader, padding: '12px 16px', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{data.name}</p>
            {data.tag && <Tag color={color}>{data.tag}</Tag>}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: C.textSecondary, lineHeight: 1.6 }}>{data.desc}</p>
        </div>
        <EditIconButton onClick={onEdit} />
        <ExpandChevron expanded={expanded} />
      </div>
      {show && (
        <div style={cardExpand}>
          {hasDetails && (
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textSecondary, fontWeight: 600 }}>상세</p>
              {data.details.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: '2px' }}><Tag color={color}>{d.l}</Tag></span>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>{d.t}</p>
                </div>
              ))}
            </div>
          )}
          {data.notes && <NotesBlock notes={data.notes} />}
        </div>
      )}
    </div>
  );
};

/* ═════════════════════ 검색 텍스트 ═════════════════════ */

const levelSearchText = (x: Level) => joinSearchable([x.name, x.desc, x.conditions, x.notes, ...x.aliases]);
const artSearchText = (x: Art) => joinSearchable([x.name, x.desc, x.tag, x.notes, x.faction, x.type, x.merits, x.demerits, ...x.traits, ...x.details.map((d) => d.l + d.t)]);
const factionSearchText = (x: Faction) => joinSearchable([x.name, x.tag, x.desc, x.notes, ...x.groups.flatMap((g) => [g.label, ...g.members.map((m) => m.n + m.d)])]);
const titleSearchText = (x: Title) => joinSearchable([x.name, x.tag, x.desc, x.notes, ...x.members.map((m) => m.n + m.d)]);
const miscSearchText = (x: Misc) => joinSearchable([x.name, x.tag, x.desc, x.notes, ...x.details.map((d) => d.l + d.t)]);
const fortuneSearchText = (x: Fortune) => joinSearchable([x.name, x.tag, x.desc, x.notes, ...x.details.map((d) => d.l + d.t)]);

/* ═════════════════════ Edit 폼 ═════════════════════ */

type EditState =
  | { tabId: 'levels'; item: Level; isNew: boolean }
  | { tabId: 'arts'; item: Art; isNew: boolean }
  | { tabId: 'factions'; item: Faction; isNew: boolean }
  | { tabId: 'titles'; item: Title; isNew: boolean }
  | { tabId: 'misc'; item: Misc; isNew: boolean }
  | { tabId: 'fortune'; item: Fortune; isNew: boolean };

const LevelForm = ({ value, onPatch }: { value: Level; onPatch: (p: Partial<Level>) => void }) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField label="분류" value={value.sub} onChange={(v) => onPatch({ sub: v as LevelSub })} placeholder="경지, 검도, 성취, 방어, 공격" />
      <TextField label="순위" value={value.rank} onChange={(v) => onPatch({ rank: v })} placeholder="숫자(선택)" />
    </div>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TagField label="별칭" value={value.aliases} onChange={(v) => onPatch({ aliases: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <TextField label="조건/특이사항" value={value.conditions} onChange={(v) => onPatch({ conditions: v })} multiline />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);

const ArtForm = ({ value, onPatch }: { value: Art; onPatch: (p: Partial<Art>) => void }) => (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField label="세력" value={value.faction} onChange={(v) => onPatch({ faction: v as ArtFaction })} placeholder="정파, 사파, 마교, 혈교, 세외, 무소속" />
      <TextField label="계열" value={value.type} onChange={(v) => onPatch({ type: v as ArtType })} placeholder="심법, 병기법, 권각법, 신보법, 호신법, 암기법, 특수법" />
    </div>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField label="태그/계열" value={value.tag} onChange={(v) => onPatch({ tag: v })} placeholder="예: 정파, 소림사..." />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <TagField label="특징" value={value.traits} onChange={(v) => onPatch({ traits: v })} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      <TextField label="장점" value={value.merits} onChange={(v) => onPatch({ merits: v })} multiline />
      <TextField label="단점" value={value.demerits} onChange={(v) => onPatch({ demerits: v })} multiline />
    </div>
    <PairListField label="상세 항목" keyLeft="l" keyRight="t" value={value.details} onChange={(v) => onPatch({ details: v as DetailEntry[] })} placeholderLeft="레이블" placeholderRight="내용" />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);

const FactionForm = ({ value, onPatch }: { value: Faction; onPatch: (p: Partial<Faction>) => void }) => (
  <>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField label="태그/계열" value={value.tag} onChange={(v) => onPatch({ tag: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <GroupField label="소속 그룹 / 구성원" value={value.groups} onChange={(v) => onPatch({ groups: v })} />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);

const TitleForm = ({ value, onPatch }: { value: Title; onPatch: (p: Partial<Title>) => void }) => (
  <>
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField label="태그/계열" value={value.tag} onChange={(v) => onPatch({ tag: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <PairListField label="구성원" keyLeft="n" keyRight="d" value={value.members} onChange={(v) => onPatch({ members: v as MemberEntry[] })} placeholderLeft="이름" placeholderRight="설명" />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);

const MiscForm = ({ value, onPatch }: { value: Misc; onPatch: (p: Partial<Misc>) => void }) => (
  <>
    <TextField label="분류" value={value.sub} onChange={(v) => onPatch({ sub: v as MiscSub })} placeholder="내공 이론, 무공 범주, 증상, 기타" />
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField label="태그/계열" value={value.tag} onChange={(v) => onPatch({ tag: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <PairListField label="상세 항목" keyLeft="l" keyRight="t" value={value.details} onChange={(v) => onPatch({ details: v as DetailEntry[] })} placeholderLeft="레이블" placeholderRight="내용" />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);

const FortuneForm = ({ value, onPatch }: { value: Fortune; onPatch: (p: Partial<Fortune>) => void }) => (
  <>
    <TextField label="분류" value={value.sub} onChange={(v) => onPatch({ sub: v as FortuneSub })} placeholder="영약, 영물, 신병이기" />
    <TextField label="이름" value={value.name} onChange={(v) => onPatch({ name: v })} />
    <TextField label="태그/계열" value={value.tag} onChange={(v) => onPatch({ tag: v })} />
    <TextField label="설명" value={value.desc} onChange={(v) => onPatch({ desc: v })} multiline />
    <PairListField label="상세 항목" keyLeft="l" keyRight="t" value={value.details} onChange={(v) => onPatch({ details: v as DetailEntry[] })} placeholderLeft="레이블" placeholderRight="내용" />
    <TextField label="메모" value={value.notes} onChange={(v) => onPatch({ notes: v })} multiline />
  </>
);

const EntryEditModal = ({ state, onChange, onSave, onDelete, onClose }: { state: EditState; onChange: (s: EditState) => void; onSave: () => void; onDelete: () => void; onClose: () => void }) => {
  const title = state.isNew ? '새 항목 추가' : `${state.item.name || '항목'} 수정`;
  const patch = <T extends EditState>(p: Partial<T['item']>) => {
    onChange({ ...state, item: { ...state.item, ...p } } as EditState);
  };
  const render = () => {
    switch (state.tabId) {
      case 'levels': return <LevelForm value={state.item} onPatch={(p) => patch<{ tabId: 'levels'; item: Level; isNew: boolean }>(p)} />;
      case 'arts': return <ArtForm value={state.item} onPatch={(p) => patch<{ tabId: 'arts'; item: Art; isNew: boolean }>(p)} />;
      case 'factions': return <FactionForm value={state.item} onPatch={(p) => patch<{ tabId: 'factions'; item: Faction; isNew: boolean }>(p)} />;
      case 'titles': return <TitleForm value={state.item} onPatch={(p) => patch<{ tabId: 'titles'; item: Title; isNew: boolean }>(p)} />;
      case 'misc': return <MiscForm value={state.item} onPatch={(p) => patch<{ tabId: 'misc'; item: Misc; isNew: boolean }>(p)} />;
      case 'fortune': return <FortuneForm value={state.item} onPatch={(p) => patch<{ tabId: 'fortune'; item: Fortune; isNew: boolean }>(p)} />;
    }
  };
  return (
    <Modal open onClose={onClose} title={title}>
      {render()}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
        <div>
          {!state.isNew && (
            <button type="button" onClick={onDelete} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #D85A30', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#D85A30', fontWeight: 500 }}>삭제</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #bbb', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#555' }}>취소</button>
          <button type="button" onClick={onSave} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#111', cursor: 'pointer', fontSize: '13px', color: '#fff', fontWeight: 500 }}>저장</button>
        </div>
      </div>
    </Modal>
  );
};

/* ═════════════════════ 기타 작은 컴포넌트 ═════════════════════ */

function PillSelector<T extends string>({ options, value, onChange, labelOf = (v) => v }: { options: readonly T[]; value: T; onChange: (v: T) => void; labelOf?: (v: T) => string }) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)}
            style={{
              padding: '4px 12px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '11px',
              fontWeight: active ? 600 : 400,
              background: active ? C.textPrimary : 'transparent',
              borderColor: active ? C.textPrimary : C.borderTertiary,
              color: active ? C.bgPrimary : C.textSecondary,
              whiteSpace: 'nowrap',
            }}>{labelOf(o)}</button>
        );
      })}
    </div>
  );
}

const SessionBanner = () => (
  <div style={{ margin: '0 20px 12px', padding: '8px 12px', borderRadius: '6px', background: '#FFF6E5', border: '1px solid #EED9A8', fontSize: '11.5px', color: '#7A5600' }}>
    ⚠️ 아티팩트 환경에서는 데이터가 브라우저에 저장되지 않습니다. 새로고침 시 초기화되며, 백업은 📋 내보내기로 JSON 을 복사해 두세요.
  </div>
);

const EmptyState = () => (
  <p style={{ textAlign: 'center', padding: '40px 20px', color: C.textTertiary, fontSize: '13px' }}>검색 결과가 없습니다.</p>
);

/* ═════════════════════ 드래그 훅 ═════════════════════ */

const useDragReorder = <T extends HasId>(items: T[], onReorder: (next: T[]) => void) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const doDrop = useCallback((targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const copy = items.slice();
    const from = copy.findIndex((x) => x.id === dragId);
    const to = copy.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    onReorder(copy);
  }, [dragId, items, onReorder]);
  const bindItem = useCallback((id: string) => ({
    draggable: true as const,
    onDragStart: (e: DragEvent) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); },
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOverId((p) => (p === id ? p : id)); },
    onDrop: (e: DragEvent) => { e.preventDefault(); doDrop(id); setDragId(null); setOverId(null); },
    onDragEnd: () => { setDragId(null); setOverId(null); },
  }), [doDrop]);
  return { dragId, overId, bindItem };
};

/* ═════════════════════ 메인 ═════════════════════ */

export default function CodexArtifact() {
  const [levels, setLevels] = useState<Level[]>(DEFAULT_LEVELS);
  const [arts, setArts] = useState<Art[]>(DEFAULT_ARTS);
  const [factions, setFactions] = useState<Faction[]>(DEFAULT_FACTIONS);
  const [titles, setTitles] = useState<Title[]>(DEFAULT_TITLES);
  const [misc, setMisc] = useState<Misc[]>(DEFAULT_MISC);
  const [fortune, setFortune] = useState<Fortune[]>(DEFAULT_FORTUNE);

  const [tab, setTab] = useState<TabId>('levels');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [edit, setEdit] = useState<EditState | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; onOk: (() => void) | null } | null>(null);
  const [showExport, setShowExport] = useState(false);

  const [levelSub, setLevelSub] = useState<LevelSub>('경지');
  const [artFaction, setArtFaction] = useState<ArtFactionFilter>('전체');
  const [artType, setArtType] = useState<ArtTypeFilter>('전체');
  const [miscSub, setMiscSub] = useState<MiscSub>('내공 이론');
  const [fortuneSub, setFortuneSub] = useState<FortuneSub>('영약');

  const setByTab = useCallback((t: TabId, next: unknown) => {
    switch (t) {
      case 'levels': setLevels(next as Level[]); break;
      case 'arts': setArts(next as Art[]); break;
      case 'factions': setFactions(next as Faction[]); break;
      case 'titles': setTitles(next as Title[]); break;
      case 'misc': setMisc(next as Misc[]); break;
      case 'fortune': setFortune(next as Fortune[]); break;
    }
  }, []);

  const getByTab = useCallback((t: TabId): HasId[] => {
    switch (t) {
      case 'levels': return levels;
      case 'arts': return arts;
      case 'factions': return factions;
      case 'titles': return titles;
      case 'misc': return misc;
      case 'fortune': return fortune;
    }
  }, [levels, arts, factions, titles, misc, fortune]);

  const reorder = useDragReorder<HasId>(getByTab(tab), (next) => setByTab(tab, next));

  const toggleExpand = (id: string) => setExpandedId((p) => (p === id ? null : id));

  const filtered = useMemo(() => {
    switch (tab) {
      case 'levels': return levels.filter((i) => i.sub === levelSub).filter((i) => matches(levelSearchText(i), query));
      case 'arts': {
        let it = arts;
        if (artFaction !== '전체') it = it.filter((i) => i.faction === artFaction);
        if (artType !== '전체') it = it.filter((i) => i.type === artType);
        return it.filter((i) => matches(artSearchText(i), query));
      }
      case 'factions': return factions.filter((i) => matches(factionSearchText(i), query));
      case 'titles': return titles.filter((i) => matches(titleSearchText(i), query));
      case 'misc': return misc.filter((i) => i.sub === miscSub).filter((i) => matches(miscSearchText(i), query));
      case 'fortune': return fortune.filter((i) => i.sub === fortuneSub).filter((i) => matches(fortuneSearchText(i), query));
    }
  }, [tab, levels, arts, factions, titles, misc, fortune, levelSub, artFaction, artType, miscSub, fortuneSub, query]);

  const handleTabChange = (next: TabId) => { setTab(next); setExpandedId(null); setQuery(''); };

  const openNew = () => {
    const make = <T extends EditState>(s: T): T => s;
    switch (tab) {
      case 'levels': setEdit(make({ tabId: 'levels', item: { id: '', sub: '경지', rank: '', name: '', aliases: [], desc: '', conditions: '', notes: '' }, isNew: true })); break;
      case 'arts': setEdit(make({ tabId: 'arts', item: { id: '', faction: artFaction === '전체' ? '정파' : artFaction, type: artType === '전체' ? '심법' : artType, name: '', tag: '', desc: '', traits: [], merits: '', demerits: '', details: [], notes: '' }, isNew: true })); break;
      case 'factions': setEdit(make({ tabId: 'factions', item: { id: '', name: '', tag: '', desc: '', groups: [{ label: '', members: [{ n: '', d: '' }] }], notes: '' }, isNew: true })); break;
      case 'titles': setEdit(make({ tabId: 'titles', item: { id: '', name: '', tag: '', desc: '', members: [], notes: '' }, isNew: true })); break;
      case 'misc': setEdit(make({ tabId: 'misc', item: { id: '', sub: miscSub, name: '', tag: '', desc: '', details: [], notes: '' }, isNew: true })); break;
      case 'fortune': setEdit(make({ tabId: 'fortune', item: { id: '', sub: fortuneSub, name: '', tag: '', desc: '', details: [], notes: '' }, isNew: true })); break;
    }
  };

  const saveEdit = () => {
    if (!edit) return;
    const current = getByTab(edit.tabId);
    const next = edit.isNew
      ? [...current, { ...edit.item, id: createId() }]
      : current.map((x) => (x.id === edit.item.id ? edit.item : x));
    setByTab(edit.tabId, next);
    setEdit(null);
  };

  const deleteEdit = () => {
    if (!edit) return;
    const next = getByTab(edit.tabId).filter((x) => x.id !== edit.item.id);
    setByTab(edit.tabId, next);
    setEdit(null);
  };

  const restoreDefault = () => {
    setConfirm({
      msg: '기본값으로 복원하시겠습니까?\n현재 탭의 데이터가 초기 기본값으로 대체됩니다.',
      onOk: () => {
        switch (tab) {
          case 'levels': setLevels(DEFAULT_LEVELS); break;
          case 'arts': setArts(DEFAULT_ARTS); break;
          case 'factions': setFactions(DEFAULT_FACTIONS); break;
          case 'titles': setTitles(DEFAULT_TITLES); break;
          case 'misc': setMisc(DEFAULT_MISC); break;
          case 'fortune': setFortune(DEFAULT_FORTUNE); break;
        }
        setExpandedId(null);
        setConfirm(null);
      },
    });
  };

  const filters = (() => {
    switch (tab) {
      case 'levels':
        return <div style={{ marginBottom: '12px' }}><PillSelector options={LEVEL_SUBS} value={levelSub} onChange={(v) => { setLevelSub(v); setExpandedId(null); }} labelOf={(v) => LEVEL_SUB_LABELS[v]} /></div>;
      case 'arts':
        return (
          <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textTertiary, fontWeight: 600 }}>세력</p>
              <PillSelector options={ART_FACTION_FILTERS} value={artFaction} onChange={(v) => { setArtFaction(v); setExpandedId(null); }} labelOf={(v) => ART_FACTION_LABELS[v]} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: C.textTertiary, fontWeight: 600 }}>계열</p>
              <PillSelector options={ART_TYPE_FILTERS} value={artType} onChange={(v) => { setArtType(v); setExpandedId(null); }} labelOf={(v) => ART_TYPE_LABELS[v]} />
            </div>
          </div>
        );
      case 'misc':
        return <div style={{ marginBottom: '12px' }}><PillSelector options={MISC_SUBS} value={miscSub} onChange={(v) => { setMiscSub(v); setExpandedId(null); }} /></div>;
      case 'fortune':
        return <div style={{ marginBottom: '12px' }}><PillSelector options={FORTUNE_SUBS} value={fortuneSub} onChange={(v) => { setFortuneSub(v); setExpandedId(null); }} /></div>;
      default:
        return null;
    }
  })();

  const DraggableRow = ({ id, children }: { id: string; children: ReactNode }) => {
    const isDragging = reorder.dragId === id;
    const isOver = reorder.overId === id && !!reorder.dragId && reorder.dragId !== id;
    return (
      <div {...reorder.bindItem(id)} style={{ opacity: isDragging ? 0.3 : 1, borderTop: isOver ? '2px solid #378ADD' : '2px solid transparent', transition: 'opacity 0.15s', cursor: reorder.dragId ? 'grabbing' : 'grab' }}>{children}</div>
    );
  };

  const renderCards = () => {
    if (filtered.length === 0) return <EmptyState />;
    switch (tab) {
      case 'levels':
        return (filtered as Level[]).map((i) => (
          <DraggableRow key={i.id} id={i.id}>
            <LevelCard level={i} expanded={expandedId === i.id} onToggle={() => toggleExpand(i.id)}
              onEdit={() => setEdit({ tabId: 'levels', item: { ...i, aliases: [...i.aliases] }, isNew: false })} />
          </DraggableRow>
        ));
      case 'arts':
        return (filtered as Art[]).map((i) => (
          <DraggableRow key={i.id} id={i.id}>
            <ArtCard art={i} expanded={expandedId === i.id} onToggle={() => toggleExpand(i.id)}
              onEdit={() => setEdit({ tabId: 'arts', item: { ...i, traits: [...i.traits], details: [...i.details] }, isNew: false })} />
          </DraggableRow>
        ));
      case 'factions':
        return (filtered as Faction[]).map((i) => (
          <DraggableRow key={i.id} id={i.id}>
            <FactionCard faction={i} expanded={expandedId === i.id} onToggle={() => toggleExpand(i.id)}
              onEdit={() => setEdit({ tabId: 'factions', item: JSON.parse(JSON.stringify(i)), isNew: false })} />
          </DraggableRow>
        ));
      case 'titles':
        return (filtered as Title[]).map((i) => (
          <DraggableRow key={i.id} id={i.id}>
            <TitleCard title={i} expanded={expandedId === i.id} onToggle={() => toggleExpand(i.id)}
              onEdit={() => setEdit({ tabId: 'titles', item: { ...i, members: [...i.members] }, isNew: false })} />
          </DraggableRow>
        ));
      case 'misc':
        return (filtered as Misc[]).map((i) => (
          <DraggableRow key={i.id} id={i.id}>
            <DetailCard data={{ id: i.id, name: i.name, tag: i.tag, desc: i.desc, details: i.details, notes: i.notes }}
              expanded={expandedId === i.id} onToggle={() => toggleExpand(i.id)}
              onEdit={() => setEdit({ tabId: 'misc', item: { ...i, details: [...i.details] }, isNew: false })} />
          </DraggableRow>
        ));
      case 'fortune':
        return (filtered as Fortune[]).map((i) => (
          <DraggableRow key={i.id} id={i.id}>
            <DetailCard data={{ id: i.id, name: i.name, tag: i.tag, desc: i.desc, details: i.details, notes: i.notes }}
              expanded={expandedId === i.id} onToggle={() => toggleExpand(i.id)}
              onEdit={() => setEdit({ tabId: 'fortune', item: { ...i, details: [...i.details] }, isNew: false })} />
          </DraggableRow>
        ));
    }
  };

  return (
    <div style={{ fontFamily: "'Noto Serif KR','Nanum Myeongjo',Georgia,serif", fontSize: '14px', color: C.textPrimary, paddingBottom: '32px', background: C.bgPrimary, minHeight: '100vh' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${C.borderTertiary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>武林典籍</h1>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: C.textTertiary }}>무협 세계관 레퍼런스</p>
        </div>
        <button type="button" onClick={() => setShowExport(true)} style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${C.borderTertiary}`, background: 'transparent', cursor: 'pointer', fontSize: '11px', color: C.textTertiary, whiteSpace: 'nowrap', marginTop: '4px' }}>📋 전체 내보내기</button>
      </div>

      {/* 검색 */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: C.textTertiary, pointerEvents: 'none' }}>🔍</span>
          <input type="text" placeholder="검색..." value={query}
            onChange={(e) => { setQuery(e.target.value); setExpandedId(null); }}
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 36px 8px 34px', borderRadius: '8px', border: `1px solid ${C.borderTertiary}`, background: C.bgSecondary, color: C.textPrimary, fontSize: '13px', outline: 'none' }} />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="검색 지우기" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textTertiary, fontSize: '14px' }}>✕</button>}
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: '1px', padding: '10px 20px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => handleTabChange(t.id)}
              style={{
                padding: '7px 13px', borderRadius: '8px 8px 0 0', border: '1px solid', cursor: 'pointer', fontSize: '12px',
                fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
                background: active ? C.bgPrimary : 'transparent',
                borderColor: active ? C.borderSecondary : 'transparent',
                borderBottomColor: active ? C.bgPrimary : 'transparent',
                color: active ? C.textPrimary : C.textSecondary,
                marginBottom: active ? '-1px' : 0,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}><span style={{ fontSize: '12px', opacity: 0.7 }}>{t.icon}</span>{t.label}</button>
          );
        })}
      </div>
      <div style={{ borderTop: `1px solid ${C.borderTertiary}` }} />

      <SessionBanner />

      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={openNew} style={{ padding: '7px 16px', borderRadius: '8px', border: `1px solid ${C.borderSecondary}`, background: C.bgSecondary, cursor: 'pointer', fontSize: '12px', color: C.textPrimary, fontWeight: 500 }}>＋ 새 항목</button>
          <button type="button" onClick={restoreDefault} style={{ padding: '5px 10px', borderRadius: '6px', border: `1px solid ${C.borderTertiary}`, background: 'transparent', cursor: 'pointer', fontSize: '11px', color: C.textTertiary }}>기본값 복원</button>
        </div>
        {filters}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>{renderCards()}</div>
      </div>

      {edit && (
        <EntryEditModal state={edit} onChange={setEdit} onSave={saveEdit} onDelete={deleteEdit} onClose={() => setEdit(null)} />
      )}
      {confirm && <ConfirmDialog message={confirm.msg} onConfirm={confirm.onOk} onCancel={() => setConfirm(null)} />}
      {showExport && (
        <ExportModal data={{ levels, arts, factions, titles, misc, fortune }}
          onClose={() => setShowExport(false)}
          onCopied={() => { setShowExport(false); setConfirm({ msg: '클립보드에 복사되었습니다.', onOk: null }); }} />
      )}
    </div>
  );
}

const ExportModal = ({ data, onClose, onCopied }: { data: unknown; onClose: () => void; onCopied: () => void }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const handleCopy = async () => {
    const ok = await copyToClipboard(json);
    if (ok) onCopied();
    else if (textareaRef.current) textareaRef.current.select();
  };
  return (
    <Modal open onClose={onClose} title="전체 데이터 내보내기">
      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#888' }}>아래 JSON을 복사해 두면 다음 세션에 기본 데이터로 반영할 수 있습니다.</p>
      <textarea ref={textareaRef} readOnly value={json} style={{ width: '100%', boxSizing: 'border-box', height: '400px', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', background: '#f0f0f0', color: '#111', fontSize: '11px', fontFamily: 'monospace', resize: 'vertical' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
        <button type="button" onClick={onClose} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #bbb', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#555' }}>닫기</button>
        <button type="button" onClick={handleCopy} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#111', cursor: 'pointer', fontSize: '13px', color: '#fff', fontWeight: 500 }}>복사</button>
      </div>
    </Modal>
  );
};
