---
title: Robust Portfolio Optimization under Systematic Market Disruptions (PFSE)
date: '2026-03-06'
summary: >-
  Novel PFSE estimator achieves 25% breakdown point with 32× computational speedup over MCD.
  Out-of-sample Sharpe 1.87 on S&P 500 (2015–2025), 29% lower drawdown during COVID-19. Submitted to
  Computational Economics.
tags:
  - Research
  - Quantitative Finance
  - Robust Statistics
  - Portfolio Optimization
  - Factor Models
  - Covariance Estimation
  - Computational Economics
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/robust-portfolio-optimization
  - icon: hero/play-circle
    name: Interactive Explorer
    url: /pfse-app/
  - icon: hero/document-text
    name: Paper
    url: /publications/robust-port-opt/
---

This project introduces the **Parallel Factor Space Estimator (PFSE)**, a hybrid framework for robust covariance estimation that resolves a fundamental trade-off in institutional portfolio management: traditional robust estimators (MCD, Tyler) offer strong statistical guarantees but are computationally infeasible for daily rebalancing of 100+ assets, while efficient methods (Ledoit-Wolf, sample covariance) have zero breakdown point against systematic contamination.

PFSE exploits a structural insight: during systematic market disruptions — flash crashes, monetary policy shocks, crisis contagion — extreme movements propagate through **common factors**, not idiosyncratic components. By concentrating robust estimation in reduced k-dimensional factor space (k=5 versus p=100–1000), PFSE inherits 25% breakdown point from MCD while achieving **32× computational speedup**.

*Work with Alessio Farcomeni (University of Roma Tor Vergata). Submitted to Computational Economics (Springer), March 2026.*

## Key Results

Validated through three complementary stages:

- **Monte Carlo (p=100, ε=10% contamination):** PFSE Sharpe 1.42 vs 0.96 for sample covariance — maintains 97% of clean-data performance while sample covariance degrades 31%
- **S&P 500 backtest (2015–2025):** Out-of-sample Sharpe 1.87 vs 1.63 (+14.7%), max drawdown −24.3% vs −34.1% (−29%) during COVID-19, turnover −42%
- **Five stress scenarios:** PFSE rank-1 across all scenarios, average Sharpe 1.67 vs 1.39 (+20%), lowest performance variability (CoV 0.041 vs 0.064)
- **Economic value:** $72M normal-period + $93M stress-period benefits per $1B portfolio, benefit-cost ratio 31:1

## Interactive Explorer

The interactive app lets you explore the full results: run the PFSE estimation algorithm live, compare methods under increasing contamination levels, examine computational scalability, and inspect S&P 500 cumulative returns across all four market regimes.

**[Open Interactive Explorer](/pfse-app/)**
