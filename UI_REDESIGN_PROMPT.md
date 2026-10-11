# SkillSync — Full UI/UX Redesign Brief

You are acting as a senior product designer **and** the front-end engineer implementing the design. Redesign the entire SkillSync client (`client/`) from the ground up as a polished, modern, production-quality product UI. This is a visual/UX overhaul — **not** a rewrite of business logic.

---

## 0. Hard constraints (read first)

**Do not change:**
- Any file in `client/src/services/**` (API shapes, axios config, socket event names) or `server/**`.
- Route *paths* in `App.jsx` beyond the one restructure described in §3, the auth/role/onboarding gating logic in `components/ProtectedRoute.jsx`, or `context/AuthContext.jsx` / `contexts/SocketContext.jsx` behaviour.
- Socket event names, `localStorage` keys (`token`, `user`), or any request/response field names.
- Data flow inside components (state, effects, handlers). You may *move* JSX and *restructure markup*, but a handler that called `postService.likePost(id)` must still call exactly that.

**You may:**
- Add new dependencies (listed in §2), new files, new routes, and a design-system layer.
- Delete genuinely dead styling (`App.css` Vite boilerplate) and unused dependencies.
- Split oversized components (`UserProfile.jsx` is 942 lines, `ChatPage.jsx` 507) into presentational subcomponents — as long as behaviour is identical.

**Work in verifiable passes.** After each phase, `cd client && npm run build` and `npm run lint` must both pass with zero errors. Do not move to the next phase with a broken build.

---

## 1. What the product actually is (use this for all copy and IA)

SkillSync is a **mentor ↔ mentee matching and collaboration platform** (MERN + Socket.io). Real, shipped features — do not invent others:

| Feature | Where it lives |
|---|---|
| **AI skill matching** — Gemini embeddings of skills/bio/experience, ranked by cosine similarity, surfaced as a `%` match score | `People.jsx`, `MentorRecommendations.jsx` |
| **Role-based identity** — every user is a `mentor` or `mentee`; the app shows you the *opposite* role | `ChooseRole.jsx`, whole app |
| **Guided onboarding** — skills (tag input w/ autocomplete), bio, experience, GitHub/LinkedIn | `Onboarding.jsx` |
| **Real-time 1:1 chat** — live messages, typing indicator, online/offline presence, in-conversation message search, file/image attachments, voice notes (MediaRecorder), webcam capture | `ChatPage.jsx`, `ChatArea.jsx`, `ChatMessages.jsx`, `MessageInput.jsx`, `CameraCapture.jsx` |
| **Connection requests** — send/accept/ignore, real-time | `ConnectionRequestPopup.jsx`, `MessageSidebar.jsx` |
| **Session scheduling** — mentors publish availability slots; mentees book one with a topic; mentor confirms/declines; either side cancels | `AvailabilityManager.jsx`, `BookSessionModal.jsx`, `Sessions.jsx` |
| **Ratings & reviews** — mentees rate a mentor after a confirmed session; mentor's average rating + review count shown everywhere | `StarRating.jsx`, `Sessions.jsx`, `BookSessionModal.jsx` |
| **Community feed** — posts with image + tags, likes, saves, share-to-chat, nested comments with replies and comment likes | `Home.jsx`, `Comment.jsx`, `CreatePost.jsx`, `ManagePost.jsx` |
| **Live notifications** — bell with unread count, 10 notification types, deep-links to the relevant page | `NotificationBell.jsx` |
| **Dashboard stats** — unread messages, pending requests, session requests, upcoming sessions | `DashboardStats.jsx` |

Brand personality to express: **credible, warm, forward-moving.** It is a career/learning product — it must feel trustworthy like a professional tool, not like a toy or a crypto dashboard. Avoid: neon glow, glassmorphism overload, random gradient blobs, emoji used as UI.

---

## 2. Technical foundation to put in place

Current state: Tailwind CSS v4 via `@tailwindcss/vite`, **no `tailwind.config.js`**, and `client/src/index.css` contains literally one line (`@import "tailwindcss";`). There are **no design tokens, no custom fonts, and no dark-mode mechanism** — every colour in the app is a hardcoded hex or a raw Tailwind palette class.

Build the foundation properly.

### 2.1 Dependencies

