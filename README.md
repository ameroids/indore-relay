# Indore Relay

A frontend-only React + Vite app with two panels:

- **Admin Panel** — manage which 8-digit ITS numbers may access the app.
- **User Panel** — an ITS holder logs in with their number and, if authorized, sees a protected video session.

Everything runs in the browser. There is no backend, no server, and no
real database — authorization data and sessions live in `localStorage`.
This is a prototype; see **Security & limitations** below before using
it for anything that matters.

---

## Quick start

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

- User login: `http://localhost:5173/login`
- Admin login: `http://localhost:5173/admin/login`

### Default admin credentials

```
username: admin
password: IndoreRelay@2026
```

Change these in `src/config/adminConfig.js` before sharing the app with
anyone.

### Production build

```bash
npm run build
npm run preview   # serve the build locally to sanity-check it
```

The build output is a static `dist/` folder — deploy it anywhere that
serves static files, including Vercel with zero configuration (just
point it at this repo; the default Vite build command/output work
as-is).

---

## Trying the full flow

1. Go to `/admin/login`, sign in with the credentials above.
2. Click **+ Add ITS**, enter an 8-digit number (e.g. `12345678`), submit.
3. Log out of the admin panel.
4. Go to `/login`, enter that same ITS number → you land on the user
   dashboard with the video.
5. Try an ITS that was never added → you get "This ITS is not
   authorized to access Indore Relay."
6. Back in the admin panel, **Disable** that ITS → the user is
   immediately signed out of it on their next action, and a fresh
   login attempt is rejected.
7. Log in as that ITS in one browser tab, then try logging in again
   in a second tab of the *same* browser (or open dev tools and copy
   the `localStorage` over) → the second login is rejected with "This
   ITS is already logged in on another device. Log out there first."
   Logging out of the first tab frees it up again.

---

## Project structure

```
src/
  components/   reusable UI: inputs, tables, modal, video player, route guards
  pages/        one file per screen (login, dashboards, 404)
  layouts/      shared chrome (topbar) for the user and admin areas
  services/     all storage/auth logic — the only place that touches localStorage
  hooks/        React contexts for user/admin session state, theme
  utils/        validation, id generation, storage helpers
  config/       admin credentials, video id, app-wide settings
  styles/       design tokens (light/dark) and global resets
```

Storage and auth logic is deliberately kept out of components. If this
project ever gets a real backend, only `src/services/*` needs to
change — see the next section.

---

## Swapping in a real backend later

`src/services/itsService.js` exports a single `itsService` object with
async methods (`list`, `add`, `setActive`, `remove`, `findByITS`,
`attachSession`, `clearSession`, `stats`). Every page and component
calls this object — nothing reaches into `localStorage` directly.

To move to Supabase (or anything else):

1. Write a `SupabaseITSService` class with the same method names,
   backed by real database calls instead of `localStorage`.
2. Export it as `itsService` from the same file (or swap the import).
3. Do the same for `src/services/adminAuthService.js` and
   `src/services/sessionService.js`, replacing local session tokens
   with real server-issued ones (e.g. Supabase Auth + a signed
   session).

No component code needs to change for this swap — that's the point of
keeping the service layer separate.

---

## Security & limitations (please read)

This is a **frontend-only prototype**. Some of the requested behavior
— strict access control, a single active device per ITS, and hiding
the video from being reachable outside the app — can only be
approximated on the frontend. Please don't treat any of this as real
security:

- **Client-side authorization is not real authorization.** The
  "authorized ITS" list lives in the browser's `localStorage` and the
  check happens in JavaScript that runs on the user's own machine.
  Anyone comfortable with browser dev tools can read or edit that
  list, or simply flip a flag in memory, and grant themselves access.
  Real access control has to be enforced by a server that the user
  doesn't control — for example, Supabase with Row Level Security, or
  any backend that checks authorization before it releases anything
  sensitive.

- **The single-device lock is per-browser, not per-device, and not
  server-verified.** `localStorage` is not shared across different
  browsers or devices — it can't be, without a backend. The "already
  logged in elsewhere" check here works because the *same* browser's
  storage doubles as the "shared" record for the demo. Open the app
  in two different real devices and each will keep its own
  `localStorage`, so this lock will not actually stop a second device
  from logging in. Making that work for real requires a backend that
  all devices talk to (which is exactly what the service-layer split
  above is designed to make easy to add later).

- **The YouTube video can no longer be navigated to from inside the
  app, but its ID is still discoverable.** The player is built with
  the YouTube IFrame *API* rather than a plain embed: the real
  YouTube iframe is kept permanently non-interactive
  (`pointer-events: none` for the mouse, `tabindex="-1"` so keyboard
  Tab can't focus into it either), and every control the user sees —
  play/pause, seek bar, mute, fullscreen — is custom UI that drives
  playback through the API. Because nothing inside YouTube's own
  surface can ever receive a click or keypress, there is no reachable
  "Watch on YouTube" button, end-screen suggestion, title link, or
  info card. What this does **not** do is hide the video ID itself —
  it's still visible in the page's JavaScript and in any network
  inspector, because the browser has to know it to play the video at
  all. There is no frontend-only way to close that second gap.

- **Sessions are self-issued.** Login "tokens" are random strings
  generated in the browser, not signed or verified by a server. They
  stop casual navigation into protected pages, not a motivated user
  editing `localStorage` directly.

If this ever needs to genuinely prevent unauthorized access — rather
than just discourage casual attempts — the authorization, session
issuance, and video delivery all need to move server-side.

---

## Notes

- Built with React 18, React Router 6, and Vite 5. No UI framework or
  component library — all styling is hand-written CSS using a small
  light/dark design-token system (`src/styles/theme.css`).
- Dark mode is the default if the OS is set to dark; the toggle in the
  top bar persists the choice.
- The video player uses the YouTube IFrame API with fully custom
  controls (play/pause, seek bar, mute, fullscreen) — the native
  YouTube control bar is turned off, so there's no built-in YouTube UI
  to interact with at all.
- The video ID in `src/config/videoConfig.js` is a placeholder —
  replace it with the real one before use.
