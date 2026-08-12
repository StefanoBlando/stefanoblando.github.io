---
title: Gas Network Risk Forecasting
date: 2024-11-01
summary: Second-place hackathon project for gas leak risk prediction using geospatial-temporal features, synthetic data augmentation, and SHAP-based interpretability.
tags:
  - Hackathon
  - Side Quest
  - Forecasting
  - Imbalanced Learning
  - Explainable AI
  - CTGAN
  - Python
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/gas-networks-risk-forecasting
---

This project was developed for the **AI Data Hackathon (Hera Group, BTO Research & Digitiamo)**, where it earned **2nd place**. The task was to detect gas leak risk in a setting dominated by imbalance, sparse events, and operational uncertainty.

The pipeline combines geospatial-temporal feature engineering with synthetic data augmentation through **CTGAN** and **TimeGAN**, then uses **SHAP** to keep the final model interpretable rather than purely predictive.

What I still like about this project is its balance between pragmatism and method: it is a hackathon project, but it already reflects an approach I use often, namely trying to make difficult prediction problems more robust without giving up explainability.
