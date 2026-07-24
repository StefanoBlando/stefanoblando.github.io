/**
 * main.js — App bootstrap, tab routing, event handlers
 * Tabs: paper | method | explorer | backtest | stress
 */

document.addEventListener('DOMContentLoaded', () => {
  const D = window.PFSE_DATA;
  if (!D) { console.error('PFSE_DATA not loaded'); return; }

  // ── Build dynamic content ──────────────────────────────────────────────────
  buildMetricCards(D);
  buildPhaseCards(D);
  buildParamTable(D);
  buildMethodCheckboxes('method-checks', D.contamination.methods, ['PFSE','Sample Cov','Ledoit-Wolf']);
  buildMethodCheckboxes('comp-checks',   D.computation.methods,   ['PFSE','MCD (full)','Ledoit-Wolf']);
  buildMethodCheckboxes('cum-checks',    D.backtest.methods,       ['PFSE','Sample Cov','Equal Weight']);
  buildMethodCheckboxes('regime-checks', D.regimes.methods,        ['PFSE','Sample Cov','Ledoit-Wolf','Equal Weight']);
  buildMethodCheckboxes('radar-checks',  D.radar.methods,          ['PFSE','SSRE','MCD (full)','Ledoit-Wolf','Sample Cov']);
  buildSelect('metric-sel',  [['sharpe','Sharpe Ratio'],['max_dd','Max Drawdown'],['turnover','Turnover']]);
  buildSelect('regime-metric-sel', [['sharpe','Sharpe Ratio'],['max_dd','Max Drawdown'],['turnover','Turnover']]);
  buildExplorerToggle();
  resetSimulation('pfse-terminal');

  // ── Tab routing ────────────────────────────────────────────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');

  function showTab(id) {
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.tab === id));
    tabPanes.forEach(p => p.classList.toggle('hidden', p.id !== `tab-${id}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onTabVisible(id);
  }

  navLinks.forEach(l => l.addEventListener('click', e => { e.preventDefault(); showTab(l.dataset.tab); }));
  showTab('paper');

  // ── Run button (Method tab) ────────────────────────────────────────────────
  const runBtn = document.getElementById('run-btn');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runBtn.disabled = true;
      runBtn.textContent = '⟳ Running...';
      document.getElementById('condition-section').classList.add('hidden');

      runSimulation('pfse-terminal', () => {
        runBtn.disabled = false;
        runBtn.textContent = '▶  Run PFSE Estimation';
        // Reveal condition number chart with fade-in
        const sec = document.getElementById('condition-section');
        sec.classList.remove('hidden');
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(12px)';
        requestAnimationFrame(() => {
          sec.style.transition = 'opacity .5s ease, transform .5s ease';
          sec.style.opacity = '1';
          sec.style.transform = 'translateY(0)';
        });
        renderConditionChart('condition-chart', D, Object.keys(D.condition_number.methods));
      });
    });
  }

  // ── Explorer: live updates ─────────────────────────────────────────────────
  document.getElementById('method-checks')?.addEventListener('change', refreshExplorer);
  document.getElementById('comp-checks')?.addEventListener('change', refreshExplorer);
  document.getElementById('metric-sel')?.addEventListener('change', refreshExplorer);

  // ── Backtest: live updates ─────────────────────────────────────────────────
  document.getElementById('cum-checks')?.addEventListener('change', refreshBacktest);
  document.getElementById('regime-checks')?.addEventListener('change', refreshRegime);
  document.getElementById('regime-metric-sel')?.addEventListener('change', refreshRegime);

  // ── Radar / stress: live updates ──────────────────────────────────────────
  document.getElementById('radar-checks')?.addEventListener('change', refreshStress);

  initScrollReveal();
});

// ── Tab visibility: lazy-render charts ───────────────────────────────────────
function onTabVisible(id) {
  const D = window.PFSE_DATA;
  if (id === 'explorer' && !window._explorerDone) {
    window._explorerDone = true;
    refreshExplorer();
  }
  if (id === 'backtest' && !window._backtestDone) {
    window._backtestDone = true;
    refreshBacktest();
    refreshRegime();
  }
  if (id === 'stress' && !window._stressDone) {
    window._stressDone = true;
    refreshStress();
    renderStressHeatmap('stress-heatmap', D);
    renderEconomicChart('econ-chart', D);
  }
}

// ── Refresh functions ─────────────────────────────────────────────────────────
function refreshExplorer() {
  const D    = window.PFSE_DATA;
  const view = window._explorerView || 'contamination';
  if (view === 'contamination') {
    const methods = getChecked('method-checks');
    const metric  = document.getElementById('metric-sel')?.value || 'sharpe';
    renderContaminationChart('contamination-chart', D, methods, metric);
  } else {
    const methods = getChecked('comp-checks');
    renderComputationChart('computation-chart', D, methods);
  }
}

function refreshBacktest() {
  const D = window.PFSE_DATA;
  renderCumulativeChart('cumulative-chart', D, getChecked('cum-checks'));
}

function refreshRegime() {
  const D      = window.PFSE_DATA;
  const metric = document.getElementById('regime-metric-sel')?.value || 'sharpe';
  renderRegimeChart('regime-chart', D, metric, getChecked('regime-checks'));
}

function refreshStress() {
  const D = window.PFSE_DATA;
  renderRadarChart('radar-chart', D, getChecked('radar-checks'));
}

// ── Explorer toggle (contamination / computation) ─────────────────────────────
function buildExplorerToggle() {
  document.querySelectorAll('.explorer-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.explorer-toggle').forEach(b => b.classList.remove('tog-active'));
      btn.classList.add('tog-active');
      const v = btn.dataset.view;
      window._explorerView = v;
      document.getElementById('contamination-panel').classList.toggle('hidden', v !== 'contamination');
      document.getElementById('computation-panel').classList.toggle('hidden', v !== 'computation');
      document.getElementById('method-controls').classList.toggle('hidden', v !== 'contamination');
      document.getElementById('comp-controls').classList.toggle('hidden', v !== 'computation');
      refreshExplorer();
    });
  });
}

// ── Dynamic builders ──────────────────────────────────────────────────────────
function buildMetricCards(D) {
  const c = document.getElementById('metric-cards'); if (!c) return;
  D.meta.key_metrics.forEach(m => {
    const div = document.createElement('div');
    div.className = 'card card-glow p-5 text-center reveal';
    div.style.cssText = `border-color:${m.color}44;background:${m.color}0d;`;
    div.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:2.3rem;font-weight:700;color:${m.color};">${m.value}</div>
      <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-top:5px;">${m.label}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:3px;">${m.delta}</div>`;
    c.appendChild(div);
  });
}

