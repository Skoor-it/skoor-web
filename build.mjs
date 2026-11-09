// Builds the website's pages from src/: every page in English (/) and Dutch (/nl/), with the texts
// of src/lang/. The built pages are committed, so the site needs no build step to be served; a test
// checks they are up to date. Run: npm run build
//
// In src/*.html:
//   {{key}}           a text from src/lang/<lang>.js
//   {{@lang}}         en or nl
//   {{@root}}         the way back to the site's root folder ('', '../', '../../')
//   {{@base}}         the root of this language ('' or 'nl/' after @root)
//   {{@app}}          the Skoor app (js/config.js)
//   {{@strings}}      the texts the page's script needs (keys starting with "js.")
//   [[name args]]     a piece made here: head, langswitch, tiles, sport, icon, store, rating, court, plan, footer
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_URL, RATING, STORES } from './js/config.js';
import en from './src/lang/en.js';
import nl from './src/lang/nl.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
export const LANGS = { en, nl };
export const PAGES = [
  { src: 'home.html', out: '' },
  { src: 'wish.html', out: 'wish/' },
  { src: 'subscribed.html', out: 'subscribed/' },
  { src: 'prices.html', out: 'prices/' },
];
const SITE = 'https://skoor.it/';

const ICONS = {
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor"/></svg>',
  tick: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="#22c55e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/></g></svg>',
  globe: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19"/></g></svg>',
  phone: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/></g></svg>',
  play: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5v17l15-8.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  watch: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"/><path d="M9 5.5 9.5 2h5l.5 3.5M9 18.5l.5 3.5h5l.5-3.5M12 9.5V12l1.5 1.5"/></g></svg>',
};

// The sports' icons (28 px, in the colour of the text).
const SPORT_ICONS = {
  badminton: '<g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="round" d="M3.927 4.38c1.086-.571 2.527-.851 3.968-.158c2.053-2.963 6.157-2.963 8.21 0c1.44-.693 2.882-.413 3.968.157c.502.264.753.396.881.773c.129.378-.024.697-.33 1.336l-4.407 9.206c-.209.435-.313.653-.361.855c-.049.202-.062.76-.089 1.877C15.722 20.353 14.48 22 12 22s-3.721-1.648-3.767-3.574c-.027-1.117-.04-1.675-.089-1.877s-.152-.42-.36-.855L3.375 6.488c-.306-.64-.459-.958-.33-1.336c.128-.377.379-.509.881-.773"/><path d="M8 17h8M8 4l3 13m5-13l-3 13m-7-5c1.2 1.333 2.8 1.333 4 0c1.2 1.333 2.8 1.333 4 0c1.2 1.333 2.8 1.333 4 0"/></g>',
  padel: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5c3.9 0 6.5 2.6 6.5 6.3 0 3.4-2 5.7-4.4 6.7L13.3 21h-2.6l-.8-5.5C7.5 14.5 5.5 12.2 5.5 8.8 5.5 5.1 8.1 2.5 12 2.5Z"/><path d="M10 7h.01M14 7h.01M12 9.5h.01M10 12h.01M14 12h.01"/></g>',
  tennis: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M5.3 5.3a9.5 9.5 0 0 1 0 13.4M18.7 5.3a9.5 9.5 0 0 0 0 13.4"/></g>',
  tabletennis: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="9.5" r="7" fill="currentColor"/><path d="m14.6 14.6 5.4 5.4" stroke-width="3.4"/><circle cx="20" cy="4" r="2"/></g>',
  squash: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="15" cy="8" rx="4.6" ry="6.6" transform="rotate(45 15 8)"/><path d="m11.4 12.6-8.4 8.4M13 6.2l4.8 4.8M15.4 3.8l4.8 4.8M11.6 9.4l3 3"/><circle cx="5" cy="6" r="1.8" fill="currentColor" stroke="none"/></g>',
  pickleball: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2.5" width="11" height="13" rx="4.5"/><path d="M8.5 15.5V21"/><circle cx="18" cy="17" r="3.5"/><path d="M17 16h.01M19 18h.01"/></g>',
  beachvolleyball: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M11.1 7.1a16.55 16.55 0 0 1 10.9 4M12 12a12.6 12.6 0 0 1-8.7 5M16.8 13.6a16.55 16.55 0 0 1-9 7.5M20.7 17a12.8 12.8 0 0 0-8.7-5 13.3 13.3 0 0 1 0-10M6.3 3.8a16.55 16.55 0 0 0 1.9 11.5"/></g>',
  basketball: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5v19M5.2 5.3a12 12 0 0 1 0 13.4M18.8 5.3a12 12 0 0 0 0 13.4"/></g>',
  football: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m12 7.5 4 2.9-1.5 4.7h-5L8 10.4z"/><path d="M12 7.5V2.6M16 10.4l4.6-1.5M14.5 15.1l2.9 3.9M9.5 15.1l-2.9 3.9M8 10.4 3.4 8.9"/></g>',
  volleyball: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M11.1 7.1a16.55 16.55 0 0 1 10.9 4M12 12a12.6 12.6 0 0 1-8.7 5M16.8 13.6a16.55 16.55 0 0 1-9 7.5M20.7 17a12.8 12.8 0 0 0-8.7-5 13.3 13.3 0 0 1 0-10M6.3 3.8a16.55 16.55 0 0 0 1.9 11.5"/></g>',
  handball: '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m13 21 3.5-2-4.5-4 2-4.5"/><path d="m5 7 4 3 5 .5 4 2.5 2.5 3M4 20l5-1 1.5-2m2.507-9a2 2 0 1 0 4 0 2 2 0 1 0-4 0m-7-4.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0"/></g>',
  rugby: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><ellipse cx="12" cy="12" rx="9.5" ry="5.75" transform="rotate(-40 12 12)"/><path d="m8.5 15.5 7-7M10 12l2 2m-.5-3.5 2 2m-3-.5 2 2"/></g>',
};

