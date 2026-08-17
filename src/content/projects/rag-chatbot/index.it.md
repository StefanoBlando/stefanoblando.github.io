---
title: Chatbot Personalizzato con RAG
date: '2024-02-15'
summary: >-
  Chatbot retrieval-augmented che combina ricerca semantica, embedding personalizzati e prompting
  con LLM per conversazioni grounded e specifiche di dominio.
tags:
  - Side Quest
  - Generative AI
  - NLP
  - RAG
  - OpenAI
  - Python
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/custom-chatbot
---

Questo progetto usa un dominio volutamente piccolo ma strutturato per esplorare un'idea piu ampia: come rendere piu affidabili gli output dei language model ancorandoli a contesto recuperato.

Il chatbot e costruito attorno a un dataset curato di personaggi immaginari e usa una pipeline **RAG** completa con embedding, retrieval e prompt conditioning. Il dataset e giocoso, ma il punto metodologico e serio: il retrieval cambia il comportamento del modello da completamento generico a ragionamento vincolato dal contesto.

Poiche i dati sottostanti sono semanticamente ricchi, il sistema puo gestire non solo question answering ma anche confronto tra personaggi, raccomandazione ed esplorazione basata su tratti. Questo lo rende un esempio compatto ma utile di progettazione NLP guidata dal retrieval.
