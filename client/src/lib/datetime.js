// Compact relative formatting for availability slots — e.g. "Today, 3–4 PM",
// "Tomorrow, 3–4 PM", or "Mon, Oct 12, 3–4 PM" for anything further out.
// Now also used by the Sessions/Availability/BookSessionModal trio in place of
// their three duplicate formatSlotTime copies. NotificationBell and ContactList
// still have their own (differently-shaped — relative "Xm ago" vs. a slot range)
// formatters; unifying those is a separate Phase 8 concern.

const TIME_OPTS = { hour: 'numeric', minute: '2-digit' };
const DATE_OPTS = { weekday: 'short', month: 'short', day: 'numeric' };

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function dayLabelFor(date) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], DATE_OPTS);
}

export function formatRelativeSlot(slot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);

  const startTime = start.toLocaleTimeString([], TIME_OPTS);
  const endTime = end.toLocaleTimeString([], TIME_OPTS);

  return `${dayLabelFor(start)}, ${startTime}–${endTime}`;
}

// Day-divider label for a single timestamp, e.g. "Today" / "Yesterday" /
// "Monday, Oct 12" — used between groups of chat messages sent on different days.
export function formatDateDivider(timestamp) {
  const date = new Date(timestamp);
  if (isSameDay(date, new Date())) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}
