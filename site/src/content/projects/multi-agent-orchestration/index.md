---
title: Multi-Agent Orchestration
date: '2026-03-18'
summary: >-
  Event-driven multi-agent coordination system for auction-based procurement, inventory allocation,
  and real-time fulfillment under demand uncertainty.
tags:
  - Multi-Agent Systems
  - Event-Driven Systems
  - Auctions
  - Inventory Systems
  - Economic Coordination
  - MCP
  - Python
  - Hackathon
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/multi-agent-orchestration
  - icon: hero/play-circle
    name: Runtime Explorer
    url: /multi-agent-orchestration-app/
---

This project can be read as a system for **real-time economic coordination** under changing phases, partial information, and hard timing constraints.

The system is structured as an **event-driven multi-agent orchestration layer**. It listens to the game through SSE events, keeps a runtime representation of the environment, and switches strategy depending on the current phase of play: policy update, procurement auction, inventory reconciliation, and fulfillment.

What makes the project interesting is not just the use of multiple agents, but the way orchestration is tied to operational robustness. Different capability sets are activated at different stages, while local persistence, metrics, and replay analysis help make decisions more stable under noisy runtime conditions.

In practice, it is a good example of a project where agentic design had to be grounded in execution reliability rather than in generic prompting alone. The deeper pattern is **auction-based coordination with inventory constraints and demand handling**.

## Interactive Explorer

The interactive app focuses on the engineering core of the project: the live event loop, shared runtime state, stylized agent interaction, phase-specific agents, capability partitioning, bounded memory, and KPI replay.

It is intentionally presented as a **runtime architecture explorer**, not as a fake benchmark dashboard. The goal is to make the orchestration logic legible in the same visual language used for the Island Model and PFSE apps, with emphasis on coordination, auctions, and fulfillment.

**[Open Runtime Explorer](/multi-agent-orchestration-app/)**
