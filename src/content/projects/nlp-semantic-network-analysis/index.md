---
title: NLP & Semantic Network Analysis
date: '2026-01-10'
summary: >-
  Technical implementation of the JADT paper pipeline, integrating multilingual preprocessing, topic
  modeling, correspondence analysis, semantic spaces, sentiment modules, and network-based
  validation across methods.
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
    url: /publications/multi-method-validation-framework/
---

This project is the technical implementation behind the publication **“A Multi-Method Validation Framework for Large-Scale Multilingual Text Analytics”** (JADT 2026, Palermo, 8–10 July 2026; Proceedings ISBN 978-88-5509-883-0). It operationalizes the full analytical workflow used in the paper, from data preparation to cross-method validation and result comparison.

The pipeline combines **R and Python** modules over a large multilingual review corpus, including: preprocessing and TF-IDF, **LDA topic modeling**, **LSA and Correspondence Analysis**, lexicon- and model-based sentiment analysis, clustering, and **co-occurrence network analysis**. The repository also includes cross-platform validation scripts to compare method outputs and check structural stability across implementations.

The central objective is methodological robustness: verifying which findings remain consistent when methods, model families, and language-specific components vary. In this sense, the project is not a generic NLP demo, but a reproducible research pipeline designed for quantitative validation of text-analytic conclusions.
