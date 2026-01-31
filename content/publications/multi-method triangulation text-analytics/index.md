---
title: "A Multi-Method Validation Framework for Large-Scale Multilingual Text Analytics"
authors:
- me
- "Domenica Fioredistella Iezzi"
date: "2026-01-15" 
doi: ""

# Schedule page publish date (NOT publication's date).
publishDate: "2025-02-01T00:00:00Z"

# Publication type.
# 3 = Preprint / Working Paper
publication_types: Working Paper

# Publication name.
publication: "Methodological Working Paper (Draft)"
publication_short: "Working Paper"

abstract: "When can researchers trust their text analytics results? Despite the proliferation of computational methods, from classical lexicometric approaches to transformer-based deep learning, the field lacks systematic criteria for distinguishing genuine findings from methodological artifacts.
This paper addresses this gap by proposing a validation framework centered on the concept of method-invariant patterns: findings that emerge consistently across analyt-
ically independent approaches, operationalized as patterns where between-method variance remains below 5% of total variance.
The framework integrates two complementary validation levels. Intra-method validation quantifies reproducibility under data perturbations through K-fold cross-validation (stability coefficients: 0.991 to 0.997) and Procrustes analysis (configuration similarity: 0.969 to 0.991). Inter-method validation assesses convergence across eighteen techniques spanning four analytical dimensions: semantic structures (LDA, LSA, NMF, neural embeddings), sentiment polarity (lexicon-based and transformer approaches), document partitions (five clustering algorithms), and relational patterns (co-occurrence networks, Correspondence Analysis).
We validate this framework on 999,152 multilingual reviews across five languages, representing one of the largest systematic multi-method comparisons in text analytics. The central finding is methodologically consequential: robust patterns emerge consistently regardless of analytical approach. Variance decomposition reveals that substantive content (rating valence) accounts for 95.4% of total variance, while methodological choice explains less than 3%. Cross-platform replication (Python versus R; Pearson r = 0.932) further confirms that validated patterns
transcend implementation differences.
The framework also provides guidance for method selection. While BERT achieves highest accuracy (91.3%), classical approaches such as SVM (89.1%) and Logistic Regression (88.7%) offer comparable performance at substantially lower computational cost (29-fold reduction in inference time). These findings demonstrate that multi-method validation offers researchers principled, operational criteria for identifying trustworthy results and making informed methodological decisions.."

# Summary.
summary: "A methodological framework validating 18 analytical approaches (BERT, LDA, GNN) on 1M+ texts to ensure cross-platform stability."

tags:
- NLP
- Methodology
- BERT
- Graph Neural Networks
- Deep Learning
- Triangulation

# Display this page in the Featured widget?
featured: true

# Custom links.
links:
- name: Co-Author (Prof. Iezzi)
  url: https://phd.uniroma2.it/web/DOMENICA-FIOREDISTELLA-IEZZI_nC4200_EN.aspx
- name: Code
  url: https://github.com/stefanoblando/nlp-semantic-network

url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: 'project/nlp-semantic-network/' # <-- ORA QUESTO ATTIVA IL BOTTONE "PROJECT"
url_slides: ''
url_source: ''
url_video: ''

# Featured image
image:
  caption: 'Methodological Triangulation'
  focal_point: ""
  preview_only: false

# Associated Projects.
# Questo serve per mostrare la scheda del progetto in fondo alla pagina
projects:
- nlp-semantic-network
---
