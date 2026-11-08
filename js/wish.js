// "Your sport isn't here?" (board 62): a wish for a sport goes to the Skoor server
// (skoor-app, functions/sportwish.js), which fixes typos and puts names of one sport together.
// Next to it, the most wished sports of the last 30 days (functions/site.js).
import { MAILING_URL, NUMBERS_URL, WISH_URL } from './config.js';
import { deviceId, esc, lang, t, validEmail } from './text.js';

const $ = (sel, root = document) => root.querySelector(sel);

// What the server's answer means for the page (plain data, so it can be tested).
export function outcome(status, json, typed) {
  const label = json?.label?.[lang()] ?? json?.label?.en ?? typed;
  if (json?.counted || json?.reason === 'again') {
    return {
      done: true, label, known: Boolean(json.supported),
      typed: json.counted ? t('js.wish.typed', { typed: esc(typed), label: esc(label) }) : t('js.wish.again', { label: esc(label) }),
    };
  }
  const reason = { invalid: 'js.wish.invalid', limit: 'js.wish.limit', busy: 'js.wish.busy' }[json?.reason] ?? 'js.wish.failed';
  return { done: false, error: t(reason) };
}

function wishForm() {
  const form = $('[data-wish]');
  const done = $('[data-wish-done]');
  if (!form || !done) return;
  const input = $('#sport', form);
  const send = $('[data-wish-send]', form);
  const why = $('[data-wish-why]', form);
  let sending = false;
  let error = '';
  const show = () => {
    const ready = input.value.trim().length >= 2;
    send.disabled = !ready || sending;
    why.textContent = sending ? t('js.wish.sending') : error || (ready ? t('js.wish.ready') : t('js.wish.typeFirst'));
  };
  input.addEventListener('input', () => { error = ''; show(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (send.disabled) return;
    const typed = input.value.trim();
    sending = true; error = ''; show();
    let result;
    try {
      const r = await fetch(WISH_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sport: typed, device: deviceId(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
          lang: lang(), source: 'web', website: form.elements.website.value,
        }),
      });
      result = outcome(r.status, await r.json().catch(() => null), typed);
    } catch {
      result = { done: false, error: t('js.wish.failed') };
    }
    sending = false;
    if (!result.done) { error = result.error; show(); return; }
    $('[data-wish-typed]', done).innerHTML = result.typed;
    $('[data-wish-note]', done).textContent = result.known ? t('js.wish.known') : t('js.wish.next');
    done.querySelectorAll('[data-label]').forEach((el) => { el.textContent = result.label; });
    $('[data-wish-mail]', done).hidden = result.known;
    $('[data-wish-mail-done]', done).hidden = true;
    form.hidden = true;
    done.hidden = false;
    $('[data-wish-title]', done).focus?.();
    mailShow();
  });
  $('[data-wish-again]', done).addEventListener('click', () => {
    input.value = '';
    form.hidden = false;
    done.hidden = true;
    show();
    input.focus();
  });

  // "Email me when it's added": needs the mailing list server; until then the button is off.
  const mail = $('[data-wish-mail]', done);
  const mailInput = $('#notify', mail);
  const mailSend = $('[data-wish-mail-send]', mail);
  const mailWhy = $('[data-wish-mail-why]', mail);
  const mailShow = () => {
    const ok = validEmail(mailInput.value);
    mailSend.disabled = !MAILING_URL || !ok;
    mailWhy.textContent = !MAILING_URL ? t('js.wish.mailSoon') : ok ? '' : t('js.wish.mailType');
    mailWhy.hidden = !mailWhy.textContent;
  };
  mailInput.addEventListener('input', mailShow);
  mail.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (mailSend.disabled) return;
    try {
      const r = await fetch(MAILING_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: mailInput.value.trim(), topics: ['sports'], sport: $('[data-label]', done).textContent, lang: lang() }),
      });
      if (!r.ok) throw new Error(String(r.status));
      mail.hidden = true;
      const ok = $('[data-wish-mail-done]', done);
      ok.textContent = t('js.wish.mailDone');
      ok.hidden = false;
    } catch {
      mailWhy.textContent = t('js.news.failed');
      mailWhy.hidden = false;
    }
  });
  show();
}

async function mostWished() {
  const list = $('[data-wish-top]');
  if (!list) return;
  const say = (text) => { list.innerHTML = `<li class="empty">${esc(text)}</li>`; };
  try {
    const r = await fetch(NUMBERS_URL, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(String(r.status));
    const wishes = (await r.json()).wishes ?? [];
    if (!wishes.length) { say(t('js.wish.none')); return; }
    const most = Math.max(...wishes.map((w) => w.count));
    list.innerHTML = wishes.map((w) => `<li>
  <span class="bar-top"><b>${esc(w.label?.[lang()] ?? w.label?.en ?? w.key)}</b><span>${esc(t('js.wish.count', { n: w.count }))}</span></span>
  <span class="bar"><span style="width: ${Math.max(4, Math.round((w.count / most) * 100))}%"></span></span></li>`).join('');
  } catch {
    say(t('js.wish.topFailed'));
  }
}

wishForm();
mostWished();
