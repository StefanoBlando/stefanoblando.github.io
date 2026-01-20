---
title: TIM Recommender System
date: 2025-06-16
summary: A predictive recommender engine utilizing Learning-to-Rank, Bayesian Optimization, and Advanced Ensembles to maximize marketing campaign effectiveness.
tags:
  - Recommender Systems
  - Machine Learning
  - LightGBM
  - XGBoost
  - Ensemble Learning
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/stefanoblando/tim-recommender-system
---

Development of a predictive **recommender system** for TIM (Telecom Italia) designed to optimize marketing campaigns by suggesting the "Next Best Action" for customers. Developed as part of the CESMA Master's program, the solution employs a **Learning-to-Rank (LTR)** approach, moving beyond simple classification to accurately rank user preferences.

**Technical Stack:**
* **Algorithms:** LightGBM, XGBoost, and Advanced Ensemble methods (Stacking, Blending, Ranking-Aware).
* **Optimization:** Bayesian Optimization with pruning for efficient hyperparameter tuning.
* **Evaluation:** Group K-Fold Cross-Validation ensuring strict data separation; validated via **NDCG@5** metric.
* **Performance:** Achieved a **+36.23%** improvement over the baseline model (NDCG score 0.68 vs 0.50).
