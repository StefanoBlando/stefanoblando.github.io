/**
 * The co-author graph's data, lifted verbatim out of
 * layouts/_partials/hbx/blocks/collaborators-network/block.html, where it sat
 * inline among 600 lines of D3.
 *
 * It lives here so the graph and the homepage can both read it: the homepage
 * counts co-authors and institutions from it rather than restating numbers
 * that would drift. The Hugo template's own tab counts had already drifted —
 * it claimed 8 faculty and 3 PhD candidates against 9 and 2 in the data.
 */

export const PEOPLE = [
  {
    "id": "gf",
    "name": "Giorgio Fagiolo",
    "role": "Full Professor (PhD Supervisor)",
    "cat": "faculty",
    "inst": "Scuola Superiore Sant'Anna",
    "extInst": [
      "sssa"
    ],
    "topics": [
      "Agent-Based Modeling",
      "Macroeconomics",
      "Systemic Risk & Networks"
    ],
    "papers": [
      "Island Model SMC (MARS 2026)",
      "K+S Model SMC (arXiv:2606)"
    ],
    "avatar": "/images/people/gf.png"
  },
  {
    "id": "av",
    "name": "Andrea Vandin",
    "role": "Associate Professor (PhD Supervisor)",
    "cat": "faculty",
    "inst": "DTU Denmark & SSSA",
    "extInst": [
      "dtu",
      "sssa"
    ],
    "topics": [
      "Statistical Model Checking",
      "Agentic AI",
      "Agent-Based Modeling"
    ],
    "papers": [
      "Towards Agentic ABMs (arXiv:2607.17948)",
      "K+S Model SMC (arXiv:2606)",
      "Island Model SMC (MARS 2026)"
    ],
    "avatar": "/images/people/av.png"
  },
  {
    "id": "dg",
    "name": "Daniele Giachini",
    "role": "Assistant Professor (PhD Supervisor)",
    "cat": "faculty",
    "inst": "Scuola Superiore Sant'Anna",
    "extInst": [
      "sssa"
    ],
    "topics": [
      "Financial Markets",
      "Heterogeneous Agents",
      "Learning Dynamics"
    ],
    "papers": [
      "Island Model SMC (MARS 2026)"
    ],
    "avatar": "/images/people/dg.png"
  },
  {
    "id": "mn",
    "name": "Mauro Napoletano",
    "role": "Full Professor",
    "cat": "faculty",
    "inst": "Uni Côte d'Azur & OFCE",
    "extInst": [
      "cotedazur",
      "ofce"
    ],
    "topics": [
      "Macroeconomics",
      "Agent-Based Modeling",
      "Industrial Dynamics"
    ],
    "papers": [
      "K+S Model SMC (arXiv:2606)"
    ],
    "avatar": "/images/people/mn.jpg"
  },
  {
    "id": "tt",
    "name": "Tania Treibich",
    "role": "Associate Professor",
    "cat": "faculty",
    "inst": "Maastricht Univ. & OFCE",
    "extInst": [
      "maastricht",
      "ofce"
    ],
    "topics": [
      "Macroeconomics",
      "Agent-Based Modeling",
      "Industrial Dynamics"
    ],
    "papers": [
      "K+S Model SMC (arXiv:2606)"
    ],
    "avatar": "/images/people/tt.jpg"
  },
  {
    "id": "gs",
    "name": "Giuseppe Squillace",
    "role": "Researcher",
    "cat": "postdoc",
    "inst": "CentraleSupélec & SSSA",
    "extInst": [
      "centralesupelec",
      "sssa"
    ],
    "topics": [
      "Agentic AI",
      "Agent-Based Modeling",
      "Complex Systems"
    ],
    "papers": [
      "Towards Agentic ABMs (arXiv:2607.17948)"
    ],
    "avatar": "/images/people/gs.png"
  },
  {
    "id": "af",
    "name": "Alessio Farcomeni",
    "role": "Full Professor (MSc Supervisor)",
    "cat": "faculty",
    "inst": "Univ. Tor Vergata",
    "extInst": [
      "torvergata"
    ],
    "topics": [
      "Robust Statistics",
      "High-Dimensional Data",
      "Portfolio Optimization"
    ],
    "papers": [
      "Robust Portfolio Optimization"
    ],
    "avatar": "/images/people/af.jpg"
  },
  {
    "id": "mt",
    "name": "Max Tschaikowski",
    "role": "Professor",
    "cat": "faculty",
    "inst": "Co-author",
    "extInst": [],
    "topics": [
      "Formal Verification",
      "Statistical Model Checking",
      "Agentic AI"
    ],
    "papers": [
      "Towards Agentic ABMs (arXiv:2607.17948)"
    ],
    "avatar": "/images/people/mt.jpg"
  },
  {
    "id": "rp",
    "name": "Riccardo Porcedda",
    "role": "PhD Candidate",
    "cat": "phd",
    "inst": "Scuola Superiore Sant'Anna & UniPi",
    "extInst": [
      "sssa",
      "unipi"
    ],
    "topics": [
      "Agentic AI",
      "Complex Networks",
      "Graph Neural Networks"
    ],
    "papers": [
      "Towards Agentic ABMs (arXiv:2607.17948)"
    ],
    "avatar": "/images/people/rp.png"
  },
  {
    "id": "eg",
    "name": "Emmanuele Guerrazzi",
    "role": "Data Engineer",
    "cat": "postdoc",
    "inst": "Scuola Superiore Sant'Anna",
    "extInst": [
      "sssa"
    ],
    "topics": [
      "Agentic AI",
      "Agent-Based Modeling",
      "Data Engineering"
    ],
    "papers": [
      "Towards Agentic ABMs (arXiv:2607.17948)"
    ],
    "avatar": "/images/people/eg.jpg"
  },
  {
    "id": "fi",
    "name": "D. Fioredistella Iezzi",
    "role": "Full Professor",
    "cat": "faculty",
    "inst": "Univ. Tor Vergata",
    "extInst": [
      "torvergata"
    ],
    "topics": [
      "Text Analytics",
      "Robust Statistics",
      "Data Science"
    ],
    "papers": [
      "Multilingual Text Analytics (VADISTAT Award 2026)"
    ],
    "avatar": "/images/people/fi.jpg"
  },
  {
    "id": "ei",
    "name": "Ernest Ivanaj",
    "role": "Researcher",
    "cat": "postdoc",
    "inst": "Co-author",
    "extInst": [],
    "topics": [
      "Statistical Model Checking",
      "Agent-Based Modeling",
      "Quantitative Methods"
    ],
    "papers": [
      "Island Model SMC (MARS 2026)"
    ],
    "avatar": "/images/people/ei.jpg"
  },
  {
    "id": "fc",
    "name": "Francesca Chiaromonte",
    "role": "Full Professor (L'EMbeDS Coord.)",
    "cat": "faculty",
    "inst": "Penn State & SSSA",
    "extInst": [
      "pennstate",
      "sssa"
    ],
    "topics": [
      "Robust Statistics",
      "High-Dimensional Data",
      "Dimension Reduction"
    ],
    "papers": [],
    "avatar": "/images/people/fc.png"
  },
  {
    "id": "le",
    "name": "Lorenzo Emer",
    "role": "PhD Candidate",
    "cat": "phd",
    "inst": "Scuola Superiore Sant'Anna & UniPi",
    "extInst": [
      "sssa",
      "unipi"
    ],
    "topics": [
      "Complex Systems",
      "Innovation Networks",
      "Green AI"
    ],
    "papers": [],
    "avatar": "/images/people/le.png"
  },
  {
    "id": "st",
    "name": "Simone Tonini",
    "role": "Research Fellow",
    "cat": "postdoc",
    "inst": "Scuola Superiore Sant'Anna",
    "extInst": [
      "sssa"
    ],
    "topics": [
      "Time Series Analysis",
      "Statistical Learning",
      "Anomaly Detection"
    ],
    "papers": [],
    "avatar": "/images/people/st.png"
  }
];

