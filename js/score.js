// The scoreboard to try on the home page: a quick badminton game to 21 (win by 2, at most 30).
// The side that wins the rally serves. Plain data, so it can be tested without a page.
export const start = () => ({ a: 0, b: 0, server: 0, history: [] });

export const over = ({ a, b }) => (Math.max(a, b) >= 21 && Math.abs(a - b) >= 2) || Math.max(a, b) >= 30;

// A point for side 0 (you) or 1 (them).
export function point(s, side) {
  if (over(s)) return s;
  return { a: s.a + (side === 0 ? 1 : 0), b: s.b + (side === 1 ? 1 : 0), server: side, history: [...s.history, s.server] };
}

// Takes the last point back: the side that served it loses it, and who served before serves again.
export function undo(s) {
  if (!s.history.length) return s;
  return {
    a: s.server === 0 ? s.a - 1 : s.a,
    b: s.server === 1 ? s.b - 1 : s.b,
    server: s.history[s.history.length - 1],
    history: s.history.slice(0, -1),
  };
}

// A score as the two digits on the tiles.
export const digits = (n) => String(n).padStart(2, '0').split('');
