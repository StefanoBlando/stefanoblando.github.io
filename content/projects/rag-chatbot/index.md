---
title: Custom Chatbot with RAG
date: 2024-02-15
summary: An intelligent chatbot system combining Large Language Models (LLMs) with Retrieval Augmented Generation (RAG) for domain-specific conversations about fictional characters.
tags:
  - Generative AI
  - NLP
  - RAG
  - OpenAI
  - Python
links:
  - icon: github
    icon_pack: fab
    name: Code
    url: https://github.com/StefanoBlando/custom-chatbot
---

This project demonstrates advanced natural language processing techniques by creating a specialized chatbot capable of answering questions about a curated dataset of fictional characters. It leverages **Retrieval Augmented Generation (RAG)** to combine the fluency of Large Language Models with the accuracy of a custom knowledge base.

**Methodological Approach:**
* **Retrieval Augmented Generation (RAG):** Implements a full RAG pipeline that retrieves relevant character profiles before generating responses, ensuring answers are grounded in the provided dataset rather than the model's training data.
* **Semantic Search:** Utilizes OpenAI embeddings (`text-embedding-ada-002`) to perform semantic similarity searches, allowing the system to understand the *meaning* of a query rather than just matching keywords.
* **Prompt Engineering:** Features specialized prompt templates that guide the LLM to act as an expert character analyst, enforcing consistent formatting and tone.

**Key Features:**
* **Interactive Interface:** Includes both a command-line interface and a web-based GUI (Gradio) for real-time interaction.
* **Advanced Analysis:** Goes beyond simple retrieval by automatically extracting personality traits, relationships, and occupations to enrich the character data.
* **Multi-Mode Functionality:**
    * **Question Answering:** Precise answers about specific characters.
    * **Recommendations:** Suggests characters based on desired personality traits (e.g., "heroic and bold").
    * **Comparisons:** Generates detailed comparative analyses between two characters.

**Technical Implementation:**
Built in **Python**, the system features a modular architecture separating data processing, embedding management, and retrieval logic. It incorporates robust error handling for API calls, batch processing for efficient embedding generation, and dynamic context management to stay within token limits.

**Dataset:**
The system is built on a diverse dataset of **55 fictional characters** spanning various settings (Ancient Greece, Modern USA, England) and media types (Plays, Movies, Shows), creating a rich testbed for semantic retrieval and relationship mapping.
