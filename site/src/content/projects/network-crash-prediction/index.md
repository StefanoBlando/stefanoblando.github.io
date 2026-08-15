---
title: Network Topology Analysis for Systemic Risk Prediction
date: '2026-01-10'
summary: >-
  Financial machine learning project combining dynamic correlation networks, graph neural networks,
  and trading backtests to detect systemic risk in U.S. equity markets.
tags:
  - Research
  - Systemic Risk
  - Graph Neural Networks
  - Algo Trading
  - Network Science
  - Financial Markets
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/systemic-risk-prediction
  - icon: hero/document-text
    name: Paper
    url: /publications/network-crash-prediction/
---

This project corresponds to my CESMA thesis on **systemic risk prediction in U.S. equity markets**. The underlying question is simple but important: can network topology say something useful about market stress before standard indicators do?

Using daily data from **210 S&P 500 constituents (2013-2025)**, the project combines dynamic correlation networks with machine learning models ranging from gradient boosting to **Graph Neural Networks** such as **GraphSAGE** and **GAT**. The goal is not just classification accuracy, but economic usefulness under realistic validation and backtesting constraints.

The most interesting result is that network-derived signals appear to carry genuine early-warning information, especially around severe and structurally fragile market states. In the strongest configurations, the framework improves both timing and trading performance relative to simpler baselines.

This project is paired with the related thesis page, where the same work is presented as a publication entry.
