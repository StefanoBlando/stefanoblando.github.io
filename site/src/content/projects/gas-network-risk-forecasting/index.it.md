---
title: Previsione del Rischio nelle Reti Gas
date: '2024-11-01'
summary: >-
  Progetto da secondo posto in hackathon per la previsione del rischio di perdite gas, usando
  feature geospaziali-temporali, data augmentation sintetica e interpretabilita basata su SHAP.
tags:
  - Hackathon
  - Side Quest
  - Forecasting
  - Imbalanced Learning
  - Explainable AI
  - CTGAN
  - Python
links:
  - icon: brands/github
    name: Code
    url: https://github.com/stefano-blando/gas-networks-risk-forecasting
---

Questo progetto e stato sviluppato per l'**AI Data Hackathon (Hera Group, BTO Research & Digitiamo)**, dove ha ottenuto il **2° posto**. Il compito era rilevare il rischio di perdite gas in un contesto dominato da forte sbilanciamento, eventi rari e incertezza operativa.

La pipeline combina feature engineering geospaziale-temporale con data augmentation sintetica tramite **CTGAN** e **TimeGAN**, e usa poi **SHAP** per mantenere il modello finale interpretabile e non soltanto predittivo.

Quello che continuo ad apprezzare di questo progetto e il suo equilibrio tra pragmatismo e metodo: e un progetto da hackathon, ma riflette gia un approccio che uso spesso, cioe rendere piu robusti problemi predittivi difficili senza rinunciare alla spiegabilita.
