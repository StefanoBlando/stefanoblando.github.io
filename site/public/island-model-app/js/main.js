/**
 * main.js — Bootstrap, island animation (educational), static sections
 * Uses window.ISLAND_DATA set by data/data.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const D = window.ISLAND_DATA;
  if (!D) { console.error('ISLAND_DATA not loaded'); return; }
  window._sweepData = D;

  populateAuthors(D.metadata);
  populateAbstract(D.metadata);
  populateParamTable(D.metadata);
  buildParamPills(D);
  buildCounterfactuals();
  buildConvergenceCards(D);
  buildAGRChart(D.agr_eps);
  buildStylizedFactsChart(D);
  build3DIslandTopologyChart();
  startIslandAnimation();
  initScrollReveal();
  initNavHighlight();

  setTimeout(() => selectParam('alpha'), 80);
});

function populateAuthors(meta) {
  const el = document.getElementById('authors-text');
  const authors = meta?.paper?.authors;
  if (!el || !Array.isArray(authors) || authors.length === 0) return;
  el.innerHTML = authors.join(' &nbsp;·&nbsp; ');
}

// ── Abstract ──────────────────────────────────────────────────────────────────
function populateAbstract(meta) {
  const el = document.getElementById('abstract-text');
  if (el && meta?.paper?.abstract) el.textContent = meta.paper.abstract;
}

// ── Param table ───────────────────────────────────────────────────────────────
function populateParamTable(meta) {
  const tbody = document.getElementById('param-tbody');
  if (!tbody || !meta?.model?.parameters) return;
  const descs = {
    pi:     'Density of productive niches in technology space',
    alpha:  'Returns to scale — amplifies skill differences between islands',
    eps:    'Probability of switching to Explorer mode each period',
    phi:    'Skill transfer success rate during imitation',
    rho:    'How island-specific knowledge is — penalises cross-island moves',
    lambda: 'Frequency of radical innovations (new island discovery rate)',
  };
  const inPaper = ['alpha','phi','rho','eps'];
  Object.entries(meta.model.parameters).forEach(([key, cfg]) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1f2937';
    const badge = inPaper.includes(key)
      ? `<span class="badge-paper" style="font-size:9px;">paper</span>`
      : `<span style="background:rgba(107,114,128,.15);color:#6b7280;border:1px solid rgba(107,114,128,.3);border-radius:999px;padding:1px 7px;font-size:9px;font-family:monospace;">not swept</span>`;
    tr.innerHTML = `
      <td style="padding:7px 8px 7px 0;font-family:monospace;font-weight:700;color:#4f8ef7;font-size:15px;">${cfg.symbol}</td>
      <td style="padding:7px 8px;color:#94a3b8;font-size:12px;">${descs[key]||cfg.description}</td>
      <td style="padding:7px 0 7px 8px;text-align:right;font-family:monospace;color:#e2e8f0;white-space:nowrap;">${cfg.baseline} ${badge}</td>`;
    tbody.appendChild(tr);
  });
}

// ── Param pills ───────────────────────────────────────────────────────────────
function buildParamPills(D) {
  const c = document.getElementById('param-pills');
  if (!c) return;
  const params = ['alpha','phi','rho'];
  const labels = { alpha:'α — Returns to Scale', phi:'φ — Skill Transfer', rho:'ρ — Knowledge Locality' };
  params.forEach(p => {
    if (!D[p]) return;
    const btn = document.createElement('button');
    btn.id = `pill-${p}`;
    btn.className = 'param-pill';
    btn.innerHTML = labels[p];
    btn.onclick = () => selectParam(p);
    c.appendChild(btn);
  });
}

// ── Counterfactuals ───────────────────────────────────────────────────────────
function buildCounterfactuals() {
  const grid = document.getElementById('counterfactual-grid');
  if (!grid) return;
  [
    { label:'α = 0.9 vs α = 1.0', sig:true,  note:'Sub- vs constant returns to scale differ significantly' },
    { label:'α = 1.0 vs α = 1.1', sig:true,  note:'Constant vs super-linear returns differ significantly' },
    { label:'φ = 0.0 vs φ = 0.1', sig:true,  note:'No diffusion vs weak diffusion differ significantly' },
    { label:'ρ = 0.0 vs ρ = 0.05',sig:true,  note:'Global vs slightly local knowledge differ' },
    { label:'ρ = 0.05 vs ρ = 0.1',sig:true,  note:'Moderate locality increase is still detectable' },
    { label:'ρ = 1.0 vs ρ = 3.0', sig:true,  note:'High locality regimes differ' },
    { label:'ρ = 3.0 vs ρ = 5.0', sig:false, note:'Saturation — further locality has no effect' },
  ].forEach(item => {
    const div = document.createElement('div');
    div.style.cssText = `border-radius:10px;padding:14px;display:flex;align-items:flex-start;gap:10px;` +
      (item.sig
        ? 'background:rgba(34,197,94,.05);border:1px solid rgba(34,197,94,.2);'
        : 'background:rgba(245,158,11,.05);border:1px solid rgba(245,158,11,.2);');
    div.innerHTML = (item.sig
      ? `<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;margin-top:4px;flex-shrink:0;"></span>`
      : `<span style="color:#f59e0b;font-size:16px;line-height:1;flex-shrink:0;margin-top:1px;">≈</span>`)
      + `<div>
        <div style="font-family:monospace;font-size:13px;font-weight:600;color:${item.sig?'#22c55e':'#f59e0b'};">${item.label}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px;">${item.note}</div>
      </div>`;
    grid.appendChild(div);
  });
}

// ── Convergence cards (replaces heatmap — with 3 params it's cleaner) ─────────
function buildConvergenceCards(D) {
  const el = document.getElementById('convergence-cards');
  if (!el) return;
  const info = {
    alpha: { sym:'α', note:'Higher α → higher variance → harder convergence. α ∈ {0.9,1.0,1.1} converge; α ≥ 1.2 require δ > 1.' },
    phi:   { sym:'φ', note:'Only low-diffusion regime (φ ∈ {0.0,0.1}) converges. Higher φ amplifies variance via skill cascades.' },
    rho:   { sym:'ρ', note:'Low locality (ρ ∈ {0.0,0.05,0.1}) converges with δ=1. Saturation effect: ρ=3.0 vs ρ=5.0 not distinguishable.' },
  };
  Object.entries(info).forEach(([p, cfg]) => {
    const data = D[p];
    if (!data) return;
    const nConv = data.series.filter(s=>s.converged).length;
    const div = document.createElement('div');
    div.className = 'card'; div.style.padding = '20px';
    div.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-family:monospace;font-size:22px;font-weight:700;color:#4f8ef7;">${cfg.sym}</span>
        <span style="font-family:monospace;font-size:13px;color:#22c55e;">${nConv}/${data.series.length} converged</span>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        ${data.series.map(s=>`<div style="flex:1;height:6px;border-radius:3px;background:${s.converged?'#22c55e':'#374151'};"></div>`).join('')}
      </div>
      <p style="font-size:12px;color:#6b7280;line-height:1.5;margin:0;">${cfg.note}</p>`;
    el.appendChild(div);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ISLAND ANIMATION — Educational
// ═══════════════════════════════════════════════════════════════════════════════

const SIM = {
  GRID: 16, N: 20,
  canvas: null, ctx: null,
  islands: [], agents: [],
  step: 0, gdpHistory: [],
  rafId: null, lastTick: 0, msPerTick: 600,
  events: [],          // { msg, ttl } — narrative text
  imitations: [],      // { from, to, ttl } — arc animations
};

const AGENT_COLORS = { miner:'#60a5fa', imitator:'#10b981', explorer:'#f59e0b' };

function startIslandAnimation() {
  SIM.canvas = document.getElementById('island-canvas');
  if (!SIM.canvas) return;
  SIM.ctx = SIM.canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  initSim();
  SIM.rafId = requestAnimationFrame(animLoop);
}

function resizeCanvas() {
  const c = SIM.canvas;
  const w = c.parentElement.clientWidth;
  c.width  = w;
  c.height = Math.min(420, Math.max(300, w * 0.55));
}

function initSim() {
  const G = SIM.GRID;
  const cx = G / 2, cy = G / 2;
  SIM.islands = [];
  for (let x = 0; x < G; x++) {
    for (let y = 0; y < G; y++) {
      const h = Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
      const prob = h - Math.floor(h);
      const dist = Math.hypot(x - cx, y - cy);
      if ((x === cx && y === cy) || prob < 0.12) {
        SIM.islands.push({
          x, y, dist,
          fitness: 1 + dist * 0.5,   // farther = more productive
          agents: [],
        });
      }
    }
  }
  const center = SIM.islands.find(i => i.x === G/2 && i.y === G/2) || SIM.islands[0];

  SIM.agents = Array.from({ length: SIM.N }, (_, id) => {
    const type = id < 10 ? 'miner' : id < 15 ? 'imitator' : 'explorer';
    return {
      id, type,
      island: center,
      // smooth position (in island-grid coords)
      px: center.x + (Math.random()-.5)*.6,
      py: center.y + (Math.random()-.5)*.6,
      tx: center.x, ty: center.y,
      skill: 1 + Math.random() * .5,
      action: 'mining',    // for annotation
      color: AGENT_COLORS[type],
    };
  });
  center.agents = [...SIM.agents];
  SIM.step = 0; SIM.gdpHistory = [0]; SIM.events = []; SIM.imitations = [];
}

function simTick() {
  const { agents, islands } = SIM;
  const eps = 0.15, phi = 0.5;
  const narratives = [];

  agents.forEach(a => {
    const roll = Math.random();

    // Type assignment
    if (roll < eps) {
      a.type = 'explorer'; a.color = AGENT_COLORS.explorer;
    } else if (roll < eps + 0.35) {
      a.type = 'imitator'; a.color = AGENT_COLORS.imitator;
    } else {
      a.type = 'miner'; a.color = AGENT_COLORS.miner;
    }

    if (a.type === 'explorer') {
      // Move to random island, prefer high-fitness ones
      const candidates = islands.filter(i => i !== a.island);
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      if (target) {
        const gained = target.fitness > a.island.fitness;
        moveAgent(a, target);
        a.action = 'exploring';
        if (gained) narratives.push(`Explorer finds higher-fitness island (f=${target.fitness.toFixed(1)})`);
      }
    } else if (a.type === 'imitator') {
      // Find best agent in same or neighboring islands
      const best = agents.reduce((b, x) => x.skill > b.skill ? x : b, agents[0]);
      if (best !== a && best.island !== a.island) {
        SIM.imitations.push({ fromX: a.px, fromY: a.py, toX: best.px, toY: best.py, ttl: 18 });
        moveAgent(a, best.island);
        if (Math.random() < phi) {
          a.skill = Math.max(a.skill, best.skill * (.92 + Math.random() * .08));
          a.action = 'imitating → skill transfer';
          narratives.push(`Imitator copies agent #${best.id} (skill ${best.skill.toFixed(2)})`);
        } else {
          a.action = 'imitating → failed transfer';
        }
      } else {
        a.skill += .03; a.action = 'imitating (local)';
      }
    } else {
      // Miner
      a.skill += a.island.fitness * .04 * Math.random();
      a.action = `mining (f=${a.island.fitness.toFixed(1)})`;
    }
  });

  // GDP = log of total output
  const gdp = Math.log(agents.reduce((s, a) => s + a.skill * a.island.fitness, 0));
  SIM.gdpHistory.push(gdp);
  if (SIM.gdpHistory.length > 60) SIM.gdpHistory.shift();

  // Narrative event
  if (narratives.length > 0) {
    SIM.events.push({ msg: narratives[Math.floor(Math.random() * narratives.length)], ttl: 60 });
    if (SIM.events.length > 3) SIM.events.shift();
  }

  // Decay imitation arcs
  SIM.imitations = SIM.imitations.filter(im => --im.ttl > 0);
  // Decay narrative events
  SIM.events = SIM.events.filter(e => --e.ttl > 0);

  SIM.step++;
  const gdpEl = document.getElementById('gdp-counter');
  if (gdpEl) gdpEl.textContent = gdp.toFixed(3);
  const stepEl = document.getElementById('sim-step');
  if (stepEl) stepEl.textContent = `t = ${SIM.step}`;
}

function moveAgent(agent, island) {
  if (agent.island?.agents) agent.island.agents = agent.island.agents.filter(a => a !== agent);
  agent.island = island;
  island.agents = island.agents || [];
  island.agents.push(agent);
  agent.tx = island.x + (Math.random() - .5) * .5;
  agent.ty = island.y + (Math.random() - .5) * .5;
}

function animLoop(ts) {
  SIM.rafId = requestAnimationFrame(animLoop);
  if (ts - SIM.lastTick > SIM.msPerTick) { SIM.lastTick = ts; simTick(); }

  // Smooth lerp agents
  SIM.agents.forEach(a => {
    a.px += (a.tx - a.px) * 0.12;
    a.py += (a.ty - a.py) * 0.12;
  });
  drawFrame();
}

function drawFrame() {
  const { canvas, ctx, islands, agents, gdpHistory, imitations, events, GRID } = SIM;
  const W = canvas.width, H = canvas.height;
  const cellW = W / GRID, cellH = H / GRID;
  const toScreen = (gx, gy) => [gx * cellW + cellW/2, gy * cellH + cellH/2];

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#07090e'; ctx.fillRect(0, 0, W, H);

  // ── Grid lines (faint) ──
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 0.5;
  for (let x = 0; x <= GRID; x++) {
    const px = x * cellW;
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke();
  }
  for (let y = 0; y <= GRID; y++) {
    const py = y * cellH;
    ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke();
  }

  // ── Islands ──
  const maxFitness = Math.max(...islands.map(i => i.fitness));
  islands.forEach(island => {
    const [px, py] = toScreen(island.x, island.y);
    const t = island.fitness / maxFitness;  // 0–1
    const r = Math.max(4, (cellW * 0.28) * (0.5 + t * 0.8));
    const isCenter = island.x === GRID/2 && island.y === GRID/2;

    // Outer glow
    const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
    const baseR = Math.round(20 + t * 30), baseG = Math.round(80 + t * 120), baseB = Math.round(180 + t * 60);
    grd.addColorStop(0, `rgba(${baseR},${baseG},${baseB},${0.18 + t * 0.25})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(px, py, r * 3, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Island body
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${baseR+20},${baseG+10},${baseB},${0.55 + t * 0.4})`;
    ctx.fill();

    // Center island ring
    if (isCenter) {
      ctx.beginPath(); ctx.arc(px, py, r + 4, 0, Math.PI*2);
      ctx.strokeStyle = '#4f8ef7aa'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // Fitness label on islands with agents or high fitness
    if ((island.agents && island.agents.length > 0) || t > 0.7) {
      ctx.font = `bold ${Math.max(8, cellW*0.22)}px JetBrains Mono`;
      ctx.fillStyle = `rgba(${baseR+40},${baseG+40},${baseB},${0.7+t*0.3})`;
      ctx.textAlign = 'center';
      ctx.fillText(`f=${island.fitness.toFixed(1)}`, px, py - r - 4);
    }
  });

  // ── Imitation arcs ──
  imitations.forEach(im => {
    const alpha = im.ttl / 18;
    const [x1, y1] = toScreen(im.fromX, im.fromY);
    const [x2, y2] = toScreen(im.toX, im.toY);
    const mx = (x1+x2)/2, my = (y1+y2)/2 - 20;
    ctx.beginPath();
    ctx.moveTo(x1,y1); ctx.quadraticCurveTo(mx,my,x2,y2);
    ctx.strokeStyle = `rgba(34,197,94,${alpha * 0.7})`;
    ctx.lineWidth = 1.5; ctx.setLineDash([4,4]); ctx.stroke();
    ctx.setLineDash([]);
  });

  // ── Agents ──
  const agentR = Math.max(4, cellW * 0.18);
  agents.forEach(a => {
    const [px, py] = toScreen(a.px, a.py);

    // Glow
    const grd = ctx.createRadialGradient(px,py,0,px,py,agentR*2.8);
    grd.addColorStop(0, a.color+'99'); grd.addColorStop(1,'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(px,py,agentR*2.8,0,Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Body
    ctx.beginPath(); ctx.arc(px,py,agentR,0,Math.PI*2);
    ctx.fillStyle = a.color; ctx.fill();

    // Mining pulse ring
    if (a.type === 'miner') {
      const pulse = 0.4 + 0.6 * Math.sin(Date.now()/450 + a.id * 1.3);
      ctx.beginPath(); ctx.arc(px,py,agentR + pulse*3.5,0,Math.PI*2);
      ctx.strokeStyle = a.color+'55'; ctx.lineWidth = 1.2; ctx.stroke();
    }

    // Explorer search ring
    if (a.type === 'explorer') {
      const scan = ((Date.now()/600 + a.id*0.5) % 1);
      ctx.beginPath(); ctx.arc(px,py,agentR + scan*12,0,Math.PI*2);
      ctx.strokeStyle = `rgba(245,158,11,${(1-scan)*0.5})`; ctx.lineWidth=1; ctx.stroke();
    }
  });

  // ── GDP mini-chart (bottom strip) ──
  const chartH = 40, chartY = H - chartH - 10, chartX = 12, chartW = W * 0.28;
  ctx.fillStyle = 'rgba(5,8,16,0.7)';
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(chartX - 4, chartY - 4, chartW + 8, chartH + 8, 6);
  ctx.fill(); ctx.stroke();

  ctx.font = '9px JetBrains Mono'; ctx.fillStyle = '#4b5563'; ctx.textAlign = 'left';
  ctx.fillText('E[log GDP]', chartX, chartY - 8);

  if (gdpHistory.length > 1) {
    const minG = Math.min(...gdpHistory), maxG = Math.max(...gdpHistory);
    const range = maxG - minG || 1;
    ctx.beginPath();
    gdpHistory.forEach((g, i) => {
      const x = chartX + (i / (gdpHistory.length - 1)) * chartW;
      const y = chartY + chartH - ((g - minG) / range) * chartH;
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Current GDP value
  const lastGdp = gdpHistory[gdpHistory.length-1] || 0;
  ctx.font = 'bold 11px JetBrains Mono'; ctx.fillStyle = '#22c55e'; ctx.textAlign = 'right';
  ctx.fillText(lastGdp.toFixed(2), chartX + chartW, chartY + chartH + 2);

  // ── Narrative event text ──
  if (events.length > 0) {
    const ev = events[events.length - 1];
    const alpha = Math.min(1, ev.ttl / 20);
    ctx.font = '11px Inter'; ctx.fillStyle = `rgba(148,163,184,${alpha})`;
    ctx.textAlign = 'center';
    ctx.fillText(`▸ ${ev.msg}`, W/2, H - 12);
  }

  // ── Legend overlay (top-right) ──
  const legX = W - 130, legY = 14;
  ['miner','imitator','explorer'].forEach((type, i) => {
    const y = legY + i * 18;
    ctx.beginPath(); ctx.arc(legX, y, 4, 0, Math.PI*2);
    ctx.fillStyle = AGENT_COLORS[type]; ctx.fill();
    ctx.font = '10px Inter'; ctx.fillStyle = '#6b7280'; ctx.textAlign = 'left';
    ctx.fillText(type.charAt(0).toUpperCase()+type.slice(1), legX+10, y+3.5);
  });

  // ── Step + fitness key (top-left) ──
  ctx.font = '10px JetBrains Mono'; ctx.fillStyle = '#374151'; ctx.textAlign = 'left';
  ctx.fillText(`t=${SIM.step}`, 12, 18);
  ctx.fillStyle = '#1f2937'; ctx.textAlign = 'left';
  ctx.fillText('island brightness = fitness', 12, 32);
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Nav highlight ─────────────────────────────────────────────────────────────
function initNavHighlight() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (link) link.classList.toggle('active', e.isIntersecting);
    });
  }, { rootMargin:'-40% 0px -50% 0px' });
  ['model','explorer','findings','code'].forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}
