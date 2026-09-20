import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "./Link";
import BearLogo from "./BearLogo";
import Barcode from "./Barcode";
import ProjectPreview from "./ProjectPreview";
import {
  isInProgress,
  projects,
  projectPath,
  receiptTotals,
} from "../data/projects";
import { sheetStyle } from "../lib/paper";
import { AUTHOR, PROFILES, SITE_HOST, SITE_URL, TAGLINE } from "../lib/seo";
import {
  prefersReducedMotion,
  useMediaQuery,
} from "../lib/media";
import { printedOn } from "../lib/today";
import "../styles/paper.css";
import "./ReceiptIndex.css";

// A profile URL as it reads on paper: no scheme, no www, no trailing slash.
const displayUrl = (href) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

// The hero's buttons, printed as receipt lines. External targets open in a new
// tab the way the old buttons did; mailto stays in place so it hands off to the
// mail client instead of leaving a blank tab behind.
// `note` is what a screen reader hears in place of the visual cue a sighted
// reader gets from the row: where the link goes, and that it will not come back
// to this tab. Announcing that before the click is a WCAG 3.2.5 matter.
const contactLines = [
  {
    label: "Github",
    value: displayUrl(PROFILES.github),
    href: PROFILES.github,
    note: "GitHub profile, opens in a new tab",
  },
  {
    label: "LinkedIn",
    value: displayUrl(PROFILES.linkedin),
    href: PROFILES.linkedin,
    note: "LinkedIn profile, opens in a new tab",
  },
  {
    label: "Résumé",
    value: "resume.pdf",
    href: "/resume.pdf",
    note: "PDF, opens in a new tab",
  },
  {
    label: "Email",
    value: "hello@gavinbowden.me",
    href: "mailto:hello@gavinbowden.me",
    sameTab: true,
    note: "opens your email app",
  },
];

// What a row is called to a screen reader. The in-progress tag is aria-hidden
// in the row, where it would be read mid-name, so it is said here instead.
function rowLabel(project) {
  const status = isInProgress(project) ? ", in progress" : "";
  return `${project.title}${status} — ${project.receipt.impact}`;
}

// Fraction of the viewport height that a line item has to scroll past before it
// becomes the selected one, and the line the settle below parks it on. Set above
// centre so the last few items still reach it before the page runs out of
// scroll. Handed to the stylesheet as --focus-ratio, the way ENTER_DELAY_MS is
// handed over as --preview-in, so the browser's own focus scrolling lands a
// tabbed-to row on this same line without the number being written twice.
const FOCUS_RATIO = 0.42;

// Minimum scroll the last row must own before natural alignment is worth using.
const MIN_TAIL = 80;

// How far ahead of the first row the panel comes out, and how far past the last
// row it stays, measured in row gaps rather than in screens.
//
// It opens before the row reaches the focus line, not when it gets there: the
// receipt's move to the left has to be finished and settled before the first
// project is the thing being read, and opening it on the line put a 0.5s layout
// move in direct competition with project one. That much was always true. What
// was wrong was measuring the lead-in against the viewport -- nine tenths of a
// screen, floored to a token 48px by the header being shorter than that -- when
// what every other project gets is half the gap between two rows. A project in
// the middle of the list is selected from half a gap before its row reaches the
// line until half a gap after, and one gap is all it gets. Against the viewport
// the two ends were getting two and a half times that and nearly twice it, for
// no reason the reader could see: the first project simply sat there while the
// list came up the screen, and the last one hung on into the sign-off.
//
// At half a gap the ends are the middle of the list: the panel opens half a gap
// before row one is on the line, closes half a gap after the last row is, and
// all eight projects own exactly one gap of scroll.
const OPEN_LEAD = 0.5;

// The receipt has to be centred and alone on arrival, so on a tall window that
// already shows the first row the panel still waits for a deliberate scroll.
// Kept small: the printed header above the list is only about 620px, so on an
// ordinary window this floor is what actually decides when the panel opens, and
// a larger one would eat the run-up the slide needs to finish in.
const MIN_OPEN_SCROLL = 48;

// Slack on both thresholds, so a pixel of scroll at a boundary cannot flap the
// panel open and shut.
const OPEN_HYSTERESIS = 48;

