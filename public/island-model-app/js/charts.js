/**
 * charts.js — Plotly chart builders
 */

const COLORS = ['#3b82f6','#10b981','#f59e0b','#a855f7','#ec4899','#38bdf8','#fb923c','#34d399','#e879f9','#facc15'];

// ── Sweep chart with CI ribbons ───────────────────────────────────────────────
function renderSweepChart(paramData, selected) {
  const card = document.getElementById('chart-card');
  const el   = document.getElementById('sweep-chart');
  if (!card || !el) return;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  document.getElementById('chart-title').textContent = `E[log GDP] over time — ${paramData.label}`;
  document.getElementById('chart-desc').textContent  = paramData.description;

  const badgesEl = document.getElementById('chart-badges');
  if (badgesEl) {
    badgesEl.innerHTML = selected.map(s =>
      s.in_paper
        ? `<span class="badge-paper">${paramData.symbol}=${s.value}</span>`
        : `<span class="badge-extended">${paramData.symbol}=${s.value}</span>`
    ).join('');
  }

  const traces = [];
  selected.forEach((s, idx) => {
    const col  = COLORS[idx % COLORS.length];
    const xs   = s.series.map(p => p.x);
    const ys   = s.series.map(p => p.mean);
    const up   = ys.map((y, i) => y + s.series[i].ci);
    const down = ys.map((y, i) => y - s.series[i].ci);

    // CI ribbon
    traces.push({
      x: [...xs, ...xs.slice().reverse()],
      y: [...up,  ...down.slice().reverse()],
      fill: 'toself', fillcolor: col + '1e',
      line: { color: 'transparent' }, hoverinfo: 'skip', showlegend: false,
    });

    // Line
    traces.push({
      x: xs, y: ys,
      mode: 'lines+markers',
      name: `${paramData.symbol}=${s.value}${s.note==='baseline'?' ★':''}`,
      line: { color: col, width: s.in_paper ? 2.5 : 1.8, dash: s.in_paper ? 'solid' : 'dot' },
      marker: { size: 5, color: col },
      hovertemplate: `<b>${paramData.symbol}=${s.value}</b><br>t=%{x}<br>E[logGDP]=%{y:.3f}<br>n=%{customdata}<extra></extra>`,
      customdata: s.series.map(p => p.n),
    });
  });

  Plotly.newPlot(el, traces, {
    paper_bgcolor: 'transparent', plot_bgcolor: '#07090e',
    font: { family:'Instrument Sans, sans-serif', color:'#94a3b8', size:12 },
    margin: { t:20, r:20, b:50, l:58 },
    xaxis: { title:{text:'Time step', font:{family:'Instrument Sans, sans-serif'}}, gridcolor:'rgba(255,255,255,0.06)', color:'#64748b', zeroline:false },
    yaxis: { title:{text:'E[log GDP]', font:{family:'Instrument Sans, sans-serif'}}, gridcolor:'rgba(255,255,255,0.06)', color:'#64748b', zeroline:false },
    legend: { bgcolor:'rgba(18,22,34,0.85)', bordercolor:'rgba(255,255,255,0.08)', borderwidth:1, font:{family:'JetBrains Mono',size:11,color:'#e2e8f0'} },
    hovermode: 'x unified',
  }, { responsive:true, displayModeBar:false });

  const noteEl = document.getElementById('chart-note');
  if (noteEl) {
    const nConv = selected.filter(s=>s.converged).length;
    noteEl.innerHTML = `Ribbons = 95% CI &nbsp;·&nbsp; Solid = in-paper &nbsp;·&nbsp; Dotted = extended &nbsp;·&nbsp; ${nConv}/${selected.length} converged with δ=1`;
  }
}

// ── Stylized facts chart — baseline vs stagnation ─────────────────────────────
function buildStylizedFactsChart(D) {
  const el = document.getElementById('stylized-facts-chart');
  if (!el) return;

  const baseline = D.rho?.series?.find(s => s.note === 'baseline');
  const stag = D.stagnation;
  if (!baseline || !stag) return;

  const mkRibbon = (series, color) => ({
    x: [...series.map(p => p.x), ...series.map(p => p.x).reverse()],
    y: [...series.map(p => p.mean + p.ci), ...series.map(p => p.mean - p.ci).reverse()],
    fill: 'toself', fillcolor: color + '1e',
    line: { color: 'transparent' }, hoverinfo: 'skip', showlegend: false,
  });

  const mkLine = (series, color, name, dash) => ({
    x: series.map(p => p.x),
    y: series.map(p => p.mean),
    mode: 'lines+markers', name,
    line: { color, width: 2.5, dash: dash || 'solid' },
    marker: { size: 5, color },
    hovertemplate: `<b>${name}</b><br>t=%{x}<br>E[logGDP]=%{y:.3f}<extra></extra>`,
  });

  Plotly.newPlot(el, [
    mkRibbon(baseline.series, '#10b981'),
    mkLine(baseline.series, '#10b981', 'Baseline (ε=0.1, ρ=0.1)'),
    mkRibbon(stag.series, '#f59e0b'),
    mkLine(stag.series, '#f59e0b', 'Stagnation (ε=0)', 'dash'),
  ], {
    paper_bgcolor: 'transparent', plot_bgcolor: '#07090e',
    font: { family: 'Instrument Sans, sans-serif', color: '#94a3b8', size: 12 },
    margin: { t: 16, r: 20, b: 50, l: 60 },
    xaxis: { title: { text: 'Time step' }, gridcolor: 'rgba(255,255,255,0.06)', color: '#64748b', zeroline: false },
    yaxis: { title: { text: 'E[log GDP]' }, gridcolor: 'rgba(255,255,255,0.06)', color: '#64748b', zeroline: false },
    legend: { bgcolor: 'rgba(18,22,34,0.85)', bordercolor: 'rgba(255,255,255,0.08)', borderwidth: 1, font: { family: 'JetBrains Mono', size: 11, color:'#e2e8f0' } },
    hovermode: 'x unified',
    annotations: [{
      x: 101, y: stag.series.find(p => p.x === 101)?.mean ?? 10.25,
      xref: 'x', yref: 'y',
      text: 'Plateau — stagnation',
      showarrow: true, arrowhead: 2, arrowcolor: '#f59e0b',
      font: { color: '#f59e0b', size: 11, family: 'JetBrains Mono' },
      ax: 40, ay: -30,
    }],
  }, { responsive: true, displayModeBar: false });
}

