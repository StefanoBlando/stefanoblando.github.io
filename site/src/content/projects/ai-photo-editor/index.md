---
title: AI Photo Editor with SAM & SDXL
date: '2024-03-10'
summary: >-
  Computer vision and generative AI pipeline combining SAM and SDXL for interactive object
  segmentation and photorealistic image editing.
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

This project explores the intersection of **precise computer vision** and **generative image editing** by combining **Segment Anything (SAM)** with **Stable Diffusion XL**.

The core idea is straightforward: segmentation provides exact control over what should be changed, while diffusion-based inpainting provides the generative flexibility to actually change it. That makes the system useful not only as a demo, but as a concrete example of how discriminative and generative models can be combined inside the same workflow.

Built in **Python** with **PyTorch**, **Diffusers**, and **Gradio**, the project supports interactive masking, object replacement, and background generation while keeping the pipeline lightweight enough to run on consumer hardware with the right optimizations.