// Scroll speed, in pixels per millisecond, past which the page is being
// travelled through rather than read. Reading pace is well under 2 (30px in a
// 16ms frame); a flick lands between 3 and 12. Below OPEN_VELOCITY the reader is
// going slowly enough that opening the panel is answering them; above it a
// flick would haul the receipt aside on the way past, so the panel waits for
// them to stop somewhere. TRACK_VELOCITY is the higher bar at which the
// selection stops chasing rows as well — at 80px a frame no highlight can be
// read, and every change of it remounts the preview.
const OPEN_VELOCITY = 2.2;
const TRACK_VELOCITY = 5;

// Speed is peak-held and decayed by this much per frame rather than taken from
// the last frame alone, so a fling keeps the gate shut while it slows down and
// one stuttery frame cannot read as a stop.
const VELOCITY_DECAY = 0.6;

// A fling ends between scroll events, never during one, so the last word on
// what is selected belongs to a pass that runs once the page has stopped
// moving. It is also where the settle below is decided, against the position
// the reader actually came to rest at.
const SETTLE_MS = 110;

// The settle: once scrolling has stopped, a row that is nearly on the focus line
// is eased the rest of the way onto it, so the list comes to rest in the same
// shape every time rather than wherever the wheel happened to run out.
//
// This used to be the browser's own `scroll-snap-type: y proximity`, and two
// things about it made the ends of the list lurch. Its range is the browser's
// to choose -- around a third of the viewport in Blink -- and it has no idea
// which way the reader was going, so it would just as happily drag them back
// the way they came. The settle answers both: it travels at most SETTLE_RANGE,
// and only ever towards the row the selection has already picked, and only if
// that row lies the way the reader was going. It finishes their movement; it
// never reverses it, and it never carries them on to the next project.
//
// The range is what stops a long approach from being taken over: past it the
// reader meant to be where they are. Mid-list the nearest-row rule usually
// binds first, since half the gap between two rows is less than this; it is at
// the two ends, where the nearest row can be most of a screen away, that this
// is the number doing the work.
const SETTLE_RANGE = 72;

// Under this a move is not worth making: the row already reads as being on the
// line, and a two-pixel scroll only risks a visible twitch.
const SETTLE_EPSILON = 2;

// Scaled with the distance, so a small tidy-up is over quickly and the longest
// move still has room to decelerate. Both are well clear of the ~100ms below
// which a scroll reads as a jump rather than a movement.
const SETTLE_MIN_MS = 220;
const SETTLE_MAX_MS = 400;

// Cubic ease-out: leaves at speed and arrives with none. The reader's own scroll
// has just run out, so this should look like the tail of it rather than a
// separate animation starting from rest.
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

// Net movement a gesture has to add up to before it counts as having gone
// somewhere. Below it the settle stands down rather than guess, which is what
// makes a rubber-band at either end of the page harmless: bouncing off the stop
// travels a good distance and comes all the way back, so it nets out to nothing
// and asks for nothing.
const DIRECTION_MIN = 4;

// How long the receipt owns the page for when the panel opens or closes. Kept in
// step with the transform transition on .receipt-paper in ReceiptIndex.css. The
// settle stands down for the length of it: the slide is the one moment on this
// page that is meant to be watched, and a second movement underneath it on the
// other axis is the sort of thing that reads as the page glitching.
const PANEL_SLIDE_MS = 360;

// When the panel opens, the title waits for the receipt to finish sliding left
// before it starts typing. Also handed to the stylesheet as --preview-in, so the
// card fades in on the same beat. Deliberately shorter than the paper's slide,
// so the card arrives while the receipt is still settling the last of its
// travel rather than after it. Moving between rows once it is open types
// straight away.
const ENTER_DELAY_MS = 300;
const ENTER_MS = 800;

// How long a row that has been asked for keeps the panel while the page travels
// to it. The browser's smooth scroll does not say when it has finished, so the
// lock normally ends the moment the tracking agrees with it — this is only the
// backstop for a scroll that never arrives, because the layout moved under it or
// the page ran out before the row reached the line. Generous on purpose: ending
// it early puts the rows in between back on the panel, which is the whole of
// what it is there to prevent, while overstaying costs nothing — any input at
// all drops it on the spot.
const FOCUS_LOCK_MS = 1200;

