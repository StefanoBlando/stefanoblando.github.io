/**
 * simulation.js — Theatrical PFSE algorithm log
 * Displays a realistic run trace that mirrors the paper's description
 */

const SIM_LINES = [
  { text:"[PFSE v1.0] ─────────────────────────────────────────────────────", cls:"log-dim",  ms:200  },
  { text:"[PFSE] Initializing estimation pipeline...",                        cls:"log-info", ms:450  },
  { text:"[PFSE] Return matrix: n=2520 obs · p=100 assets · 2015–2025",      cls:"",         ms:750  },
  { text:"[PFSE] Contamination model: row-wise systematic (ε=10%)",          cls:"",         ms:1000 },
  { text:"[PFSE] ─────────────────────────────────────────────────────────", cls:"log-dim",  ms:1150 },
  { text:"[PFSE] ── Phase 1: Robust Parallel Analysis ─────────────────────",cls:"log-info", ms:1300 },
  { text:"[PFSE]   Tyler M-estimator on scatter matrix...",                   cls:"",         ms:1600 },
  { text:"[PFSE]   Iter  5 · convergence = 0.0421",                         cls:"",         ms:2050 },
  { text:"[PFSE]   Iter 12 · convergence = 0.0031  ✓",                      cls:"log-ok",   ms:2550 },
  { text:"[PFSE]   Parallel analysis: 200 null simulations...",              cls:"",         ms:2850 },
  { text:"[PFSE]   → Optimal factor dimension: k = 5",                      cls:"log-ok",   ms:3250 },
  { text:"[PFSE] ── Phase 2: Robust Factor Extraction ────────────────────", cls:"log-info", ms:3550 },
  { text:"[PFSE]   Tukey bisquare weights (c=4.685) initializing...",        cls:"",         ms:3850 },
  { text:"[PFSE]   Iter  1 · 31 outliers (12.3%) · max_w=0.24",            cls:"",         ms:4250 },
  { text:"[PFSE]   Iter  6 · 24 outliers ( 9.5%) · max_w=0.61",            cls:"",         ms:4650 },
  { text:"[PFSE]   Iter 12 · 21 outliers ( 8.3%) · max_w=0.89  ✓",        cls:"log-ok",   ms:5100 },
  { text:"[PFSE] ── Phase 3: MCD in Factor Space (k=5) ──────────────────", cls:"log-info", ms:5400 },
  { text:"[PFSE]   Subset size h = 0.75·n = 1890  (25% breakdown point)",   cls:"",         ms:5700 },
  { text:"[PFSE]   C-step 1 · det(Σ_F) = 3.41e-07",                        cls:"",         ms:6100 },
  { text:"[PFSE]   C-step 4 · det(Σ_F) = 1.87e-08",                        cls:"",         ms:6500 },
  { text:"[PFSE]   C-step 7 · det(Σ_F) = 1.82e-08  ✓ converged",          cls:"log-ok",   ms:6900 },
  { text:"[PFSE] ── Phase 4: Robust Idiosyncratic Estimation ─────────────", cls:"log-info", ms:7200 },
  { text:"[PFSE]   MAD on factor residuals for p=100 assets  ✓",            cls:"log-ok",   ms:7600 },
  { text:"[PFSE] ── Phase 5: Structured Reconstruction ───────────────────", cls:"log-info", ms:7900 },
  { text:"[PFSE]   Combining Λ·Σ_F·Λᵀ + Ψ...",                            cls:"",         ms:8200 },
  { text:"[PFSE]   Condition number κ(Σ̂) = 47.3  (threshold=1e6)  ✓",     cls:"log-ok",   ms:8600 },
  { text:"[PFSE]   Positive definiteness: min eigenvalue = 0.0031  ✓",     cls:"log-ok",   ms:9000 },
  { text:"[PFSE] ─────────────────────────────────────────────────────────", cls:"log-dim",  ms:9300 },
  { text:"[PFSE] ESTIMATION COMPLETE",                                       cls:"log-ok",   ms:9500 },
  { text:"[PFSE] ─────────────────────────────────────────────────────────", cls:"log-dim",  ms:9600 },
  { text:"[PFSE]   Sharpe ratio (out-of-sample):     1.87   (+14.7% vs sample)", cls:"log-ok", ms:9900 },
  { text:"[PFSE]   Max drawdown (COVID-19):         −24.3%  (−29%  vs sample)", cls:"log-ok",  ms:10200 },
  { text:"[PFSE]   Portfolio turnover (monthly):    18.3%   (−42%  vs sample)", cls:"log-ok",  ms:10500 },
  { text:"[PFSE]   Total computation time:            2.4 s  (32× speedup vs MCD)", cls:"log-ok", ms:10800 },
];

let _simRunning = false;
let _simTimers  = [];

function runSimulation(terminalId, onComplete) {
  if (_simRunning) return;
  _simRunning = true;
  const term = document.getElementById(terminalId);
  if (!term) return;
  term.innerHTML = '';
  const last = SIM_LINES[SIM_LINES.length - 1].ms;

  SIM_LINES.forEach(({ text, cls, ms }) => {
    const t = setTimeout(() => {
      const line = document.createElement('div');
      if (cls) line.className = cls;
      line.textContent = text;
      term.appendChild(line);
      term.scrollTop = term.scrollHeight;
    }, ms);
    _simTimers.push(t);
  });

  const done = setTimeout(() => {
    _simRunning = false;
    if (onComplete) onComplete();
  }, last + 400);
  _simTimers.push(done);
}

function resetSimulation(terminalId) {
  _simTimers.forEach(clearTimeout);
  _simTimers = [];
  _simRunning = false;
  const term = document.getElementById(terminalId);
  if (term) {
    term.innerHTML = '<div class="log-dim">[PFSE] Ready — press ▶ Run to start estimation</div>';
  }
}