export const PIECES = {
  head(c, titleKey, descKey) {
    const url = SITE + c.base + c.page.out;
    const other = SITE + (c.lang === 'en' ? 'nl/' : '') + c.page.out;
    return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.t(titleKey)}</title>
<meta name="description" content="${c.t(descKey)}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="${c.lang}" href="${url}">
<link rel="alternate" hreflang="${c.lang === 'en' ? 'nl' : 'en'}" href="${other}">
<meta property="og:title" content="${c.t(titleKey)}">
<meta property="og:description" content="${c.t(descKey)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}icons/skoor-512.png">
<link rel="icon" href="${c.root}icons/skoor-favicon.svg" type="image/svg+xml">
<link rel="icon" href="${c.root}icons/skoor-favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${c.root}icons/skoor-apple-180.png">
<link rel="preload" href="${c.root}fonts/barlow-condensed-800-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${c.root}css/site.css">`;
  },
  // EN · NL in the menu: the language shown is white, the other one a link to this page in it.
  langswitch(c) {
    const href = c.root + (c.lang === 'en' ? 'nl/' : '') + c.page.out;
    const label = c.lang === 'en' ? 'Nederlands' : 'English';
    const [a, b] = c.lang === 'en' ? ['EN', 'NL'] : ['NL', 'EN'];
    return `<a href="${href}" class="langlink" hreflang="${c.lang === 'en' ? 'nl' : 'en'}" lang="${c.lang === 'en' ? 'nl' : 'en'}" aria-label="${label}"><span class="lang-on">${a}</span>&nbsp;·&nbsp;${b}</a>`;
  },
  // Two flip tiles showing a score of two digits. Sizes: xl (the phone to try), l, m, s.
  tiles(c, size, on, digits) {
    return [...digits].map((d) => `<span class="tile tile-${size}${on === 'on' ? ' tile-on' : ''}">${d}</span>`).join('');
  },
  // Only the sport's name: how many points or minutes is chosen when a game starts, so no rule here.
  sport(c, id) {
    return `<div class="sport" data-sport="${id}"><span class="sport-icon"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">${SPORT_ICONS[id]}</svg></span><span class="sport-words"><span class="sport-name">${c.t(`sports.${id}`)}</span></span></div>`;
  },
  icon(c, name) { return ICONS[name]; },
  // A store button; one whose store isn't there yet is shown disabled, with "Coming soon".
  store(c, key, icon, smallKey, nameKey) {
    const url = STORES[key];
    const inner = `${ICONS[icon]}<span><span class="store-small">${url ? c.t(smallKey) : c.t('get.soon')}</span><b>${c.t(nameKey)}</b></span>`;
    return url ? `<a href="${url}" class="store">${inner}</a>` : `<a class="store store-off" role="link" aria-disabled="true">${inner}</a>`;
  },
  rating(c) {
    if (!RATING) return '';
    const from = c.t('nums.rating').replace('{n}', String(RATING.reviews));
    return `<div class="stat"><span class="stat-n">${RATING.rating}<span class="green star">${ICONS.star}</span></span><span class="stat-l">${from}</span></div>`;
  },
  court(c, n) { return c.t('clubs.court').replace('{n}', n); },
  // A plan on the prices page: its texts are prices.<id>…; 'free' links to the app, the others wait
  // for payments and are shown disabled, with the reason (buttons are never hidden).
  plan(c, id, items) {
    const k = (s) => c.t(`prices.${id}${s}`);
    const list = Array.from({ length: Number(items) }, (_, i) => `<li>${ICONS.tick}<span>${k(String(i + 1))}</span></li>`).join('');
    const per = k('Per') ? `<span class="plan-per">${k('Per')}</span>` : '';
    const button = id === 'free'
      ? `<a href="${APP_URL}" class="btn btn-m plan-btn">${c.t('prices.startFree')}</a><span class="why plan-why">${c.t('prices.noCard')}</span>`
      : `<button type="button" class="btn btn-m plan-btn" disabled aria-describedby="why-${id}">${c.t('prices.comingSoon')}</button><span class="why plan-why" id="why-${id}">${c.t('prices.why')}</span>`;
    return `<article class="plan" aria-labelledby="plan-${id}">
      <div class="plan-top"><h3 class="plan-name" id="plan-${id}">${k('')}</h3><span class="plan-for">${k('For')}</span></div>
      <div class="plan-price"><span class="plan-n">${k('Price')}</span>${per}</div>
      <span class="plan-note">${k('Note')}</span>
      <ul class="plan-list">${list}</ul>
      <div class="plan-foot">${button}</div>
    </article>`;
  },
  footer(c) {
    return `<footer class="foot">
  <div class="wrap foot-in">
    <span class="logo logo-s"><img src="${c.root}icons/skoor-logo.svg" alt="Skoor" width="71" height="24"></span>
    <span class="foot-slogan">${c.t('foot.slogan')}</span>
    <a href="${c.root}${c.base}#clubs" class="footlink">${c.t('foot.clubs')}</a>
    <a href="${c.root}${c.base}prices/" class="footlink">${c.t('foot.prices')}</a>
    <span class="footlink footlink-off">${c.t('foot.privacy')} <span class="soon">· ${c.t('foot.soon')}</span></span>
    <span class="footlink footlink-off">${c.t('foot.contact')} <span class="soon">· ${c.t('foot.soon')}</span></span>
    <a href="${c.root}${c.lang === 'en' ? 'nl/' : ''}${c.page.out}" class="footlink" lang="${c.lang === 'en' ? 'nl' : 'en'}">${c.t('nav.otherLang')}</a>
  </div>
</footer>`;
  },
};

