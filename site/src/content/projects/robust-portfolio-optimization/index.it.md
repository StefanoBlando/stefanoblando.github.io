---
title: Ottimizzazione Robusta di Portafoglio sotto Disruption Sistemiche di Mercato (PFSE)
date: '2026-03-06'
summary: >-
  Il nuovo stimatore PFSE raggiunge breakdown point del 25% con speedup computazionale di 32x
  rispetto a MCD. Sharpe out-of-sample 1.87 su S&P 500 (2015-2025), drawdown ridotto del 29% durante
  il COVID-19. Sottomesso a Computational Economics.
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

Questo progetto introduce il **Parallel Factor Space Estimator (PFSE)**, un framework ibrido per la stima robusta della covarianza che risolve un trade-off fondamentale nel portfolio management istituzionale: gli stimatori robusti tradizionali (MCD, Tyler) offrono forti garanzie statistiche ma sono computazionalmente impraticabili per il ribilanciamento giornaliero di oltre 100 asset, mentre i metodi efficienti (Ledoit-Wolf, sample covariance) hanno breakdown point nullo contro contaminazioni sistematiche.

PFSE sfrutta un'intuizione strutturale: durante disruption sistemiche di mercato, come flash crash, shock di politica monetaria o contagio di crisi, i movimenti estremi si propagano attraverso **fattori comuni**, non componenti idiosincratiche. Concentrando la stima robusta in uno spazio fattoriale ridotto di dimensione k (k=5 contro p=100-1000), PFSE eredita il breakdown point del 25% da MCD ottenendo al tempo stesso **32x speedup computazionale**.

*Lavoro con Alessio Farcomeni (University of Roma Tor Vergata). Sottomesso a Computational Economics (Springer), marzo 2026.*

## Risultati principali

Validato attraverso tre stadi complementari:

- **Monte Carlo (p=100, ε=10% contamination):** PFSE Sharpe 1.42 vs 0.96 per sample covariance, mantiene il 97% della performance clean-data mentre la sample covariance degrada del 31%
- **Backtest S&P 500 (2015-2025):** Sharpe out-of-sample 1.87 vs 1.63 (+14.7%), max drawdown -24.3% vs -34.1% (-29%) durante il COVID-19, turnover -42%
- **Cinque scenari di stress:** PFSE rank-1 in tutti gli scenari, Sharpe medio 1.67 vs 1.39 (+20%), minima variabilita della performance (CoV 0.041 vs 0.064)
- **Valore economico:** $72M di benefici in periodi normali + $93M in periodi di stress per ogni portafoglio da $1B, rapporto benefici-costi 31:1

## Interactive Explorer

L'app interattiva permette di esplorare tutti i risultati: eseguire live l'algoritmo di stima PFSE, confrontare i metodi all'aumentare della contaminazione, esaminare la scalabilita computazionale e ispezionare i rendimenti cumulati dell'S&P 500 nei quattro regimi di mercato.

**[Apri l'Interactive Explorer](/pfse-app/)**
