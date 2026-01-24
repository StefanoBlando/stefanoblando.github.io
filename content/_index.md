---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  spacing: '6rem'

sections:
  # 1. BIOGRAFIA
  - block: resume-biography-3
    content:
      username: me
      text: ''
      button:
        text: Download CV
        url: uploads/resume.pdf
    design:
      background:
        gradient_mesh:
          enable: true
      name:
        size: lg
      avatar:
        size: large
        shape: circle

# 2. RESEARCH OVERVIEW
  - block: markdown
    content:
      title: '📚 Research Overview'
      subtitle: ''
      text: |
        My research addresses the **validation gap** in complex economic models. By fusing **Economic Theory** with **Simulation-Based Inference (SBI)**, I aim to ground theoretical models in empirical reality, moving beyond static equilibrium to map the dynamics of non-ergodic systems.

        ### Core Research Pillars:

        * **Generative Modeling & Calibration:** Developing automated pipelines to calibrate Agent-Based Models (ABM) against real-world data using Neural Density Estimators and SBI.
        * **Network Topology & Risk:** Leveraging **Graph Neural Networks (GNNs)** to detect early warning signals of systemic distress and analyze the evolving topology of financial markets.
        * **Computational Robustness:** Performing rigorous **Statistical Model Checking** and Ensemble Analysis (via HPC) to quantify uncertainty and ensure model resilience against structural shocks.
    design:
      columns: '1'
  # 3. NEWS
  - block: collection
    id: news
    content:
      title: Latest News
      subtitle: ''
      text: ''
      filters:
        folders:
          - blog
        exclude_featured: false
    design:
      view: date_title_summary
      columns: 2

  # 4. PUBBLICAZIONI
  - block: collection
    id: papers
    content:
      title: Publications
      filters:
        folders:
          - publications
        featured_only: false
    design:
      view: citation
      columns: 1
---
