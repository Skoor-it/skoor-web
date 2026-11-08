// "Your sport. Its rules." (board 58): the sports Skoor has, from the server (skoor-app,
// functions/sports.js), so a sport added to the app shows here without changing the website. The
// page is built with the same list, so it is right before the server answers, or when it can't.

// Only icons from Skoor's own server; anything else is left out.
const ICON = /^https:\/\/api\.skoor\.it\/siteSports\/[a-z]{2,20}\.svg$/;

// The server's answer as plain cards ({ id, name, icon }), in its order; null when it isn't a
// usable list (then the page keeps the sports it was built with).
export function sportCards(answer, lang = 'en') {
  const list = Array.isArray(answer?.sports) ? answer.sports : null;
  if (!list?.length) return null;
  const cards = list
    .filter((s) => typeof s?.id === 'string' && /^[a-z]{2,20}$/.test(s.id) && ICON.test(s.icon ?? ''))
    .map((s) => {
      const name = s.name?.[lang] ?? s.name?.en;
      return { id: s.id, name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 40) : s.id, icon: s.icon };
    });
  return cards.length ? cards : null;
}
