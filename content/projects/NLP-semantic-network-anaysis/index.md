---
title: NLP & Semantic Network Analysis
date: 2026-01-10
summary: A hybrid text mining framework combining Correspondence Analysis and Network Science to decode latent semantic structures in unstructured corpora.
tags:
  - Text Mining
  - Network Science
  - Correspondence Analysis
  - Clustering
  - R
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/stefanoblando/sentiment-semantic-lexicometric-network-analysis # Aggiorna se necessario
---

Development of a comprehensive methodology for **extracting knowledge from unstructured text** by bridging statistical analysis with network science. Applied to a case study of *The Adventures of Sherlock Holmes*, this project transforms raw textual data into navigable semantic maps.

**Technical Stack:**
* **Text Representation:** Vector Space Model utilizing **TF-IDF** weighting to capture term importance and filter stop-words.
* **Dimensionality Reduction:** Applied **Correspondence Analysis (CA)** to identify associations between terms and documents in a lower-dimensional factor map.
* **Clustering & Network Analysis:** Utilized **K-Means** for semantic grouping and the **Louvain algorithm** for detecting modular communities within the keyword co-occurrence network.
* **Visualization:** Integration with **Gephi** and R libraries (factoextra, igraph) to visualize the topological structure of semantic relationships.
