---
title: Island Model + MultiVeStA — Statistical Model Checking of Economic Growth
date: '2026-03-06'
summary: >-
  Accepted paper at MARS @ ETAPS 2026. Reproduces and extends Fagiolo & Dosi (2003) Island Model
  using MultiVeStA for statistical model checking, with formal convergence guarantees on parameter
  sensitivity analysis.
tags:
  - Research
  - Agent-Based Modeling
  - Statistical Model Checking
  - MultiVeStA
  - MATLAB
  - Economic Growth
  - Complexity Economics
  - ETAPS 2026
links:
  - icon: hero/play-circle
    name: Interactive Explorer
    url: /island-model-app/
  - icon: hero/document-text
    name: Proceedings
    url: https://cgi.cse.unsw.edu.au/~eptcs/paper.cgi?MARS2026.2
  - icon: hero/book-open
    name: Publication Page
    url: /publications/island-model-smc/
  - icon: brands/github
    name: MultiVeStA
    url: https://github.com/andrea-vandin/MultiVeStA
---

This project reproduces and extends the **Fagiolo & Dosi (2003) Island Model** — a landmark agent-based model of endogenous economic growth — using **MultiVeStA**, a tool for sequential statistical model checking of stochastic systems.

The paper was accepted at **MARS @ ETAPS 2026** (Workshop on Models for Formal Analysis of Real Systems, European Joint Conferences on Theory and Practice of Software).

*Work with Giorgio Fagiolo, Daniele Giachini, Andrea Vandin, and Ernest Ivanaj (Scuola Superiore Sant'Anna).*

Related pages: **[Proceedings](https://cgi.cse.unsw.edu.au/~eptcs/paper.cgi?MARS2026.2)**, **[publication page](/publications/island-model-smc/)**, and **[presentation recap](/blog/mars-etaps-2026-presentation/)**.

## What the Model Does

The Island Model captures endogenous growth through the interaction of three types of heterogeneous agents operating on a fitness landscape:

- **Miners** exploit their current productive niche, accumulating skills over time
- **Imitators** copy the most successful visible agent, diffusing knowledge across the economy with probability φ
- **Explorers** search for new islands at random, driving innovation and preventing lock-in

The key insight is that the tension between exploitation and exploration — parameterised by ε — generates self-sustaining growth dynamics without requiring exogenous technological progress.

## What MultiVeStA Adds

Standard Monte Carlo analysis uses a fixed number of simulation runs with no formal guarantee on estimation quality. MultiVeStA applies **sequential statistical model checking**: it runs simulations adaptively, stopping only when the 95% confidence interval on E[logGDP] is narrower than δ=0.05 at every time step. This provides a formal precision guarantee — the sample size is determined by the data variance, not by the experimenter.

Our analysis confirms the **optimality of moderate exploration** (ε ≈ 0.1), reproduces all stylized facts of the original model, and establishes through Welch t-test counterfactual analysis that 6 out of 7 pairwise parameter comparisons yield statistically distinguishable growth trajectories. The single exception (ρ=3.0 vs ρ=5.0) reveals a **saturation effect** in knowledge locality.

## Interactive Explorer

The interactive app lets you explore the model live: watch agents move across the technology landscape, observe imitation cascades and exploration events, run MultiVeStA sensitivity analysis on α, φ, and ρ, and see how the sequential sampling converges.

* **[Open Interactive Explorer](/island-model-app/)**
* **[Read the proceedings version](https://cgi.cse.unsw.edu.au/~eptcs/paper.cgi?MARS2026.2)**
* **[View the publication page](/publications/island-model-smc/)**
* **[MultiVeStA on GitHub](https://github.com/andrea-vandin/MultiVeStA)**