function buildPhaseCards(D) {
  const c = document.getElementById('phases'); if (!c) return;
  D.phases.forEach(ph => {
    const div = document.createElement('div');
    div.className = 'card card-glow p-5 reveal';
    div.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:14px;">
        <div style="min-width:34px;height:34px;border-radius:50%;background:${ph.col}1a;border:2px solid ${ph.col};
                    display:flex;align-items:center;justify-content:center;
                    font-family:'JetBrains Mono',monospace;font-weight:700;color:${ph.col};font-size:13px;flex-shrink:0;">${ph.n}</div>
        <div>
          <div style="font-weight:600;color:#e2e8f0;font-size:15px;margin-bottom:5px;">${ph.name}</div>
          <div style="color:#94a3b8;font-size:13px;line-height:1.7;margin-bottom:10px;">${ph.desc}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="background:rgba(79,142,247,.1);border:1px solid rgba(79,142,247,.2);border-radius:5px;
                         padding:3px 10px;font-size:11px;font-family:'JetBrains Mono',monospace;color:#4f8ef7;">${ph.complexity}</span>
            <span style="background:rgba(255,255,255,.04);border:1px solid #1f2937;border-radius:5px;
                         padding:3px 10px;font-size:11px;color:#6b7280;">${ph.key}</span>
          </div>
        </div>
      </div>`;
    c.appendChild(div);
  });
}

function buildParamTable(D) {
  const tbody = document.getElementById('param-tbody'); if (!tbody) return;
  [{ s:'k',    n:'Factor dimension',       v:'5',       note:'Selected by robust parallel analysis'      },
   { s:'h',    n:'MCD subset fraction',    v:'0.75',    note:'Controls 25% breakdown point'              },
   { s:'c',    n:'Tukey bisquare const.',  v:'4.685',   note:'95% Gaussian efficiency'                   },
   { s:'T',    n:'Reweighting iterations', v:'10–20',   note:'Converges ~12 iterations'                  },
   { s:'p',    n:'Portfolio size',         v:'50–1000', note:'Tested; daily rebalancing feasible ≤1000'  },
   { s:'n',    n:'Observations',           v:'2520',    note:'10 years daily returns (2015–2025)'        },
   { s:'ε',    n:'Contamination level',    v:'0–15%',   note:'Row-wise (systematic disruptions)'         },
   { s:'β',    n:'Breakdown point',        v:'25%',     note:'Inherited from MCD in factor space'        },
  ].forEach(p => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1f2937';
    tr.innerHTML = `
      <td style="padding:8px 10px 8px 0;font-family:'JetBrains Mono',monospace;font-weight:700;color:#4f8ef7;font-size:15px;">${p.s}</td>
      <td style="padding:8px 10px;color:#e2e8f0;font-size:12px;font-weight:500;">${p.n}</td>
      <td style="padding:8px 10px;font-family:'JetBrains Mono',monospace;color:#22c55e;font-size:12px;">${p.v}</td>
      <td style="padding:8px 0 8px 10px;color:#6b7280;font-size:11px;">${p.note}</td>`;
    tbody.appendChild(tr);
  });
}

function buildMethodCheckboxes(containerId, methods, defaultOn) {
  const c = document.getElementById(containerId); if (!c) return;
  Object.entries(methods).forEach(([key, m]) => {
    const col     = m.col || '#6b7280';
    const checked = defaultOn.includes(key) ? 'checked' : '';
    const lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0;';
    lbl.innerHTML = `
      <input type="checkbox" value="${key}" ${checked} style="accent-color:${col};width:14px;height:14px;cursor:pointer;">
      <span style="font-size:13px;color:#e2e8f0;">${m.label || key}</span>
      <span style="width:20px;height:3px;border-radius:2px;background:${col};flex-shrink:0;"></span>`;
    c.appendChild(lbl);
  });
}

function buildSelect(id, options) {
  const sel = document.getElementById(id); if (!sel) return;
  options.forEach(([v,l]) => { const o = document.createElement('option'); o.value=v; o.textContent=l; sel.appendChild(o); });
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function getChecked(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input:checked`)).map(i => i.value);
}

function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = 'opacity .5s ease, transform .5s ease';
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold:0.04 });
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(14px)';
    obs.observe(el);
  });
}
