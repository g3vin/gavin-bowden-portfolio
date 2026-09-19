// How fast a title types itself in, and how long the whole of it takes. It lives
// here rather than with the card that does the typing because it is the clock
// for more than the typing: a project page's head is three beats — the title,
// the summary under it, the details slip beside it — and the slip is printed by
// a different component from the other two. Both count from the same number.

// Per-character pace, and a floor and a ceiling on the whole title. A long name
// types faster rather than making the reader wait for it, and a short one types
// slower rather than being over before the eye has read it as typing at all.
//
// Both ends are the sequence's business as much as the title's. Everything under
// the title is cued off the moment the typing ends, and at a flat 28ms a
// one-word project ("Inkblot") spent that cue 196ms in — the whole head landed
// in one lump while the reader was still arriving on the page. Held between
// these two, a head reads the same whatever is rung up on it: the typing is
// always a beat long enough to be seen and short enough not to be waited on.
const CHAR_MS = 28;
const MIN_TYPE_MS = 360;
const MAX_TYPE_MS = 620;

// What one character costs for a given title, and what the whole of it comes to.
// The pace is the plain per-character one until the floor or the ceiling has
// something to say about it, which is only ever at the short and long extremes
// of the project list.
export function typePace(title) {
  const chars = Math.max(1, title.length);
  const step = Math.min(Math.max(CHAR_MS, MIN_TYPE_MS / chars), MAX_TYPE_MS / chars);
  return { step, total: Math.round(step * chars) };
}
