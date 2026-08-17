---
title: Custom Chatbot with RAG
date: '2024-02-15'
summary: >-
  Retrieval-augmented chatbot that combines semantic search, custom embeddings, and LLM prompting
  for grounded domain-specific conversations.
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

This project uses a deliberately small but structured domain to explore a larger idea: how to make language-model outputs more reliable by grounding them in retrieved context.

The chatbot is built around a curated dataset of fictional characters and uses a full **RAG** pipeline with embeddings, retrieval, and prompt conditioning. The dataset is playful, but the methodological point is serious: retrieval changes the behavior of the model from generic completion to context-bounded reasoning.

Because the underlying data is semantically rich, the system can handle not only question answering but also character comparison, recommendation, and trait-based exploration. That makes it a useful compact example of retrieval-driven NLP design.
