---
title: "Archivio Templates & Esempi"
date: 2026-01-23
summary: "Cartella di backup per esempi di layout. Non visibile sul sito pubblico."

# Questo blocco è magico: applica queste regole a TUTTI i file dentro questa cartella
cascade:
  
  # 1. Impedisce la pubblicazione sul sito finale
  # (Se vuoi vederli in locale mentre lavori, usa il comando 'hugo server -D')
  draft: true 

  # 2. Impedisce ai motori di ricerca di indicizzarli (doppia sicurezza)
  robots: noindex, nofollow

  # 3. Li nasconde dai feed RSS e dalle sitemap
  _build:
    list: false
    render: false

type: book # Opzionale: li tiene ordinati come un libro se li apri
---

Questa cartella contiene i template originali di Hugo Blox (post, slide, progetti).
I file qui dentro **non vengono pubblicati** sul sito web online.

Servono solo come archivio per fare copia-incolla della struttura quando serve creare una nuova pagina.