export const INSTITUTIONS = {
  "sssa": {
    "label": "Scuola Superiore Sant'Anna",
    "abbr": "SSSA",
    "logo": "/images/universities/santanna.png",
    "info": "Public research university in Pisa specializing in applied sciences and L'EMbeDS Lab.",
    "isHost": true
  },
  "unipi": {
    "label": "Università di Pisa",
    "abbr": "UniPi",
    "logo": "/images/universities/unipi.png",
    "info": "Historic Italian university for computer science and complex systems.",
    "isHost": true
  },
  "dtu": {
    "label": "DTU - Technical University of Denmark",
    "abbr": "DTU Denmark",
    "logo": "/images/universities/dtu.png",
    "info": "European leader in formal methods, model checking, and agentic systems.",
    "isHost": false
  },
  "pennstate": {
    "label": "Penn State University",
    "abbr": "Penn State",
    "logo": "/images/universities/pennstate.png",
    "info": "Leading US research university for high-dimensional statistical methodology.",
    "isHost": false
  },
  "cotedazur": {
    "label": "Université Côte d'Azur",
    "abbr": "UniCA",
    "logo": "/images/universities/cotedazur.png",
    "info": "French university of excellence for macroeconomic dynamic modeling.",
    "isHost": false
  },
  "ofce": {
    "label": "OFCE - Sciences Po Paris",
    "abbr": "OFCE",
    "logo": "/images/universities/ofce.jpg",
    "info": "French Economic Observatory at Sciences Po Paris.",
    "isHost": false
  },
  "maastricht": {
    "label": "Maastricht University",
    "abbr": "Maastricht",
    "logo": "/images/universities/maastricht.jpg",
    "info": "Dutch research center for macroeconomics and structural innovation.",
    "isHost": false
  },
  "centralesupelec": {
    "label": "CentraleSupélec Paris",
    "abbr": "CentraleSupélec",
    "logo": "/images/universities/centralesupelec.png",
    "info": "Grande école d'ingénieurs at Université Paris-Saclay.",
    "isHost": false
  },
  "torvergata": {
    "label": "Università di Roma Tor Vergata",
    "abbr": "Tor Vergata",
    "logo": "/images/universities/torvergata.png",
    "info": "Italian university excellence for robust statistics and text analytics.",
    "isHost": false
  }
};

/** Faculty cyan, post-doc indigo, PhD emerald. */
export const ROLE_COLORS = {
  "faculty": "#38bdf8",
  "postdoc": "#818cf8",
  "phd": "#34d399"
};

/** Derived, never typed in. */
export const INSTITUTION_COUNT = new Set(PEOPLE.flatMap((p) => p.extInst)).size;

export const COUNT_BY_CATEGORY = PEOPLE.reduce((acc, p) => {
  acc[p.cat] = (acc[p.cat] ?? 0) + 1;
  return acc;
}, {});
