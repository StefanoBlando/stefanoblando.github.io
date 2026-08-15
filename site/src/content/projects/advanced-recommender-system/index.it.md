---
title: Sistema di Raccomandazione Avanzato
date: '2025-06-20'
summary: >-
  Sistema di raccomandazione learning-to-rank per la previsione della next best action, che combina
  ottimizzazione bayesiana ed ensemble ranking per migliorare NDCG@5 del 36%.
tags:
  - Side Quest
  - Recommender Systems
  - Machine Learning
  - LightGBM
  - XGBoost
  - Ensemble Learning
  - Python
image:
  caption: System Architecture
  focal_point: Smart
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/advanced-recommender-system
---

Questo progetto e stato sviluppato nel **Master CESMA** in collaborazione con **TIM**. Invece di formulare il problema come un classico task di classificazione, il sistema e stato progettato come pipeline **learning-to-rank** per raccomandare la next best action.

Questo cambio di impostazione conta perche il ranking e piu vicino alla decisione di business reale: non solo stabilire se un'azione sia buona o cattiva, ma quale debba venire prima per uno specifico utente.

La pipeline combina validazione accurata, ottimizzazione bayesiana e strategie di ensemble ranking. Il risultato finale e un miglioramento sostanziale rispetto alla baseline su **NDCG@5**, rendendo il progetto un buon esempio di machine learning applicato sotto vincoli di valutazione realistici.

Sintesi delle performance:

| Stage | NDCG@5 Score | Improvement vs Baseline |
| :--- | :--- | :--- |
| **Baseline Model** | 0.5030 | -- |
| **Best Single Model** | 0.6838 | +35.94% |
| **Best Ensemble** | **0.6852** | **+36.23%** |

Nel complesso, e uno degli esempi piu chiari del portfolio di come un task ML familiare possa essere riformulato in modo piu coerente con il problema decisionale reale.
