---
title: Network Topology Analysis for Systemic Risk Prediction
date: 2026-01-10
summary: Development of a hybrid framework combining Dynamic Correlation Networks and Graph Neural Networks (GraphSAGE, GAT) to predict market crashes. Validated on S&P 500 data (2013–2025) with profitable trading strategies.
tags:
  - Systemic Risk
  - Graph Neural Networks
  - Algo Trading
  - Network Science
  - Financial Markets
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/stefanoblando/systemic-risk-prediction
---

This project implements the research for the Master Thesis **"Network Topology and Machine Learning for Systemic Risk: From Early Warning to Trading Strategies."** It investigates the application of complex network theory and deep learning to forecast systemic events using daily price data from **210 S&P 500 constituents spanning 2013–2025**.

**Novel Methodological Contributions:**
* **Hybrid Predictive Framework:** Integration of network-derived features (Eigenvalue entropy, Absorption Ratio, Modularity) with traditional market indicators to predict crash targets.
* **Advanced Architectures:** Comparison of Gradient Boosting (XGBoost, LightGBM, CatBoost), LSTM networks, and Graph Neural Networks (**GraphSAGE, GAT**) for temporal and topological learning.
* **Microstructure Analysis:** Examination of herding behavior via the Chang-Cheng-Khorana framework and volatility spillover measurement using the Diebold-Yilmaz methodology.

**Key Results:**
* **Early Warning Signals:** Network features anticipate market movements by an average of **4.2 trading days**, with **88.9%** of Granger causality tests showing significant predictive relationships.
* **Crisis Detection:** The topology exhibited detectable anomalies an average of **67 days** before major onsets (COVID-19, 2022 Bear Market, SVB Crisis, Japan Carry Trade unwind).
* **Economic Value:** The best-performing trading strategy (Hybrid ML-trend) achieved a **Sharpe ratio of 0.79** (vs 0.46 for Buy & Hold), reducing max drawdown from 25.4% to 21.2% and delivering a **net outperformance of 21.7%**.

**Technical Implementation:**
Built entirely in **Python**, utilizing a rigorous validation pipeline:
* **Libraries:** `PyTorch Geometric` (GNNs), `NetworkX` (Topology), `LightGBM/XGBoost` (Gradient Boosting).
* **Validation:** Strict **Walk-Forward Cross-Validation with Purging** to prevent lookahead bias.
* **Simulation:** Contagion simulation through cascade models and transaction cost-adjusted backtesting for trading strategies.
