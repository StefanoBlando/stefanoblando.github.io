/**
 * charts.js — Plotly chart builders for PFSE paper
 */

// ── Shared layout base ────────────────────────────────────────────────────────
const BASE = {
  paper_bgcolor: 'transparent',
  plot_bgcolor:  '#07090e',
  font:   { family:'Instrument Sans, sans-serif', color:'#94a3b8', size:12 },
  legend: { bgcolor:'rgba(18,22,34,0.85)', bordercolor:'rgba(255,255,255,0.08)', borderwidth:1, font:{ color:'#e2e8f0', family:'JetBrains Mono, monospace', size:11 } },
  margin: { t:24, r:24, b:58, l:68 },
  hovermode: 'x unified',
};
const AXIS = { gridcolor:'rgba(255,255,255,0.06)', linecolor:'rgba(255,255,255,0.08)', color:'#64748b', zeroline:false };
const CFG  = { responsive:true, displayModeBar:false };

// ── Helper: build a line trace ───────────────────────────────────────────────
function lineTrace(xs, ys, name, col, dash, width, extra) {
  return { x:xs, y:ys, mode:'lines+markers', name,
           line:{ color:col, width, dash }, marker:{ size:5, color:col },
           ...extra };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — METHOD
// ═══════════════════════════════════════════════════════════════════════════════

// ── Condition number chart (appears after theatrical run) ─────────────────────
function renderConditionChart(elId, D, selectedMethods) {
  const el = document.getElementById(elId);
  if (!el) return;
  const cd = D.condition_number;
  const traces = [];

  // Instability threshold
  traces.push({ x:[0,15], y:[cd.stable_threshold, cd.stable_threshold],
    mode:'lines', name:'Instability threshold',
    line:{ color:'#ef4444', width:1.2, dash:'dash' }, hoverinfo:'skip' });

  (selectedMethods || Object.keys(cd.methods)).forEach(m => {
    const me = cd.methods[m]; if (!me) return;
    traces.push(lineTrace(cd.x, me.kappa, me.label, me.col, me.dash, me.w,
      { hovertemplate:`<b>${me.label}</b><br>ε=%{x}%<br>κ(Σ̂)=%{y:,.0f}<extra></extra>` }));
  });

  Plotly.newPlot(el, traces, {
    ...BASE,
    xaxis:{ ...AXIS, title:{ text:'Contamination level (%)' } },
    yaxis:{ ...AXIS, title:{ text:'Condition number κ(Σ̂)' }, type:'log' },
  }, CFG);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — EXPLORER
// ═══════════════════════════════════════════════════════════════════════════════

// ── Contamination sweep ───────────────────────────────────────────────────────
function renderContaminationChart(elId, D, selectedMethods, metric) {
  const el = document.getElementById(elId); if (!el) return;
  const cd = D.contamination;
  const traces = [];
  const ylabels = { sharpe:'Sharpe Ratio', max_dd:'Max Drawdown (%)', turnover:'Portfolio Turnover (%)' };

  if (metric === 'sharpe') {
    traces.push({ x:[0,15], y:[cd.clean,cd.clean], mode:'lines', name:'Clean benchmark',
      line:{ color:'#374151', width:1.5, dash:'dot' }, hoverinfo:'skip' });
  }

  (selectedMethods || Object.keys(cd.methods)).forEach(m => {
    const me = cd.methods[m]; if (!me) return;
    const ys = me[metric];
    traces.push(lineTrace(cd.x, ys, me.label, me.col, me.dash, me.w,
      { hovertemplate:`<b>${me.label}</b><br>ε=%{x}%<br>${ylabels[metric]}=%{y:.3f}<extra></extra>` }));
  });

  Plotly.newPlot(el, traces, {
    ...BASE,
    xaxis:{ ...AXIS, title:{ text:'Contamination level (%)' }, dtick:2.5 },
    yaxis:{ ...AXIS, title:{ text:ylabels[metric] } },
  }, CFG);
}

// ── Computational scalability ─────────────────────────────────────────────────
function renderComputationChart(elId, D, selectedMethods) {
  const el = document.getElementById(elId); if (!el) return;
  const comp = D.computation;
  const traces = [];

  traces.push({ x:[comp.p[0], comp.p[comp.p.length-1]],
    y:[comp.daily_limit, comp.daily_limit], mode:'lines',
    name:'Daily rebalancing limit (300s)',
    line:{ color:'#ef4444', width:1.2, dash:'dash' }, hoverinfo:'skip' });

  (selectedMethods || Object.keys(comp.methods)).forEach(m => {
    const me = comp.methods[m]; if (!me) return;
    traces.push(lineTrace(comp.p, me.t, me.label, me.col, me.dash, me.w,
      { connectgaps:false,
        hovertemplate:`<b>${me.label}</b><br>p=%{x}<br>time=%{y:.1f}s<extra></extra>` }));
  });

  Plotly.newPlot(el, traces, {
    ...BASE,
    yaxis:{ ...AXIS, title:{ text:'Computation time (s, log scale)' }, type:'log' },
    xaxis:{ ...AXIS, title:{ text:'Portfolio size p' } },
    annotations:[{ x:Math.log10(550), y:Math.log10(250), xref:'x', yref:'y', text:'← PFSE feasible to p≈1000',
      showarrow:false, font:{ color:'#4f8ef7', size:10 }, xanchor:'left' }],
  }, CFG);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — S&P 500 BACKTEST
// ═══════════════════════════════════════════════════════════════════════════════

// ── Cumulative returns time series ────────────────────────────────────────────
function renderCumulativeChart(elId, D, selectedMethods) {
  const el = document.getElementById(elId); if (!el) return;
  const bt = D.backtest;
  const traces = [];

  // Regime shading via invisible area traces
  bt.regimes.forEach(r => {
    const si = bt.dates.indexOf(r.start), ei = bt.dates.indexOf(r.end);
    if (si < 0 || ei < 0) return;
    traces.push({
      x:[r.start, r.end, r.end, r.start, r.start],
      y:[0, 0, 400, 400, 0],
      fill:'toself', fillcolor: r.color,
      line:{ width:0 }, mode:'lines',
      showlegend:false, hoverinfo:'skip', name:r.name,
    });
  });

  // COVID annotation arrow
  traces.push({ x:['2020-01','2020-04'], y:[175, 134], mode:'lines', showlegend:false,
    hoverinfo:'skip', line:{ color:'rgba(239,68,68,.4)', width:1, dash:'dot' } });

  (selectedMethods || Object.keys(bt.methods)).forEach(m => {
    const me = bt.methods[m]; if (!me) return;
    traces.push({
      x: bt.dates, y: me.idx,
      mode:'lines', name:me.label,
      line:{ color:me.col, width:me.w || 2 },
      hovertemplate:`<b>${me.label}</b><br>%{x}<br>Index=%{y:.1f}<extra></extra>`,
    });
  });

  Plotly.newPlot(el, traces, {
    ...BASE, hovermode:'x unified',
    margin:{ t:20, r:20, b:54, l:62 },
    xaxis:{ ...AXIS, title:{ text:'Quarter' }, tickangle:-30 },
    yaxis:{ ...AXIS, title:{ text:'Cumulative Return Index (base=100)' } },
    annotations:[
      { x:'2020-01', y:185, text:'COVID-19<br>crash', showarrow:true, arrowhead:2,
        arrowcolor:'#ef4444', ax:0, ay:-40, font:{ color:'#ef4444', size:10 } },
    ],
  }, CFG);
}

// ── Regime bar chart ──────────────────────────────────────────────────────────
function renderRegimeChart(elId, D, metric, selectedMethods) {
  const el = document.getElementById(elId); if (!el) return;
  const reg = D.regimes;
  const xlabels = { sharpe:'Sharpe Ratio', max_dd:'Max Drawdown (%)', turnover:'Portfolio Turnover (%)' };
  const traces = [];

  (selectedMethods || ["PFSE","Sample Cov","Ledoit-Wolf","Equal Weight"]).forEach(m => {
    const me = reg.methods[m]; if (!me) return;
    traces.push({
      x: reg.periods.map(p=>p.name), y: me[metric],
      type:'bar', name:me.label,
      marker:{ color:me.col, opacity:0.85 },
      hovertemplate:`<b>${me.label}</b><br>%{x}<br>${xlabels[metric]}=%{y:.2f}<extra></extra>`,
    });
  });

  Plotly.newPlot(el, traces, {
    ...BASE, barmode:'group',
    xaxis:{ ...AXIS },
    yaxis:{ ...AXIS, title:{ text:xlabels[metric] } },
  }, CFG);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — STRESS & VALUE
// ═══════════════════════════════════════════════════════════════════════════════

// ── Radar chart ───────────────────────────────────────────────────────────────
function renderRadarChart(elId, D, selectedMethods) {
  const el = document.getElementById(elId); if (!el) return;
  const rd = D.radar;
  const dims = [...rd.dims, rd.dims[0]]; // close the polygon
  const traces = [];

  (selectedMethods || ["PFSE","SSRE","MCD (full)","Ledoit-Wolf","Sample Cov"]).forEach(m => {
    const me = rd.methods[m]; if (!me) return;
    const r = [...me.scores, me.scores[0]];
    traces.push({
      type:'scatterpolar', r, theta:dims,
      fill:'toself', name:me.label,
      fillcolor: me.col + '22',
      line:{ color:me.col, width:2 },
      hovertemplate:`<b>${me.label}</b><br>%{theta}: %{r:.0f}/100<extra></extra>`,
    });
  });

  Plotly.newPlot(el, traces, {
    paper_bgcolor:'transparent',
    polar:{
      bgcolor:'#050810',
      radialaxis:{ visible:true, range:[0,100], gridcolor:'#1f2937', color:'#6b7280', tickfont:{ size:9 } },
      angularaxis:{ gridcolor:'#1f2937', color:'#6b7280', tickfont:{ size:10 }, linecolor:'#1f2937' },
    },
    legend:{ bgcolor:'transparent', font:{ color:'#94a3b8', size:11 } },
    font:{ family:'Inter', color:'#94a3b8' },
    margin:{ t:20, r:40, b:20, l:40 },
  }, CFG);
}

// ── Stress heatmap ────────────────────────────────────────────────────────────
function renderStressHeatmap(elId, D) {
  const el = document.getElementById(elId); if (!el) return;
  const st = D.stress;
  const methodOrder = ["PFSE","SSRE","MCD (full)","Ledoit-Wolf","Sample Cov","Equal Weight"];
  const methods  = methodOrder.filter(m => st.methods[m]);
  const scenNames = st.scenarios.map(s => s.name);
  const zData    = methods.map(m => st.methods[m].sharpe);
  const textData = zData.map(row => row.map(v => v.toFixed(2)));

  Plotly.newPlot(el, [{
    type:'heatmap', z:zData, x:scenNames, y:methods,
    text:textData, texttemplate:'%{text}',
    colorscale:[[0,'#1a0933'],[0.25,'#1e3a5f'],[0.6,'#1e5c8a'],[1,'#4f8ef7']],
    colorbar:{ title:{ text:'Sharpe', font:{ color:'#94a3b8' } }, tickfont:{ color:'#94a3b8' }, bgcolor:'transparent', bordercolor:'#1f2937' },
    hovertemplate:'<b>%{y}</b><br>%{x}<br>Sharpe=%{z:.3f}<extra></extra>',
  }], {
    ...BASE, margin:{ t:20, r:80, b:90, l:110 },
    xaxis:{ ...AXIS, tickangle:-30 },
    yaxis:{ ...AXIS, autorange:'reversed' },
    hovermode:'closest',
  }, CFG);
}

// ── Economic value bar chart (stacked) ────────────────────────────────────────
function renderEconomicChart(elId, D) {
  const el = document.getElementById(elId); if (!el) return;
  const ev = D.economic;

  const normalTrace = {
    type:'bar', name:'Normal Period',
    x: ev.normal_items.map(i=>i.l),
    y: ev.normal_items.map(i=>i.v),
    marker:{ color: ev.normal_items.map(i=>i.col), opacity:0.85 },
    hovertemplate:'<b>%{x}</b><br>$%{y}M (normal period)<extra></extra>',
  };
  const stressTrace = {
    type:'bar', name:'Stress Period',
    x: ev.stress_items.map(i=>i.l),
    y: ev.stress_items.map(i=>i.v),
    marker:{ color: ev.stress_items.map(i=>i.col), opacity:0.85 },
    hovertemplate:'<b>%{x}</b><br>$%{y}M (stress period)<extra></extra>',
  };

  Plotly.newPlot(el, [normalTrace, stressTrace], {
    ...BASE, barmode:'group',
    xaxis:{ ...AXIS, tickangle:-20, tickfont:{ size:10 } },
    yaxis:{ ...AXIS, title:{ text:'Annual Value ($M)' } },
  }, CFG);
}

// ── 3D Contamination Surface Chart ──────────────────────────────────────────
function render3DContaminationSurface(elId, D) {
  const el = document.getElementById(elId); if (!el) return;
  const x = [0, 2.5, 5, 7.5, 10, 12.5, 15]; // Contamination %
  const y = [50, 100, 200, 300, 500]; // Assets p

  const z_pfse = [
    [1.47, 1.46, 1.45, 1.45, 1.44, 1.42, 1.40],
    [1.45, 1.44, 1.43, 1.43, 1.42, 1.40, 1.38],
    [1.44, 1.43, 1.42, 1.41, 1.40, 1.38, 1.35],
    [1.42, 1.41, 1.40, 1.39, 1.38, 1.36, 1.33],
    [1.40, 1.39, 1.38, 1.37, 1.35, 1.33, 1.30],
  ];

  const z_sample = [
    [1.47, 1.39, 1.25, 1.12, 0.98, 0.84, 0.70],
    [1.45, 1.37, 1.22, 1.09, 0.96, 0.82, 0.68],
    [1.42, 1.31, 1.15, 1.01, 0.87, 0.73, 0.58],
    [1.38, 1.24, 1.07, 0.92, 0.78, 0.64, 0.49],
    [1.32, 1.16, 0.98, 0.82, 0.68, 0.54, 0.39],
  ];

  const trace1 = {
    type: 'surface', x, y, z: z_pfse, name: 'PFSE (Robust)',
    colorscale: [[0, '#1e3a8a'], [0.5, '#3b82f6'], [1, '#93c5fd']],
    showscale: false, opacity: 0.92,
    hovertemplate: 'PFSE<br>ε=%{x}%<br>p=%{y}<br>Sharpe=%{z:.2f}<extra></extra>'
  };

  const trace2 = {
    type: 'surface', x, y, z: z_sample, name: 'Sample Covariance',
    colorscale: [[0, '#831843'], [0.5, '#db2777'], [1, '#fbcfe8']],
    showscale: false, opacity: 0.85,
    hovertemplate: 'Sample Cov<br>ε=%{x}%<br>p=%{y}<br>Sharpe=%{z:.2f}<extra></extra>'
  };

  const layout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#07090e',
    margin: { l: 0, r: 0, b: 0, t: 30 },
    scene: {
      xaxis: { title: 'Contamination % (ε)', gridcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
      yaxis: { title: 'Assets (p)', gridcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
      zaxis: { title: 'Sharpe Ratio', gridcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
      camera: { eye: { x: 1.6, y: -1.6, z: 1.2 } },
      bgcolor: '#07090e'
    },
    legend: { font: { color: '#e2e8f0', family: 'JetBrains Mono, monospace' }, y: 0.95, x: 0.05 }
  };

  Plotly.newPlot(el, [trace1, trace2], layout, CFG);
}
