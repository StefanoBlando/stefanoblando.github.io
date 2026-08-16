/**
 * Every string the interface says, in both languages.
 *
 * One file rather than a translation per template: the two languages have to
 * be verifiably complete, and a missing key is only visible when they sit next
 * to each other. `tests/i18n.test.mjs` fails the build if a key exists in one
 * language and not the other.
 *
 * Content — posts, projects, papers — is *not* here. That lives beside the
 * English original as `index.it.md` and is loaded by its own collection.
 */

export const LANGS = ['en', 'it'];
export const DEFAULT_LANG = 'en';

/** `/projects/` in English, `/it/projects/` in Italian. */
export function localise(path, lang) {
  return lang === DEFAULT_LANG ? path : `/${lang}${path}`;
}

/** The other language's version of the page you are on. */
export function otherLang(lang) {
  return lang === 'en' ? 'it' : 'en';
}

export const UI = {
  en: {
    'lang.name': 'English',
    'lang.switch': 'Italiano',
    'lang.switchLabel': 'Leggi in italiano',

    'nav.research': 'Research',
    'nav.projects': 'Projects',
    'nav.publications': 'Publications',
    'nav.experience': 'Experience',
    'nav.network': 'Network',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.search': 'Search',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.skip': 'Skip to content',

    'home.title': 'Stefano Blando — AI Researcher & PhD Candidate',
    'home.description':
      "PhD candidate at Scuola Superiore Sant'Anna. Adaptive multi-agent systems, statistical verification, robust quantitative methods, and language models for economic and financial systems.",
    'home.role': 'AI Researcher & PhD Candidate',
    'home.lede':
      'Adaptive multi-agent systems, statistical verification, and robust quantitative methods for economic and financial systems.',
    'home.scroll': 'Scroll to travel',
    'home.contact': 'Contact',
    'home.profiles': 'Profiles',
    'home.start': 'Start',

    'station.research': 'Four connected pillars',
    'station.projects': 'Research, built',
    'station.publications': 'Papers and proceedings',
    'station.experience': 'The academic path',
    'station.network': 'Co-authors and collaborators',
    'station.news': 'Recent updates',

    'research.title': 'Research — Stefano Blando',
    'research.description':
      'Four research pillars: adaptive multi-agent systems, statistical verification, robust quantitative methods, and text analytics.',
    'research.heading': 'Research',
    'research.lede':
      'Four connected pillars, from simulation design through to empirical validation. Each gathers the papers and the software built around one line of questions.',
    'research.publications': 'publications',
    'research.projects': 'projects',
    'research.back': '← All research',
    'research.related': 'Related work',

    'projects.title': 'Projects — Stefano Blando',
    'projects.description':
      'Simulations, interfaces and agentic systems built around the research questions.',
    'projects.count': 'projects',
    'projects.headingA': 'Research,',
    'projects.headingB': 'built',
    'projects.lede':
      'Simulations, interfaces and agentic systems built around the research questions — some from the work itself, some from hackathons, some from curiosity.',
    'projects.back': '← All projects',

    'publications.title': 'Publications — Stefano Blando',
    'publications.description':
      'Peer-reviewed papers, conference proceedings, and working papers in computational economics, agent-based modeling, and quantitative finance.',
    'publications.count': 'publications',
    'publications.headingA': 'Papers and',
    'publications.headingB': 'proceedings',
    'publications.lede':
      'Peer-reviewed papers, conference proceedings and working papers in computational economics, agent-based modeling and quantitative finance.',
    'publications.back': '← All publications',
    'publications.abstract': 'Abstract',
    'publications.cite': 'Cite this',
    'publications.citeGenerated': 'generated from arXiv',
    'publications.copy': 'Copy BibTeX',
    'publications.copied': 'Copied',

    'blog.title': 'News — Stefano Blando',
    'blog.description': 'Talks, papers, awards and workshops.',
    'blog.count': 'posts',
    'blog.headingA': 'Talks, papers,',
    'blog.headingB': 'awards',
    'blog.lede':
      'What the work has been doing lately: conferences, accepted papers, prizes and the workshops behind them.',
    'blog.back': '← All news',

    'experience.title': 'Experience — Stefano Blando',
    'experience.description':
      'Academic path, professional experience, awards and grants, methods and languages.',
    'experience.headingA': 'Experience &',
    'experience.headingB': 'education',
    'experience.lede':
      "PhD in Artificial Intelligence at Scuola Superiore Sant'Anna and the University of Pisa, after statistics, finance and philosophy at Tor Vergata and La Sapienza. What follows is the whole record: degrees, roles, the awards and grants behind the work, and the methods it is done with.",
    'experience.cv': 'Download CV (PDF)',
    'experience.education': 'Education',
    'experience.experience': 'Experience',
    'experience.awards': 'Awards & grants',
    'experience.skills': 'Methods & tools',
    'experience.languages': 'Languages',
    'experience.collaboration': 'Collaboration',
    'experience.coauthors': 'co-authors',
    'experience.institutions': 'institutions',
    'experience.explore': 'Explore the network →',
    'experience.present': 'present',
    'experience.outOf': 'out of 5',

    'network.eyebrow': 'Research Network',
    'network.heading': "Co-authors & L'EMbeDS Lab Network",
    'network.intro':
      'A radial view of the people the work is done with: co-authors, PhD supervisors, lab colleagues, and the topics that connect them.',
    'network.all': 'All',
    'network.faculty': 'Faculty',
    'network.postdoc': 'PostDoc & Staff',
    'network.phd': 'PhD Candidates',
    'network.searchPlaceholder': 'Search collaborator…',
    'network.searchLabel': 'Search collaborator',
    'network.pan': 'Drag sideways to explore the ring',
    'network.works': 'Co-authored works',
    'network.close': 'Close',
    'network.title': 'Research Network — Stefano Blando',
    'network.description':
      'Interactive visualization connecting co-authors, PhD supervisors, lab colleagues and research topics.',

    'search.title': 'Search — Stefano Blando',
    'search.description': 'Search the papers, projects, research pillars and news on this site.',
    'search.kicker': 'Everything on this site',
    'search.heading': 'Search',
    'search.lede': 'Papers, projects, research pillars and news — full text, including the abstracts.',
    'search.placeholder': 'Search papers, projects, news…',
    'search.noscript': 'Search needs JavaScript. Without it, the',
    'search.noscriptEnd': 'indexes list everything.',

    'notfound.title': 'Not found — Stefano Blando',
    'notfound.description':
      'That page does not exist. The research, publications, projects and news are all still here.',
    'notfound.kicker': 'Error 404',
    'notfound.headingA': 'That page is',
    'notfound.headingB': 'not here',
    'notfound.lede':
      'The address may be mistyped, or it may have belonged to the previous version of this site. Everything below is where it has always been.',
  },

  it: {
    'lang.name': 'Italiano',
    'lang.switch': 'English',
    'lang.switchLabel': 'Read in English',

    'nav.research': 'Ricerca',
    'nav.projects': 'Progetti',
    'nav.publications': 'Pubblicazioni',
    'nav.experience': 'Percorso',
    'nav.network': 'Rete',
    'nav.news': 'Notizie',
    'nav.contact': 'Contatti',
    'nav.search': 'Cerca',
    'nav.menu': 'Menu',
    'nav.close': 'Chiudi',
    'nav.skip': 'Vai al contenuto',

    'home.title': 'Stefano Blando — Ricercatore in IA e dottorando',
    'home.description':
      "Dottorando alla Scuola Superiore Sant'Anna. Sistemi multi-agente adattivi, verifica statistica, metodi quantitativi robusti e modelli linguistici per i sistemi economici e finanziari.",
    'home.role': 'Ricercatore in IA e dottorando',
    'home.lede':
      'Sistemi multi-agente adattivi, verifica statistica e metodi quantitativi robusti per i sistemi economici e finanziari.',
    'home.scroll': 'Scorri per viaggiare',
    'home.contact': 'Contatti',
    'home.profiles': 'Profili',
    'home.start': 'Inizio',

    'station.research': 'Quattro pilastri connessi',
    'station.projects': 'La ricerca, costruita',
    'station.publications': 'Articoli e atti di convegno',
    'station.experience': 'Il percorso accademico',
    'station.network': 'Coautori e collaboratori',
    'station.news': 'Aggiornamenti recenti',

    'research.title': 'Ricerca — Stefano Blando',
    'research.description':
      'Quattro pilastri di ricerca: sistemi multi-agente adattivi, verifica statistica, metodi quantitativi robusti e analisi testuale.',
    'research.heading': 'Ricerca',
    'research.lede':
      'Quattro pilastri connessi, dal disegno della simulazione fino alla validazione empirica. Ognuno raccoglie gli articoli e il software costruiti attorno a una linea di domande.',
    'research.publications': 'pubblicazioni',
    'research.projects': 'progetti',
    'research.back': '← Tutta la ricerca',
    'research.related': 'Lavori collegati',

    'projects.title': 'Progetti — Stefano Blando',
    'projects.description':
      'Simulazioni, interfacce e sistemi agentici costruiti attorno alle domande di ricerca.',
    'projects.count': 'progetti',
    'projects.headingA': 'La ricerca,',
    'projects.headingB': 'costruita',
    'projects.lede':
      'Simulazioni, interfacce e sistemi agentici costruiti attorno alle domande di ricerca — alcuni nati dal lavoro stesso, altri da hackathon, altri dalla curiosità.',
    'projects.back': '← Tutti i progetti',

    'publications.title': 'Pubblicazioni — Stefano Blando',
    'publications.description':
      'Articoli sottoposti a revisione paritaria, atti di convegno e working paper in economia computazionale, modellazione ad agenti e finanza quantitativa.',
    'publications.count': 'pubblicazioni',
    'publications.headingA': 'Articoli e',
    'publications.headingB': 'atti di convegno',
    'publications.lede':
      'Articoli sottoposti a revisione paritaria, atti di convegno e working paper in economia computazionale, modellazione ad agenti e finanza quantitativa.',
    'publications.back': '← Tutte le pubblicazioni',
    'publications.abstract': 'Abstract',
    'publications.cite': 'Cita',
    'publications.citeGenerated': 'generata da arXiv',
    'publications.copy': 'Copia BibTeX',
    'publications.copied': 'Copiato',

    'blog.title': 'Notizie — Stefano Blando',
    'blog.description': 'Interventi, articoli, premi e workshop.',
    'blog.count': 'notizie',
    'blog.headingA': 'Interventi, articoli,',
    'blog.headingB': 'premi',
    'blog.lede':
      'Che cosa sta facendo il lavoro in questo periodo: convegni, articoli accettati, premi e i workshop che ci stanno dietro.',
    'blog.back': '← Tutte le notizie',

    'experience.title': 'Percorso — Stefano Blando',
    'experience.description':
      'Percorso accademico, esperienza professionale, premi e finanziamenti, metodi e lingue.',
    'experience.headingA': 'Percorso &',
    'experience.headingB': 'formazione',
    'experience.lede':
      "Dottorato in Intelligenza Artificiale alla Scuola Superiore Sant'Anna e all'Università di Pisa, dopo statistica, finanza e filosofia a Tor Vergata e alla Sapienza. Qui c'è tutto il percorso: titoli, ruoli, i premi e i finanziamenti dietro al lavoro, e i metodi con cui è fatto.",
    'experience.cv': 'Scarica il CV (PDF)',
    'experience.education': 'Formazione',
    'experience.experience': 'Esperienza',
    'experience.awards': 'Premi e finanziamenti',
    'experience.skills': 'Metodi e strumenti',
    'experience.languages': 'Lingue',
    'experience.collaboration': 'Collaborazioni',
    'experience.coauthors': 'coautori',
    'experience.institutions': 'istituzioni',
    'experience.explore': 'Esplora la rete →',
    'experience.present': 'oggi',
    'experience.outOf': 'su 5',

    'network.eyebrow': 'Rete di ricerca',
    'network.heading': "Coautori e rete del laboratorio L'EMbeDS",
    'network.intro':
      'Una vista radiale delle persone con cui il lavoro è fatto: coautori, supervisori di dottorato, colleghi di laboratorio e i temi che li collegano.',
    'network.all': 'Tutti',
    'network.faculty': 'Docenti',
    'network.postdoc': 'PostDoc e staff',
    'network.phd': 'Dottorandi',
    'network.searchPlaceholder': 'Cerca un collaboratore…',
    'network.searchLabel': 'Cerca un collaboratore',
    'network.pan': 'Trascina di lato per esplorare l’anello',
    'network.works': 'Lavori in coautoraggio',
    'network.close': 'Chiudi',
    'network.title': 'Rete di ricerca — Stefano Blando',
    'network.description':
      'Visualizzazione interattiva che collega coautori, supervisori di dottorato, colleghi di laboratorio e temi di ricerca.',

    'search.title': 'Cerca — Stefano Blando',
    'search.description': 'Cerca fra gli articoli, i progetti, i pilastri di ricerca e le notizie.',
    'search.kicker': 'Tutto quello che c’è qui',
    'search.heading': 'Cerca',
    'search.lede':
      'Articoli, progetti, pilastri di ricerca e notizie — testo completo, abstract compresi.',
    'search.placeholder': 'Cerca articoli, progetti, notizie…',
    'search.noscript': 'La ricerca ha bisogno di JavaScript. Senza, gli indici di',
    'search.noscriptEnd': 'elencano comunque tutto.',

    'notfound.title': 'Pagina non trovata — Stefano Blando',
    'notfound.description':
      'Questa pagina non esiste. La ricerca, le pubblicazioni, i progetti e le notizie sono tutti ancora qui.',
    'notfound.kicker': 'Errore 404',
    'notfound.headingA': 'Questa pagina',
    'notfound.headingB': 'non è qui',
    'notfound.lede':
      'L’indirizzo può essere sbagliato, oppure apparteneva alla versione precedente di questo sito. Tutto quello che segue è dove è sempre stato.',
  },
};

/** `t('nav.research')` for the given language. */
export function useTranslations(lang) {
  const dictionary = UI[lang] ?? UI[DEFAULT_LANG];
  return function t(key) {
    const value = dictionary[key];
    // A missing string is a bug, not a blank: say which one, loudly, at build.
    if (value === undefined) throw new Error(`missing translation: ${lang}.${key}`);
    return value;
  };
}