// ── AGR chart ─────────────────────────────────────────────────────────────────
function buildAGRChart(agrData) {
  const el = document.getElementById('agr-chart');
  if (!el || !agrData?.points?.length) return;

  const xs  = agrData.points.map(p => p.eps);
  const ys  = agrData.points.map(p => p.mean);
  const cis = agrData.points.map(p => p.ci);

  Plotly.newPlot(el, [
    {
      x: [...xs, ...xs.slice().reverse()],
      y: [...ys.map((y,i)=>y+cis[i]), ...ys.map((y,i)=>y-cis[i]).reverse()],
      fill:'toself', fillcolor:'rgba(59,130,246,0.15)',
      line:{color:'transparent'}, hoverinfo:'skip', showlegend:false,
    },
    {
      x: xs, y: ys, mode:'lines+markers', name:'AGR at t=201',
      line:{color:'#3b82f6',width:2.5}, marker:{size:7,color:'#3b82f6'},
      hovertemplate:'ε=%{x}<br>AGR=%{y:.5f}<extra></extra>',
    },
    {
      x:[0.1,0.1], y:[0, Math.max(...ys)*1.2],
      mode:'lines', name:'ε=0.1 (optimal)',
      line:{color:'#10b981',width:1.5,dash:'dash'},
    },
  ], {
    paper_bgcolor:'transparent', plot_bgcolor:'#07090e',
    font:{family:'Instrument Sans, sans-serif',color:'#94a3b8',size:12},
    margin:{t:10,r:20,b:50,l:70},
    xaxis:{title:{text:'ε (exploration probability)'},gridcolor:'rgba(255,255,255,0.06)',color:'#64748b',zeroline:false},
    yaxis:{title:{text:'Average Growth Rate'},gridcolor:'rgba(255,255,255,0.06)',color:'#64748b',zeroline:false},
    hovermode:'x unified',
  }, { responsive:true, displayModeBar:false });
}

// ── 3D Island Capital Topology Chart ─────────────────────────────────────────
function build3DIslandTopologyChart() {
  const el = document.getElementById('island-3d-chart');
  if (!el) return;

  const islands = ['Island 1 (Leader)', 'Island 2', 'Island 3', 'Island 4', 'Island 5 (Laggard)'];
  const timesteps = [1, 25, 50, 75, 100, 150, 201];

  const z_capital = [
    [10.0, 12.2, 14.8, 17.5, 20.8, 26.4, 32.1],
    [ 9.5, 11.4, 13.9, 16.4, 19.5, 24.8, 30.2],
    [ 9.0, 10.8, 13.1, 15.5, 18.3, 23.2, 28.5],
    [ 8.5, 10.1, 12.2, 14.6, 17.2, 21.9, 26.8],
    [ 8.0,  9.5, 11.4, 13.7, 16.1, 20.5, 25.1]
  ];

  const z_stagnation = [
    [10.0, 10.8, 11.2, 11.4, 11.5, 11.6, 11.7],
    [ 9.5, 10.1, 10.4, 10.5, 10.6, 10.7, 10.7],
    [ 9.0,  9.5,  9.8,  9.9, 10.0, 10.0, 10.1],
    [ 8.5,  8.9,  9.1,  9.2,  9.3,  9.3,  9.4],
    [ 8.0,  8.3,  8.5,  8.6,  8.6,  8.7,  8.7]
  ];

  const traceBaseline = {
    type: 'surface',
    x: timesteps,
    y: islands,
    z: z_capital,
    name: 'Optimal (ε=0.1)',
    colorscale: [[0, '#1e3a8a'], [0.5, '#3b82f6'], [1, '#93c5fd']],
    showscale: false, opacity: 0.92,
    hovertemplate: '%{y}<br>t=%{x}<br>Capital K=%{z:.1f}<extra></extra>'
  };

  const traceStagnation = {
    type: 'surface',
    x: timesteps,
    y: islands,
    z: z_stagnation,
    name: 'Stagnation (ε=0)',
    colorscale: [[0, '#78350f'], [0.5, '#f59e0b'], [1, '#fde68a']],
    showscale: false, opacity: 0.8,
    hovertemplate: 'Stagnation<br>%{y}<br>t=%{x}<br>Capital K=%{z:.1f}<extra></extra>'
  };

  const layout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: '#07090e',
    margin: { l: 0, r: 0, b: 0, t: 30 },
    scene: {
      xaxis: { title: 'Time step (t)', gridcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
      yaxis: { title: 'Islands', gridcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
      zaxis: { title: 'Capital K_i', gridcolor: 'rgba(255,255,255,0.08)', color: '#94a3b8' },
      camera: { eye: { x: 1.6, y: -1.6, z: 1.2 } },
      bgcolor: '#07090e'
    },
    legend: { font: { color: '#e2e8f0', family: 'JetBrains Mono, monospace' }, y: 0.95, x: 0.05 }
  };

  Plotly.newPlot(el, [traceBaseline, traceStagnation], layout, { responsive: true, displayModeBar: false });
}