// The texts in a page are HTML already (they may hold <br>, <b>); in attributes only plain text.
export function render(page, lang) {
  const texts = LANGS[lang];
  const depth = (lang === 'en' ? 0 : 1) + page.out.split('/').filter(Boolean).length;
  const c = {
    lang, page, root: '../'.repeat(depth), base: lang === 'en' ? '' : 'nl/',
    t(key) {
      if (!(key in texts)) throw new Error(`No text "${key}" in ${lang}.js (${page.src})`);
      return texts[key];
    },
  };
  let html = readFileSync(join(ROOT, 'src', page.src), 'utf8');
  html = html.replace(/\[\[(\w+)([^\]]*)\]\]/g, (_, name, args) => {
    if (!PIECES[name]) throw new Error(`No piece [[${name}]] (${page.src})`);
    return PIECES[name](c, ...args.trim().split(/\s+/).filter(Boolean));
  });
  const strings = Object.fromEntries(Object.entries(texts).filter(([k]) => k.startsWith('js.')));
  const special = {
    '@lang': lang, '@root': c.root, '@base': c.root + c.base, '@app': APP_URL,
    '@strings': JSON.stringify(strings).replace(/</g, '\\u003c'),
  };
  html = html.replace(/\{\{([@\w.]+)\}\}/g, (_, key) => (key in special ? special[key] : c.t(key)));
  return html.replace(/^<!doctype html>\n/i, (d) => `${d}<!-- Built from src/${page.src} by build.mjs: change that file and run npm run build. -->\n`);
}

export function outputs() {
  const files = [];
  for (const lang of Object.keys(LANGS)) {
    for (const page of PAGES) files.push({ path: `${lang === 'en' ? '' : 'nl/'}${page.out}index.html`, html: render(page, lang) });
  }
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const f of outputs()) {
    mkdirSync(dirname(join(ROOT, f.path)), { recursive: true });
    writeFileSync(join(ROOT, f.path), f.html);
    console.log('built', f.path);
  }
}
