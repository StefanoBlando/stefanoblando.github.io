---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  spacing: '0rem'

sections:
  - block: portfolio-hero
    content:
      username: me-it
      eyebrow: Stefano Blando | Ricercatore AI e Dottorando
      headline: Comprendere i sistemi complessi attraverso l'*intelligenza adattiva.*
      summary: La mia ricerca si colloca all'intersezione tra intelligenza artificiale, modellazione agent-based ed economia. Sviluppo simulazioni adattive, metodi di verifica statistica e strumenti applicativi per studiare sistemi economici complessi.
      primary: {text: Esplora il mio lavoro, url: '#work'}
      secondary: {text: Scarica il CV, url: /uploads/resume.pdf}
      portrait_alt: Ritratto di Stefano Blando
      social_label: Profili social
  - block: research-pillars
    content:
      eyebrow: Profilo di ricerca
      title: Quattro linee di ricerca connesse
      text: Il mio lavoro combina agenti adattivi, verifica statistica, metodi quantitativi robusti e analisi testuale su larga scala per studiare sistemi economici e sociali complessi, dal disegno delle simulazioni alla validazione empirica.
      expand_label: Approfondisci e vedi progetti
      projects_label: Progetti Correlati
      items:
        - name: Sistemi Multi-Agente Adattivi
          description: Studio popolazioni di agenti che apprendono, applicano euristiche e deliberano all'interno di reti economiche in evoluzione, osservando come l'adattamento locale plasma le dinamiche aggregate.
          detailed_text: In questa linea di ricerca, modello i sistemi economici come reti dinamiche e decentralizzate di decisori eterogenei. Superando l'ipotesi di equilibrio globale ed agenti iper-razionali, gli agenti operano con razionalità limitata, interazioni locali e strategie adattive (come il reinforcement learning multi-agente e regole euristiche). Combinando la scienza delle reti e i modelli agent-based, studio come l'adattamento a livello micro generi fenomeni macroeconomici, variazioni di liquidità e dinamiche sistemiche emergenti.
          topics: [Sistemi Multi-Agente, Reinforcement Learning, Graph Neural Networks]
          projects:
            - risk-sentinel
            - multi-agent-orchestration
            - real-estate-ai-agent
        - name: Verifica Statistica
          description: Uso diagnostica di convergenza e statistical model checking per rendere le evidenze delle simulazioni più affidabili e riproducibili.
          detailed_text: I modelli agent-based e le simulazioni stocastiche complesse generano un'immensa quantità di tracce di esecuzione che risultano notoriamente difficili da validare in modo formale. La mia ricerca applica il Statistical Model Checking (SMC), i test di ipotesi e la diagnostica di convergenza statistica per verificare i risultati delle simulazioni rispetto a specifiche di logica temporale. Questo approccio unisce i metodi formali all'economia agent-based, fornendo intervalli di confidenza quantificabili per politiche e scenari di stress testing.
          topics: [Statistical Model Checking, Agent-Based Modeling, Riproducibilità]
          projects:
            - island-model-smc
        - name: Metodi Quantitativi Robusti
          description: Applico econometria, statistica robusta e graph learning a problemi di rischio sistemico e decisioni finanziarie.
          detailed_text: Per affrontare l'instabilità e gli shock strutturali nelle infrastrutture economiche, integro econometria robusta, teoria dei valori estremi e graph neural networks. Questo approccio consente di identificare precocemente i vettori di contagio finanziario, la propagazione dello stress nei mercati interbancari e la vulnerabilità delle reti energetiche. L'obiettivo è costruire framework quantitativi di supporto alle decisioni che rimangano solidi in presenza di distribuzioni a coda pesante e cambi di regime di mercato.
          topics: [Econometria, Rischio Sistemico, Reti Economiche]
          projects:
            - robust-portfolio-optimization
            - network-crash-prediction
            - gas-network-risk-forecasting
        - name: Analisi Testuale e Modelli del Linguaggio
          description: Applico analisi testuale e modelli del linguaggio a corpora multilingui, sentiment e dinamiche narrative, e a sistemi basati su retrieval ed embedding.
          detailed_text: Applico metodi di analisi testuale e modelli del linguaggio allo studio di dati non strutturati. Il lavoro comprende l'analisi della struttura semantica di corpora multilingui, l'estrazione di sentiment e dinamiche narrative, e la costruzione di sistemi basati su retrieval, embedding costruiti su misura e adattamento parameter-efficient di modelli pre-addestrati. Uso tecniche classiche di text analytics accanto ad architetture transformer, modelli a spazio di stato e foundation model, con attenzione a verificare che i risultati dipendano dai dati e non dalla tecnica impiegata.
          topics: [NLP, Narrative Economics, Foundation Models]
          projects:
            - nlp-semantic-network-analysis
            - peft-finetuning
            - rag-chatbot
  - block: featured-projects
    content:
      eyebrow: Progetti selezionati
      title: La ricerca tradotta in tecnologia
      text: Tre progetti che collegano domande di ricerca a simulazioni, interfacce e sistemi agentici funzionanti.
      slugs:
        - risk-sentinel
        - island-model-smc
        - multi-agent-orchestration
      view_project: Vedi progetto
      view_all: Esplora tutti i progetti

  - block: featured-publications
    content:
      eyebrow: Produzione scientifica
      title: Pubblicazioni selezionate
      text: Articoli scientifici, atti di conferenze e working paper in economia computazionale, modellazione agent-based e finanza quantitativa.
      view_all: Esplora tutte le pubblicazioni
      view_pdf: PDF
      view_entry: Dettagli

  - block: resume-experience
    content:
      title: Esperienza e Formazione
      username: me-it
    design:
      date_format: 'January 2006'
      is_education_first: true

  - block: collaborators-network
    content:
      eyebrow: Rete di Ricerca
      title: Collaboratori e Co-autori
      text: Collaboratori accademici, co-autori e membri del laboratorio di ricerca.


  - block: featured-news
    content:
      eyebrow: Ultimi aggiornamenti
      title: News e Riconoscimenti
      text: Notizie recenti, accettazioni a conferenze, premi e resoconti di presentazioni.
      view_all: Esplora tutte le news
      read_more: Leggi articolo

  - block: portfolio-contact
    content:
      eyebrow: Contatti
      title: Parliamo di ricerca, sistemi o collaborazioni.
      text: Vivo a Pisa e sono disponibile per collaborazioni accademiche e tecniche su intelligenza artificiale, reti economiche e sistemi complessi.
      email: stefano.blando@santannapisa.it
      links:
        - {label: GitHub, url: 'https://github.com/stefano-blando'}
        - {label: LinkedIn, url: 'https://www.linkedin.com/in/stefano-blando/'}
        - {label: Google Scholar, url: 'https://scholar.google.com/citations?user=dNbRRG0AAAAJ'}
---
