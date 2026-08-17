---
title: Island Model + MultiVeStA - Statistical Model Checking della Crescita Economica
date: '2026-03-06'
summary: >-
  Paper accettato a MARS @ ETAPS 2026. Riproduce ed estende l'Island Model di Fagiolo e Dosi (2003)
  usando MultiVeStA per statistical model checking, con garanzie formali di convergenza sull'analisi
  di sensibilita dei parametri.
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
    name: Pagina Pubblicazione
    url: /publications/island-model-smc/
  - icon: brands/github
    name: MultiVeStA
    url: https://github.com/andrea-vandin/MultiVeStA
---

Questo progetto riproduce ed estende l'**Island Model di Fagiolo e Dosi (2003)**, un modello agent-based fondamentale della crescita economica endogena, usando **MultiVeStA**, uno strumento per lo statistical model checking sequenziale di sistemi stocastici.

Il paper e stato accettato a **MARS @ ETAPS 2026** (Workshop on Models for Formal Analysis of Real Systems, European Joint Conferences on Theory and Practice of Software).

*Lavoro con Giorgio Fagiolo, Daniele Giachini, Andrea Vandin ed Ernest Ivanaj (Scuola Superiore Sant'Anna).*

Pagine collegate: **[Proceedings](https://cgi.cse.unsw.edu.au/~eptcs/paper.cgi?MARS2026.2)**, **[pagina della pubblicazione](/publications/island-model-smc/)** e **[resoconto della presentazione](/blog/mars-etaps-2026-presentation/)**.

## Cosa fa il modello

L'Island Model cattura la crescita endogena attraverso l'interazione di tre tipi di agenti eterogenei che operano su un fitness landscape:

- **Miners** sfruttano la loro nicchia produttiva corrente, accumulando competenze nel tempo
- **Imitators** copiano l'agente visibile con maggior successo, diffondendo conoscenza nell'economia con probabilita φ
- **Explorers** cercano nuove isole casualmente, guidando l'innovazione ed evitando il lock-in

L'intuizione chiave e che la tensione tra exploitation ed exploration, parametrizzata da ε, genera dinamiche di crescita autosostenute senza richiedere progresso tecnologico esogeno.

## Cosa aggiunge MultiVeStA

L'analisi Monte Carlo standard usa un numero fisso di simulazioni senza garanzie formali sulla qualita della stima. MultiVeStA applica **sequential statistical model checking**: esegue le simulazioni in modo adattivo, fermandosi solo quando l'intervallo di confidenza al 95% su E[logGDP] e piu stretto di δ=0.05 a ogni istante temporale. Questo fornisce una garanzia formale di precisione: la dimensione campionaria e determinata dalla varianza dei dati, non dal ricercatore.

La nostra analisi conferma l'**ottimalita di un'esplorazione moderata** (ε ≈ 0.1), riproduce tutti gli stylized facts del modello originale e stabilisce tramite analisi controfattuale con Welch t-test che 6 confronti su 7 tra coppie di parametri producono traiettorie di crescita statisticamente distinguibili. L'unica eccezione (ρ=3.0 vs ρ=5.0) rivela un **effetto di saturazione** nella localita della conoscenza.

## Interactive Explorer

L'app interattiva permette di esplorare il modello dal vivo: osservare gli agenti muoversi nel paesaggio tecnologico, seguire le cascata di imitazione e gli eventi di esplorazione, eseguire l'analisi di sensibilita MultiVeStA su α, φ e ρ, e vedere come converge il campionamento sequenziale.

* **[Apri l'Interactive Explorer](/island-model-app/)**
* **[Leggi la versione nei proceedings](https://cgi.cse.unsw.edu.au/~eptcs/paper.cgi?MARS2026.2)**
* **[Vai alla pagina della pubblicazione](/publications/island-model-smc/)**
* **[MultiVeStA on GitHub](https://github.com/andrea-vandin/MultiVeStA)**
