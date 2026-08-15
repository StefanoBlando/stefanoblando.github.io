---
title: Editor Fotografico AI con SAM e SDXL
date: '2024-03-10'
summary: >-
  Pipeline di computer vision e generative AI che combina SAM e SDXL per segmentazione interattiva
  degli oggetti ed editing fotografico fotorealistico.
tags:
  - Side Quest
  - Computer Vision
  - Generative AI
  - Stable Diffusion
  - SAM
  - Gradio
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/ai-photo-editor
---

Questo progetto esplora l'intersezione tra **computer vision precisa** ed **editing generativo delle immagini** combinando **Segment Anything (SAM)** con **Stable Diffusion XL**.

L'idea di base e semplice: la segmentazione fornisce controllo esatto su cio che va modificato, mentre l'inpainting basato su diffusion offre la flessibilita generativa necessaria per modificarlo davvero. Questo rende il sistema utile non solo come demo, ma anche come esempio concreto di integrazione tra modelli discriminativi e generativi nello stesso workflow.

Sviluppato in **Python** con **PyTorch**, **Diffusers** e **Gradio**, il progetto supporta masking interattivo, sostituzione di oggetti e generazione dello sfondo mantenendo la pipeline abbastanza leggera da funzionare anche su hardware consumer con le giuste ottimizzazioni.
