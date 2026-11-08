// The home page (board 58): the scoreboard to try, the live numbers, the mailing list, and the
// court at night behind the top.
import { MAILING_URL, NUMBERS_URL } from './config.js';
import { digits, over, point, start, undo } from './score.js';
import { lang, number, t, validEmail } from './text.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- the scoreboard to try ----------
function tryScoreboard() {
  const box = $('[data-try]');
  if (!box) return;
  let s = start();
  const hints = [t('js.hint1'), t('js.hint2'), t('js.hint3')];
  const show = (said) => {
    const won = over(s);
    $('[data-playing]', box).hidden = won;
    $('[data-won]', box).hidden = !won;
    [s.a, s.b].forEach((n, side) => {
      const serving = s.server === side;
      $(`[data-tiles="${side}"]`, box).querySelectorAll('.tile').forEach((tile, i) => {
        tile.textContent = digits(n)[i];
        tile.classList.toggle('tile-on', serving);
      });
      $(`[data-name="${side}"]`, box).classList.toggle('serving', serving);
    });
    $('[data-hint]', box).textContent = hints[(s.a + s.b) % 3];
    $('[data-undo]', box).disabled = !s.history.length;
    if (said) $('[data-said]', box).textContent = t('js.scoreSaid', { a: s.a, b: s.b });
    if (won) {
      $('[data-winner]', box).textContent = s.a > s.b ? t('js.youWin') : t('js.theyWin');
      $('[data-final]', box).textContent = `${Math.max(s.a, s.b)}–${Math.min(s.a, s.b)}`;
      $('[data-reset]', box).focus();
    }
  };
  $$('[data-point]', box).forEach((b) => b.addEventListener('click', () => { s = point(s, Number(b.dataset.point)); show(true); }));
  $('[data-undo]', box).addEventListener('click', () => { s = undo(s); show(true); });
  $('[data-reset]', box).addEventListener('click', () => { s = start(); show(false); $('[data-point="0"]', box).focus(); });
  show(false);
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
  const { SCENES, startCourt } = await import('./court.js');
  const asked = new URLSearchParams(location.search).get('court');
  const id = SCENES.includes(asked) ? asked : SCENES[Math.floor(Math.random() * SCENES.length)];
  $('[data-scene]').textContent = t(`js.court.${id}`);
  startCourt(canvas, id);
}

tryScoreboard();
mailingList();
liveNumbers();
// The court comes after the page has been drawn: three.js is the biggest file of the site.
const drawCourt = () => court().catch(() => {}); // without it, the black background stays
if (document.readyState === 'complete') drawCourt(); else addEventListener('load', drawCourt, { once: true });
