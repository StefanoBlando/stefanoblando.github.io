---
title: NLP e Analisi di Reti Semantiche
date: 2026-01-10
summary: Implementazione tecnica della pipeline del paper JADT, con preprocessing multilingue, topic modeling, correspondence analysis, spazi semantici, moduli di sentiment e validazione basata su reti tra metodi diversi.
tags:
  - Research
  - Text Mining
  - Network Science
  - Correspondence Analysis
  - Clustering
  - R
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/nlp-semantic-network
  - icon: hero/document-text
    name: Paper
    url: /it/publications/multi-method-validation-framework/
---

Questo progetto e l'implementazione tecnica alla base della pubblicazione **“A Multi-Method Validation Framework for Large-Scale Multilingual Text Analytics”** (JADT 2026, Palermo, 8–10 luglio 2026; Atti ISBN 978-88-5509-883-0). Operationalizza l'intero workflow analitico usato nel paper, dalla preparazione dei dati alla validazione cross-method e al confronto dei risultati.

La pipeline combina moduli in **R e Python** su un grande corpus multilingue di recensioni, includendo: preprocessing e TF-IDF, **LDA topic modeling**, **LSA e Correspondence Analysis**, sentiment analysis lessicale e model-based, clustering e **analisi di reti di co-occorrenza**. Il repository include anche script di validazione cross-platform per confrontare gli output dei metodi e verificare la stabilita strutturale tra implementazioni.

L'obiettivo centrale e la robustezza metodologica: verificare quali risultati restano consistenti quando cambiano metodi, famiglie di modelli e componenti specifiche della lingua. In questo senso, il progetto non e una generica demo NLP, ma una pipeline di ricerca riproducibile progettata per la validazione quantitativa di conclusioni di text analytics.
