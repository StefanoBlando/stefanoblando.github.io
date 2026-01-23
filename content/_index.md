---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  # Default section spacing
  spacing: '6rem'

sections:
  # 1. LA TUA BIOGRAFIA
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

  # 2. LA TUA RICERCA
  - block: markdown
    content:
      title: '📚 Research Overview'
      subtitle: ''
      text: |-
        My research focuses on **Dynamic Economic Networks**, using **Agent-Based Modeling (ABM)** and **Reinforcement Learning** to simulate financial markets and map uncertainty.

        I am a PhD Candidate in **Artificial Intelligence** within the National PhD Program (SSSA & UniPi). I aim to move beyond static network models to capture how individual strategies create emergent collective behaviors that reshape economic systems over time.
    design:
      columns: '1'

  # 3. NEWS & UPDATES (AGGIUNTO ORA)
  # Questo blocco legge i file dentro content/blog/ e li mostra come Notizie
  - block: collection
    id: news
    content:
      title: Latest News
      subtitle: ''
      text: ''
      filters:
        folders:
          - blog  # <--- IMPORTANTE: Legge dalla cartella fisica 'blog'
        exclude_featured: false
    design:
      view: date_title_summary # Visualizza data, titolo e riassunto (ottimo per le news)
      columns: 2

  # 4. PUBBLICAZIONI
  - block: collection
    id: papers
    content:
      title: Publications
      filters:
        folders:
          - publications # <--- Assicurati di avere la cartella content/publications
        featured_only: false
    design:
      view: citation
      columns: 1
---
