import { useRef, useState } from "react";
import { prefersReducedMotion, useIsoLayoutEffect } from "../lib/media";
import "./ProjectPreview.css";

// Per-character pace, and the ceiling on the whole title: a long name types
// faster rather than making the reader wait for it.
const CHAR_MS = 28;
const MAX_TYPE_MS = 650;

// How many characters of `text` are showing. Restarts whenever the text changes
// or the card becomes active again; shows everything at once for a reader who
// asked for less motion. The delay is read when typing starts rather than being
// a dependency: the panel stops asking for one partway through, and that must
// not restart a title that is already on screen.
function useTypewriter(text, { delay = 0, active = true, step = CHAR_MS }) {
  const [count, setCount] = useState(() => (active ? 0 : text.length));
  // The delay this run actually started with, so the fade-ins below the title
  // are timed off the same number.
  const [wait, setWait] = useState(delay);
  const delayRef = useRef(delay);
  useIsoLayoutEffect(() => {
    delayRef.current = delay;
  });

  // A layout effect so the reset to zero lands before the browser paints: as a
  // plain effect the first frame of an opening panel still showed the whole
  // title from last time, then blanked and started typing.
  useIsoLayoutEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setCount(text.length);
      return;
    }
    const startedWith = delayRef.current;
    setCount(0);
    setWait(startedWith);
    let frame = 0;
    let start = 0;
    let shown = 0;
    const tick = (now) => {
      if (!start) start = now + startedWith;
      const typed = Math.max(0, Math.floor((now - start) / step) + 1);
      const next = now < start ? 0 : Math.min(text.length, typed);
      if (next !== shown) setCount((shown = next));
      if (next < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, active, step]);

  return { count, wait };
}

// The project as a modern web card: big title, one line of description, the
// poster. On the home page it sits inside the aria-hidden preview panel, which
// repeats a receipt row that carries the real link and name — so no heading there, and no alt text on the picture.
//
// `heading` makes it the head of a project page instead: the title becomes the
// page's <h1>, read whole by a screen reader rather than letter by letter. The
// page leads with the fuller `summary` in place of the one-line description,
// and has its own figures in the writeup, so the poster is left off there.
function ProjectPreview({
  project,
  delay = 0,
  active = true,
  heading = false,
  cta,
  className = "",
}) {
  const { title, description, summary, poster } = project;
  const step = Math.min(CHAR_MS, MAX_TYPE_MS / Math.max(1, title.length));
  const { count, wait } = useTypewriter(title, { delay, active, step });
  const done = count >= title.length;
  const typeMs = Math.round(step * title.length + wait);
  const Title = heading ? "h1" : "p";
  const showPoster = poster && !heading;

  // Solid while letters are arriving, blinking while it waits to start and
  // again once the title is done.
  const caretState = done ? " is-done" : count > 0 ? " is-typing" : "";
  const caret = <i className={`preview__caret${caretState}`} />;
  // The caret rides in one unbreakable run with the last typed letter. Left
  // loose after it, a balanced title whose last line is exactly full could
  // push the caret onto a line of its own. A space is left unjoined so its
  // break opportunity, and the finished title's line breaks, are kept.
  const last = title[count - 1];
  const joined = last && !/\s/.test(last);

  const typed = (
    <>
      {title.slice(0, joined ? count - 1 : count)}
      {joined ? (
        <span className="preview__tail">
          {last}
          {caret}
        </span>
      ) : (
        caret
      )}
      <span className="preview__rest">{title.slice(count)}</span>
    </>
  );

  return (
    <div
      className={`preview${heading ? " preview--heading" : ""}${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--type-ms": `${typeMs}ms` }}
    >
      {/* One run of text, with the untyped remainder present but invisible:
          the lines are broken on the finished title from the first frame, so
          no word moves as the ones before it arrive. The caret takes no width
          for the same reason. */}
      <Title className="preview__title">
        {heading ? (
          <>
            <span className="visually-hidden">{title}</span>
            <span aria-hidden="true">{typed}</span>
          </>
        ) : (
          typed
        )}
      </Title>
      <p className="preview__desc">{heading ? summary : description}</p>
      {showPoster && (
        <div className="preview__media">
          <img className="preview__img" src={poster} alt="" loading="lazy" />
        </div>
      )}
      {cta && <p className="preview__cta">{cta}</p>}
    </div>
  );
}

export default ProjectPreview;
