# skoor.it

The website of Skoor (*Play it. Skoor it.*), built from boards 58–64 of the design board
("Skoor redesign"): the home page, "Your sport isn't here?" and "You're on the list", in English
(`/`) and Dutch (`/nl/`), on phones and computers.

Plain pages, no framework. The finished pages are in the repository, so the folder is served as it
is: on **Cloudflare Pages** (project connected to this repository, branch `main`, no build command,
output directory `/`), at skoor.it and www.skoor.it. Every push to `main` is published.
In Cloudflare the project's **production branch** must be `main` (Settings → Builds → Branch control);
other branches only get preview addresses.

The app itself is at **app.skoor.it** (the `alpha/` folder of `Skoor-it/skoor-app`, published by a Cloudflare Worker).
`_redirects` sends `skoor.it/link` (the TV screens) and `skoor.it/dash` on to the app; `_headers`
lets browsers keep the fonts and three.js.

## Change something

| What | Where |
|---|---|
| Texts (English and Dutch, always both) | `src/lang/en.js`, `src/lang/nl.js` |
| The pages' layout | `src/home.html`, `src/wish.html`, `src/subscribed.html` |
| Look | `css/site.css` |
| Addresses: the app, the servers, the stores, the mailing list | `js/config.js` |
| The phone on the home page (the real app in demo mode, `DEMO_URL`), live numbers, mailing list | `js/home.js` |
| The court at night (three.js) | `js/court.js` |
| Wishing a sport | `js/wish.js` |

After changing anything in `src/` or `js/config.js`, run `npm run build`: it writes `index.html`,
`wish/`, `subscribed/` and the same under `nl/`. Then `npm test` (it also checks the built pages
are up to date). `npm start` serves the site at http://localhost:8090.

## Where the data comes from

- **Server address**: everything goes to `api.skoor.it` (a Cloudflare Worker in front of the Skoor
  server functions, see `cloudflare/api-worker.js` in `Skoor-it/skoor-app`).
- **Live numbers and "Most wished right now"**: `siteNumbers` in the Skoor app's server
  (`Skoor-it/skoor-app`, `functions/site.js`). Totals only, counted once an hour.
- **Sport wishes**: `sportWish` (`functions/sportwish.js`), the same as in the app.
- **Mailing list**: not built yet (provider still to choose: Brevo or Laposta). While
  `MAILING_URL` in `js/config.js` is `null`, the sign-up buttons are disabled and say the list opens
  soon. When the server exists it gets `POST { email, topics[], lang, website }` (and `sport` from
  the wish page) and answers 2xx after sending the confirmation mail; the confirmation link leads
  to `/subscribed/`.
- **Stores and rating**: `STORES` and `RATING` in `js/config.js`; a store without a link shows
  "Coming soon".

Fonts (Barlow Condensed, Inter) and three.js are kept here, so the site loads nothing from other
sites except the Skoor servers.
