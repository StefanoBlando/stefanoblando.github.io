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

  # 2. RESEARCH OVERVIEW (Dettagliata e strutturata)
  - block: markdown
    content:
      title: '📚 Research Overview'
      subtitle: ''
      text: |
        My research agenda addresses the **validation gap** in complex socio-economic systems. By integrating **Economic Theory** with **Data-Driven AI**, I aim to overcome the limitations of static equilibrium models and map uncertainty in non-ergodic environments.
        
        Current work focuses on three methodological pillars:
        
        * **Simulation & Inference:** Developing pipelines for **Automated Parameter Calibration** of Agent-Based Models (ABM) using **Simulation-Based Inference (SBI)** and ABC methods.
        * **Systemic Risk & Topology:** Leveraging **Graph Neural Networks (GNNs)** and Deep Learning to analyze financial network topologies and predict systemic distress.
        * **Scalable Computing:** Utilizing **High-Performance Computing (HPC)** to perform rigorous Statistical Model Checking and Ensemble Analysis on high-dimensional systems.
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
