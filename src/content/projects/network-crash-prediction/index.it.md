---
title: Analisi della Topologia di Rete per la Previsione del Rischio Sistemico
date: '2026-01-10'
summary: >-
  Progetto di machine learning finanziario che combina reti di correlazione dinamiche, graph neural
  networks e trading backtest per individuare il rischio sistemico nei mercati azionari
  statunitensi.
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

Questo progetto corrisponde alla mia tesi CESMA sulla **previsione del rischio sistemico nei mercati azionari statunitensi**. La domanda di fondo e semplice ma importante: la topologia di rete puo dire qualcosa di utile sullo stress di mercato prima degli indicatori standard?

Usando dati giornalieri di **210 componenti dell'S&P 500 (2013-2025)**, il progetto combina reti di correlazione dinamiche con modelli di machine learning che vanno dal gradient boosting alle **Graph Neural Networks** come **GraphSAGE** e **GAT**. L'obiettivo non e solo l'accuratezza di classificazione, ma l'utilita economica sotto vincoli realistici di validazione e backtesting.

Il risultato piu interessante e che i segnali derivati dalla rete sembrano contenere vera informazione di early warning, soprattutto attorno a stati di mercato severi e strutturalmente fragili. Nelle configurazioni migliori, il framework migliora sia il timing sia la performance di trading rispetto a baseline piu semplici.

Questo progetto e affiancato dalla relativa pagina tesi, dove lo stesso lavoro e presentato come publication entry.
