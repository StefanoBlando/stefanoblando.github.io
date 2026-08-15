---
title: Fine-Tuning Leggero con PEFT e LoRA
date: '2024-11-20'
summary: >-
  Pipeline di fine-tuning parameter-efficient che usa LoRA per adattare DistilBERT alla sentiment
  analysis allenando meno dell'1% dei parametri del modello.
tags:
  - Side Quest
  - Generative AI
  - NLP
  - PEFT / LoRA
  - Hugging Face
  - Model Optimization
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/peft-model-finetuning
---

Questo progetto si concentra su una domanda pratica in NLP: quanta adattazione utile si puo ottenere da un modello pretrained senza pagare il costo completo del fine-tuning totale?

Usando **LoRA** su `distilbert-base-uncased` per sentiment analysis, la pipeline mostra che un sottoinsieme molto piccolo di parametri allenabili puo comunque produrre un netto salto di performance rispetto alla baseline zero-shot. Il progetto riguarda quindi meno la massima benchmark accuracy e piu la comprensione del trade-off tra performance ed efficienza.

Costruita nell'ecosistema **Hugging Face**, l'implementazione copre valutazione, configurazione LoRA, training e inferenza in un setup leggero che resta accessibile anche su hardware modesto.
