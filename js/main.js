// main.js
const app = document.getElementById('app');
const panes = { battle: document.getElementById('battle'), overview: document.getElementById('overview'), match: document.getElementById('match') };

function showTab(name) {
  Object.values(panes).forEach(p => p.classList.add('hidden'));
  panes[name].classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', e => showTab(e.target.dataset.tab)));

// ── 데이터 입력: 샘플 데이터 (fetch 없이 내장 배열 직접 사용) ──
document.getElementById('loadFake').addEventListener('click', () => {
  state.setData(SAMPLE_DATA);
  showPasteMsg(`샘플 데이터 ${SAMPLE_DATA.length}명 로드됨 ✅`, false);
});

// ── 데이터 입력: CSV 파일 업로드 (FileReader, file:// 에서도 정상 동작) ──
document.getElementById('fileInput').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const parsed = parseCSV(r.result);
    applyParsed(parsed, 'CSV 업로드');
  };
  r.readAsText(f);
});

// ── 데이터 입력: 구글 시트 링크 ──
// 공유 링크(.../d/{id}/edit...)를 CSV 내보내기 링크(.../export?format=csv)로 자동 변환해서 불러온다.
// 이미 "게시된 웹(pub)" 링크나 output=csv 링크를 넣으면 그대로 사용한다.
function buildSheetCsvUrl(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url) return null;
  if (/output=csv/i.test(url) || /\/pub\?/i.test(url)) return url;
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const id = idMatch[1];
  const gidMatch = url.match(/gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

const sheetUrlInput = document.getElementById('sheetUrlInput');
const loadSheetBtn = document.getElementById('loadSheetUrl');

document.getElementById('openSheetCsv').addEventListener('click', () => {
  const csvUrl = buildSheetCsvUrl(sheetUrlInput.value);
  if (!csvUrl) { showPasteMsg('올바른 구글 시트 링크가 아니에요. "docs.google.com/spreadsheets/d/..." 형태의 링크를 넣어주세요.', true); return; }
  window.open(csvUrl, '_blank');
});

loadSheetBtn.addEventListener('click', async () => {
  const csvUrl = buildSheetCsvUrl(sheetUrlInput.value);
  if (!csvUrl) {
    showPasteMsg('올바른 구글 시트 링크가 아니에요. "docs.google.com/spreadsheets/d/..." 형태의 링크를 넣어주세요.', true);
    return;
  }
  const originalText = loadSheetBtn.textContent;
  loadSheetBtn.disabled = true;
  loadSheetBtn.textContent = '불러오는 중...';
  showPasteMsg('구글 시트에서 불러오는 중이에요...', false);

  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    // 비공개 시트면 CSV 대신 로그인 페이지(HTML)가 돌아온다 — 그 경우를 감지
    if (/^\s*<(!doctype|html)/i.test(text)) throw new Error('비공개 시트이거나 접근 권한이 없어요.');
    const parsed = parseCSV(text);
    applyParsed(parsed, '구글 시트 링크');
  } catch (err) {
    showPasteMsg('불러오지 못했어요. 시트 공유 설정을 "링크가 있는 모든 사용자(뷰어)"로 바꾼 뒤 다시 시도하거나, [새 탭에서 확인] 버튼으로 연 화면의 내용을 전체 복사(Ctrl+A → Ctrl+C)해서 아래 textarea에 붙여넣어 주세요.', true);
  } finally {
    loadSheetBtn.disabled = false;
    loadSheetBtn.textContent = originalText;
  }
});

// ── 데이터 입력: 붙여넣기 ──
// "paste" 이벤트만 믿지 않고, 명시적으로 누르는 [적용하기] 버튼을 기본 경로로 둔다.
// (브라우저/환경에 따라 paste 이벤트가 씹히는 경우가 있어, 버튼 클릭 시 textarea의
//  현재 값을 직접 다시 파싱해서 무조건 반영되도록 함 — "40건 복사했는데 반영 안 됨" 버그 수정)
const pasteArea = document.getElementById('pasteArea');

document.getElementById('applyPaste').addEventListener('click', () => {
  const parsed = parseCSV(pasteArea.value);
  applyParsed(parsed);
});

// 참고용: 붙여넣는 순간 바로 반영되면 편하니 자동 파싱도 시도는 하되,
// 실패해도 위 버튼으로 항상 재시도할 수 있게 해둔다.
pasteArea.addEventListener('paste', e => {
  const clipboard = (e.clipboardData && e.clipboardData.getData) ? e.clipboardData.getData('text/plain') : null;
  if (clipboard) {
    e.preventDefault();
    pasteArea.value = clipboard;
  }
  // 값이 안정적으로 반영된 뒤 파싱 (paste 이벤트 타이밍 이슈 방지)
  setTimeout(() => {
    const parsed = parseCSV(pasteArea.value);
    if (parsed.length) applyParsed(parsed);
  }, 30);
});

function applyParsed(parsed, sourceLabel) {
  if (!parsed || !parsed.length) {
    showPasteMsg('데이터를 인식하지 못했어요. 1행(헤더)부터 마지막 응답까지 다시 복사해서 붙여넣어 주세요.', true);
    return;
  }
  state.setData(parsed);
  showPasteMsg(`${parsed.length}명 데이터 적용됨 ✅${sourceLabel ? ' (' + sourceLabel + ')' : ''}`, false);
}

function showPasteMsg(text, isError) {
  const el = document.getElementById('pasteMsg');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('error', !!isError);
  el.classList.toggle('ok', !isError);
}

// init panels
initBattle(panes.battle);
initOverview(panes.overview);
initMatch(panes.match);

// 데이터 갱신 시 상단 카운트 + 현재 탭 다시 그리기
document.addEventListener('dataUpdated', (e) => {
  const cnt = (e && e.detail && e.detail.length) || state.data.length || 0;
  const el = document.getElementById('dataCount');
  if (el) {
    el.textContent = `응답 ${cnt}명 로드됨`;
    el.classList.add('updated');
    setTimeout(() => el.classList.remove('updated'), 900);
  }
  const active = document.querySelector('.tab.active').dataset.tab;
  if (active === 'battle') initBattle(panes.battle);
  if (active === 'overview') initOverview(panes.overview);
  if (active === 'match') initMatch(panes.match);
});

// 시작하자마자 샘플 데이터 자동 로드 (fetch 없이 내장 배열 사용)
state.setData(SAMPLE_DATA);
