// tab-battle.js
function avg(arr, field) { if (!arr.length) return 0; return arr.reduce((s, x) => s + (Number(x[field]) || 0), 0) / arr.length }
function round1(n) { return Math.round(n * 10) / 10; }

// ── 한글 조사(은/는, 이/가) 자동 처리 ──
function hasBatchim(ch) {
  const code = ch.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false; // 한글 음절이 아니면(P, J 등) 받침 없다고 취급
  return (code - 0xAC00) % 28 !== 0;
}
function josaEunNeun(word) { const last = word[word.length - 1]; return hasBatchim(last) ? '은' : '는'; }
function josaIGa(word) { const last = word[word.length - 1]; return hasBatchim(last) ? '이' : '가'; }

const OPPOSITE = { '아침형': '저녁형', '저녁형': '아침형', 'P': 'J', 'J': 'P' };

// 주어(subject)가 속한 "그룹군"
const FAMILY = { '아침형': 'chrono', '저녁형': 'chrono', 'P': 'mbti', 'J': 'mbti' };

// ── 지표(metric) 정의: 점수형(scale) + 범주형(category) ──
// 점수형은 원래 있던 4개 지표, 범주형은 주어의 반대 그룹군에서만 골라 쓸 수 있게 한다.
// (예: 주어가 '아침형/저녁형' 계열이면 metric으로 'P'/'J' 비율을, 주어가 'P/J' 계열이면 '아침형'/'저녁형' 비율을 고를 수 있음)
const BASE_METRIC_OPTIONS = [
  { value: 'meal', label: '급식만족도' },
  { value: 'nag', label: '잔소리집중도' },
  { value: 'pet', label: '반려동물수' },
  { value: 'honesty', label: '숙제성실도' },
];
const CATEGORY_METRIC_OPTIONS = {
  chrono: [ { value: 'catP', label: 'P' }, { value: 'catJ', label: 'J' } ],
  mbti:   [ { value: 'catMorning', label: '아침형' }, { value: 'catEvening', label: '저녁형' } ],
};
const METRIC_REGISTRY = {
  meal:        { label: '급식만족도', type: 'scale' },
  nag:         { label: '잔소리집중도', type: 'scale' },
  pet:         { label: '반려동물수', type: 'scale' },
  honesty:     { label: '숙제성실도', type: 'scale' },
  catP:        { label: 'P', type: 'category', field: 'mbti', target: 'P' },
  catJ:        { label: 'J', type: 'category', field: 'mbti', target: 'J' },
  catMorning:  { label: '아침형', type: 'category', field: 'chrono', target: '아침형' },
  catEvening:  { label: '저녁형', type: 'category', field: 'chrono', target: '저녁형' },
};

// 지표별 서술어 어간: 반려동물수/범주형 비율 비교는 "많다", 그 외 점수형 지표는 "높다"
function verbStem(metricValue) {
  const def = METRIC_REGISTRY[metricValue];
  if (def.type === 'category') return '많';
  return metricValue === 'pet' ? '많' : '높';
}

// 주어(subject) 값에 맞춰 metric select의 옵션을 다시 구성한다.
// (점수형 4개는 항상 유지 + 반대 그룹군의 범주형 2개를 추가)
function populateMetricOptions(selectEl, subjectValue, keepValue) {
  const family = FAMILY[subjectValue];
  const catOpts = CATEGORY_METRIC_OPTIONS[family] || [];
  const all = [...BASE_METRIC_OPTIONS, ...catOpts];
  selectEl.innerHTML = all.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
  if (keepValue && all.some(o => o.value === keepValue)) selectEl.value = keepValue;
}

// 그룹 내에서 특정 범주값의 비율(%)을 계산
function categoryPercent(arr, field, target) {
  if (!arr.length) return 0;
  return arr.filter(d => String(d[field]) === target).length / arr.length * 100;
}

const CONFETTI_COLORS = ['var(--pink)', 'var(--teal)', 'var(--yellow)'];
function spawnConfetti(layer) {
  layer.innerHTML = '';
  const count = 26;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = (Math.random() * 100) + '%';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = (Math.random() * 200) + 'ms';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(piece);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 1400);
}

