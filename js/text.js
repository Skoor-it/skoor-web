// The page's texts for its script, in the page's language (put into the page by build.mjs).
let strings = null;
export const lang = () => document.documentElement.lang || 'en';

export function t(key, values = {}) {
  strings ??= JSON.parse(document.getElementById('strings')?.textContent || '{}');
  let s = strings[key] ?? key;
  if (typeof s === 'object') s = s[new Intl.PluralRules(lang()).select(values.n ?? 0)] ?? s.other;
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (k in values ? values[k] : `{${k}}`));
}

// Makes a value safe to put into a text that holds markup.
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const number = (n) => new Intl.NumberFormat(lang() === 'nl' ? 'nl-BE' : 'en-GB').format(n);

export const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(s).trim());

// A random number for this browser, kept so a sport is wished once per browser (as in the app).
export function deviceId() {
  try {
    let id = localStorage.getItem('skoor.web.device');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2);
      localStorage.setItem('skoor.web.device', id);
    }
    return id;
  } catch {
    return '';
  }
}
