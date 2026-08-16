window.ORCH_DATA = {
  meta: {
    title: "Multi-Agent Coordination under Auctions and Demand Uncertainty",
    short: "Economic Coordination Runtime Explorer",
    authors: ["Stefano Blando"],
    venue: "Competitive Coordination Environment",
    status: "Competitive Build",
    abstract:
      "This project explores real-time coordination in a competitive market-like environment. In practice, the system handles auction-based procurement, inventory allocation, policy updates, and demand fulfillment under tight timing constraints. The point is not generic prompting, but reliable coordination under changing phases, partial information, and execution risk.",
    key_metrics: [
      { label: "Decision Phases", value: "4", delta: "policy · procurement · reconciliation · fulfillment", color: "#4f8ef7" },
      { label: "Execution Surface", value: "12", delta: "partitioned decision and action capabilities", color: "#22c55e" },
      { label: "Persistent Memory", value: "1", delta: "procurement memory trimmed to 6 turns", color: "#a78bfa" },
      { label: "Replay Layer", value: "KPI", delta: "turn-level operational and revenue metrics", color: "#f59e0b" }
    ]
  },

  architecture: [
    {
      title: "Live Event Stream",
      tag: "Control Plane",
      color: "#4f8ef7",
      text: "The system reacts to live environmental updates, phase changes, and new demand signals through a guarded coordination loop."
    },
    {
      title: "Shared State Ledger",
      tag: "State Layer",
      color: "#22c55e",
      text: "A shared state layer tracks phase, balance, inventories, demand queues, market context, and turn-level performance signals."
    },
    {
      title: "Phase Agents",
      tag: "Decision Layer",
      color: "#a78bfa",
      text: "The agent factory routes execution to speaking, closed_bid, waiting, or serving, each with a dedicated system prompt, tool set, and action policy."
    },
    {
      title: "Action Layer",
      tag: "Execution Layer",
      color: "#f59e0b",
      text: "Each phase is linked to a restricted action surface for policy updates, procurement, rebalancing, preparation, and fulfillment."
    },
    {
      title: "Market Analyst",
      tag: "Sub-Agent",
      color: "#f472b6",
      text: "Bidding and waiting phases can call a separate analyst agent to inspect historical prices, bid archives, competition, and market opportunities."
    },
    {
      title: "Persistence + Replay",
      tag: "Observability",
      color: "#38bdf8",
      text: "Selected memory is saved across turns, while KPI logs support replay analysis of conversion, revenue, procurement spend, failures, and fulfillment latency."
    }
  ],

  animation: {
    nodes: [
      { id: "market", label: "Market Feed", x: 0.5, y: 0.12, color: "#38bdf8", type: "context" },
      { id: "demand", label: "Demand Signal", x: 0.15, y: 0.28, color: "#22c55e", type: "context" },
      { id: "speaking", label: "Policy Agent", x: 0.82, y: 0.26, color: "#4f8ef7", type: "phase" },
      { id: "coordinator", label: "Coordinator", x: 0.50, y: 0.46, color: "#e2e8f0", type: "core" },
      { id: "closed_bid", label: "Auction Agent", x: 0.83, y: 0.50, color: "#22c55e", type: "phase" },
      { id: "state", label: "State Ledger", x: 0.18, y: 0.68, color: "#a78bfa", type: "context" },
      { id: "waiting", label: "Inventory Agent", x: 0.82, y: 0.72, color: "#a78bfa", type: "phase" },
      { id: "serving", label: "Fulfillment Agent", x: 0.48, y: 0.84, color: "#f59e0b", type: "phase" },
      { id: "kpi", label: "KPI Replay", x: 0.16, y: 0.88, color: "#f59e0b", type: "context" }
    ],
    states: [
      {
        phase: "Policy Update",
        accent: "#4f8ef7",
        caption: "Demand enters the coordinator, which activates the policy agent to refresh the supply menu before the operational cycle begins.",
        routes: [
          { from: "demand", to: "coordinator", label: "demand", color: "#22c55e" },
          { from: "coordinator", to: "speaking", label: "policy", color: "#4f8ef7" },
          { from: "speaking", to: "state", label: "menu", color: "#4f8ef7" }
        ]
      },
      {
        phase: "Procurement Auction",
        accent: "#22c55e",
        caption: "Inventory gaps and market context route the system into auction mode, where the bidding agent places procurement bids using recent information and bounded memory.",
        routes: [
          { from: "state", to: "coordinator", label: "inventory gap", color: "#a78bfa" },
          { from: "market", to: "coordinator", label: "price feed", color: "#38bdf8" },
          { from: "coordinator", to: "closed_bid", label: "bid plan", color: "#22c55e" },
          { from: "closed_bid", to: "market", label: "bid", color: "#22c55e" }
        ]
      },
      {
        phase: "Inventory Reconciliation",
        accent: "#a78bfa",
        caption: "Once auction outcomes arrive, the reconciliation agent narrows the feasible supply set, liquidates surplus, and updates the state ledger.",
        routes: [
          { from: "market", to: "waiting", label: "auction result", color: "#38bdf8" },
          { from: "state", to: "waiting", label: "stock", color: "#a78bfa" },
          { from: "waiting", to: "state", label: "rebalanced menu", color: "#a78bfa" },
          { from: "waiting", to: "market", label: "sell / buy", color: "#a78bfa" }
        ]
      },
      {
        phase: "Demand Fulfillment",
        accent: "#f59e0b",
        caption: "The fulfillment agent processes waiting demand FIFO, prepares feasible outputs, handles requests, and emits KPI traces for replay analysis.",
        routes: [
          { from: "demand", to: "serving", label: "queue", color: "#22c55e" },
          { from: "state", to: "serving", label: "inventory", color: "#a78bfa" },
          { from: "coordinator", to: "serving", label: "dispatch", color: "#f59e0b" },
          { from: "serving", to: "kpi", label: "latency / revenue", color: "#f59e0b" }
        ]
      }
    ]
  },

  flow: {
    nodes: [
      "Live Events",
      "State Ledger",
      "Phase Queue",
      "Policy Agent",
      "Auction Agent",
      "Inventory Agent",
      "Serving Agent",
      "Analyst Agent",
      "Action Layer",
      "Persistence",
      "Replay Metrics"
    ],
    links: [
      { source: 0, target: 1, value: 10 },
      { source: 1, target: 2, value: 9 },
      { source: 2, target: 3, value: 2 },
      { source: 2, target: 4, value: 2 },
      { source: 2, target: 5, value: 2 },
      { source: 2, target: 6, value: 3 },
      { source: 4, target: 7, value: 1 },
      { source: 5, target: 7, value: 1 },
      { source: 3, target: 8, value: 2 },
      { source: 4, target: 8, value: 2 },
      { source: 5, target: 8, value: 2 },
      { source: 6, target: 8, value: 3 },
      { source: 4, target: 9, value: 1 },
      { source: 1, target: 9, value: 1 },
      { source: 1, target: 10, value: 2 }
    ]
  },

  phases: [
    {
      id: "speaking",
      name: "Speaking",
      short: "Policy Update",
      color: "#4f8ef7",
      goal: "Set the supply policy, open the operating cycle, and close the phase without drifting from deterministic selection.",
      memory: "Stateless",
      subagents: "None",
      tools: ["get_restaurant_info", "set_menu", "open_close_restaurant", "end_phase"],
      policies: [
        "Follow a deterministic policy update rather than improvising from scratch.",
        "Prioritize feasible options supported by current resources.",
        "Open the operating cycle, then terminate the phase cleanly."
      ],
      note: "This is the lowest-ambiguity phase: it behaves like a policy update step before the market cycle starts.",
      promptFocus: "Exact JSON execution, feasible supply policy, low-error startup."
    },
    {
      id: "closed_bid",
      name: "Closed Bid",
      short: "Auction Strategy",
      color: "#22c55e",
      goal: "Place low-cost procurement bids on missing inputs while preserving balance and using recent market information.",
      memory: "Persistent memory enabled",
      subagents: "market_analyst",
      tools: ["place_bid", "end_phase"],
      policies: [
        "Start from deterministic recommended bids computed from balance and inventory gaps.",
        "Allow bounded deviations around the recommendation only when archive or market evidence justifies it.",
        "Trim persistent memory to the last 6 turns to avoid context bloat."
      ],
      note: "This phase is easiest to interpret as auction-based procurement under budget constraints.",
      promptFocus: "Budget caps, historical bid context, price shading, competition-aware procurement."
    },
    {
      id: "waiting",
      name: "Waiting",
      short: "Inventory Reconciliation",
      color: "#a78bfa",
      goal: "Refresh state after auction resolution, update the feasible supply set, liquidate surplus inventory, and opportunistically buy from the market.",
      memory: "Stateless",
      subagents: "market_analyst",
      tools: ["get_restaurant_info", "set_menu", "market_sell", "get_market", "market_execute", "end_phase"],
      policies: [
        "Restrict the active supply set to options that are now feasible.",
        "Sell surplus ingredients that are unlikely to be valuable before end-of-turn expiration.",
        "Buy from the market only if prices beat the typical bid context."
      ],
      note: "This phase bridges auction outcomes and operational execution.",
      promptFocus: "Feasible supply refresh, liquidation, cheap market replacement."
    },
    {
      id: "serving",
      name: "Serving",
      short: "FIFO Execution",
      color: "#f59e0b",
      goal: "Process waiting demand in FIFO order, prepare exact or ingredient-compatible outputs, and keep fulfillment robust under noisy runtime conditions.",
      memory: "Stateless",
      subagents: "None",
      tools: ["get_meals", "prepare_dish", "wait_for_preparation", "serve_dish", "get_market", "market_execute", "end_phase"],
      policies: [
        "Read the full waiting queue once, then process it FIFO.",
        "Match requests exactly or through valid ingredient-compatible outputs; do not improvise substitutes.",
        "Track failures, latency, and remaining capacity before closing the phase."
      ],
      note: "This is the most execution-heavy phase and the main source of operational failure modes.",
      promptFocus: "FIFO queue discipline, exact fulfillment semantics, one attempt per client."
    }
  ],

  kpis: {
    turns: [1, 2, 3, 4, 5, 6],
    clients: [8, 11, 13, 12, 14, 15],
    served: [5, 8, 9, 10, 12, 13],
    revenue: [132, 214, 246, 271, 324, 356],
    bidSpend: [84, 96, 121, 109, 138, 142],
    notReady: [3, 2, 2, 1, 1, 1],
    avgLatencyMs: [1880, 1640, 1530, 1410, 1360, 1290]
  },

  runtimeTrace: [
    {
      label: "Turn 4 · speaking",
      phase: "speaking",
      turn: 4,
      status: "Supply policy refreshed and operating cycle reopened.",
      lines: [
        "Phase → speaking",
        "State snapshot loaded: turn=4 balance=612 inventory=stable",
        "Policy engine selected 4 feasible supply items",
        "Supply policy refreshed",
        "Operating cycle opened",
        "Phase closed"
      ]
    },
    {
      label: "Turn 4 · closed_bid",
      phase: "closed_bid",
      turn: 4,
      status: "Recommended bids adjusted with archive context.",
      lines: [
        "Phase → closed_bid",
        "Missing ingredients detected: mozzarella, basilico, tonno",
        "Historical price context loaded from bid archive",
        "Analyst signal: mozzarella trend flat, competition medium",
        "Procurement bids submitted",
        "Auction memory updated",
        "Phase closed"
      ]
    },
    {
      label: "Turn 4 · waiting",
      phase: "waiting",
      turn: 4,
      status: "Cookable menu narrowed after auction resolution.",
      lines: [
        "Phase → waiting",
        "Auction wins reconciled into inventory snapshot",
        "Active supply narrowed to feasible options",
        "Surplus inventory partially liquidated",
        "Phase closed"
      ]
    },
    {
      label: "Turn 4 · serving",
      phase: "serving",
      turn: 4,
      status: "FIFO serving loop executed with one not-ready failure.",
      lines: [
        "Phase → serving",
        "Built waiting queue: 10 client IDs",
        "Prepared next feasible output",
        "Attempted fulfillment for client 4412",
        "WARN output not ready in time",
        "KPI [current turn 4] clients=12 served=10 revenue=271 bid_spend=109 net=162",
        "Phase closed"
      ]
    }
  ],

  toolSurface: {
    phases: ["speaking", "closed_bid", "waiting", "serving"],
    tools: [
      "get_restaurant_info",
      "set_menu",
      "open_close_restaurant",
      "place_bid",
      "get_market",
      "market_execute",
      "market_sell",
      "get_meals",
      "prepare_dish",
      "wait_for_preparation",
      "serve_dish",
      "end_phase"
    ],
    matrix: [
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1]
    ]
  }
};