function initBattle(container) {
  container.innerHTML = `
    <div class="sentence-builder">
      <select id="subject" class="select">
        <option>아침형</option><option>저녁형</option><option>P</option><option>J</option>
      </select>
      <span class="josa" id="josa1">은(는)</span>
      <select id="metric" class="select"></select>
      <span class="josa" id="josa2">가</span>
      <span class="static-text" id="verbText">높다!</span>
    </div>
    <div class="confirm-row">
      <button id="battleStart" class="btn">확인</button>
    </div>
    <div class="battle-result">
      <div id="resultLeft" class="result-left">
        <div class="confetti-layer" id="confettiLayer"></div>
        <div id="stamp" class="stamp-emoji" aria-hidden="true"></div>
        <div id="resultSentence" class="result-sentence"></div>
      </div>
      <div class="result-right">
        <div class="bars-vertical">
          <div class="bar-col">
            <div class="bar-track"><div id="barA" class="bar-fill a"></div></div>
            <div class="bar-value" id="valueA">0</div>
            <div class="bar-label" id="labelA">아침형</div>
          </div>
          <div class="bar-col">
            <div class="bar-track"><div id="barB" class="bar-fill b"></div></div>
            <div class="bar-value" id="valueB">0</div>
            <div class="bar-label" id="labelB">저녁형</div>
          </div>
        </div>
      </div>
    </div>
    <div id="countInfo" class="stat muted"></div>
  `;

  const subject = container.querySelector('#subject');
  const metric = container.querySelector('#metric');
  const josa1El = container.querySelector('#josa1');
  const josa2El = container.querySelector('#josa2');
  const verbText = container.querySelector('#verbText');
  const labelA = container.querySelector('#labelA');
  const labelB = container.querySelector('#labelB');
  const start = container.querySelector('#battleStart');
  const barA = container.querySelector('#barA');
  const barB = container.querySelector('#barB');
  const valueA = container.querySelector('#valueA');
  const valueB = container.querySelector('#valueB');
  const stamp = container.querySelector('#stamp');
  const resultLeft = container.querySelector('#resultLeft');
  const resultSentence = container.querySelector('#resultSentence');
  const confettiLayer = container.querySelector('#confettiLayer');
  const info = container.querySelector('#countInfo');

  function metricLabel() { return METRIC_REGISTRY[metric.value].label; }

  function updateSentence() {
    const sv = subject.value;
    const stem = verbStem(metric.value);
    josa1El.textContent = josaEunNeun(sv);
    josa2El.textContent = josaIGa(metricLabel());
    verbText.textContent = `${stem}다!`;
    labelA.textContent = sv;
    labelB.textContent = OPPOSITE[sv] || '나머지';
    // 선택이 바뀌면 이전 결과는 지운다
    stamp.classList.remove('show'); stamp.textContent = '';
    resultSentence.classList.remove('show'); resultSentence.textContent = '';
    resultLeft.classList.remove('ok', 'no', 'tie');
  }
  subject.addEventListener('change', () => {
    // 주어가 바뀌면 반대 그룹군의 범주형 옵션으로 metric 목록을 다시 구성한다
    populateMetricOptions(metric, subject.value, metric.value);
    updateSentence();
  });
  metric.addEventListener('change', updateSentence);
  populateMetricOptions(metric, subject.value);
  updateSentence();

  start.addEventListener('click', () => {
    const sv = subject.value;
    const metricDef = METRIC_REGISTRY[metric.value];
    const mLabel = metricLabel();
    const stem = verbStem(metric.value);
    const ov = OPPOSITE[sv] || '나머지';
    const isCategory = metricDef.type === 'category';
    const unit = isCategory ? '%' : '';

    sound.drumroll();
    stamp.textContent = ''; stamp.classList.remove('show');
    resultSentence.classList.remove('show');
    resultLeft.classList.remove('ok', 'no', 'tie');
    confettiLayer.innerHTML = '';

    setTimeout(() => {
      const group = state.data.filter(d => String(d.chrono) === sv || String(d.mbti) === sv);
      const rest = state.data.filter(d => !(String(d.chrono) === sv || String(d.mbti) === sv));

      const gAvg = isCategory ? categoryPercent(group, metricDef.field, metricDef.target) : avg(group, metric.value);
      const rAvg = isCategory ? categoryPercent(rest, metricDef.field, metricDef.target) : avg(rest, metric.value);
      const max = Math.max(gAvg, rAvg, 1);

      barA.style.height = Math.max(6, (gAvg / max) * 100) + '%'; valueA.textContent = round1(gAvg) + unit;
      barB.style.height = Math.max(6, (rAvg / max) * 100) + '%'; valueB.textContent = round1(rAvg) + unit;
      info.textContent = `응답 ${state.data.length}명 기준 결과예요. 사람이 늘어나면 또 바뀔 수도 있어요 😏`;

      setTimeout(() => {
        // 화면에 보이는 반올림 값 기준으로 판정 (예: 1.28 vs 1.32가 둘 다 "1.3"으로 보이는데
        // O/X가 나오면 이상하게 보이므로, 표시값이 같으면 무승부로 처리한다)
        const gR = round1(gAvg), rR = round1(rAvg);
        let result;
        if (gR === rR) result = 'TIE';
        else result = gR > rR ? 'O' : 'X';

        if (result === 'TIE') {
          stamp.textContent = '🤝';
          resultLeft.classList.add('tie');
          resultSentence.textContent = `${sv} · ${ov} 두 그룹의 ${mLabel}${josaIGa(mLabel)} 거의 같았어요! 무승부예요 🤝`;
          sound.tie();
        } else if (result === 'O') {
          stamp.textContent = '⭕';
          resultLeft.classList.add('ok');
          resultSentence.textContent = `${sv}${josaEunNeun(sv)} ${mLabel}${josaIGa(mLabel)} 정말 더 ${stem}았어요!`;
          sound.ding(); spawnConfetti(confettiLayer);
        } else {
          stamp.textContent = '❌';
          resultLeft.classList.add('no');
          resultSentence.textContent = `${sv}${josaEunNeun(sv)} ${mLabel}${josaIGa(mLabel)} 더 ${stem}지는 않았어요!`;
          sound.buzz();
        }
        stamp.classList.add('show');
        setTimeout(() => resultSentence.classList.add('show'), 50);
      }, 700);
    }, 800);
  });
}
