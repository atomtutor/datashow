// data.js
// CSV/붙여넣기 텍스트를 파싱해서 표준 배열로 변환합니다.
// (기존 fetch 기반 loadCSV는 제거 — file:// 환경(더블클릭 실행)에서 fetch가 막히기 때문에
//  샘플 데이터는 아래 SAMPLE_DATA 배열에 이미 파싱된 형태로 직접 넣어둡니다.)

function parseCSV(text) {
  if (!text || !String(text).trim()) return [];
  // remove BOM
  text = text.replace(/\uFEFF/g, '');
  const lines = String(text).trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  // detect delimiter: prefer tab if more tabs than commas
  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const tabCount = (headerLine.match(/\t/g) || []).length;
  const delim = tabCount > commaCount ? '\t' : ',';
  const headers = headerLine.split(delim).map(h => h.trim());

  // build normalized header map for robust lookup
  const normHeaders = headers.map(h => h.replace(/\s+/g, '').toLowerCase());

  const rows = lines.slice(1).map(l => {
    const cols = l.split(delim);
    const r = {};
    normHeaders.forEach((nh, i) => { r[nh] = (cols[i] === undefined ? "" : cols[i].trim()) });
    return r;
  });

  const find = (r, candidates) => {
    for (const c of candidates) {
      const k = String(c || '').replace(/\s+/g, '').toLowerCase();
      if (r[k] !== undefined) return r[k];
    }
    return '';
  }

  return rows.map(r => ({
    nickname: find(r, ['닉네임', 'nickname']),
    chrono: find(r, ['아침저녁형', '아침/저녁', 'chrono']),
    mbti: find(r, ['mbti', 'MBTI']),
    meal: Number(find(r, ['급식만족도', 'meal']) || 0),
    nag: Number(find(r, ['잔소리집중도', 'nag']) || 0),
    pet: Number(find(r, ['반려동물수', 'pet']) || 0),
    honesty: Number(find(r, ['숙제성실도', 'honesty']) || 0)
  }));
}

