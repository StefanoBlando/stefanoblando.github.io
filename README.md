# 🎓 Stefano Blando | Research Portfolio

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fstefano-blando.github.io&label=Live%20Site&style=for-the-badge&color=2ea44f)](https://stefano-blando.github.io)
[![Astro](https://img.shields.io/badge/Built%20with-Astro-blueviolet?style=for-the-badge&logo=astro)](https://astro.build/)

Source code for my personal academic website and research portfolio.

## 👨‍🔬 About Me

I am a **PhD Candidate in Artificial Intelligence** at the **Scuola Superiore Sant'Anna** and the **University of Pisa**.

My research integrates **Computational Economics**, **Network Science**, and **Advanced Statistics** to model and validate complex financial systems. I adopt a multi-disciplinary approach to bridge the gap between economic theory and data-driven AI.

### 🧰 Methodological Toolkit

My general expertise covers the full pipeline of modeling and analysis:

* **Complex Systems & Simulation:** Agent-Based Modeling (ABM), Stochastic Simulations, and Complex Network Theory.
* **Machine & Deep Learning:** Graph Neural Networks (GNNs), Deep Learning architectures, and Reinforcement Learning.
* **Advanced Statistics:** High-Dimensional Statistics, Markov Chain Monte Carlo (MCMC), and Statistical Model Checking (SMC).

### 🔭 Current Research Focus

Currently, I am focused on the **rigorous validation of Complex Dynamical Stochastic Systems**, moving beyond standard equilibrium analysis. My work specifically employs:

* **Simulation-Based Inference (SBI) & ABC:** For the automated parameter calibration of black-box simulation models without tractable likelihoods.
* **Ensemble Analysis:** To characterize **non-ergodic** behaviors and map uncertainty where time averages differ from ensemble averages.
* **Functional Data Analysis (FDA):** Applied to the study of **Statistical Transients** and trajectory clustering in high-dimensional systems.

## 🛠️ Built With

* **Framework:** [Astro](https://astro.build/) — static output, English and Italian
* **Search:** [Pagefind](https://pagefind.app/), one index per language
* **Homepage:** a `three.js` particle cloud, [Lenis](https://lenis.darkroom.engineering/) for the scroll
* **Hosting:** GitHub Pages, deployed from `main` by `.github/workflows/deploy.yml`

## 💻 Running it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # the generators, the dictionary, the citation data
npm run build    # generators → astro build → Pagefind index, into dist/
```

`npm run universe` regenerates the files under `src/data/` that the pages read;
`npm run build` runs it for you. `src/data/authors/me.yaml` and `me-it.yaml` are
the source for the experience page.

## 📁 What is where

| | |
|---|---|
| `src/content/` | the writing — projects, publications, posts, pillars |
| `src/pages/` | the routes; `[...locale]` renders each one in both languages |
| `src/engine/` | the homepage particle cloud and its shapes |
| `scripts/` | the generators that turn content and author files into `src/data/` |
| `public/` | images, fonts and the files served as-is |
| `docs/` | the design specs, including the record of what was built and why |

## 🗄️ The previous site

This portfolio was a Hugo (Hugo Blox) site until August 2026. That version is
kept intact on the **`hugo-legacy`** branch — it is no longer built or deployed,
and editing it changes nothing that a visitor sees.

## 🔗 Links

* **Website:** [stefano-blando.github.io](https://stefano-blando.github.io)
* **GitHub:** [@stefano-blando](https://github.com/stefano-blando)
* **Institution:** [Scuola Superiore Sant'Anna](https://www.santannapisa.it/)

---
© 2026 Stefano Blando. All rights reserved.
