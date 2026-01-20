---
title: High-Dimensional Robust Portfolio Optimization
date: 2023-06-15
summary: Development of novel robust covariance estimators (PFSE, SSRE) to maintain portfolio performance under market stress. Implemented in R with a focus on computational efficiency.
tags:
  - Quantitative Finance
  - Robust Statistics
  - R Language
  - High-Dimensional Data
  - Factor Analysis
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/StefanoBlando/robust-portfolio-optimization 
---

This project implements the research for **"High-Dimensional Robust Portfolio Optimization Under Sparse Contamination: A Factor-Analytic Approach."** It addresses the failure of traditional covariance estimation during market stress by introducing specialized robust techniques designed for high-dimensional portfolios.

**Novel Methodological Contributions:**
* **PFSE (Parallel Factor Space Estimator):** A novel approach combining robust factor dimension selection with targeted robustification in the factor space.
* **SSRE (Sequential Screening Robust Estimator):** A multi-stage approach with preliminary outlier detection followed by robust factor analysis.
* **SSRE_GLasso:** Enhanced estimation using graphical lasso regularization for better conditioning.

**Key Results:**
* **Performance:** Achieved **15-20% higher Sharpe ratios** compared to conventional robust estimators (MCD, Tyler’s M-estimator).
* **Efficiency:** Computation times reduced by **80-90%**, enabling real-time application on high-dimensional data.
* **Stability:** Reduced portfolio turnover by **30-40%**, significantly lowering transaction costs.

**Technical Implementation:**
Built entirely in **R**, utilizing parallel processing (`doParallel`) and advanced statistical packages (`robustbase`, `glasso`, `pcaPP`) to perform simulation studies, empirical analysis on S&P 500 data (2015-2025), and rigorous stress testing.
