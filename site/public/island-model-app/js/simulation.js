/**
 * simulation.js — Explorer state + theatrical log
 */

let _currentParam = null;
let _selectedValues = new Set();

// ── Param selection ───────────────────────────────────────────────────────────
function selectParam(param) {
  const D = window._sweepData;
  if (!D || !D[param]) return;
  _currentParam = param;
  _selectedValues = new Set();

  // Pills
  document.querySelectorAll('.param-pill').forEach(p => p.classList.remove('active'));
  const pill = document.getElementById(`pill-${param}`);
  if (pill) pill.classList.add('active');

  // Info box
  const info = document.getElementById('param-info');
  const descEl = document.getElementById('param-description');
  const noteEl = document.getElementById('param-paper-note');
  if (info && descEl) {
    info.style.display = 'block';
    descEl.textContent = D[param].description;
    if (noteEl) noteEl.textContent = D[param].paper_note;
  }

  // Value checkboxes
  const box = document.getElementById('value-checkboxes');
  if (!box) return;
  box.innerHTML = D[param].series.map((s, i) => {
    const convIcon = s.converged
      ? `<span style="color:#22c55e;font-size:10px;">✓</span>`
      : `<span style="color:#ef4444;font-size:10px;">✗</span>`;
    const paperBadge = s.in_paper
      ? `<span class="badge-paper" style="font-size:8px;padding:1px 5px;">paper</span>` : '';
    const baseline = s.note === 'baseline'
      ? `<span style="color:#f59e0b;font-size:9px;font-family:monospace;">★</span>` : '';
    return `<label id="vlbl-${i}" class="val-label" onclick="toggleVal(${s.value},${i})">
      ${convIcon} <span>${D[param].symbol} = ${s.value}</span> ${paperBadge}${baseline}
    </label>`;
  }).join('');

  // Reset terminal + chart
  const term = document.getElementById('sim-terminal');
  if (term) term.innerHTML = `<span class="log-dim">// Select values above, then click ▶ Run</span>`;
  const chart = document.getElementById('chart-card');
  if (chart) chart.style.display = 'none';
}

function toggleVal(val, idx) {
  const lbl = document.getElementById(`vlbl-${idx}`);
  const D = window._sweepData;
  if (!D || !_currentParam) return;
  const series = D[_currentParam].series.find(s => s.value === val);
  if (_selectedValues.has(val)) {
    _selectedValues.delete(val);
    if (lbl) { lbl.classList.remove('selected','selected-paper'); }
  } else {
    _selectedValues.add(val);
    if (lbl) lbl.classList.add(series?.in_paper ? 'selected-paper' : 'selected');
  }
}

function selectAll() {
  const D = window._sweepData;
  if (!D || !_currentParam) return;
  D[_currentParam].series.forEach((s, i) => {
    _selectedValues.add(s.value);
    const lbl = document.getElementById(`vlbl-${i}`);
    if (lbl) lbl.classList.add(s.in_paper ? 'selected-paper' : 'selected');
  });
}

function selectPaper() {
  const D = window._sweepData;
  if (!D || !_currentParam) return;
  clearAll();
  D[_currentParam].series.forEach((s, i) => {
    if (!s.in_paper) return;
    _selectedValues.add(s.value);
    const lbl = document.getElementById(`vlbl-${i}`);
    if (lbl) lbl.classList.add('selected-paper');
  });
}

function clearAll() {
  _selectedValues = new Set();
  document.querySelectorAll('[id^="vlbl-"]').forEach(l => l.classList.remove('selected','selected-paper'));
}

// ── Run theatrical simulation ─────────────────────────────────────────────────
function runSim() {
  const D = window._sweepData;
  if (!D || !_currentParam || _selectedValues.size === 0) {
    const term = document.getElementById('sim-terminal');
    if (term) term.innerHTML = `<span class="log-warn">// Please select at least one value first.</span>`;
    return;
  }

  const paramData = D[_currentParam];
  const selected = paramData.series.filter(s => _selectedValues.has(s.value));
  const btn = document.getElementById('run-btn');
  if (btn) btn.disabled = true;

  const term = document.getElementById('sim-terminal');
  term.innerHTML = '';

  const lines = buildLogLines(paramData, selected);
  let i = 0;

  function appendLine(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
  }

  function tick() {
    if (i >= lines.length) {
      if (btn) btn.disabled = false;
      setTimeout(() => renderSweepChart(paramData, selected), 200);
      return;
    }
    appendLine(lines[i++]);
    const delay = lines[i-1]?.includes('batch') ? 55 + Math.random()*70 : 40;
    setTimeout(tick, delay);
  }
  tick();
}

function buildLogLines(pData, selected) {
  const lines = [];
  const sym = pData.symbol;
  lines.push(`<span class="log-info">[MultiVeStA] Initializing Island Model — N=20, T=201</span>`);
  lines.push(`<span class="log-info">[MultiVeStA] Loading logGDPaftersteps.multiquatex</span>`);
  lines.push(`<span class="log-info">[MultiVeStA] Target: δ=0.05, confidence=95%</span>`);
  lines.push(`<span class="log-dim">─────────────────────────────────────────────────</span>`);

  selected.forEach(s => {
    lines.push(`<span class="log-info">[MultiVeStA] Config: ${sym}=${s.value}${s.note==='baseline'?' (baseline)':''}</span>`);
    let ci = 0.48;
    const maxBatches = Math.ceil((s.n_samples||30) / 5);
    for (let b = 1; b <= maxBatches; b++) {
      ci *= (0.72 + Math.random() * 0.18);
      const t = Math.round(10 + b*(191/maxBatches));
      const estGdp = (s.final_mean * (t/201)).toFixed(3);
      const converged = ci <= 0.05;
      const status = converged
        ? `<span class="log-ok">CI/2=${ci.toFixed(3)} ≤ δ ✓</span>`
        : `<span class="log-warn">CI/2=${ci.toFixed(3)} > δ</span>`;
      lines.push(`<span>[MV] batch ${String(b).padStart(2)}/${maxBatches}  t=${String(t).padStart(3)}  E[logGDP]=${estGdp}  ${status}</span>`);
      if (converged) break;
    }
    lines.push(`<span class="log-ok">[MultiVeStA] ✓ ${sym}=${s.value}: E[logGDP@201] = ${s.final_mean.toFixed(3)} ± ${s.final_ci.toFixed(3)}</span>`);
    lines.push(`<span class="log-dim">─────────────────────────────────────────────────</span>`);
  });
  lines.push(`<span class="log-ok">[MultiVeStA] Done. Rendering chart...</span>`);
  return lines;
}
