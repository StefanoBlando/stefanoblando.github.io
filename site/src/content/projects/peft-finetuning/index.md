---
title: Lightweight Fine-Tuning with PEFT & LoRA
date: '2024-11-20'
summary: >-
  Parameter-efficient fine-tuning pipeline using LoRA to adapt DistilBERT for sentiment analysis
  while training less than 1% of the model parameters.
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

This project focuses on a practical question in NLP: how much useful adaptation can you obtain from a pretrained model without paying the full cost of fine-tuning everything?

Using **LoRA** on `distilbert-base-uncased` for sentiment analysis, the pipeline shows that a very small trainable subset of parameters can still deliver a strong performance jump over the zero-shot baseline. That makes the project less about squeezing out maximum benchmark accuracy and more about understanding the trade-off between performance and efficiency.

Built with the **Hugging Face** ecosystem, the implementation covers evaluation, LoRA configuration, training, and inference in a lightweight setup that remains accessible on modest hardware.
