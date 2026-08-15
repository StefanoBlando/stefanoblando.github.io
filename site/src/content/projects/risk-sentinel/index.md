---
title: RiskSentinel - Agentic Systemic Risk Simulator
date: '2026-03-15'
summary: >-
  Multi-agent systemic risk simulator for financial contagion analysis on 210 S&P 500 stocks, built
  for Microsoft AI Dev Days Hackathon 2026 and deployed as an interactive Streamlit app.
tags:
  - Hackathon
  - Multi-Agent Systems
  - Financial AI
  - Systemic Risk
  - Network Science
  - Azure OpenAI
  - Streamlit
  - Microsoft Agent Framework
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/risk-sentinel
  - icon: hero/play-circle
    name: App
    url: https://risk-sentinel-stefanoblando.streamlit.app/
---

RiskSentinel is an **agentic systemic risk simulator** built around a question I find both practical and conceptually interesting: if a large financial node is hit by a shock, how can we make the propagation of that stress visible, comparable, and explainable in real time?

Built for the **Microsoft AI Dev Days Hackathon 2026**, the project combines three contagion models, topology-aware analytics, and a bounded multi-agent workflow on top of research-grade market network data. The purpose is not only to simulate cascades, but to make them easier to inspect through natural-language interaction, interactive visualization, and model comparison.

What makes the project work is the combination of several layers that are often separated: a proper network simulation engine, an interface that makes the results explorable, and an agentic layer that helps interpret what is happening without pretending to replace the underlying quantitative machinery.

The result is a practical prototype for **systemic risk monitoring**, sitting between quantitative finance, complex systems, and AI-assisted decision support.

You can explore the project here:
* **[Repository](https://github.com/stefano-blando/risk-sentinel)**
* **[App](https://risk-sentinel-stefanoblando.streamlit.app/)**
