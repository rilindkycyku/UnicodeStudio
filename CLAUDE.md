# CLAUDE.md

Guidance for AI assistants working in this repository. Read this before touching code.

## What this is

**Unicode Studio (Platinum Edition)** — a small, single-screen React 19 + Vite app that converts
typed text into styled Unicode (bold, italic, script, double-struck, monospace, circled,
strikethrough) so it can be pasted into places that don't support formatting: Facebook posts,
Instagram captions, ads.

Alongside the converter it keeps a **template library** — real, ready-to-post Albanian promotional
copy for a supermarket ("Besa", Kaçanik) — plus a draft area with per-network character limits and
locally-saved history.

It is entirely client-side. No backend, no API, no database — everything is `localStorage`. Keep it
that way.

The UI chrome is English; the template content is **Albanian**.

## Commands

```bash
npm install
npm run dev       # vite --host
npm run build
npm run preview
npm run lint      # eslint . — flat config in eslint.config.js
```

There is **no test suite**, and `npm run build` succeeds.

**`npm run lint` currently exits 1 with 3 pre-existing errors**, so it is not a clean gate — don't
read a red run as something you broke:

- `src/App.jsx:2` and `src/components/Footer.jsx:1` — `'motion' is defined but never used`
  (`no-unused-vars`); Framer Motion is imported in both files and used in neither.
- `src/App.jsx:82` — `react-hooks/set-state-in-effect`, the four `setState` calls in the mount
  effect that load `localStorage`.

Fixing them is a reasonable small cleanup. What matters is not adding a fourth, and saying in the
commit body which state you left lint in.

`.env.example` documents one variable:

```
VITE_UNLOCK_KEY=your_key_here
```

It gates the template library (see below). Without it in `.env`, the unlock prompt can never match.

## Layout

This is a deliberately small codebase — four source files do nearly everything.

```
src/
  App.jsx                 ~590 lines: the entire UI, all state, all localStorage
  utils/textConverter.js  The Unicode mapping tables and toUnicodeStyle()
  data/templates.json     The template library, grouped by category
  components/Footer.jsx
  index.css               Hand-written CSS — the "Platinum" theme
  assets/                 brand-logo.png, logo.png
```

There is no router, no state library, no CSS framework. Styling is **vanilla CSS** in `index.css`,
not Tailwind — don't reach for utility classes here.

## Architecture rules

### 1. The conversion is a lookup table, and Albanian is a special case

`utils/textConverter.js` holds one object per style, mapping ASCII `A–Z a–z 0–9` to the
corresponding Unicode block. Two things are not plain lookups and must survive any refactor:

- **`ë`, `Ë`, `ç`, `Ç` are composed, not mapped.** Unicode's mathematical alphanumeric blocks have
  no Albanian letters, so the converter maps the base letter and appends a combining mark
  (`̈` diaeresis, `̧` cedilla). Dropping this silently mangles Albanian text, which is
  most of what this app is used for.
- **`strikethrough` is not a mapping at all** — it interleaves the combining overlay `̶` after
  every character, so it is handled before the table lookup.

Unmapped characters (punctuation, spaces, emoji) pass through unchanged, and an unknown `styleId`
falls back to `sans-bold`. Preserve both fallbacks.

Adding a style means: add the table here, then add a row to the exported `availableStyles`
(`{ id, name, preview, category }`) — and nothing else. `App.jsx` renders whatever that list
contains, grouped by its `category` (`Sans`, `Decorative`, `Monospace`, `Experimental`), so a new
category name creates a new collapsible group for free. `toSansBold` is kept as an alias of
`toUnicodeStyle` for backward compatibility.

### 2. Everything persists to `localStorage`, under four keys

| Key | Holds |
|---|---|
| `studio_history` | Recently converted text |
| `studio_custom` | Templates the user wrote themselves |
| `studio_unlocked` | Which library templates have been unlocked |
| `studio_lib_state` | Whether the library as a whole is unlocked |

Each is loaded once on mount, and each is written back by its own `useEffect` keyed on its own
state.

Be careful about what the read actually guards. It is
`JSON.parse(localStorage.getItem('studio_history') || '[]')` — the `|| '[]'` supplies a default only
when the key is **missing**. A key that exists but holds invalid JSON makes `JSON.parse` throw
inside the mount effect, and there is no `try`/`catch` and no error boundary in this app, so the
screen goes blank. Nothing writes a corrupt value today, but a half-finished write or a hand-edited
devtools entry would. If you touch this code, wrapping the four reads is the fix — don't describe
the current `||` as protection it doesn't give.

### 3. The lock is a convenience gate, not security

The template library is unlocked by comparing typed input against `import.meta.env.VITE_UNLOCK_KEY`.
**`VITE_`-prefixed variables are compiled into the client bundle and are readable by anyone** who
opens devtools. This is fine for what it does — keeping a specific business's marketing copy out of
casual view — but it is not a secret. Never put anything that actually needs protecting behind it,
and never add a `VITE_`-prefixed API key or password.

### 4. Content lives in `templates.json`

Categories today: `Daily Offers`, `Weekly Offers`, `Seasonal & Festive`, `Ramadan & Eid`, `Others`.
Each template is `{ id, title, content }`, with `content` carrying real newlines.

Adding or editing promotional copy is a JSON edit. `id`s must stay unique — `studio_unlocked` stores
them, so reusing an id unlocks the wrong template on someone's machine.

`SOCIAL_LIMITS` in `App.jsx` (FB Post 250, FB Ad 125, Instagram 2200) drives the character counter.
`MOCKUP_TEMPLATES` is Lorem-ipsum placeholder shown before the library is unlocked — it is not real
content.

## Gotchas

- `package.json` `version` is `0.0.0` and nothing displays a version. There is **no CHANGELOG**, so
  releases are not tracked here the way they are in the author's other repos — don't invent a
  versioning ritual, and don't bump it expecting it to show up anywhere.
- Styled Unicode is **not accessible text**: screen readers announce mathematical alphanumerics
  character by character or skip them. That's inherent to what the app produces, but don't use
  `toUnicodeStyle` for the app's *own* interface labels.
- **`lodash` is in `dependencies` but is never imported.** Nothing in `src/` uses it. Removing it is
  a safe cleanup; don't add an import just to justify it, and think twice before adding another
  utility dependency to a four-file app.
- **The README's Ctrl+K shortcut does not exist.** `README.md` advertises "CTRL + K" for the style
  picker, but `App.jsx` registers no global key handler — the only `onKeyDown` is Enter on the
  unlock field. Either implement it or correct the README; don't document it as working.
