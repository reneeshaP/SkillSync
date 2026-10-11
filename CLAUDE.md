# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project structure

SkillSync is a MERN-stack mentor/mentee platform split into two independent apps with no shared package boundary and no root `package.json`:

- `client/` — Vite + React 18 SPA (Tailwind CSS v4, React Router v7)
- `server/` — Express + Mongoose API with a Socket.io real-time layer

Each app is installed, run, and linted independently from its own directory.

## Commands

### client/
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run preview` — preview a production build

### server/
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start with node

Neither app has a test suite or `test` script configured.

## Environment

- `server/.env` (copy from `server/.env.example`): `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`.
- `client/.env`: `VITE_GOOGLE_CLIENT_ID` is read in `main.jsx`. A `VITE_API_URL` var exists but nothing in the client reads it — see "Hardcoded backend URL" below.

## Architecture

### Auth
- JWT-based; token stored in `localStorage`, sent as `Authorization: Bearer <token>`.
- `middleware/auth.js` verifies the JWT (payload field is `_id`, not `id`) and attaches the **full Mongoose user document** as `req.user` — not just the decoded token payload.
- Two signup paths converge on the same `User` model: email/password (hashed in a `User` pre-save hook — controllers must not hash passwords themselves) and Google OAuth (`controllers/authController.js` `googleAuth`, via `google-auth-library`'s `verifyIdToken`). Google signups land with `roleConfirmed: false`; `ProtectedRoute.jsx` redirects those users to `/choose-role` until `PUT /api/auth/confirm-role` is called.

### Real-time layer (Socket.io)
- `server/socket.js` authenticates the socket handshake with the same JWT (`decoded._id`) and tracks online users in an in-memory `Map` — this resets on server restart and does not work across multiple server instances. It relays chat messages, typing status, connection requests, and session request/response events.
- Client side: `contexts/SocketContext.jsx` owns the app-wide socket connection lifecycle; `services/socket.service.js` wraps `socket.io-client` and is where new event listeners belong. `services/notification.service.js` turns raw socket events into in-app notifications and filters out the current user's own broadcast-echoed events.
- Chat REST endpoints (history, search, attachments) live in `routes/chat.js`; Socket.io only handles live delivery, not persistence.

### AI mentor matching
- `services/embedding.service.js` builds a text blob from a user's skills/bio/experience and calls the Gemini `gemini-embedding-001` `embedContent` endpoint directly via `fetch` (no SDK) to get a vector, stored on `User.embedding`.
- `routes/mentors.js` (`GET /recommend`) ranks the opposite role (mentor ↔ mentee, based on `req.user.role`) by cosine similarity (`utils/cosineSimilarity.js`).
- Embeddings are only as fresh as the last profile save — there is no background recompute job.

### Sessions, availability, and reviews
- `models/AvailabilitySlot.js` (mentor-defined open slots) → `models/Session.js` (booked, status pending/confirmed/declined/cancelled) → `models/Review.js` (one per mentor+mentee pair, only allowed after a confirmed session; a unique index enforces upsert-not-duplicate in `routes/reviews.js`).
- Review create/update/delete recomputes `User.averageRating`/`reviewCount` via an aggregate in `routes/reviews.js` — any new code path touching `Review` must go through that recompute, not just save the document.

## Known dead code
Not mounted in `server.js` and not called by the client — leftover, not the live implementation:
- `server/routes/post.js` + `server/controllers/postController.js` (the live post routes are `server/routes/posts.js`, inline handlers, mounted at `/api/posts`)
- `server/routes/conversations.js` + `server/models/Conversation.js` (the live chat implementation is `server/models/Chat.js` + `server/routes/chat.js`)

## Hardcoded backend URL
The client has no single point of configuration for the API origin. `http://localhost:8000` is hardcoded independently in `services/api.config.js`, `utils/axios.js` (a near-duplicate axios instance whose only consumer is `profile.service.js` — everything else uses `api.config.js`), `services/auth.service.js` (raw `fetch`, not axios), `services/socket.service.js`, and inline in several pages/components that prefix uploaded-file URLs (avatars, chat attachments, e.g. `Home.jsx`, `ChatArea.jsx`). Changing the backend origin currently means editing all of these by hand.

## CORS / origin allowlist
Both Express CORS (`server.js`) and Socket.io CORS (`socket.js`) allow any `http://localhost:<port>` or `http://127.0.0.1:<port>` origin via regex — intentionally permissive for local dev against Vite's shifting port, not a production-ready allowlist.
