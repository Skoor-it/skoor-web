// The built pages are up to date with src/, both languages have the same texts, and nothing is
// left unfilled.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { outputs, LANGS, PAGES } from '../build.mjs';

const ROOT = new URL('../', import.meta.url);

test('the built pages are up to date (run npm run build after changing src/)', () => {
  for (const f of outputs()) {
    assert.ok(existsSync(new URL(f.path, ROOT)), `${f.path} is missing`);
    assert.equal(readFileSync(new URL(f.path, ROOT), 'utf8'), f.html, `${f.path} is out of date`);
  }
});

test('every text exists in English and Dutch, with the same placeholders', () => {
  const { en, nl } = LANGS;
  assert.deepEqual(Object.keys(nl).sort(), Object.keys(en).sort());
  const holes = (s) => JSON.stringify(s).match(/\{\w+\}/g)?.sort() ?? [];
  for (const k of Object.keys(en)) assert.deepEqual(holes(nl[k]), holes(en[k]), k);
});

test('no unfilled holes, every page links its other language and its files exist', () => {
  for (const f of outputs().filter((o) => o.path.endsWith('.html'))) {
    assert.doesNotMatch(f.html, /\{\{|\[\[/, f.path);
    assert.match(f.html, /hreflang="(en|nl)"/, f.path);
    const base = new URL(f.path, ROOT);
    for (const [, ref] of f.html.matchAll(/(?:src|href)="(?!https?:|#|mailto:)([^"]+)"/g)) {
      const target = new URL(ref.split('#')[0] || '.', base);
      const file = target.pathname.endsWith('/') ? new URL('index.html', target) : target;
      assert.ok(existsSync(file), `${f.path} links to ${ref}, which doesn't exist`);
    }
  }
});

test('UK English: no US spellings in the English texts', () => {
  const text = JSON.stringify(LANGS.en);
  for (const us of ['color', 'center', 'canceled', 'organize', 'favorite', 'practice your']) assert.ok(!text.includes(us), us);
});

test('the sitemap lists every page that may be found, in both languages; robots.txt points to it', () => {
  const files = Object.fromEntries(outputs().map((f) => [f.path, f.html]));
  for (const p of PAGES) {
    for (const base of ['', 'nl/']) {
      const url = `<loc>https://skoor.it/${base}${p.out}</loc>`;
      if (p.index === false) assert.ok(!files['sitemap.xml'].includes(url), `${base}${p.out} should not be in the sitemap`);
      else assert.ok(files['sitemap.xml'].includes(url), `${base}${p.out} is missing from the sitemap`);
    }
  }
  assert.match(files['robots.txt'], /^Sitemap: https:\/\/skoor\.it\/sitemap\.xml$/m);
});
