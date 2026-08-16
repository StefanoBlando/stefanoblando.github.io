/**
 * Turns the author data file into the shape the Experience page reads.
 *
 * `data/authors/me.yaml` is written for Hugo: the summaries are markdown
 * fragments, hard wrapped, mixing "Label: value" lines with "* " bullets. A
 * template cannot lay that out — it can only print it — so the reflow happens
 * here, where it is a pure function with a test beside it.
 *
 * Nothing is invented: every field on the way out is a field on the way in.
 */

/** A line ends a sentence if it ends in terminal punctuation, closing quote allowed. */
const FINISHED = /[.!?]["')\]]?$/;

/** "Final Grade", "Erasmus+ Exchange" — a short capitalised label, then a colon. */
const FACT = /^([A-Z][A-Za-z+ ]{0,22}):\s+(.+)$/;

/**
 * Rejoins hard-wrapped prose. A line that follows an unfinished sentence and
 * does not start a bullet is the tail of the line above, not a new statement.
 */
export function unwrap(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const out = [];
  for (const line of lines) {
    const previous = out[out.length - 1];
    if (previous && !line.startsWith('* ') && !FINISHED.test(previous)) {
      out[out.length - 1] = `${previous} ${line}`;
    } else {
      out.push(line);
    }
  }
  return out;
}

/**
 * Full stops that are part of a word, not the end of a sentence. Titles are
 * the ones that actually occur here — "Supervisor: Prof. Alessio Farcomeni"
 * was being cut down to "Prof" — the rest are cheap insurance.
 */
const ABBREVIATIONS = new Set([
  'Prof', 'Dr', 'Mr', 'Mrs', 'Ms', 'St', 'Univ', 'Dept', 'Inc', 'Ltd',
  'vs', 'etc', 'al', 'cf', 'eg', 'ie', 'No', 'Fig', 'Eq', 'approx',
]);

/**
 * Index just past the first sentence, ignoring full stops inside quotation
 * marks — thesis titles end in one and would otherwise split in half — and
 * those that close an abbreviation or an initial.
 */
export function firstSentenceEnd(text) {
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') quoted = !quoted;
    if (quoted || char !== '.') continue;
    if (!/^\s+[A-Z]/.test(text.slice(i + 1))) continue;

    // "U.S.", "A. Smith": a one-letter token before the stop is an initial.
    const word = text.slice(0, i).split(/[\s(]/).pop();
    if (word.length <= 1 || ABBREVIATIONS.has(word)) continue;

    return i + 1;
  }
  return text.length;
}

/**
 * Splits a summary into the three things it is made of: labelled facts a grid
 * can hold, prose, and bullets. A fact keeps only its first sentence; whatever
 * follows it on the line was a second statement that happened to share a line.
 */
export function parseSummary(text) {
  const facts = [];
  const notes = [];
  const bullets = [];

  for (const line of unwrap(text)) {
    if (line.startsWith('* ')) {
      bullets.push(line.slice(2).trim());
      continue;
    }

    const match = line.match(FACT);
    if (!match) {
      notes.push(line);
      continue;
    }

    const [, label, remainder] = match;
    const cut = firstSentenceEnd(remainder);
    facts.push({ label, value: remainder.slice(0, cut).trim().replace(/\.$/, '') });
    const rest = remainder.slice(cut).trim();
    if (rest) notes.push(rest);
  }

  return { facts, notes, bullets };
}

/** `2025-11-01`, a YAML timestamp, or a bare year — all of them as a year. */
export function year(value) {
  if (!value) return '';
  if (value instanceof Date) return String(value.getUTCFullYear());
  return String(value).slice(0, 4);
}

/** Hugo's `---` em-dash convention, which no longer passes through a renderer. */
const dashes = (text) => String(text ?? '').replace(/\s*---\s*/g, ' — ');

const span = (entry) => ({
  from: year(entry.start),
  to: entry.end ? year(entry.end) : 'present',
  current: !entry.end,
});

/**
 * The whole résumé, in reading order. Source order is preserved throughout:
 * the author file is already newest first, and re-sorting it here would be a
 * second opinion about a thing the file already states.
 */
export function buildResume(author) {
  const education = (author.education ?? []).map((entry) => ({
    degree: entry.degree,
    institution: entry.institution,
    ...span(entry),
    ...parseSummary(entry.summary),
  }));

  const experience = (author.experience ?? []).map((entry) => ({
    role: entry.role,
    org: entry.org,
    url: entry.company_url ?? '',
    location: entry.location ?? '',
    ...span(entry),
    ...parseSummary(entry.summary),
  }));

  const awards = (author.awards ?? []).map((entry) => ({
    title: dashes(entry.title),
    awarder: dashes(entry.awarder),
    year: year(entry.date),
    summary: unwrap(entry.summary).join(' '),
    url: entry.url ?? '',
  }));

  const skills = (author.skills ?? []).map((group) => ({
    name: group.name,
    items: (group.items ?? []).map((item) => ({ label: item.label, level: item.level ?? 0 })),
  }));

  const languages = (author.languages ?? []).map((entry) => ({
    name: entry.name,
    label: entry.label,
    level: entry.level ?? 0,
  }));

  // The page states the span it covers before it states anything else, and the
  // earliest thing on it is the earliest degree.
  const starts = [...education, ...experience].map((entry) => entry.from).filter(Boolean);

  return {
    role: author.role ?? '',
    orcid: author.orcid ?? '',
    since: starts.length ? starts.sort()[0] : '',
    education,
    experience,
    awards,
    skills,
    languages,
  };
}
