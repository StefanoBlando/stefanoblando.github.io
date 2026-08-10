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
      username: me
      eyebrow: Stefano Blando | AI Researcher and PhD Candidate
      headline: Understanding complex systems through *adaptive intelligence.*
      summary: My research lies at the intersection of artificial intelligence, agent-based modeling, and economics. I develop adaptive simulations, statistical verification methods, and practical tools for studying complex economic systems.
      primary:
        text: Explore my work
        url: '#work'
      secondary:
        text: Download CV
        url: /uploads/resume.pdf
      portrait_alt: Portrait of Stefano Blando
      social_label: Social profiles

  - block: research-pillars
    content:
      eyebrow: Research profile
      title: Four connected research pillars
      text: My work combines adaptive agents, statistical verification, robust quantitative methods, and large-scale text analysis to study complex economic and social systems, from simulation design to empirical validation.
      expand_label: Expand details & projects
      projects_label: Relevant Projects
      items:
        - name: Adaptive Multi-Agent Systems
          description: I study populations of learning, heuristic, and deliberative agents interacting over evolving economic networks, studying how local adaptation shapes aggregate dynamics.
          detailed_text: In this research line, I model economic systems as dynamic, decentralized networks of heterogeneous decision-makers. Rather than assuming hyper-rational global equilibrium, agents operate with bounded rationality, local interactions, and adaptive strategies (such as multi-agent reinforcement learning or heuristic decision rules). By combining network science and agent-based modeling, I analyze how micro-level adaptation gives rise to macroeconomic phenomena, market liquidity shifts, and emergent systemic patterns.
          topics: [Multi-Agent Systems, Reinforcement Learning, Graph Neural Networks]
          projects:
            - risk-sentinel
            - multi-agent-orchestration
            - real-estate-ai-agent
        - name: Statistical Verification
          description: I use convergence diagnostics and statistical model checking to make simulation evidence more reliable and reproducible.
          detailed_text: Agent-based models and complex stochastic simulations generate massive execution traces that are notoriously challenging to validate formally. My work applies Statistical Model Checking (SMC), hypothesis testing, and rigorous statistical convergence diagnostics to verify complex simulation outcomes against temporal logic specifications. This bridge between formal methods and agent-based economics establishes quantifiable confidence intervals for policy interventions and stress-test scenarios.
          topics: [Statistical Model Checking, Agent-Based Modeling, Reproducibility]
          projects:
            - island-model-smc
        - name: Robust Quantitative Methods
          description: I apply econometrics, robust statistics, and graph learning to systemic risk and financial decision problems.
          detailed_text: To address instability and structural shocks in economic infrastructure, I integrate robust econometrics, extreme value theory, and graph neural networks. This approach enables early detection of financial contagion vectors, stress propagation in interbank market networks, and energy network vulnerability forecasting. The goal is to build quantitative decision-support frameworks that remain resilient under heavy-tailed distributions and structural market regime shifts.
          topics: [Econometrics, Systemic Risk, Economic Networks]
          projects:
            - robust-portfolio-optimization
            - network-crash-prediction
            - gas-network-risk-forecasting
        - name: Text as Data & Semantic Networks
          description: I study large multilingual corpora as networks of meaning, and test whether the patterns they reveal survive a change of method.
          detailed_text: Quantitative text analysis faces the same validity problem as simulation, since it is rarely clear whether a finding reflects the data or the technique used to extract it. Working with Prof. Domenica Fioredistella Iezzi at the University of Rome Tor Vergata, I address this by measuring method-invariance directly. Across 999,152 multilingual reviews analysed with 18 independent techniques, from classical clustering to Transformer models, substantive content accounted for 95.4% of the variance while methodological choice explained less than 3%. The same work showed that classical approaches such as SVM reach 89.1% accuracy against BERT's 91.3%, at a 29-fold lower computational cost. This line applies the verification logic of my simulation work to language data, treating semantic structure as something to be measured rather than asserted.
          topics: [NLP, Semantic Networks, Method Validation]
          projects:
            - nlp-semantic-network-analysis

  - block: featured-projects
    content:
      eyebrow: Selected work
      title: Research translated into technology
      text: Three projects that connect research questions with working simulations, interfaces, and agentic systems.
      slugs:
        - risk-sentinel
        - island-model-smc
        - multi-agent-orchestration
      view_project: View project
      view_all: Explore all projects

  - block: featured-publications
    content:
      eyebrow: Research output
      title: Selected publications
      text: Peer-reviewed papers, conference proceedings, and working papers in computational economics, agent-based modeling, and quantitative finance.
      view_all: Explore all publications
      view_pdf: PDF
      view_entry: Details

  - block: resume-experience
    content:
      title: Experience & Education
      username: me
    design:
      date_format: 'January 2006'
      is_education_first: true

  - block: collaborators-network
    content:
      eyebrow: Research Network
      title: Collaborators & Co-authors
      text: Academic collaborators, co-authors, and lab members across research institutions.


  - block: featured-news
    content:
      eyebrow: Latest updates
      title: News & Recognition
      text: Recent announcements, conference acceptances, awards, and presentation recaps.
      view_all: Explore all news
      read_more: Read article

  - block: portfolio-contact
    content:
      eyebrow: Contact
      title: Let us discuss research, systems, or collaboration.
      text: I am based in Pisa and open to academic and technical collaborations in artificial intelligence, economic networks, and complex systems.
      email: stefano.blando@santannapisa.it
      links:
        - label: GitHub
          url: https://github.com/stefano-blando
        - label: LinkedIn
          url: https://www.linkedin.com/in/stefano-blando/
        - label: Google Scholar
          url: https://scholar.google.com/citations?user=dNbRRG0AAAAJ
---
