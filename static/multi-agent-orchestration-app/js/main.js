function ready(fn) {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
}

ready(() => {
  const data = window.ORCH_DATA;
  if (!data) return;
  const TOKEN_CYCLE_MS = 5200;
  const PHASE_DURATION_MS = 7000;
  const CAPABILITY_LABELS = {
    get_restaurant_info: "state snapshot",
    set_menu: "policy update",
    open_close_restaurant: "activate cycle",
    place_bid: "submit bids",
    get_market: "read market",
    market_execute: "buy from market",
    market_sell: "liquidate surplus",
    get_meals: "read queue",
    prepare_dish: "prepare output",
    wait_for_preparation: "wait for readiness",
    serve_dish: "fulfill request",
    end_phase: "close phase"
  };

  const phaseMap = Object.fromEntries(data.phases.map((p) => [p.id, p]));
  let activePhase = data.phases[0].id;
  let activeTrace = 0;
  let autoplayTimer = null;
  let animationIndex = 0;
  let animationRunning = true;
  let animationFrame = null;
  let lastAnimationShift = 0;
  let lastFrameTs = 0;
  let tokenProgress = 0;

  const $ = (id) => document.getElementById(id);

  $("abstract-text").textContent = data.meta.abstract;
  renderMetricCards();
  renderArchitectureCards();
  initAnimation();
  renderPhasePills();
  renderPhaseDetail(activePhase);
  renderTraceTabs();
  renderTrace(activeTrace);
  drawFlow();
  drawKpiChart();
  drawToolHeatmap();
  initScrollSpy();
  revealNow();

  $("play-trace").addEventListener("click", toggleAutoplay);
  $("play-animation").addEventListener("click", toggleAnimation);

  function renderMetricCards() {
    const root = $("metric-cards");
    root.innerHTML = data.meta.key_metrics
      .map(
        (m) => `
          <div class="card card-glow metric-card reveal">
            <div class="section-label" style="margin-bottom:8px;">${m.label}</div>
            <div style="font-size:30px;font-weight:700;color:${m.color};margin-bottom:8px;">${m.value}</div>
            <div style="font-size:12px;color:#94a3b8;line-height:1.6;">${m.delta}</div>
          </div>
        `
      )
      .join("");
    revealNow();
  }

  function renderArchitectureCards() {
    const root = $("architecture-cards");
    root.innerHTML = data.architecture
      .map(
        (item) => `
          <div class="card card-glow reveal" style="padding:18px;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;">
              <div style="font-size:16px;font-weight:600;color:#e2e8f0;">${item.title}</div>
              <span class="badge" style="color:${item.color};border-color:${item.color}40;background:${item.color}18;">${item.tag}</span>
            </div>
            <div style="font-size:13px;color:#94a3b8;line-height:1.7;">${item.text}</div>
          </div>
        `
      )
      .join("");
    revealNow();
  }

  function renderPhasePills() {
    const root = $("phase-pills");
    root.innerHTML = data.phases
      .map(
        (phase) => `
          <button class="param-pill ${phase.id === activePhase ? "active" : ""}" data-phase="${phase.id}">
            ${phase.name}
          </button>
        `
      )
      .join("");

    root.querySelectorAll("[data-phase]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activePhase = btn.dataset.phase;
        renderPhasePills();
        renderPhaseDetail(activePhase);
      });
    });
  }

  function renderPhaseDetail(phaseId) {
    const phase = phaseMap[phaseId];
    $("phase-title").textContent = phase.name + " Phase";
    $("phase-goal").textContent = phase.goal;
    $("phase-note").textContent = phase.note;
    $("phase-focus").textContent = phase.promptFocus;
    $("phase-memory").textContent = phase.memory;
    $("phase-subagents").textContent = phase.subagents;

    $("phase-tools").innerHTML = phase.tools
      .map((tool) => `<span class="tool-chip" style="border-color:${phase.color}50;background:${phase.color}15;color:${phase.color};">${CAPABILITY_LABELS[tool] || tool}</span>`)
      .join("");

    $("phase-policies").innerHTML = phase.policies
      .map((policy) => `<li style="color:#cbd5e1;line-height:1.8;">${policy}</li>`)
      .join("");

    drawPhaseTools(phase);
  }

  function drawPhaseTools(phase) {
    const tools = phase.tools.map((tool) => CAPABILITY_LABELS[tool] || tool);
    Plotly.newPlot(
      "phase-chart",
      [{
        type: "bar",
        x: tools.map((_, i) => i + 1),
        y: tools.map(() => 1),
        text: tools,
        textposition: "auto",
        marker: { color: phase.color, line: { color: phase.color, width: 1 } },
        hovertemplate: "%{text}<extra></extra>"
      }],
      {
        margin: { l: 30, r: 10, t: 10, b: 40 },
        paper_bgcolor: "#111827",
        plot_bgcolor: "#111827",
        font: { color: "#cbd5e1", family: "Inter, sans-serif", size: 12 },
        xaxis: { title: "Execution Step", tickfont: { color: "#6b7280" }, gridcolor: "#1f2937" },
        yaxis: { visible: false, range: [0, 1.6] },
        showlegend: false
      },
      { displayModeBar: false, responsive: true }
    );
  }

  function drawFlow() {
    const flow = data.flow;
    Plotly.newPlot(
      "flow-chart",
      [{
        type: "sankey",
        orientation: "h",
        node: {
          pad: 18,
          thickness: 16,
          line: { color: "#0a0e1a", width: 1 },
          label: flow.nodes,
          color: [
            "#4f8ef7", "#22c55e", "#a78bfa", "#4f8ef7", "#22c55e",
            "#a78bfa", "#f59e0b", "#f472b6", "#38bdf8", "#64748b", "#f59e0b"
          ]
        },
        link: {
          source: flow.links.map((l) => l.source),
          target: flow.links.map((l) => l.target),
          value: flow.links.map((l) => l.value),
          color: flow.links.map(() => "rgba(79,142,247,0.20)")
        },
        hoverlabel: { bgcolor: "#050810", font: { color: "#e2e8f0" } }
      }],
      {
        margin: { l: 12, r: 12, t: 10, b: 10 },
        paper_bgcolor: "#111827",
        font: { color: "#cbd5e1", family: "Inter, sans-serif", size: 12 }
      },
      { displayModeBar: false, responsive: true }
    );
  }

  function initAnimation() {
    const canvas = $("orchestration-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const nodeMap = Object.fromEntries(data.animation.nodes.map((n) => [n.id, n]));

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pos(node) {
      return {
        x: node.x * canvas.clientWidth,
        y: node.y * canvas.clientHeight
      };
    }

    function drawNode(node, activeIds) {
      const p = pos(node);
      const active = activeIds.has(node.id);
      const radius = node.type === "core" ? 44 : 34;

      ctx.beginPath();
      ctx.fillStyle = active ? `${node.color}20` : "#0b1220";
      ctx.strokeStyle = active ? node.color : "#1f2937";
      ctx.lineWidth = active ? 2.2 : 1.2;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (active) {
        ctx.beginPath();
        ctx.strokeStyle = `${node.color}55`;
        ctx.lineWidth = 10;
        ctx.arc(p.x, p.y, radius + 7, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#e2e8f0";
      ctx.font = node.type === "core" ? "600 13px Inter" : "500 12px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      wrapText(node.label, p.x, p.y, 82, 15);
    }

    function drawEdge(fromNode, toNode, color, active) {
      const a = pos(fromNode);
      const b = pos(toNode);
      ctx.beginPath();
      ctx.strokeStyle = active ? `${color}90` : "#1f2937";
      ctx.lineWidth = active ? 2.2 : 1.2;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    function drawToken(route, t) {
      const from = pos(nodeMap[route.from]);
      const to = pos(nodeMap[route.to]);
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;

      ctx.beginPath();
      ctx.fillStyle = route.color;
      ctx.shadowColor = route.color;
      ctx.shadowBlur = 14;
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(route.label, x, y - 14);
    }

    function wrapText(text, x, y, maxWidth, lineHeight) {
      const words = text.split(" ");
      const lines = [];
      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      const offset = ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((l, i) => ctx.fillText(l, x, y - offset + i * lineHeight));
    }

    function renderAnimation(ts) {
      if (!lastAnimationShift) lastAnimationShift = ts;
      if (!lastFrameTs) lastFrameTs = ts;
      const delta = ts - lastFrameTs;
      lastFrameTs = ts;

      if (animationRunning) {
        tokenProgress = (tokenProgress + delta / TOKEN_CYCLE_MS) % 1;
      }

      if (animationRunning && ts - lastAnimationShift > PHASE_DURATION_MS) {
        animationIndex = (animationIndex + 1) % data.animation.states.length;
        lastAnimationShift = ts;
      }

      const state = data.animation.states[animationIndex];
      $("animation-phase").textContent = state.phase;
      $("animation-phase").style.color = state.accent;
      $("animation-caption").textContent = state.caption;

      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      const activeIds = new Set(["coordinator"]);
      state.routes.forEach((route) => {
        activeIds.add(route.from);
        activeIds.add(route.to);
      });

      data.animation.states.forEach((animState) => {
        animState.routes.forEach((route) => drawEdge(nodeMap[route.from], nodeMap[route.to], route.color, false));
      });

      state.routes.forEach((route) => drawEdge(nodeMap[route.from], nodeMap[route.to], route.color, true));

      data.animation.nodes.forEach((node) => drawNode(node, activeIds));

      const base = tokenProgress;
      state.routes.forEach((route, idx) => {
        const shift = (base + idx * 0.19) % 1;
        drawToken(route, shift);
      });

      animationFrame = requestAnimationFrame(renderAnimation);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationFrame = requestAnimationFrame(renderAnimation);
  }

  function drawKpiChart() {
    const turns = data.kpis.turns;
    const served = data.kpis.served;
    const clients = data.kpis.clients;
    const revenue = data.kpis.revenue;
    const spend = data.kpis.bidSpend;
    const latency = data.kpis.avgLatencyMs;

    Plotly.newPlot(
      "kpi-chart",
      [
        {
          type: "scatter",
          mode: "lines+markers",
          name: "Clients",
          x: turns,
          y: clients,
          line: { color: "#64748b", width: 2 },
          marker: { color: "#64748b", size: 7 }
        },
        {
          type: "scatter",
          mode: "lines+markers",
          name: "Served",
          x: turns,
          y: served,
          line: { color: "#22c55e", width: 3 },
          marker: { color: "#22c55e", size: 8 }
        },
        {
          type: "bar",
          name: "Revenue",
          x: turns,
          y: revenue,
          marker: { color: "rgba(79,142,247,0.35)" }
        },
        {
          type: "scatter",
          mode: "lines+markers",
          name: "Bid Spend",
          x: turns,
          y: spend,
          yaxis: "y2",
          line: { color: "#f59e0b", width: 2, dash: "dot" },
          marker: { color: "#f59e0b", size: 6 }
        },
        {
          type: "scatter",
          mode: "lines",
          name: "Avg Latency (ms)",
          x: turns,
          y: latency,
          yaxis: "y3",
          line: { color: "#f472b6", width: 2 }
        }
      ],
      {
        margin: { l: 45, r: 50, t: 10, b: 40 },
        barmode: "overlay",
        paper_bgcolor: "transparent",
        plot_bgcolor: "#07090e",
        font: { color: "#94a3b8", family: "Instrument Sans, sans-serif", size: 12 },
        legend: { orientation: "h", y: 1.16, x: 0, font: { family: "JetBrains Mono, monospace", color: "#e2e8f0", size: 11 } },
        xaxis: { title: "Turn", tickmode: "array", tickvals: turns, gridcolor: "rgba(255,255,255,0.06)", color: "#64748b" },
        yaxis: { title: "Clients / Revenue", gridcolor: "rgba(255,255,255,0.06)", zerolinecolor: "rgba(255,255,255,0.08)", color: "#64748b" },
        yaxis2: { title: "Bid Spend", overlaying: "y", side: "right", showgrid: false, color: "#64748b" },
        yaxis3: { overlaying: "y", side: "right", visible: false }
      },
      { displayModeBar: false, responsive: true }
    );
  }

  function drawToolHeatmap() {
    const surf = data.toolSurface;
    Plotly.newPlot(
      "tools-chart",
      [{
        type: "heatmap",
        z: surf.matrix,
        x: surf.tools.map((tool) => CAPABILITY_LABELS[tool] || tool),
        y: surf.phases,
        colorscale: [
          [0, "#07090e"],
          [0.01, "#07090e"],
          [1, "#3b82f6"]
        ],
        hovertemplate: "Phase: %{y}<br>Tool: %{x}<br>Enabled: %{z}<extra></extra>",
        showscale: false
      }],
      {
        margin: { l: 90, r: 12, t: 10, b: 110 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "#07090e",
        font: { color: "#94a3b8", family: "Instrument Sans, sans-serif", size: 12 },
        xaxis: { tickangle: -30, gridcolor: "rgba(255,255,255,0.06)", color: "#64748b" },
        yaxis: { gridcolor: "rgba(255,255,255,0.06)", color: "#64748b" }
      },
      { displayModeBar: false, responsive: true }
    );
  }

  function renderTraceTabs() {
    const root = $("trace-tabs");
    root.innerHTML = data.runtimeTrace
      .map(
        (step, index) => `
          <button class="trace-pill ${index === activeTrace ? "active" : ""}" data-trace="${index}">
            ${step.label}
          </button>
        `
      )
      .join("");

    root.querySelectorAll("[data-trace]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTrace = Number(btn.dataset.trace);
        renderTraceTabs();
        renderTrace(activeTrace);
      });
    });
  }

  function renderTrace(index) {
    const item = data.runtimeTrace[index];
    $("trace-status").textContent = item.status;
    $("trace-meta").textContent = `Turn ${item.turn} · ${item.phase}`;
    $("terminal").innerHTML = item.lines
      .map((line, i) => {
        const cls = line.startsWith("WARN") ? "log-warn" : line.startsWith("KPI") ? "log-info" : "log-ok";
        return `<div class="${cls}"><span class="log-dim">${String(i + 1).padStart(2, "0")}</span> ${line}</div>`;
      })
      .join("");
  }

  function toggleAutoplay() {
    const btn = $("play-trace");
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
      btn.textContent = "Play Trace";
      return;
    }

    btn.textContent = "Pause Trace";
    autoplayTimer = setInterval(() => {
      activeTrace = (activeTrace + 1) % data.runtimeTrace.length;
      renderTraceTabs();
      renderTrace(activeTrace);
    }, 1800);
  }

  function toggleAnimation() {
    animationRunning = !animationRunning;
    $("play-animation").textContent = animationRunning ? "Pause Animation" : "Play Animation";
  }

  function initScrollSpy() {
    const sections = ["animation", "architecture", "phases", "runtime", "tools"];
    const links = Array.from(document.querySelectorAll(".nav-link"));
    window.addEventListener("scroll", () => {
      const pos = window.scrollY + 120;
      let current = sections[0];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= pos) current = id;
      });
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
      });
    });
  }

  function revealNow() {
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => el.classList.add("visible"));
  }
});
