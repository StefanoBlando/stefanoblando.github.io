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
  # Questo blocco prende la foto e i social dal file dati (che modificheremo dopo)
  - block: resume-biography-3
    content:
      username: me  # IMPORTANTE: Corrisponde al nome della tua foto (me.png)
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

  # 2. LA TUA RICERCA (Sostituisce il testo di DeepMind)
  - block: markdown
    content:
      title: '📚 Research Overview'
      subtitle: ''
      text: |-
        My research focuses on **Dynamic Economic Networks**, using **Agent-Based Modeling (ABM)** and **Reinforcement Learning** to simulate financial markets and map uncertainty.

        I am a PhD Candidate in **Artificial Intelligence** within the National PhD Program (SSSA & UniPi). I aim to move beyond static network models to capture how individual strategies create emergent collective behaviors that reshape economic systems over time.
    design:
      columns: '1'

  # 3. PUBBLICAZIONI (Mostra la lista pulita dei paper)
  - block: collection
    id: papers
    content:
      title: Publications
      filters:
        folders:
          - publications
        featured_only: false # Metti 'false' per mostrare tutto quello che caricherai
    design:
      view: citation # Visualizza come lista bibliografica classica
      columns: 1
---
