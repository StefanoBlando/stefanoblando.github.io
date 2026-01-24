---
title: Lightweight Fine-Tuning with PEFT & LoRA
date: 2024-11-20
summary: A high-efficiency NLP pipeline adapting DistilBERT for Sentiment Analysis. By utilizing LoRA, it achieves 84% accuracy on the SST-2 dataset while training less than 1% of the model parameters.
tags:
  - Generative AI
  - NLP
  - PEFT / LoRA
  - Hugging Face
  - Model Optimization
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/StefanoBlando/peft-model-finetuning
---

This project implements a complete **Parameter-Efficient Fine-Tuning (PEFT)** pipeline for sequence classification. It addresses the computational bottleneck of adapting Large Language Models (LLMs) by utilizing **LoRA (Low-Rank Adaptation)** to fine-tune `distilbert-base-uncased` on the SST-2 sentiment analysis dataset.

**Methodological Approach:**
* **LoRA Architecture:** Injects trainable low-rank decomposition matrices (Rank=16, Alpha=32) into the `q_lin` and `v_lin` attention modules.
* **Frozen Backbone:** Keeps the pre-trained DistilBERT weights frozen, drastically reducing memory footprint during backpropagation.
* **Targeted Adaptation:** Focuses exclusively on attention mechanisms to capture sentiment patterns without altering the model's core knowledge.

**Key Results:**
* **Performance:** Increased accuracy from **43.1%** (zero-shot baseline) to **84.2%** (fine-tuned), with F1-scores exceeding 0.82.
* **Extreme Efficiency:** Trained only **~295,000 parameters** out of ~124 Million (**0.23%** of the total model).
* **Resource Optimization:** Achieved state-of-the-art results with minimal VRAM usage, enabling training on consumer-grade GPUs.

**Technical Implementation:**
Developed in **Python** using the **Hugging Face ecosystem** (`transformers`, `peft`, `datasets`). The pipeline includes modular scripts for zero-shot evaluation, LoRA configuration, training loop optimization, and rigorous inference testing.