// Matches the CSS breakpoint that hides the side panel. Below it the scroll
// tracking stands down and the panel is not rendered, so JS has to know too.
const COMPACT_QUERY = "(max-width: 800px)";

function ReceiptIndex() {
  // Which row is selected. null only before the first row has ever reached the
  // focus line; past the list it keeps its last value, so a closing panel does
  // not lose the project it was printing.
  const [activeIndex, setActiveIndex] = useState(null);
  // Whether the panel is out. Deliberately not derived from activeIndex: it
  // opens earlier and closes sooner than the selection it displays, which is
  // what keeps the receipt's move to the left clear of the reading.
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // The same value where the scroll handler can read it without re-subscribing.
  const panelOpenRef = useRef(false);
  // Whether the panel is still coming out. True the whole time it is closed, so
  // the render that opens it already knows to hold the title for the slide;
  // cleared shortly after, so moving between rows types immediately.
  const [isEntering, setIsEntering] = useState(true);
  // The row the page is currently travelling to, and when to stop waiting for
  // it: { index, until }, or null when nothing has been asked for. Clicking or
  // tabbing a row five projects down scrolls there, and the tracking pass runs
  // on every frame of that scroll — so without this the panel is handed each
  // row on the way past, and the reader watches four titles type themselves
  // before the one they picked. A ref because the scroll handler reads it
  // without wanting to re-subscribe, and writing it must not cost a render.
  const focusLockRef = useRef(null);
  const itemRefs = useRef([]);
  const listRef = useRef(null);

  const isCompact = useMediaQuery(COMPACT_QUERY);

  // The focus line, handed to the stylesheet for scroll-padding-top. Set on the
  // root because that is the scrolling element, and outside the compact gate
  // below because tabbing into a row has to land well whatever the width.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--focus-ratio", FOCUS_RATIO);
    return () => root.style.removeProperty("--focus-ratio");
  }, []);

  useEffect(() => {
    if (!isPanelOpen) return;
    const timer = setTimeout(() => setIsEntering(false), ENTER_MS);
    return () => clearTimeout(timer);
  }, [isPanelOpen]);

  useEffect(() => {
    // When the receipt last started sliding, so the settle can stay off the page
    // until it has arrived.
    let panelMovedAt = -Infinity;

    // Mirrors every write into the ref, so the hysteresis below always compares
    // against the state the reader is actually looking at. Closing re-arms the
    // entrance delay for the next time the panel comes out.
    const setPanelOpen = (next) => {
      if (panelOpenRef.current === next) return;
      panelOpenRef.current = next;
      panelMovedAt = performance.now();
      setIsPanelOpen(next);
      if (!next) setIsEntering(true);
    };

    // Compact layout has no side panel, so there is nothing for scroll to
    // select a project for.
    if (isCompact) {
      setPanelOpen(false);
      return;
    }

    let frame = 0;
    let settle = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let velocity = 0;
    // The running settle's rAF handle, and which way the reader was last
    // travelling: +1 down the page, -1 up it, 0 before they have moved at all.
    let settleFrame = 0;
    let direction = 0;
    // One scroll gesture: where it started, and whether one is in progress.
    // Direction is taken from the whole of it when it ends, not from the last
    // frame of it -- see the settled branch in measure().
    let gestureStartY = window.scrollY;
    let gesturing = false;
    // Whether a pointer is being held down: a scrollbar mid-drag, most likely.
    // The page is theirs until they let go of it.
    let pointerDown = false;
    // Page geometry, measured once and kept until the layout itself moves. None
    // of it changes as the page is scrolled, and reading seven rects plus
    // scrollHeight on every frame forces a layout flush per frame — a cost that
    // shows up only as the page failing to keep up with the wheel.
    let geometry = null;

    const readGeometry = () => {
      const els = itemRefs.current.filter(Boolean);
      const list = listRef.current;
      if (!els.length || !list) return null;

      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      const focusLine = viewport * FOCUS_RATIO;
      const docTop = (el) => el.getBoundingClientRect().top + scrollY;

      // The scroll offset that parks each row on the focus line: what the
      // selection measures distance from, and what the settle aims at.
      const rowYs = els.map((el) => docTop(el) - focusLine);
      const last = rowYs.length - 1;
      // The gap at each end of the list, which is what a project's turn is
      // worth. Taken from the adjacent pair rather than averaged, so a row that
      // wraps to an extra line lends its height to the two turns either side of
      // it the same way it does in the middle. With a single row there is no
      // gap to read and the row's own height stands in for one.
      const firstGap = last > 0 ? rowYs[1] - rowYs[0] : els[0].offsetHeight;
      const lastGap = last > 0 ? rowYs[last] - rowYs[last - 1] : firstGap;

      return {
        count: els.length,
        rowYs,
        // The panel is out from half a gap before the first row reaches the
        // focus line until half a gap after the last one has: the same turn
        // every project in the middle of the list gets. The floor keeps the
        // receipt centred and alone on arrival, so a window tall enough to
        // show the first row already still waits for a deliberate scroll.
        openY: Math.max(rowYs[0] - firstGap * OPEN_LEAD, MIN_OPEN_SCROLL),
        // Measured from the last row, not from the bottom of the list: the list
        // box ends below its last line by that line's full height, and the
        // difference was the last project holding the panel into the sign-off.
        endY: rowYs[last] + lastGap * OPEN_LEAD,
        maxScroll: document.documentElement.scrollHeight - viewport,
      };
    };

    const cancelSettle = () => {
      if (!settleFrame) return;
      cancelAnimationFrame(settleFrame);
      settleFrame = 0;
    };

    // Where to come to rest, given the row the selection has just picked — the
    // nearest one. The settle aims at that row and no other, so the highlight
    // and the panel cannot change while the page is moving under the reader:
    // the stretch of page a row is nearest to is an interval around it, and
    // moving towards the row can only go further inside that interval.
    //
    // Picking the nearest row *ahead* instead was the obvious reading of
    // "finish their movement", and it was wrong. Come to rest 30px past a row
    // and the next one along can still be inside the range, so the page went on
    // to it — which is the reader arriving at one project and being handed the
    // one after it. The settle has to agree with the highlight or it is moving
    // the page to contradict it.
    //
    // Null, so nothing happens at all, in the two cases where a move would not
    // be finishing anything. The row lies behind them: they have already passed
    // it and stopping there was their doing, so it is left where they put it
    // rather than dragged back. Or the row is further off than SETTLE_RANGE, so
    // they meant to stop between projects — and this is what leaves the run-up
    // to the first row and the tail below the last one scrolling freely, since
    // both are long stretches with nothing near.
    const settleTarget = (scrollY, index) => {
      const delta = geometry.rowYs[index] - scrollY;
      if (!direction || Math.sign(delta) !== direction) return null;
      if (Math.abs(delta) > SETTLE_RANGE) return null;
      // Clamped, so a row near either end cannot ask for scroll the page does
      // not have and leave the animation grinding against the stop.
      return Math.max(0, Math.min(geometry.maxScroll, scrollY + delta));
    };

    // Eases the page from where it stopped onto `target`. Driven frame by frame
    // rather than handed to `behavior: "smooth"` so the duration and the curve
    // are ours: the browser's own smooth scroll is tuned for jumping across a
    // document, and over 70px it lands with a snap of its own.
    const settleTo = (target) => {
      const from = window.scrollY;
      const distance = target - from;
      if (Math.abs(distance) < SETTLE_EPSILON) return;

      const duration =
        SETTLE_MIN_MS +
        (SETTLE_MAX_MS - SETTLE_MIN_MS) *
          Math.min(1, Math.abs(distance) / SETTLE_RANGE);
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        window.scrollTo(window.scrollX, from + distance * easeOutCubic(progress));
        settleFrame = progress < 1 ? requestAnimationFrame(step) : 0;
      };
      settleFrame = requestAnimationFrame(step);
    };

    // The selection, filtered through the focus lock. While a row is on its way
    // to the focus line it keeps the panel, whatever the page is passing; the
    // lock is dropped as soon as the tracking picks that row by itself, which is
    // the scroll arriving. Returns false when the lock held, meaning the caller
    // has nothing further to do with this pass: a page already travelling to a
    // row needs no help finishing.
    const select = (index, now) => {
      const lock = focusLockRef.current;
      if (lock && now < lock.until && index !== lock.index) {
        setActiveIndex(lock.index);
        return false;
      }
      focusLockRef.current = null;
      setActiveIndex(index);
      return true;
    };

    // `settled` marks the pass that runs after the page has stopped moving: it
    // ignores the speed gates, so whatever was deferred mid-flick is decided
    // here, against the position the reader actually came to rest at.
    // `allowSettle` marks the one pass a settle may start from -- the end of a
    // scroll. A re-measure after a resize or a font landing runs the same code,
    // and moving the page under a reader who did not touch it would be the
    // rudest thing here.
    const measure = (settled, allowSettle) => {
      frame = 0;
      if (!geometry) geometry = readGeometry();
      if (!geometry) return;

      const scrollY = window.scrollY;
      const now = performance.now();
      const elapsed = now - lastT;
      if (elapsed > 0) {
        velocity = Math.max(
          Math.abs(scrollY - lastY) / elapsed,
          velocity * VELOCITY_DECAY,
        );
      }
      lastY = scrollY;
      lastT = now;
      if (settled) velocity = 0;

      // Which way the reader went, measured across the whole gesture rather
      // than the last frame of it. The difference matters at both ends of the
      // page, where the elastic bounce runs the scroll backwards for a moment
      // as it hits the stop: read frame by frame, a hard flick down to the
      // footer ended up recorded as travelling *up*, and the settle would then
      // crawl the page back onto the last project. Over the gesture the bounce
      // cancels itself out and the flick reads as what it was.
      if (settled && allowSettle) {
        const travelled = scrollY - gestureStartY;
        direction =
          Math.abs(travelled) < DIRECTION_MIN ? 0 : Math.sign(travelled);
        gesturing = false;
      }

      // Both thresholds move outwards while the panel is open, so coming to rest
      // on one cannot leave the receipt flapping between two positions. The
      // opening one needs a floor as well: widened by the full hysteresis it
      // reaches scroll 0, and the receipt would never come back to centre at the
      // top of the page.
      const enterY = panelOpenRef.current
        ? Math.max(geometry.openY - OPEN_HYSTERESIS, MIN_OPEN_SCROLL / 2)
        : geometry.openY;
      const exitY = panelOpenRef.current
        ? geometry.endY + OPEN_HYSTERESIS
        : geometry.endY;
      const inRange = scrollY >= enterY && scrollY <= exitY;

      // Closing is immediate — leaving the list is the reader's own doing — but
      // opening waits for them to slow down. A flick through the whole page
      // should not haul the receipt aside and print a project on the way past;
      // the panel comes out when they stop somewhere in the list, which the
      // settled pass below catches even if they never scrolled slowly at all.
      if (!inRange) setPanelOpen(false);
      else if (velocity <= OPEN_VELOCITY) setPanelOpen(true);

      // Whether every row can reach the focus line under its own steam.
      // Requiring only the last row position <= maxScroll is not enough: right
      // at that boundary the last row reaches the line exactly as the page runs
      // out, leaving it a few pixels of scroll and unreachable in practice.
      const canAlign =
        geometry.rowYs[geometry.count - 1] + MIN_TAIL <= geometry.maxScroll;

      // Past this speed the rows blur by faster than a highlight could be read,
      // and every change of selection remounts the preview. Leave it where it
      // is and let the settled pass put it on the row the page comes to rest by.
      if (velocity > TRACK_VELOCITY) return;

      if (canAlign) {
        // The selection is the row whose position is nearest, which is the rule
        // the settle goes by too — so the row that lights up is always the row
        // the page comes to rest on. Picking the last row past the focus line
        // instead left the two disagreeing either side of every midpoint: let go
        // a little short of a row and the page settled forward onto it while the
        // highlight stayed on the row behind.
        // Above the list this lands on the first project rather than nothing,
        // which is what the panel needs — it opens before the first row is
        // reached, and has to open on the project about to arrive.
        let next = 0;
        let best = Infinity;
        for (let index = 0; index < geometry.count; index += 1) {
          const distance = Math.abs(scrollY - geometry.rowYs[index]);
          if (distance < best) {
            best = distance;
            next = index;
          }
        }
        if (!select(next, now)) return;

        // Four reasons not to touch the page, on top of the two inside
        // settleTarget. Only the end of a scroll may start a settle, and only
        // while the panel is out and still -- lining a row up with the focus
        // line is for the benefit of the panel beside it, so with no panel, or
        // one still sliding, there is nothing to line it up for and the move
        // would be motion for its own sake. A pointer still down is a scrollbar
        // mid-drag, and the page belongs to whoever is holding it. And moving
        // the page on the reader's behalf is the whole of what the
        // reduced-motion preference asks us not to do, so there it simply does
        // not happen; the selection still tracks the nearest row.
        const settleAllowed =
          allowSettle &&
          !pointerDown &&
          panelOpenRef.current &&
          now - panelMovedAt >= PANEL_SLIDE_MS &&
          !prefersReducedMotion();
        if (settleAllowed) {
          const target = settleTarget(scrollY, next);
          if (target !== null) settleTo(target);
        }
        return;
      }

      // On a short page the last rows can never reach the line, so spread the
      // remaining rows across the scroll that is actually left. Costs exact
      // alignment, but every project stays reachable — and there is nothing to
      // settle onto here, since a settle to a row the highlight does not answer
      // to is exactly the disagreement the nearest-row rule exists to remove.
      const startY = geometry.rowYs[0];
      const span = geometry.maxScroll - startY;
      const progress =
        span > 0 ? Math.min(1, Math.max(0, (scrollY - startY) / span)) : 1;
      select(
        Math.min(geometry.count - 1, Math.floor(progress * geometry.count)),
        now,
      );
    };

    const schedule = (settled) => {
      if (settled) {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => measure(true, false));
        return;
      }
      if (!frame) frame = requestAnimationFrame(() => measure(false, false));
    };

    const onScroll = () => {
      // The first scroll after a rest opens a gesture. It starts from the last
      // position that was measured rather than the current one, since by the
      // time this fires the page has already moved. Scrolls the settle itself
      // raises are not a gesture and must not start one.
      if (!settleFrame && !gesturing) {
        gesturing = true;
        gestureStartY = lastY;
      }
      schedule(false);
      // The settle raises scroll events of its own, every frame it runs. Letting
      // those re-arm the timer is what keeps it from firing mid-animation: the
      // deadline is pushed along until the last frame has gone by, and the pass
      // that eventually runs finds the page already on the line and does
      // nothing.
      clearTimeout(settle);
      settle = setTimeout(() => measure(true, true), SETTLE_MS);
    };

    // Any hint of input ends the settle on the spot. It exists to finish the
    // movement the reader just made, never to compete with the next one, and
    // 400ms is long enough for them to have started another. Scroll events are
    // no use for this, since the settle raises them itself; these are the things
    // that cause a scroll rather than the scroll itself. Captured, so nothing in
    // the page can stop one reaching here.
    // The lock goes with it: a reader who reaches for the wheel mid-journey has
    // taken the page back, and the row they asked for a moment ago no longer
    // gets to hold the panel against where they are actually going. Safe to do
    // here even though this fires on the way *into* a lock — the keydown that
    // moves focus, and the pointerdown that precedes a click, both land before
    // the focus event that sets it.
    const onInput = () => {
      cancelSettle();
      focusLockRef.current = null;
    };
    const inputEvents = ["wheel", "touchstart", "pointerdown", "keydown"];

    // A pointer goes down on a scrollbar and the reader may hold it anywhere,
    // including still, for as long as they like. Every one of those pauses looks
    // exactly like the end of a scroll from here, so the settle is held off
    // until they let go. `pointerup` can land anywhere, and a drag that leaves
    // the window ends as a cancel, so both are listened for and neither is
    // scoped to a target.
    const onPointerDown = () => {
      pointerDown = true;
    };
    const onPointerUp = () => {
      pointerDown = false;
    };
    const pointerEvents = ["pointerup", "pointercancel"];

    // Anything that moves the layout invalidates the cache rather than
    // re-measuring in place, so the next frame pays for it once.
    const remeasure = () => {
      geometry = null;
      schedule(true);
    };

    // A resize event covers the window changing; the observer covers the page's
    // own height changing under it — a web font arriving, an image landing.
    // Opening the panel no longer alters
    // layout at all (it is a transform and an opacity now), so this cannot feed
    // back into itself.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);
    if (listRef.current) observer.observe(listRef.current);

    measure(true, false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    for (const type of inputEvents) {
      window.addEventListener(type, onInput, { passive: true, capture: true });
    }
    window.addEventListener("pointerdown", onPointerDown, {
      passive: true,
      capture: true,
    });
    for (const type of pointerEvents) {
      window.addEventListener(type, onPointerUp, {
        passive: true,
        capture: true,
      });
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
      cancelSettle();
      clearTimeout(settle);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      for (const type of inputEvents) {
        window.removeEventListener(type, onInput, { capture: true });
      }
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      for (const type of pointerEvents) {
        window.removeEventListener(type, onPointerUp, { capture: true });
      }
    };
  }, [isCompact]);

  // Tabbing can land on a row the scroll position has not selected, so bring the
  // row to the focus line and let the scroll handler agree with the keyboard.
  const syncToFocus = useCallback((index) => {
    const el = itemRefs.current[index];
    if (!el) return;
    // Straight onto the line, which is the row's own settle position: the
    // selection goes by whichever of those is nearest, so landing on one picks
    // it outright and the settle has nothing left to correct.
    const target = window.innerHeight * FOCUS_RATIO;
    const delta = el.getBoundingClientRect().top - target;
    if (Math.abs(delta) < 4) return;
    // The panel prints the row that was asked for now, and types it once, while
    // the page goes to meet it. Taken before the scroll starts, so the first
    // tracking pass of it already knows whose journey this is.
    focusLockRef.current = { index, until: performance.now() + FOCUS_LOCK_MS };
    setActiveIndex(index);
    // Tabbing still has to bring the row to the line — otherwise the keyboard
    // and the highlight disagree — but for a reader who asked for less motion
    // it arrives there instantly rather than gliding.
    window.scrollBy({
      top: delta,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  // Which project the panel shows. Before any row has been selected that is the
  // first one; afterwards activeIndex keeps its last value, so a closing panel
  // keeps the project it was showing instead of blanking mid-fade.
  const active = projects[activeIndex ?? 0];

  return (
    <section
      className="receipt-section"
      aria-label={`${AUTHOR} — projects and contact`}
    >
      <div
        className={`receipt-section__layout${isPanelOpen ? " is-open" : ""}`}
        style={{ "--preview-in": `${ENTER_DELAY_MS}ms` }}
      >
        <div className="paper receipt-paper">
          <article
            className="sheet receipt"
            style={sheetStyle("receipt-index", 2600)}
          >
            <BearLogo className="slip-mark receipt__logo" />

            <p className="slip-kicker">Hi, I&apos;m</p>
            <h1 className="slip-title receipt__store">{AUTHOR}</h1>
            <p className="receipt__tagline">
              {TAGLINE}
            </p>

            <div className="rule rule--double" aria-hidden="true" />

            <dl className="receipt__meta">
              <div className="slip-row">
                <dt>Status</dt>
                <dd>Open to work</dd>
              </div>
              <div className="slip-row">
                <dt>Location</dt>
                <dd>Hampton Roads, VA</dd>
              </div>
              <div className="slip-row">
                <dt>Onsite</dt>
                <dd>Available</dd>
              </div>
              <div className="slip-row">
                <dt>Auth</dt>
                <dd>US Citizen</dd>
              </div>
              <div className="slip-row">
                <dt>Printed</dt>
                <dd>{printedOn}</dd>
              </div>
            </dl>

            <div className="rule rule--double" aria-hidden="true" />

            {/* The receipt prints its sections as rules, which say nothing to a
                screen reader. These headings give the page the outline its
                layout already has, and let anyone navigating by heading jump
                straight to the contact block or the project list. */}
            <nav aria-labelledby="receipt-contact-heading">
              <h2 id="receipt-contact-heading" className="visually-hidden">
                Contact and profiles
              </h2>
              <ul className="slip-list receipt__contact">
                {contactLines.map((line) => (
                  <li key={line.label}>
                    <a
                      className="slip-row slip-link"
                      href={line.href}
                      /* Named explicitly rather than from the row's text: the
                         sheet prints in caps via text-transform, and Chrome
                         folds that into the computed name, so the row would
                         otherwise reach a screen reader shouting. Starts with
                         the same words that are printed, so voice control can
                         still match what a user reads aloud. */
                      aria-label={`${line.label}: ${line.value}, ${line.note}`}
                      {...(line.sameTab
                        ? {}
                        : { target: "_blank", rel: "noreferrer" })}
                    >
                      <span className="slip-label">{line.label}</span>
                      <span className="slip-link__value">{line.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="rule rule--double" aria-hidden="true" />

            <nav aria-labelledby="receipt-projects-heading">
              <h2 id="receipt-projects-heading" className="visually-hidden">
                Projects
              </h2>
              <ul className="slip-list receipt__items" ref={listRef}>
                {projects.map((project, index) => {
                  return (
                    <li
                      key={project.slug}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                    >
                      {/* A link at every width. Without the side panel there is
                          nothing to preview beside the paper, and the project
                          page prints as its own receipt, so a tap goes straight
                          there. The arrow says so where no panel can. */}
                      <Link
                        className={`slip-press receipt__item${isPanelOpen && index === activeIndex ? " is-active" : ""}`}
                        to={projectPath(project.slug)}
                        aria-label={rowLabel(project)}
                        // The scroll tracking stands down in the compact
                        // layout, so there is no focus line to bring the row to.
                        onFocus={isCompact ? undefined : () => syncToFocus(index)}
                      >
                        <span className="receipt__name">
                          <span aria-hidden="true">{project.receipt.qty}x </span>
                          {project.title}
                          {isInProgress(project) && (
                            <span className="receipt__status" aria-hidden="true">
                              In progress
                            </span>
                          )}
                        </span>
                        {isCompact && (
                          // ASCII, not an arrow glyph: the receipt's Doto subset
                          // has no U+2192, so → would fall back to a system font.
                          <span className="receipt__go" aria-hidden="true">
                            &gt;
                          </span>
                        )}
                        <span className="receipt__sku" aria-hidden="true">
                          (SKU:{project.year})
                        </span>
                        <span className="receipt__impact" aria-hidden="true">
                          {project.receipt.impact}
                        </span>
                        {/* The modifier line under a till-roll item. It earns the
                            row the scroll distance it needs to be readable, and
                            prints something worth reading in it. */}
                        <span className="receipt__stack">
                          {project.stack.slice(0, 3).join(" · ")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="rule rule--double" aria-hidden="true" />

            <h2 className="visually-hidden">Totals</h2>
            <dl className="receipt__totals">
              <div className="slip-row">
                <dt>Subtotal</dt>
                <dd>{receiptTotals.count} projects</dd>
              </div>
              <div className="slip-row">
                <dt>At NASA Langley</dt>
                <dd>{receiptTotals.atLangley}</dd>
              </div>
              <div className="slip-row receipt__grand">
                <dt>Total</dt>
                <dd>
                  {receiptTotals.peopleServed.toLocaleString("en-US")}+ served
                </dd>
              </div>
            </dl>

            <div className="rule rule--double" aria-hidden="true" />

            <div className="receipt__policy">
              <p className="receipt__policy-title">Return policy</p>
              <p>
                Every number above is traceable to the project page it links to.
              </p>
            </div>

            <p className="slip-thanks">Thank you for shopping local!</p>
            <p className="slip-thanks">Available onsite in Hampton Roads</p>

            <Barcode
              className="slip-barcode receipt__barcode"
              value={SITE_URL}
            />
            <p className="slip-code">{SITE_HOST}</p>
          </article>
        </div>

        {/* Not rendered at all in the compact layout, where the CSS hides the
            column anyway: a display:none <img> is still fetched, and this one
            would be spent on the layout phones get — the connection least able
            to afford it. Nothing is lost with it: the panel is aria-hidden
            decoration, and the row itself is the link to the project. */}
        {!isCompact && (
          <div className="receipt-preview" aria-hidden="true">
            <div className="receipt-preview__inner">
              {/* Clickable, but deliberately not focusable: the panel is
                  aria-hidden because it repeats the receipt row, and focusable
                  content inside aria-hidden strands keyboard and screen-reader
                  users on something they cannot perceive. They use the row.
                  Keyed so every change remounts it and the lookup runs again. */}
              <Link
                className="receipt-preview__link"
                to={projectPath(active.slug)}
                tabIndex={-1}
              >
                <ProjectPreview
                  project={active}
                  key={active.slug}
                  active={isPanelOpen}
                  delay={isEntering ? ENTER_DELAY_MS : 0}
                  cta={
                    <>
                      <span className="preview__cta-label">
                        Read the full write-up
                      </span>
                      <span className="preview__cta-arrow">→</span>
                    </>
                  }
                />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ReceiptIndex;
