// The sports the court behind the top of the home page can show (court.js draws them), and the one
// for this visit: ?court=rugby, else a random one. The phone next to it plays the same sport
// (the app in demo mode), so background and score always match.
export const SCENES = ['badminton', 'padel', 'tennis', 'tabletennis', 'squash', 'pickleball', 'beachvolleyball', 'volleyball', 'basketball', 'handball', 'rugby', 'football'];

let chosen = null;
export function sceneOfThisVisit() {
  if (!chosen) {
    const asked = new URLSearchParams(location.search).get('court');
    chosen = SCENES.includes(asked) ? asked : SCENES[Math.floor(Math.random() * SCENES.length)];
  }
  return chosen;
}
