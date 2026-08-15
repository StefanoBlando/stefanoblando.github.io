---
title: Multi-Agent Orchestration
date: '2026-03-18'
summary: >-
  Sistema di coordinamento multi-agente event-driven per procurement basato su aste, allocazione di
  inventario e fulfillment in tempo reale sotto incertezza della domanda.
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

Questo progetto puo essere letto come un sistema di **coordinamento economico in tempo reale** sotto fasi mutevoli, informazione parziale e vincoli temporali stringenti.

Il sistema e strutturato come un **livello di orchestrazione multi-agente event-driven**. Ascolta il gioco tramite eventi SSE, mantiene una rappresentazione runtime dell'ambiente e cambia strategia in base alla fase corrente: aggiornamento della policy, asta di procurement, riconciliazione dell'inventario e fulfillment.

Cio che rende interessante il progetto non e solo l'uso di piu agenti, ma il modo in cui l'orchestrazione e legata alla robustezza operativa. In fasi diverse si attivano insiemi diversi di capacita, mentre persistenza locale, metriche e replay analysis aiutano a rendere le decisioni piu stabili in condizioni runtime rumorose.

In pratica, e un buon esempio di progetto in cui il design agentico doveva poggiare sull'affidabilita esecutiva e non soltanto su prompting generico. Il pattern piu profondo e il **coordinamento basato su aste con vincoli di inventario e gestione della domanda**.

## Interactive Explorer

L'app interattiva si concentra sul nucleo ingegneristico del progetto: event loop live, stato runtime condiviso, interazione stilizzata tra agenti, agenti specifici per fase, partizionamento delle capacita, memoria limitata e replay dei KPI.

E presentata intenzionalmente come **runtime architecture explorer**, non come una falsa dashboard di benchmark. L'obiettivo e rendere leggibile la logica di orchestrazione nello stesso linguaggio visivo usato per le app Island Model e PFSE, con enfasi su coordinamento, aste e fulfillment.

**[Apri il Runtime Explorer](/multi-agent-orchestration-app/)**