Add:
- `framer-motion` — all animation (page transitions, list stagger, modal/popover motion, layout animation for tabs).
- Radix primitives: `@radix-ui/react-dialog`, `react-dropdown-menu`, `react-tabs`, `react-switch`, `react-tooltip`, `react-popover`, `react-avatar`, `react-scroll-area`, `react-radio-group`, `react-accordion`. Accessible and unstyled; style them with Tailwind. These replace the hand-rolled dropdowns/modals, which currently have no focus trap, no Escape handling and no ARIA.
- `clsx` + `tailwind-merge` (export a `cn()` helper from `src/lib/utils.js`), and `class-variance-authority` for component variants.
- `sonner` — toast notifications.
- `prop-types` — **it is imported in 12+ files but missing from `package.json`**. Either add it or migrate those files off PropTypes; do not leave it undeclared.

Remove (installed, zero imports): `@heroicons/react`, `swiper`, `react-slick`, `slick-carousel`. Also remove `react-responsive-carousel` once the Signup carousel is rebuilt with Framer Motion.

**Standardise on `lucide-react` for every icon.** Today the app mixes `react-icons/fi` (17 import sites) and `lucide-react` (8), so the same concept is drawn at two different stroke weights — e.g. search is `FiSearch` in `Home.jsx` but lucide `Search` in `ChatArea.jsx`. Migrate all `react-icons` usage to lucide, then drop `react-icons`.

### 2.2 Typography

Load via Google Fonts (`<link>` in `client/index.html`, with `preconnect` and `display=swap`), variable weights:
- **Headings / display:** `Plus Jakarta Sans` (600/700/800) — humanist geometric, friendly but professional.
- **Body / UI:** `Inter` (400/500/600), with `-webkit-font-smoothing: antialiased` and sensible `font-feature-settings`.
- **Mono:** `JetBrains Mono` — for time ranges in the slot picker and similar tabular data, nothing more.

Always give a real system fallback stack.

Define a type scale as tokens — do not freestyle `text-2xl` everywhere: `display`, `h1`–`h4`, `body-lg`, `body`, `body-sm`, `caption`, `overline`, each with a paired line-height and letter-spacing (negative tracking on the large sizes, around `-0.02em` on display/h1). Headings use the display family, body uses the UI family.

### 2.3 Themes — light + dark, with a toggle

Implement with Tailwind v4's CSS-first approach in `index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* semantic tokens only — no raw hexes in components */
}
```

Define **semantic** tokens (not `purple-600`): `--color-bg`, `--color-bg-subtle`, `--color-surface`, `--color-surface-raised`, `--color-surface-overlay`, `--color-border`, `--color-border-strong`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-brand`, `--color-brand-hover`, `--color-brand-fg`, `--color-brand-subtle`, `--color-accent`, `--color-success`, `--color-warning`, `--color-danger`, `--color-info`, `--color-ring`. Each gets a value under `:root` (light) and under `.dark`.

Use **OKLCH** for all colour values so the light and dark pairs are perceptually matched rather than eyeballed.

