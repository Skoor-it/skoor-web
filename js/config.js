// Addresses and switches for the website. Used by the pages in the browser and by build.mjs.
// A store link that is still null shows its button disabled, with "Coming soon".

// The Skoor app ("Open Skoor", "Start a game", "Open in your browser").
export const APP_URL = 'https://badminton-dev-bc258.web.app/';

// The Skoor servers (skoor-app, functions/).
const FUNCTIONS = 'https://europe-west1-badminton-dev-bc258.cloudfunctions.net';
export const WISH_URL = `${FUNCTIONS}/sportWish`;
export const NUMBERS_URL = `${FUNCTIONS}/siteNumbers`;

// The mailing list server (not built yet: the provider is still to be chosen). While null, the
// "Keep me posted" and "Email me" buttons are disabled and say the list opens soon.
export const MAILING_URL = null;

// The stores, once the apps are in them.
export const STORES = {
  appStore: null,
  googlePlay: null,
  garmin: null,
  wearOs: null,
};

// The stores' rating, once there are reviews: { rating: '4.8', reviews: 120 }. While null, the
// rating tile is left out.
export const RATING = null;
