---
title: TIM Recommender System (Next Best Action)
date: 2025-06-20
summary: A predictive recommender engine utilizing Learning-to-Rank, Bayesian Optimization, and Advanced Ensembles to maximize marketing campaign effectiveness (NDCG@5 +36%).
tags:
  - Recommender Systems
  - Machine Learning
  - LightGBM
  - XGBoost
  - Ensemble Learning
  - Python
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/stefanoblando/advanced-recommender-system
image:
  caption: 'System Architecture'
  focal_point: Smart
---

This project was developed as part of the **CESMA Master's program** at the University of Rome "Tor Vergata" in collaboration with **TIM**. The goal was to build a predictive engine capable of suggesting the most relevant "Next Best Action" to customers, thereby maximizing the effectiveness of marketing campaigns.

The solution employs a robust machine learning pipeline moving beyond simple classification to a **Learning-to-Rank (LTR)** framework.

### 🚀 Key Technical Highlights

* **Modular Architecture:** Code organized into distinct modules (`src/`) for data loading, feature engineering, and modeling to ensure reproducibility.
* **Advanced Validation:** Implemented **Group K-Fold Cross-Validation** to prevent data leakage and ensure realistic performance assessment on unseen users.
* **Hyperparameter Tuning:** Utilized **Bayesian Optimization** with pruning to efficiently find optimal model configurations.
* **Ensemble Strategy:** Achieved top performance by combining LightGBM and XGBoost predictions using **Learned Blending** and **Ranking-Aware** weighting strategies.

### 📊 Performance Results

The project successfully demonstrated a significant improvement over the baseline model using the **NDCG@5** metric.

| Stage | NDCG@5 Score | Improvement vs Baseline |
| :--- | :--- | :--- |
| **Baseline Model** | 0.5030 | -- |
| **Best Single Model** | 0.6838 | +35.94% |
| **Best Ensemble** | **0.6852** | **+36.23%** |

This structured approach delivers a robust and validated solution ready for production environments.
