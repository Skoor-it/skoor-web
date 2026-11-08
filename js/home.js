// The home page (board 58): the scoreboard to try, the live numbers, the mailing list, and the
// court at night behind the top.
import { DEMO_URL, MAILING_URL, NUMBERS_URL, SPORTS_URL } from './config.js';
import { sportCards } from './sports.js';
import { sceneOfThisVisit } from './scenes.js';
import { lang, number, t, validEmail } from './text.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- the real app in the phone ----------
// app.skoor.it in demo mode, loaded only once the phone comes into view (it is the whole app).
function appInPhone() {
  const frame = $('[data-app-frame]');
  if (!frame) return;
  const load = () => { if (!frame.src) frame.src = `${DEMO_URL}&sport=${sceneOfThisVisit()}`; }; // the background's sport
  if (!('IntersectionObserver' in window)) { load(); return; }
  const seen = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { load(); seen.disconnect(); }
  }, { rootMargin: '200px' });
  seen.observe(frame);
}

// ---------- the sports (skoor-app, functions/sports.js) ----------
// The page is built with the sports Skoor had then. The server's list puts them in its order with
// its names, and adds sports that came later; those draw their icon from the server.
async function sportList() {
  const box = $('[data-sports]');
  if (!box) return;
  try {
    const r = await fetch(SPORTS_URL, { headers: { accept: 'application/json' } });
    if (!r.ok) return;
    const cards = sportCards(await r.json(), lang());
    if (!cards) return;
    const built = new Map($$('[data-sport]', box).map((el) => [el.dataset.sport, el]));
    const wish = $('.sport-wish', box);
    for (const c of cards) {
      let el = built.get(c.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'sport';
        el.dataset.sport = c.id;
        el.innerHTML = '<span class="sport-icon"><span class="sport-img" aria-hidden="true"></span></span><span class="sport-words"><span class="sport-name"></span></span>';
        $('.sport-img', el).style.setProperty('--icon', `url("${c.icon}")`);
      }
      $('.sport-name', el).textContent = c.name;
      box.insertBefore(el, wish);
      built.delete(c.id);
    }
    built.forEach((el) => el.remove()); // a sport the server no longer has
  } catch {
    // No answer: the sports the page was built with stay.
  }
}

// ---------- the live numbers (skoor-app, functions/site.js) ----------
async function liveNumbers() {
  try {
    const r = await fetch(NUMBERS_URL, { headers: { accept: 'application/json' } });
    if (!r.ok) return;
    const n = await r.json();
    for (const key of ['liveNow', 'players', 'games', 'points']) {
      if (Number.isFinite(n[key])) $$(`[data-num="${key}"]`).forEach((el) => { el.textContent = number(n[key]); });
    }
  } catch {
    // No numbers: the dashes stay.
  }
}

// ---------- the mailing list ----------
function mailingList() {
  const form = $('[data-news]');
  if (!form) return;
  const email = $('#nl-email', form);
  const send = $('[data-news-send]', form);
  const why = $('[data-news-why]', form);
  const state = { topics: new Set(['news']), lang: lang(), sending: false, error: false };
  const show = () => {
    $$('[data-topic]', form).forEach((b) => b.setAttribute('aria-pressed', String(state.topics.has(b.dataset.topic))));
    const ok = validEmail(email.value);
    const reason = !MAILING_URL ? t('js.news.soon') : !ok ? t('js.news.typeEmail') : !state.topics.size ? t('js.news.pickTopic')
      : state.sending ? t('js.news.sending') : state.error ? t('js.news.failed') : t('js.news.ready');
    send.disabled = !MAILING_URL || !ok || !state.topics.size || state.sending;
    why.textContent = reason;
  };
  $$('[data-topic]', form).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.topic;
    if (state.topics.has(k)) state.topics.delete(k); else state.topics.add(k);
    show();
  }));
  // The emails' language: a drop-down that starts on the language of the page.
  const pickLang = $('[data-mail-lang]', form);
  pickLang.value = state.lang;
  pickLang.addEventListener('change', () => { state.lang = pickLang.value; show(); });
  email.addEventListener('input', () => { state.error = false; show(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (send.disabled) return;
    state.sending = true; state.error = false; show();
    try {
      const r = await fetch(MAILING_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim(), topics: [...state.topics], lang: state.lang, website: form.elements.website.value }),
      });
      if (!r.ok) throw new Error(String(r.status));
      $('[data-news-sent-text]', form).innerHTML = t('js.news.sentText');
      $('[data-email]', form).textContent = email.value.trim();
      $('[data-news-ask]', form).hidden = true;
      $('[data-news-sent]', form).hidden = false;
    } catch {
      state.error = true;
    }
    state.sending = false; show();
  });
  $('[data-news-again]', form).addEventListener('click', () => {
    email.value = '';
    $('[data-news-ask]', form).hidden = false;
    $('[data-news-sent]', form).hidden = true;
    show();
    email.focus();
  });
  show();
}

// ---------- the court at night ----------
// A random sport each visit; ?court=tennis shows one sport.
async function court() {
  const canvas = $('[data-court]');
  if (!canvas) return;
  const { startCourt } = await import('./court.js');
  const id = sceneOfThisVisit();
  $('[data-scene]').textContent = t(`js.court.${id}`);
  startCourt(canvas, id);
}

appInPhone();
mailingList();
liveNumbers();
sportList();
// The court comes after the page has been drawn: three.js is the biggest file of the site.
const drawCourt = () => court().catch(() => {}); // without it, the black background stays
if (document.readyState === 'complete') drawCourt(); else addEventListener('load', drawCourt, { once: true });
