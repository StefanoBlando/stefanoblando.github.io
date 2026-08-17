---
title: Advanced Recommender System
date: '2025-06-20'
summary: >-
  Learning-to-rank recommender system for next-best-action prediction, combining Bayesian
  optimization and ensemble ranking to improve NDCG@5 by 36%.
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

This project was developed within the **CESMA Master's program** in collaboration with **TIM**. Instead of framing the problem as a standard classification task, the system was designed as a **learning-to-rank** pipeline for next-best-action recommendation.

That shift in framing matters because ranking is closer to the actual business decision: not just whether an action is good or bad, but which action should come first for a given user.

The pipeline combines careful validation, Bayesian optimization, and ensemble ranking strategies. The end result is a substantial improvement over baseline performance on **NDCG@5**, making the project a solid example of applied machine learning under realistic evaluation constraints.

Performance summary:

| Stage | NDCG@5 Score | Improvement vs Baseline |
| :--- | :--- | :--- |
| **Baseline Model** | 0.5030 | -- |
| **Best Single Model** | 0.6838 | +35.94% |
| **Best Ensemble** | **0.6852** | **+36.23%** |

Overall, it is one of the clearest examples in the portfolio of taking a familiar ML task and reformulating it in a way that is better aligned with the actual decision problem.
