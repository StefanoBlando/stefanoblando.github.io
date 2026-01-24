---
title: AI Photo Editor with SAM & SDXL
date: 2024-03-10
summary: An advanced image editing pipeline combining Meta's Segment Anything Model (SAM) for precise segmentation with Stable Diffusion XL for photorealistic inpainting.
tags:
  - Computer Vision
  - Generative AI
  - Stable Diffusion
  - SAM
  - Gradio
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/StefanoBlando/ai-photo-editor
---

This project implements a state-of-the-art **AI Photo Editing Pipeline** that allows users to seamlessly transform images by selecting objects and generating new backgrounds or subjects. It bridges the gap between precise computer vision and generative AI by integrating **Meta's Segment Anything Model (SAM)** with **Stable Diffusion XL (SDXL)**.

**Methodological Approach:**
* **Precision Segmentation:** Utilizes SAM (ViT-Base checkpoint) to generate zero-shot segmentation masks from simple user prompts (points or bounding boxes), isolating specific objects with pixel-perfect accuracy.
* **Generative Inpainting:** Leverages the **Stable Diffusion XL 1.0** inpainting pipeline to generate high-resolution, photorealistic content within the masked areas, ensuring consistent lighting and texture with the original image.
* **Iterative Refinement:** Enables a multi-pass workflow where users can perform segmentation and inpainting in sequence to progressively refine the composition.

**Key Features:**
* **Interactive Web Interface:** Built with **Gradio**, offering a user-friendly canvas for point-based selection and real-time visualization of masks and edits.
* **Dual Editing Modes:**
    * **Background Replacement:** Keeps the subject intact while generating entirely new environments (e.g., placing a car on Mars).
    * **Subject Replacement:** Uses inverted masks to swap out specific objects while preserving the original background.
* **Performance Optimization:** Implements **mixed-precision inference (FP16)**, model CPU offloading, and VAE slicing to run large foundational models efficiently on consumer-grade GPUs (8GB+ VRAM).

**Technical Implementation:**
Developed in **Python** using the **Hugging Face Diffusers** library and **PyTorch**. The system features a modular architecture with dedicated processors for segmentation and inpainting, robust memory management for GPU resources, and comprehensive configuration via YAML files.
