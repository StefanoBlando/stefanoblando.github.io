---
title: >-
  Statistical model checking of the Island Model: an established economic agent-based model of
  endogenous growth
authors:
  - Stefano Blando
  - Giorgio Fagiolo
  - Daniele Giachini
  - Andrea Vandin
  - Ernest Ivanaj
date: '2026-04-12'
publishDate: '2026-03-20T00:00:00Z'
type: Conference paper
venue: MARS @ ETAPS 2026, Turin, Italy
venue_short: MARS 2026
abstract: >-
  Agent-based models (ABMs) are increasingly used to study complex economic phenomena such as
  endogenous growth, but their analysis typically relies on ad-hoc Monte Carlo exercises without
  formal statistical guarantees. We show how statistical model checking (SMC), and in particular
  MultiVeStA, can automate and enrich the analysis of a seminal ABM: the Island Model of Fagiolo and
  Dosi, which captures the exploration-exploitation trade-off in technological search. We reproduce
  key stylized facts from the original model with formal confidence intervals, confirm the
  optimality of moderate exploration rates, and perform a counterfactual sensitivity analysis across
  returns to scale, skill transfer, and knowledge locality. Using MultiVeStA's built-in Welch's
  t-test, 6 out of 7 pairwise parameter comparisons yield statistically different growth
  trajectories, while the exception reveals a saturation effect in knowledge locality. Our results
  demonstrate that SMC offers a principled, reproducible methodology for the quantitative analysis
  of agent-based economic models.
summary: >-
  Presented at MARS @ ETAPS 2026, this paper uses MultiVeStA to give the Island Model a more
  rigorous and reproducible statistical analysis.
tags:
  - Agent-Based Modeling
  - Computational Economics
  - Statistical Model Checking
  - MultiVeStA
  - Endogenous Growth
  - MATLAB
featured: true
pillar: statistical-verification
image:
  caption: Statistical validation of the Island Model with MultiVeStA
  focal_point: ''
  preview_only: false
links:
  - name: Proceedings
    url: https://cgi.cse.unsw.edu.au/~eptcs/paper.cgi?MARS2026.2
  - name: Acceptance News
    url: /blog/mars-etaps-2026-acceptance/
  - name: Presentation Recap
    url: /blog/mars-etaps-2026-presentation/
  - name: Interactive Explorer
    url: /island-model-app/
  - name: Code
    url: https://github.com/andrea-vandin/MultiVeStA
---
