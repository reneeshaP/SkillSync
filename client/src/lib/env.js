// Single source of truth for the backend origin. VITE_API_URL is the API
// base including the /api suffix (e.g. "http://localhost:8000/api" in dev,
// "https://skillsync-api.onrender.com/api" in production) — matches the
// convention already used by client/.env. Replaces 8 independent
// hardcoded "http://localhost:8000" literals across the app.

const RAW = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_URL = RAW.replace(/\/$/, '');
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
