// tab-overview.js
function percent(count, total) { return total ? Math.round(count / total * 100) : 0 }

const OVERVIEW_FIELDS = [
  { key: 'chrono', label: '아침형 vs 저녁형', type: 'category', order: ['아침형', '저녁형'] },
  { key: 'mbti', label: '성향 유형 (P・J)', type: 'category', order: ['P', 'J'] },
  { key: 'meal', label: '급식 만족도', type: 'scale', color: 'var(--pink)' },
  { key: 'nag', label: '잔소리 집중도', type: 'scale', color: 'var(--teal)' },
  { key: 'pet', label: '반려동물 수', type: 'count', color: 'var(--pink)' },
  { key: 'honesty', label: '숙제 성실도', type: 'scale', color: 'var(--teal)' },
];
const CATEGORY_COLOR = { '아침형': 'var(--pink)', '저녁형': 'var(--teal)', 'P': 'var(--pink)', 'J': 'var(--teal)' };

function renderBarRow(label, value, valueText, color) {
  return `<div class="bar-row">
    <div class="row-label">${label}</div>
    <div class="row-track"><div class="row-fill" style="width:${value}%;background:${color}"></div></div>
    <div class="row-value">${valueText}</div>
  </div>`;
}

function initOverview(container) {
  let cur = 0;
  function render() {
    const field = OVERVIEW_FIELDS[cur];
    const total = state.data.length;
    container.innerHTML = `
      <div class="overview-card">
        <h2>${field.label}</h2>
        <div id="overviewBody" class="overview-body"></div>
        <div class="overview-nav">
          <button id="prev" class="btn secondary">◀ 이전</button>
          <span>${cur + 1} / ${OVERVIEW_FIELDS.length}</span>
          <button id="next" class="btn secondary">다음 ▶</button>
        </div>
      </div>`;
    const body = container.querySelector('#overviewBody');

    if (field.type === 'category') {
      const counts = {};
      state.data.forEach(d => { const v = d[field.key] || '미응답'; counts[v] = (counts[v] || 0) + 1; });
      const keys = (field.order || []).filter(k => counts[k] !== undefined)
        .concat(Object.keys(counts).filter(k => !(field.order || []).includes(k)));
      const top = keys.reduce((a, b) => (counts[a] || 0) >= (counts[b] || 0) ? a : b, keys[0]);
      body.innerHTML = `
        <div class="overview-summary">${percent(counts[top] || 0, total)}%</div>
        <div class="overview-caption">우리 반은 <strong>${top}</strong>이(가) 가장 많아요!</div>
        ${keys.map(k => renderBarRow(k, percent(counts[k], total), `${counts[k]}명 (${percent(counts[k], total)}%)`, CATEGORY_COLOR[k] || 'var(--pink)')).join('')}
      `;
    } else if (field.type === 'scale' || field.type === 'count') {
      const vals = state.data.map(d => Number(d[field.key]) || 0);
      const avgVal = total ? (vals.reduce((s, v) => s + v, 0) / total) : 0;
      const buckets = {};
      vals.forEach(v => { buckets[v] = (buckets[v] || 0) + 1; });
      const sortedKeys = Object.keys(buckets).map(Number).sort((a, b) => a - b);
      const maxCount = Math.max(1, ...sortedKeys.map(k => buckets[k]));
      let caption = `평균 ${avgVal.toFixed(1)}${field.type === 'count' ? '마리' : '점'}`;
      if (field.key === 'pet') {
        const totalPet = vals.reduce((s, v) => s + v, 0);
        caption = `총 ${totalPet}마리가 우리 반과 함께 살고 있어요! 🐾`;
      } else if (field.key === 'honesty') {
        caption += avgVal <= 5 ? ' — 다들 양심고백 완료 😂' : ' — 다들 성실하네요 👏';
      }
      body.innerHTML = `
        <div class="overview-summary">${field.type === 'count' ? (vals.reduce((s, v) => s + v, 0)) : avgVal.toFixed(1)}${field.type === 'count' ? '마리' : '점'}</div>
        <div class="overview-caption">${caption}</div>
        ${sortedKeys.map(k => renderBarRow(`${k}${field.type === 'count' ? '마리' : '점'}`, Math.round(buckets[k] / maxCount * 100), `${buckets[k]}명`, field.color)).join('')}
      `;
    }

    container.querySelector('#prev').addEventListener('click', () => { cur = (cur - 1 + OVERVIEW_FIELDS.length) % OVERVIEW_FIELDS.length; render() });
    container.querySelector('#next').addEventListener('click', () => { cur = (cur + 1) % OVERVIEW_FIELDS.length; render() });
  }
  render();
  document.addEventListener('dataUpdated', () => render());
}