// 개발/테스트용 샘플 데이터 (survey_fake_data.csv 100개 응답을 그대로 파싱해서 넣어둔 것)
// "샘플 데이터 로드" 버튼 및 자동 로드 시 이 배열을 사용합니다. (fetch 사용 안 함 → file:// 더블클릭 실행 OK)
const SAMPLE_DATA = [
  {
    "nickname": "무지개마스터40",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 8,
    "nag": 4,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "우유킹",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 6,
    "nag": 4,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "다람쥐장인",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 10,
    "nag": 2,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "아이스크림고수",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 7,
    "nag": 6,
    "pet": 0,
    "honesty": 4
  },
  {
    "nickname": "곰돌이덕후",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 7,
    "nag": 7,
    "pet": 2,
    "honesty": 7
  },
  {
    "nickname": "곰돌이고수",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 6,
    "nag": 4,
    "pet": 0,
    "honesty": 8
  },
  {
    "nickname": "달빛누나",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 7,
    "nag": 5,
    "pet": 0,
    "honesty": 9
  },
  {
    "nickname": "메추리요정",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 10,
    "nag": 7,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "우유탐험가80",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 1,
    "nag": 3,
    "pet": 3,
    "honesty": 3
  },
  {
    "nickname": "라면누나31",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 3,
    "nag": 5,
    "pet": 3,
    "honesty": 7
  },
  {
    "nickname": "다람쥐고수",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 4,
    "nag": 2,
    "pet": 1,
    "honesty": 3
  },
  {
    "nickname": "토끼형아17",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 4,
    "nag": 2,
    "pet": 0,
    "honesty": 9
  },
  {
    "nickname": "수달챔피언",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 6,
    "nag": 5,
    "pet": 0,
    "honesty": 4
  },
  {
    "nickname": "고양이마스터",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 5,
    "nag": 5,
    "pet": 0,
    "honesty": 1
  },
  {
    "nickname": "별똥별짱49",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 7,
    "nag": 4,
    "pet": 0,
    "honesty": 8
  },
  {
    "nickname": "잠꾸러기수집가",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 3,
    "nag": 5,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "아이스크림사장님",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 3,
    "nag": 1,
    "pet": 2,
    "honesty": 8
  },
  {
    "nickname": "무지개장인",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 1,
    "nag": 3,
    "pet": 0,
    "honesty": 4
  },
  {
    "nickname": "수달매니아18",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 9,
    "nag": 5,
    "pet": 0,
    "honesty": 3
  },
  {
    "nickname": "잠꾸러기요원1",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 10,
    "nag": 2,
    "pet": 1,
    "honesty": 8
  },
  {
    "nickname": "피자친구56",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 3,
    "nag": 9,
    "pet": 2,
    "honesty": 4
  },
  {
    "nickname": "솜사탕요원5",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 3,
    "nag": 5,
    "pet": 1,
    "honesty": 6
  },
  {
    "nickname": "메추리탐험가",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 5,
    "nag": 7,
    "pet": 1,
    "honesty": 8
  },
  {
    "nickname": "펭귄덕후",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 5,
    "nag": 6,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "떡볶이챔피언",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 7,
    "nag": 4,
    "pet": 1,
    "honesty": 5
  },
  {
    "nickname": "달빛장인71",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 4,
    "nag": 5,
    "pet": 5,
    "honesty": 6
  },
  {
    "nickname": "무지개챔피언14",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 6,
    "nag": 5,
    "pet": 1,
    "honesty": 9
  },
  {
    "nickname": "메추리킹",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 7,
    "nag": 3,
    "pet": 2,
    "honesty": 3
  },
  {
    "nickname": "곰돌이형아",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 5,
    "nag": 3,
    "pet": 3,
    "honesty": 7
  },
  {
    "nickname": "댕댕이짱48",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 3,
    "nag": 7,
    "pet": 0,
    "honesty": 1
  },
  {
    "nickname": "붕어빵킹84",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 5,
    "nag": 3,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "고구마킹37",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 5,
    "nag": 4,
    "pet": 3,
    "honesty": 8
  },
  {
    "nickname": "우유킹42",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 10,
    "nag": 8,
    "pet": 1,
    "honesty": 6
  },
  {
    "nickname": "옥수수러버70",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 2,
    "nag": 7,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "구름요원",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 4,
    "nag": 6,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "펭귄탐험가",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 3,
    "nag": 5,
    "pet": 0,
    "honesty": 8
  },
  {
    "nickname": "딸기수집가",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 6,
    "nag": 7,
    "pet": 1,
    "honesty": 5
  },
  {
    "nickname": "댕댕이매니아29",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 1,
    "nag": 7,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "초코마스터",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 6,
    "nag": 10,
    "pet": 1,
    "honesty": 6
  },
  {
    "nickname": "젤리킹",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 4,
    "nag": 7,
    "pet": 1,
    "honesty": 5
  },
  {
    "nickname": "구름장인",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 9,
    "nag": 4,
    "pet": 2,
    "honesty": 4
  },
  {
    "nickname": "솜사탕짱",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 6,
    "nag": 7,
    "pet": 0,
    "honesty": 1
  },
  {
    "nickname": "딸기누나75",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 3,
    "nag": 3,
    "pet": 0,
    "honesty": 4
  },
  {
    "nickname": "고양이고수",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 6,
    "nag": 3,
    "pet": 0,
    "honesty": 8
  },
  {
    "nickname": "구름누나56",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 5,
    "nag": 5,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "메추리러버",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 9,
    "nag": 3,
    "pet": 0,
    "honesty": 3
  },
  {
    "nickname": "젤리수집가10",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 8,
    "nag": 7,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "다람쥐사장님28",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 2,
    "nag": 2,
    "pet": 3,
    "honesty": 4
  },
  {
    "nickname": "감자친구",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 7,
    "nag": 2,
    "pet": 2,
    "honesty": 7
  },
  {
    "nickname": "고양이매니아",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 4,
    "nag": 9,
    "pet": 1,
    "honesty": 5
  },
  {
    "nickname": "펭귄러버",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 5,
    "nag": 3,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "솜사탕러버31",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 9,
    "nag": 9,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "토끼매니아10",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 3,
    "nag": 5,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "치킨누나64",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 5,
    "nag": 4,
    "pet": 1,
    "honesty": 6
  },
  {
    "nickname": "옥수수마스터",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 3,
    "nag": 5,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "잠꾸러기수집가77",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 6,
    "nag": 7,
    "pet": 1,
    "honesty": 4
  },
  {
    "nickname": "딸기짱85",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 4,
    "nag": 7,
    "pet": 0,
    "honesty": 6
  },
  {
    "nickname": "아이스크림러버",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 3,
    "nag": 6,
    "pet": 3,
    "honesty": 6
  },
  {
    "nickname": "떡볶이킹",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 5,
    "nag": 5,
    "pet": 0,
    "honesty": 3
  },
  {
    "nickname": "딸기덕후",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 6,
    "nag": 10,
    "pet": 1,
    "honesty": 10
  },
  {
    "nickname": "만두친구94",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 4,
    "nag": 6,
    "pet": 2,
    "honesty": 8
  },
  {
    "nickname": "젤리형아",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 6,
    "nag": 2,
    "pet": 0,
    "honesty": 2
  },
  {
    "nickname": "곰돌이누나71",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 2,
    "nag": 9,
    "pet": 1,
    "honesty": 7
  },
  {
    "nickname": "무지개형아",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 4,
    "nag": 4,
    "pet": 0,
    "honesty": 2
  },
  {
    "nickname": "피자챔피언",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 4,
    "nag": 5,
    "pet": 0,
    "honesty": 8
  },
  {
    "nickname": "아이스크림요원5",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 10,
    "nag": 4,
    "pet": 1,
    "honesty": 7
  },
  {
    "nickname": "구름킹",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 7,
    "nag": 3,
    "pet": 0,
    "honesty": 8
  },
  {
    "nickname": "솜사탕챔피언43",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 6,
    "nag": 5,
    "pet": 3,
    "honesty": 4
  },
  {
    "nickname": "솜사탕요정46",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 5,
    "nag": 4,
    "pet": 1,
    "honesty": 7
  },
  {
    "nickname": "댕댕이챔피언45",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 6,
    "nag": 3,
    "pet": 1,
    "honesty": 8
  },
  {
    "nickname": "치킨수집가",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 3,
    "nag": 6,
    "pet": 1,
    "honesty": 7
  },
  {
    "nickname": "잠꾸러기탐험가",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 9,
    "nag": 5,
    "pet": 1,
    "honesty": 7
  },
  {
    "nickname": "초코매니아24",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 6,
    "nag": 5,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "잠꾸러기챔피언",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 7,
    "nag": 2,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "떡볶이매니아93",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 4,
    "nag": 2,
    "pet": 1,
    "honesty": 5
  },
  {
    "nickname": "무지개박사",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 10,
    "nag": 6,
    "pet": 1,
    "honesty": 1
  },
  {
    "nickname": "달빛매니아90",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 8,
    "nag": 6,
    "pet": 4,
    "honesty": 5
  },
  {
    "nickname": "고구마수집가",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 4,
    "nag": 3,
    "pet": 1,
    "honesty": 5
  },
  {
    "nickname": "번개덕후17",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 10,
    "nag": 7,
    "pet": 0,
    "honesty": 10
  },
  {
    "nickname": "라면요원",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 6,
    "nag": 3,
    "pet": 3,
    "honesty": 3
  },
  {
    "nickname": "우유챔피언92",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 6,
    "nag": 3,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "옥수수수집가9",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 9,
    "nag": 3,
    "pet": 1,
    "honesty": 3
  },
  {
    "nickname": "치킨집사",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 5,
    "nag": 6,
    "pet": 3,
    "honesty": 3
  },
  {
    "nickname": "떡볶이매니아",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 9,
    "nag": 9,
    "pet": 3,
    "honesty": 6
  },
  {
    "nickname": "곰돌이박사9",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 10,
    "nag": 4,
    "pet": 0,
    "honesty": 9
  },
  {
    "nickname": "토끼요원55",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 2,
    "nag": 9,
    "pet": 2,
    "honesty": 4
  },
  {
    "nickname": "고구마킹",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 3,
    "nag": 9,
    "pet": 0,
    "honesty": 4
  },
  {
    "nickname": "초코대장",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 5,
    "nag": 2,
    "pet": 0,
    "honesty": 7
  },
  {
    "nickname": "번개친구25",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 9,
    "nag": 3,
    "pet": 3,
    "honesty": 5
  },
  {
    "nickname": "수달요정",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 6,
    "nag": 5,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "초코친구",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 10,
    "nag": 8,
    "pet": 0,
    "honesty": 1
  },
  {
    "nickname": "우유덕후63",
    "chrono": "저녁형",
    "mbti": "J",
    "meal": 6,
    "nag": 3,
    "pet": 3,
    "honesty": 4
  },
  {
    "nickname": "댕댕이박사66",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 2,
    "nag": 8,
    "pet": 0,
    "honesty": 3
  },
  {
    "nickname": "구름사장님",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 7,
    "nag": 4,
    "pet": 5,
    "honesty": 2
  },
  {
    "nickname": "토끼박사",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 10,
    "nag": 4,
    "pet": 2,
    "honesty": 6
  },
  {
    "nickname": "고양이누나",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 6,
    "nag": 5,
    "pet": 0,
    "honesty": 3
  },
  {
    "nickname": "솜사탕요정",
    "chrono": "아침형",
    "mbti": "J",
    "meal": 4,
    "nag": 5,
    "pet": 2,
    "honesty": 7
  },
  {
    "nickname": "치킨친구28",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 9,
    "nag": 6,
    "pet": 0,
    "honesty": 4
  },
  {
    "nickname": "구름박사",
    "chrono": "저녁형",
    "mbti": "P",
    "meal": 6,
    "nag": 4,
    "pet": 0,
    "honesty": 5
  },
  {
    "nickname": "수달탐험가",
    "chrono": "아침형",
    "mbti": "P",
    "meal": 4,
    "nag": 5,
    "pet": 2,
    "honesty": 2
  }
];
