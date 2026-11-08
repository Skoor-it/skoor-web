import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digits, over, point, start, undo } from '../js/score.js';

const play = (s, sides) => sides.reduce((x, side) => point(x, side), s);

test('the side that wins the rally serves; undo gives the serve back', () => {
  let s = play(start(), [0, 1, 1]);
  assert.deepEqual([s.a, s.b, s.server], [1, 2, 1]);
  s = undo(s);
  assert.deepEqual([s.a, s.b, s.server], [1, 1, 1]);
  s = undo(undo(s));
  assert.deepEqual([s.a, s.b, s.server, s.history.length], [0, 0, 0, 0]);
  assert.deepEqual(undo(s), s, 'nothing to undo');
});

test('to 21, win by 2, at most 30; no points after the game', () => {
  assert.equal(over(play(start(), Array(21).fill(0))), true);
  const s20 = play(start(), [...Array(20).fill(0), ...Array(20).fill(1)]);
  assert.equal(over(point(s20, 0)), false, '21–20 goes on');
  assert.equal(over(point(point(s20, 0), 0)), true, '22–20 wins');
  const s29 = play(start(), [...Array(29).fill(0), ...Array(29).fill(1)]);
  const won = point(s29, 1);
  assert.equal(over(won), true, '30–29 wins');
  assert.deepEqual(point(won, 0), won, 'no point after the game');
  assert.deepEqual(digits(7), ['0', '7']);
});
