import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sportCards } from '../js/sports.js';

const icon = (id) => `https://api.skoor.it/siteSports/${id}.svg`;

test('the server\'s sports become cards, in its order and the page\'s language', () => {
  const answer = { sports: [
    { id: 'padel', name: { en: 'Padel', nl: 'Padel' }, kind: 'points', icon: icon('padel') },
    { id: 'handball', name: { en: 'Handball', nl: 'Handbal' }, kind: 'timed', icon: icon('handball') },
    { id: 'curling', name: { en: 'Curling' }, kind: 'points', icon: icon('curling') },
  ] };
  assert.deepEqual(sportCards(answer, 'nl').map((c) => c.name), ['Padel', 'Handbal', 'Curling']);
  assert.deepEqual(sportCards(answer, 'en')[1], { id: 'handball', name: 'Handball', icon: icon('handball') });
});

test('a strange answer keeps the sports the page was built with', () => {
  for (const bad of [null, {}, { sports: [] }, { sports: 'x' }, { error: 'server' }]) assert.equal(sportCards(bad), null);
  // Icons from anywhere else, and odd ids, are left out.
  const answer = { sports: [
    { id: 'tennis', name: { en: 'Tennis' }, icon: 'https://evil.example/tennis.svg' },
    { id: 'x"><img', name: { en: 'X' }, icon: icon('x') },
    { id: 'squash', name: { en: '' }, icon: icon('squash') },
  ] };
  assert.deepEqual(sportCards(answer), [{ id: 'squash', name: 'squash', icon: icon('squash') }]);
});