Palette direction — keep violet as the brand anchor (it is already the app's identity and matches the existing logo), but replace the flat `purple-600` with a proper ramp:

- **Brand:** violet/indigo, roughly `oklch(0.56 0.21 288)` as the 500 step, with a full 50→950 ramp. It must hit 4.5:1 against its foreground in *both* themes — the current `text-purple-400` on `#1a1c23` is borderline, and `text-purple-400` on a light surface will fail outright.
- **Accent:** a cool teal, around `oklch(0.70 0.13 195)`, reserved for *AI / match* signals — the `% match` score, the "matched for you" headers, the recommendation surface. This gives the matching engine its own visual language instead of being the same purple as every button.
- **Semantics:** emerald (confirmed / online / open slot), amber (pending), rose (declined / cancelled / destructive), slate-blue (info). The session status chips in `Sessions.jsx` (`STATUS_STYLES`) and the slot status chips in `AvailabilityManager.jsx` must be driven by these tokens.
- **Neutrals:** a slightly warm neutral ramp, not pure grey. Dark base around `oklch(0.17 0.012 285)` with three distinct elevation steps; light base around `#FCFCFD` with white surfaces and a soft but visible border.

**Theme toggle requirements:**
- `src/contexts/ThemeContext.jsx` providing `theme` (`'light' | 'dark' | 'system'`), `resolvedTheme`, and `setTheme`.
- Persist to `localStorage` under a **new** key (e.g. `skillsync-theme`); never touch the existing `token` / `user` keys.
- **Dark is the default.** A visitor with no stored preference gets dark, regardless of their OS setting. `system` stays available as an explicit third choice in the toggle (tracking `prefers-color-scheme` live via a `matchMedia` listener), but it is not the initial state.
- **No flash of wrong theme on load:** add a small blocking inline script in `client/index.html` that sets `class="dark"` on `<html>` before React mounts — unconditionally, unless `localStorage` holds an explicit `light` (or a `system` preference that currently resolves to light). Because dark is the default, the server-rendered/initial HTML should already carry `class="dark"` so the common path has zero work to do. Also add `<meta name="color-scheme" content="dark light">`.
- Toggle UI: an icon button (sun / moon / monitor) with a Framer Motion crossfade-and-rotate on the icon, a tooltip, and an `aria-label` that reflects the next state. Place it in the **left sidebar's footer region** (see §2.5) for the authenticated app, in the landing-page nav, **and** on the auth pages — Login / Signup / Onboarding / ChooseRole currently have no chrome at all, so give them a minimal top bar with logo + theme toggle. One shared `ThemeToggle` component, three placements.
- Design **dark first** — it is the default and the theme most users will see, so it gets the primary design attention and is the one you compose colour, elevation and contrast decisions in. But light is a first-class deliverable, not a mechanical inversion: every screen must be reviewed and genuinely polished in light mode too. Dark-first is an order of work, not an excuse for a weak light theme.
- A specific light-mode hazard in this codebase: the current design leans on *darker* surfaces for elevation (`#1a1c23` card on `#0f1117` page). That inverts in light mode — elevated surfaces must become *lighter* (white card on a tinted page), with borders and shadows doing more of the separation work than fill does. Define elevation semantically (`surface`, `surface-raised`) so this flips correctly instead of producing grey-on-grey cards.

### 2.4 Motion

- Easing tokens: a quint ease-out for entrances, a quart ease-in-out for transforms. Durations: 120ms (micro / hover), 200ms (default), 320ms (overlays / page), 600ms+ only for landing-page scroll reveals.
- Page transitions via `AnimatePresence` keyed on the route (fade + 8px rise; no slide transitions between unrelated pages).
- List entrances: stagger children 30–40ms, cap the animated count at ~8 and render the rest immediately — the feed and match list can be long.
- Hover / press: `scale(1.01)` / `scale(0.98)` on cards and buttons, never more. The current `hover:scale-105` on the Signup CTAs is too much.
- **Respect `prefers-reduced-motion`** via `useReducedMotion()`, degrading to opacity-only. Also delete the leftover 20s infinite spin keyframe in `App.css`.
- Use `motion.div` with `layoutId` for the active-tab indicator (UserProfile tabs) and the selected-conversation highlight.

### 2.5 Layout & responsive

Almost nothing in the app is genuinely responsive today. Fix:

- A 4px-based spacing scale, radius tokens (`sm` 8, `md` 12, `lg` 16, `xl` 20, `2xl` 28, `full`), and two-layer shadow tokens (ambient + direct) that are *subtler* in dark mode.
- A shared container token. **`Home.jsx` currently has `max-w-4xl` on the header but `px-20` with no max-width on the feed**, so the header and the feed are misaligned at every viewport. One container, used by both.
- Mobile-first breakpoints. Specific failures to fix:
  - `Signup.jsx` uses fixed `w-1/2` split panes → unusable below ~900px.
  - `ChatPage.jsx` is a fixed `w-80` sidebar + chat area with no mobile behaviour → needs a list↔conversation view switch on small screens, with a back button.
  - `UserProfile.jsx`'s 5-tab row overflows on mobile → scrollable tab strip or a select.
  - `People.jsx` match cards put a 220px action column beside the content → reflow and stack on narrow screens.
  - `Home.jsx`'s header crams a search field plus five icons onto one row → needs a dedicated mobile layout.
- Build a real app shell with a **persistent left sidebar nav**. Navigation currently lives as five bare icons in the `Home` header, and **`People.jsx`, `Sessions.jsx` and `ChatPage.jsx` each ship their own one-off "← back to home" arrow** — there is no consistent chrome. Create `components/layout/AppShell.jsx` and wrap every authenticated page in it.

  **Left nav spec:**
  - Fixed/sticky, full-height, its own `surface` with a right border. Logo + wordmark at the top.
  - Items with icon + label: **Feed**, **Matches** (`/people`), **Messages** (`/chat`), **Sessions** (`/sessions`), **Profile** (`/userprofile`). Label the Matches item by role where it reads better — mentors are browsing mentees.
  - Active state driven by `useLocation()`: brand-tinted background, brand text, and a `layoutId`-animated indicator bar on the active item. This replaces the per-page back arrows entirely — **delete them**, since the nav is always present.
  - Live count badges on Messages (unread), Sessions (pending) and Matches, sourced from the data `DashboardStats` already fetches. Lift that fetch into the shell so the sidebar and the stat tiles share one source instead of double-fetching.
  - A footer region in the sidebar: current user avatar + name + role chip (opens a Radix DropdownMenu with Profile / Settings / Theme / Log out), the theme toggle, and the notification bell. Move logout out of `UserProfile.jsx`'s body — it is currently a grey button buried in the profile sidebar.
  - Collapsible to an icon-only rail (~72px) with tooltips on every item; persist the collapsed state to `localStorage`.
  - The "Create post" action is a prominent primary button at the top of the nav, not the small white `+` circle currently sitting in the Home header.
  - **Below `lg`:** the sidebar becomes a bottom tab bar (Feed / Matches / Messages / Sessions / Profile) plus a compact top bar carrying the logo, search, bell and theme toggle. Chat at mobile width hides the bottom bar while a thread is open so the message composer is not fighting it for space.
  - Full keyboard support, `aria-current="page"` on the active item, and a skip-to-content link that jumps past the nav.

---

## 3. New: public landing page (highest-priority new work)

**There is currently no landing page.** `/` is a protected route that redirects straight to `/login`, so a first-time visitor sees a bare login form on a near-black background and never learns what SkillSync is. The Signup page has a "Getting Started is Easy" section buried *below* the fold of the form — that content wants to live on a landing page.

Build `client/src/Pages/Landing.jsx` at the public route `/`, and move the authenticated feed to `/feed`. **Redirect authenticated users** hitting `/` straight to the feed, so the landing page only serves visitors. Update `App.jsx` and every `navigate('/')` call accordingly — there are several, including the logout handler in `UserProfile.jsx` and the back buttons in `People`, `Sessions`, `MessageSidebar` and `CreatePost`.

Sections, in order:

1. **Sticky nav** — logo + wordmark, anchor links (How it works · Features · For mentors), theme toggle, "Log in" (ghost) and "Get started free" (primary). Translucent / blurred background once scrolled.
2. **Hero** — one sharp headline about the real value: being *matched* with the right mentor, not browsing a directory. Subhead naming the mechanism (AI skill matching, scheduled sessions, real-time chat). Two CTAs → `/signup` and `/login`. Supporting visual: an animated, self-contained mock of the product — a match card rising in with its `% match` ring counting up, a chat bubble arriving, a session slot flipping to confirmed. Build it as real DOM + Framer Motion, **not** a screenshot or stock photo. Add a restrained animated background (mesh gradient, or a dotted grid behind a radial fade mask) that is theme-aware and GPU-cheap.
3. **Value strip** — a few numbers or claims animating in on scroll. Keep them honest ("Matched on skills, not keywords", "Free while in beta") rather than inventing user counts.
4. **"How it works" — three steps**, reusing and sharpening the copy that already exists in `Signup.jsx`: *Create your profile → Get matched → Book sessions and grow.* Each step gets an illustrative visual, connected by a line that draws itself on scroll.
5. **Feature grid (bento layout)** — one tile per real capability: AI skill matching (featuring the `% match` visual), real-time chat with voice notes and attachments, session booking from mentor availability, verified ratings and reviews, the community feed, live notifications. Mixed tile sizes, each with a small animated detail on hover. Every claim must map to a feature in §1's table.
6. **Dual-audience split** — "For mentees" / "For mentors" panels side by side, each with its own benefit list and CTA. The product is genuinely two-sided and the current UI never says so before signup.
7. **Testimonials** — build the component, but populate it with clearly-marked placeholder content. Do not fabricate quotes attributed to named people.
8. **FAQ** — Radix Accordion. Real questions: Is it free? How does the matching work? How do sessions get scheduled? Can I be both a mentor and a mentee? What happens right after I sign up?
9. **Final CTA band** and **footer** (product / resources / legal columns, logo, copyright, theme toggle). This replaces the lone `© 2025 All Rights Reserved` line currently hardcoded inside `UserProfile.jsx`.

Craft requirements: scroll reveals via `useInView` that fire once and never re-trigger; full reduced-motion support; both themes complete; the LCP text/image must not be animation-delayed; fully responsive down to 360px.

---

## 4. Build a real component library first

Create `client/src/components/ui/` and build these **before** touching any page, so pages get rebuilt *on top of* the system instead of restyled ad hoc:

`Button` (variants primary / secondary / ghost / outline / danger / link × sizes sm / md / lg / icon, plus loading and disabled states), `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Label`, `FormField` (label + hint + error + required marker), `Card`, `Badge` / `Chip` (including a removable skill chip and a status chip driven by semantic tokens), `Avatar` (initials fallback, presence ring, size scale), `AvatarGroup`, `Tabs`, `Dialog`, `Sheet` (mobile drawer), `DropdownMenu`, `Tooltip`, `Popover`, `Accordion`, `Toast` (sonner wrapper), `Skeleton`, `Spinner`, `EmptyState` (icon + title + body + action), `ErrorState` (with retry), `ProgressBar`, `SearchInput` (clear button + loading + empty states), `StarRating` (upgrade the existing one: half-star display, keyboard-operable, `aria-label`), `MatchScore` (the `%` ring / meter), `IconButton` (with a required `aria-label` prop).

**Deduplicate while you are in here.** The same markup is copy-pasted across files and must collapse into shared components:

- The avatar-with-initials-fallback is reimplemented in **eight places** (`Home`, `People`, `UserProfile`, `ViewProfile`, `MentorRecommendations`, `Comment`, `ManagePost`, `ContactList`) using **three different fallback strategies** — an initials circle, `ui-avatars.com`, and `i.pravatar.cc`. Pick one (initials circle, with a deterministic colour derived from the user id) and use it everywhere.
- `getAvatarUrl()` is redefined in **nine files**, each with its own `const API_URL = 'http://localhost:8000'`. Extract one helper. Note that `client/.env` already defines `VITE_API_URL` and nothing reads it — route the helper through a single config module.
- The skill chip `bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm` appears in six-plus files.
- The spinner `animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500` appears in five files.
- The post card (header, content, image, tags, action bar, comments) is duplicated between `Home.jsx`, `UserProfile.jsx`'s `renderPost`, and `ManagePost.jsx` — extract one `PostCard`.
- The match card is duplicated between `People.jsx` and `MentorRecommendations.jsx` — extract one `MatchCard`.

---

## 5. Page-by-page direction

Rebuild each of these. Current colour values are given so you know exactly what you are replacing.

### 5.1 Three clashing palettes must become one

This is the single worst problem in the app — three unrelated design languages ship side by side:

- **Main app:** bg `#0f1117`, surface `#1a1c23`, raised `#282c3a`, hover `#323744`, accent `purple-600`.
- **Chat:** Tailwind `slate-900` / `800` / `700` / `600`, with **cyan-500 outgoing bubbles and pure-white incoming bubbles**. Navigating Home → Chat looks like entering a different product. The sidebar even has an unexplained red dot next to the word "Messaging".
- **Signup:** `zinc-950`, a one-off `#3B364C` panel, and `bg-black`.

Collapse all three into the token system. Chat bubbles: outgoing = brand, incoming = `surface-raised`; both must read correctly in light mode (white-on-white is a guaranteed bug there today).

### 5.2 `Login.jsx` / `Signup.jsx`

One coherent auth design across both. Split layout: the form on one side, a branded panel on the other carrying real value propositions. Rebuild the Signup carousel with Framer Motion plus proper dot indicators and pause-on-hover, then drop `react-responsive-carousel`.

Add: a password strength meter; inline per-field validation on blur instead of a single red line at the top of the form; a properly designed role selector — two selectable **cards** ("I want to learn" / "I want to mentor"), not two bare radio buttons in a grey box; a styled Terms checkbox; a loading state on submit; and a Google button visually reconciled with the rest of the form (a stock Google widget currently sits inside a custom dark form and clashes). Move the "Getting Started is Easy" block out of Signup — it belongs on the landing page. Error and success messages become toasts or styled alert components.

### 5.3 `Home.jsx` → the feed

Three columns at desktop width: the shell's **left sidebar nav** (§2.5), the centre feed, and a right rail holding `DashboardStats` and `MentorRecommendations` (plus trending tags if you want a third module). Today those two are stacked *above* the feed, pushing the actual content below the fold — moving them into the rail is the single biggest layout win on this page. Below `lg` the rail collapses: stats become a horizontal scroll strip above the feed, and matches move to a "See your matches" link-card.

- **The entire current `Home` header dissolves into the shell.** The five bare icons, the `+` circle and the avatar all become sidebar items — do not rebuild a second navigation here. What remains page-local is the search field, which moves into the shell's top bar.
- Fix the **broken logo** — it points at `/logo.png`, but the file on disk is `client/public/skillsync logo.png` (note the space). Rename the asset to a URL-safe name and build a proper wordmark lockup for the sidebar. Also replace the `vite.svg` favicon in `index.html` with a real SkillSync favicon.
- While migrating them: `FiMessageCircle` and `FiUsers` are currently bare SVGs with `onClick` — not focusable, not keyboard-operable, no accessible name. The sidebar replacements must be real `<button>`/`<Link>` elements. The same bare-SVG-with-onClick pattern appears in `UserProfile` and `Comment` and needs the same treatment there.
- Search: a proper combobox with grouped results (People / Posts / Tags), keyboard navigation, and loading, empty and no-results states.
- Dashboard stat tiles: redesign as proper metric cards with an icon, urgency treatment, and a clear affordance that they are clickable.
- Post card: better typographic rhythm, deliberate image aspect handling, tag chips, and an action bar with counts plus hover/active feedback — likes currently just turn purple with no animation, so add a satisfying like micro-interaction. Collapse long comment threads behind a "show more".
- Replace the bare spinner with **feed skeletons**, and replace `No posts yet. Be the first to share!` with a designed `EmptyState` that carries a CTA.

### 5.4 `People.jsx` (matches)

Make AI matching the hero of this page. Render the match score as a ring or meter in the accent colour, with a short reason ("shares 4 of your skills"). Add filter and sort controls (match %, rating, availability) and a density/view toggle.

Redesign the availability line: it currently renders as `Available from 10/12/2025, 3:00 PM to 10/12/2025, 4:00 PM`, which is redundant and hard to scan — show a compact relative slot instead (`Tomorrow, 3–4 PM`). Make the whole card one clear hit target, with visually distinct secondary ("Book a slot") and primary ("Connect" / "Message") actions. Add skeleton loading and a designed empty state.

### 5.5 `ChatPage.jsx` and the chat components

Re-theme into the token system, plus: mobile list↔thread navigation; date separators between message groups; consecutive-message grouping so the avatar only renders on the first message of a run (**every** message currently renders an avatar on both sides, which is extremely noisy); message status (sending / sent); real presentation for file, image and audio attachments; an animated three-dot typing indicator instead of the text "Typing..."; a presence dot with a tooltip; an animated recording state; and an in-thread search bar with match highlighting. The unread indicator in `ContactList` is a bare 3px blue dot — make it a count badge. Add designed empty states for "no conversation selected" and for a brand-new empty thread.

**Also fix:** `ChatArea.jsx` receives an `onTyping` prop but never forwards it to `MessageInput`, so the typing indicator can never fire. Wire it through.

### 5.6 `Sessions.jsx`, `AvailabilityManager.jsx`, `BookSessionModal.jsx`

- **Sessions:** segmented views (Upcoming / Pending / Past), status chips from semantic tokens, a proper date-time block per session (day, time, duration, timezone), clearly separated mentor-vs-mentee action sets, and a confirmation dialog for cancel — it currently calls `window.confirm()`.
- **AvailabilityManager:** the twin `datetime-local` inputs are the weakest UI in the app. Replace with a real slot composer — date picker, time range, duration, optional "repeat weekly" — plus a week-view grid showing existing slots (open vs booked), grouped by day.
- **BookSessionModal:** Radix Dialog with focus trap and Escape. Present slots as selectable time chips grouped by day rather than a radio list. Surface the mentor's rating and reviews more prominently, add a character counter to the topic field, and replace the post-booking `alert()` with a success toast.

### 5.7 `UserProfile.jsx` (942 lines — split it)

A proper profile header (cover area, large avatar with an obvious upload affordance — it is currently a ✏️ **emoji** in a purple circle; use a real icon button with a hover overlay on the avatar). Rebuild the tab row with Radix Tabs plus an animated `layoutId` indicator, scrollable on mobile. Redesign the profile-completeness bar as a ring or segmented meter with a "what's still missing" hint.

Edit mode should be a real form layout — grouped sections, two columns where sensible, inline validation, a sticky save bar, and a dirty-state guard — instead of eight identical stacked inputs. Give avatar and resume upload real drag-and-drop dropzones with file-type/size hints and progress. Split the file into `ProfileHeader`, `ProfileAbout`, `ProfileSecurity`, `ProfilePosts`, `ProfileSaved`, `ProfileAvailability`.

### 5.8 `ViewProfile.jsx`

Elevate it from a single centred card into a real public profile: header with avatar, name, role and rating; skills; experience; bio; social links; the mentor's **reviews list** (reviews are already fetched in `BookSessionModal` but never shown on a profile — surface them here); available slots; and sticky Connect / Message / Book actions.

**Copy bug to fix:** it renders `I am a Mentor` / `I am a Mentee` on *other people's* profiles — it should read "Mentor" / "Mentee". Replace the `connectStatus` string with a toast, and the `i.pravatar.cc` fallback with the shared Avatar.

### 5.9 `Onboarding.jsx` and `ChooseRole.jsx`

Turn onboarding into a **multi-step wizard** — Role → Skills → About you → Links → Done — with a progress indicator, animated step transitions, per-step validation, a back button, and a completion celebration state. It is the first thing a new user touches and is currently one long flat form. `ChooseRole` becomes step 1: two large illustrated choice cards with hover and selected states, not two grey boxes with small icons.

Upgrade `TagInput` into a polished combobox: arrow-key navigation through suggestions, highlighted matching substrings, a visible "press Enter to add" hint, max-count handling, and popular-skill quick-add chips.

### 5.10 `CreatePost.jsx`

Currently a bare form on its own route. Make it a Dialog or Sheet opened from the feed, keeping `/create-post` working as a deep link. Add a rich textarea with a character counter, drag-and-drop image upload with preview and remove, a tag input that reuses `TagInput` (today it is a comma-separated text field, inconsistent with the chip input used everywhere else), and a live post preview.

### 5.11 `NotificationBell.jsx`

Convert the hand-rolled dropdown to a Radix Popover. Add per-type icons and colour coding (message / connection / session / review / profile-view), relative timestamps, unread grouping, an animated unread-count badge, a "Mark all read" affordance, an empty state, and a max-height scroll area. The notification copy is assembled from ten inline string conditionals — move it into a map.

### 5.12 `Comment.jsx` and `ManagePost.jsx`

Proper comment-thread visuals: indentation with connector lines for replies, collapsible reply groups, a like affordance with count, and relative timestamps. Inline editing — editing a comment currently opens a **`window.prompt()`** from `UserProfile.jsx`. Convert `ManagePost`'s overflow menu to a Radix DropdownMenu with a destructive-styled delete that opens a confirmation dialog.

### 5.13 Dead / unstyled components

`Post.jsx` and `UserStatus.jsx` render against CSS classes (`post`, `post-header`, `post-content`, `post-footer`, `status online`) **that do not exist anywhere in the codebase**, so they render completely unstyled. Check their import sites: either bring them into the design system or delete them if they are unreachable.

---

## 6. Replace all native browser dialogs

There are **14 calls** to `alert()` / `confirm()` / `prompt()` across the client (`People.jsx`, `Sessions.jsx`, `ChatPage.jsx`, `UserProfile.jsx`, `BookSessionModal.jsx`, `MessageInput.jsx`, `CameraCapture.jsx`). Every one is an immersion-breaking OS dialog. Replace them with `sonner` toasts for feedback, Radix Dialog for confirmations, and inline field errors for validation. No native dialogs may remain.

---

## 7. Accessibility (non-negotiable)

- All interactive elements are real `<button>` / `<a>`, keyboard-reachable, with a visible `:focus-visible` ring using `--color-ring` at 2px offset — not just the `focus:ring` currently present on some inputs.
- Every icon-only control gets an `aria-label`. Modals get a focus trap, Escape to close, and focus restoration. Dropdowns get correct `role` / `aria-expanded` (Radix gives you this for free).
- 4.5:1 text contrast and 3:1 UI contrast in **both** themes. Audit the existing muted greys: `text-gray-500` on `#1a1c23` and `text-slate-500` on `slate-900` both fail today.
- Every form input has an associated `<label>` (several currently rely on placeholder text alone). Errors are linked with `aria-describedby` and announced via `aria-live`.
- Meaningful `alt` on content images; `alt=""` on decorative ones.
- Honour `prefers-reduced-motion` everywhere.
- Add a skip-to-content link in the app shell.

---

## 8. Polish details that separate "fine" from "designed"

- Optimistic UI and loading states on every mutation (like, save, connect, book, review). Several currently refetch the entire post list after a single like.
- Skeletons that match the final layout — never a bare spinner — for the feed, matches, sessions, conversations and profile.
- Designed empty states (icon + headline + body + CTA) for: empty feed, no matches, no conversations, no sessions, no availability slots, no notifications, no saved posts, no search results. All eight are currently plain grey sentences.
- Designed error states with a retry action, not `text-red-500` paragraphs.
- Hover, active, focus, disabled and loading states defined for every interactive component.
- `scroll-behavior: smooth`, themed custom scrollbars, a branded text-selection colour, styled `::placeholder`.
- One relative-time utility. Today `Home` uses `toLocaleDateString`, `NotificationBell` has a hand-rolled "2h ago", `ContactList` uses `toLocaleTimeString`, and `Sessions` uses a fourth format.
- A proper 404 page — unmatched routes currently render nothing at all.
- Per-route `document.title`, and real meta / Open Graph tags for the landing page.
- Delete the Vite boilerplate (`.logo`, `.read-the-docs`, `logo-spin`) from `App.css`.
- Remove the `console.log` debug noise in `ChatPage.jsx`, including one that fires on every single render.

---

## 9. Delivery order

1. **Phase 1 — Foundation:** dependencies, fonts, `index.css` tokens, theme context (dark default) + no-flash script + toggle, `cn()` helper, motion tokens, favicon and logo asset fix. Verify dark loads with no flash on a cold `localStorage`, and that both themes switch cleanly on one existing page.
2. **Phase 2 — Component library:** everything in §4, including the shared `Avatar`, the single `getAvatarUrl`, `PostCard`, `MatchCard`, `EmptyState`, and toast setup.
3. **Phase 3 — App shell:** the left sidebar nav per §2.5 (items, active state, badges, user menu, collapsed rail, mobile bottom bar), top bar, container, page transitions, 404, footer. Wire every authenticated page into it and delete the per-page back arrows and the old `Home` header nav in the same pass.
4. **Phase 4 — Landing page** (§3) plus the route restructure.
5. **Phase 5 — Auth and onboarding:** Login, Signup, ChooseRole, the Onboarding wizard.
6. **Phase 6 — Core app:** Feed, People, ViewProfile, UserProfile.
7. **Phase 7 — Chat and Sessions.**
8. **Phase 8 — Polish pass:** native-dialog removal, accessibility audit, responsive audit at 360 / 768 / 1024 / 1440, contrast check in both themes, reduced-motion check, final `npm run build` and `npm run lint`.

After each phase, report what changed, what you verified, and any decision you had to make. **Pause after Phase 1 and again after Phase 4** so the direction can be reviewed before the bulk of the work lands.

---

## 10. Acceptance checklist

- [ ] Zero hardcoded hex colours and zero raw Tailwind palette colour classes in `Pages/` and `components/` — semantic tokens only.
- [ ] A first-time visitor with an empty `localStorage` and a light OS setting lands in **dark**; the toggle moves cleanly between light / dark / system in both directions; no flash of the wrong theme on reload in any of the three states.
- [ ] Every screen reviewed in light **and** dark; no white-on-white or black-on-black; elevated surfaces read as *raised* in both themes (lighter in light mode, not grey-on-grey).
- [ ] Exactly one navigation surface in the authenticated app — the left sidebar (bottom tab bar below `lg`). No leftover per-page back arrows, no second row of header icons.
- [ ] Sidebar active state matches the current route on every page, including deep links like `/profile/:id`.
- [ ] One icon library, one Avatar component, one API-base constant, one date formatter, one skeleton/spinner approach.
- [ ] Zero `alert` / `confirm` / `prompt`.
- [ ] A keyboard-only walkthrough of signup → onboarding → feed → match → book session → chat is fully operable, with visible focus throughout.
- [ ] Every route usable at a 360px-wide viewport.
- [ ] `npm run build` and `npm run lint` both clean.
- [ ] Unused dependencies removed; `prop-types` resolved.
- [ ] Logo and favicon render — no broken images anywhere.
