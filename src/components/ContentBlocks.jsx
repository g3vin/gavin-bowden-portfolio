import { useEffect, useId, useRef, useState } from "react";
import DotRipple from "./DotRipple";
import { useEdgeFill } from "../lib/edgeFill";
import { useSlowImage, useSlowVideo } from "../lib/loading";
import { prefersReducedMotion } from "../lib/media";
import "./ContentBlocks.css";

// A block's declared ratio, e.g. '588 / 1280', read as taller than it is wide.
// Vertical media is phone media, so it is shown as an iPhone screen instead.
const isPortrait = (ratio) => {
  const [width, height] = (ratio || "").split("/").map(Number);
  return Boolean(width && height && width < height);
};

// What the frame does about its media's arrival, as a class. Nothing at all for
// something that was already decoded when the page came alive: it is on screen,
// and opening the window around it now would only take it away and give it
// back. See ../lib/loading.js for the three states and the arrival block in
// ContentBlocks.css for what they look like.
const arrivalClass = (arrival) => (arrival === "ready" ? "" : ` is-${arrival}`);

// Landscape media are desktop captures and sit in a Mac window: a title bar
// with the three traffic lights over the picture or the clip.
function Window({ className = "", children }) {
  return (
    <div className={`window${className}`}>
      <div className="window__bar" aria-hidden="true">
        <span className="window__light window__light--close" />
        <span className="window__light window__light--min" />
        <span className="window__light window__light--max" />
      </div>
      {children}
    </div>
  );
}

function Figure({ src, alt, caption, fit, ratio }) {
  const imgRef = useRef(null);
  const { pending, arrival } = useSlowImage(imgRef, src);
  const portrait = isPortrait(ratio);
  const opening = arrivalClass(arrival);
  const contained = fit === "contain" && !portrait;
  const className = contained
    ? "figure__img figure__img--contain"
    : "figure__img";
  /* A contained picture keeps its own shape inside the window's 16/9 frame, so
     bars are left over at the sides. They take the picture's own edge colour,
     read off the picture once it lands — see ../lib/edgeFill.js. */
  const fill = useEdgeFill(imgRef, src, contained);
  /* A declared ratio is the picture's own, so the box is the shape of the
     picture and filling it crops nothing. Without one the picture is poured
     into the default 16/9 box, which crops whatever overflows — for a tall
     screenshot that means slicing off the top and the bottom. */
  const shape =
    ratio && !portrait && fit !== "contain"
      ? { aspectRatio: ratio, objectFit: "cover" }
      : undefined;

  const frame = (
    <div
      className="figure__frame"
      style={fill ? { "--edge-fill": fill } : undefined}
    >
      {/* An empty alt is deliberate where a block ships none: the caption below
          already carries the meaning, and repeating it in the alt would have a
          screen reader read the same sentence twice. */}
      <img
        ref={imgRef}
        className={className}
        style={shape}
        src={src}
        alt={alt || ""}
        loading="lazy"
      />
      {pending && <DotRipple className="figure__loading" />}
    </div>
  );

  return (
    <figure className="figure">
      {/* The frame is here so the ripple has a box to sit in — the picture's
          own, since the img carries the aspect ratio. Nothing moves when the
          picture lands: the ripple is laid over a frame that was already the
          right size and is taken away again from on top of it. */}
      {portrait ? (
        <div className={`phone${opening}`}>{frame}</div>
      ) : (
        <Window className={opening}>{frame}</Window>
      )}
      {caption && (
        <figcaption className="figure__caption">{caption}</figcaption>
      )}
    </figure>
  );
}

// Whether this clip is the one filling the screen. Three spellings of the same
// question: the standard one, Safari's prefixed one, and the flag an iPhone
// sets while the system player has the clip.
function isPlayerOpen(video) {
  return (
    document.fullscreenElement === video ||
    document.webkitFullscreenElement === video ||
    Boolean(video.webkitDisplayingFullscreen)
  );
}

// Pressing a clip hands it to the browser's own player, full screen, with the
// native controls and the scrubber. Nothing is rebuilt to do it: the very
// element that was running in the page is the one that fills the screen, still
// playing, so the reader lands on the frame they pressed rather than back at
// the start of the recording.
function openPlayer(video) {
  video.play().catch(() => {});

  // fullscreenEnabled rather than the method: an iPhone carries
  // requestFullscreen on the element and refuses every call to it. Where the
  // document says no, the clip goes to the system player below instead, which
  // is the better answer on a phone anyway.
  const request = document.fullscreenEnabled
    ? video.requestFullscreen
    : document.webkitFullscreenEnabled
      ? video.webkitRequestFullscreen
      : null;

  if (request) {
    // The standard call rejects when the browser declines -- a window already
    // full screen for something else, a gesture gone stale; the prefixed one
    // returns nothing at all.
    request.call(video)?.catch?.(() => {});
    return;
  }

  // iPhone. Its player will not open on a clip that has no metadata yet, and
  // these are preload="none" until something plays them, so one pressed before
  // it has ever run has to be waited for -- the play() above is the fetch.
  const enter = () => video.webkitEnterFullscreen?.();
  if (video.readyState === 0) {
    video.addEventListener("loadedmetadata", enter, { once: true });
  } else {
    enter();
  }
}

function Video({ src, poster, caption, ratio }) {
  const videoRef = useRef(null);
  const { pending, arrival } = useSlowVideo(videoRef, poster);
  const captionId = useId();
  const portrait = isPortrait(ratio);
  const opening = arrivalClass(arrival);
  const sized = Boolean(ratio) && !portrait;
  // null until this has run in a browser, so the prerendered page carries no
  // play badge: with no JavaScript there is nothing behind it to press, and a
  // button that does nothing is worse than a still frame.
  const [playing, setPlaying] = useState(null);
  // The native controls are wanted in the player and nowhere else: on the page
  // the clip is a silent illustration, and a control bar across it is chrome
  // over chrome.
  const [inPlayer, setInPlayer] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Whatever the clip is doing by the time this runs, including a play the
    // browser has already refused.
    setPlaying(!video.paused);

    // These are silent screen recordings that start themselves as they scroll
    // into view — motion nobody asked for. Under a reduced-motion preference
    // the clip stays on its poster frame until the reader presses it, which is
    // the whole of what the preference asks for. The badge above says so.
    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // A clip that is the whole screen is not being scrolled past, whatever
        // the box it left behind in the page now intersects.
        if (isPlayerOpen(video)) return;
        if (entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6, 1] },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Both ends of the trip are watched, because a reader leaves the player by
  // pressing Escape at least as often as by pressing anything in it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sync = () => {
      const showing = isPlayerOpen(video);
      setInPlayer(showing);
      // Back in the page the clip carries on as it was -- except on an iPhone,
      // whose player pauses whatever it hands back, which would leave a clip
      // sitting dead in the middle of the screen.
      if (!showing && !prefersReducedMotion()) video.play().catch(() => {});
    };

    // The first two are the same event twice, prefixed and not; the last two
    // are what an iPhone fires instead, since its player is not the page going
    // full screen at all.
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "webkitbeginfullscreen",
      "webkitendfullscreen",
    ];
    for (const event of events) video.addEventListener(event, sync);
    // Escaping out of full screen reports to the document in some browsers and
    // to the element in others.
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);

    return () => {
      for (const event of events) video.removeEventListener(event, sync);
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const open = () => {
    const video = videoRef.current;
    if (video) openPlayer(video);
  };

  // Space still stops the clip where it is, for a reader who wants the motion
  // to stop rather than to fill the screen with it.
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const frame = (
    <div className="figure__frame">
      <video
        ref={videoRef}
        /* A declared ratio is the clip's own, so filling the box crops nothing;
           it only keeps a stale cached file or a sub-pixel rounding from
           showing as a hairline gap inside the rounded frame. The ratio goes to
           the stylesheet as a custom property rather than being set inline,
           because an inline aspect-ratio outranks every selector and would
           still be squeezing the clip once it filled the screen. */
        className={sized ? "figure__video figure__video--ratio" : "figure__video"}
        style={sized ? { "--ratio": ratio } : undefined}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        controls={inPlayer}
        onClick={open}
        /* The element is the truth about whether it is running: an autoplay the
           browser refused never fires either of these, so the badge stays up. */
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        /* Focusable and named so the player is reachable from the keyboard too.
           The caption is already the text alternative for a clip with no
           narration, so it names the video rather than being repeated. */
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            open();
          } else if (event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
        aria-labelledby={caption ? captionId : undefined}
        aria-label={caption ? undefined : "Project demo clip, no audio"}
      />
      {/* Over the poster while that is still arriving, and again whenever the
          clip runs out of buffer mid-play — the one moment a reader has
          nothing at all to tell them whether anything is still coming. */}
      {pending && <DotRipple className="figure__loading" />}
      {/* Says the still frame is a clip, whenever it is not running: a browser
          that refused the autoplay (a phone in low power mode, a data saver),
          a reader who has asked for less motion and had it stood down for them
          deliberately, or one who simply pressed pause. Decoration only — the
          press it is telling them about is the clip itself, which is already
          focusable and already named. It keeps out of the way while the poster
          is still coming, since there is nothing to play yet. */}
      {playing !== null && (
        <span
          className={`figure__play${playing || pending || arrival === "waiting" ? " is-hidden" : ""}`}
          aria-hidden="true"
        />
      )}
    </div>
  );

  return (
    <figure className="figure">
      {/* Landscape clips are desktop recordings and sit in a Mac window; portrait
          ones are phone recordings and take the iPhone screen's own shape. */}
      {portrait ? (
        <div className={`phone${opening}`}>{frame}</div>
      ) : (
        <Window className={opening}>{frame}</Window>
      )}
      {caption && (
        <figcaption className="figure__caption" id={captionId}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Block({ block }) {
  switch (block.type) {
    case "heading":
      return <h2 className="block__heading">{block.text}</h2>;

    case "text":
      return <p className="block__text">{block.text}</p>;

    case "list":
      return (
        <ul className="block__list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "image":
      return <Figure {...block} />;

    case "gallery":
      return (
        <div className="block__gallery">
          {block.images.map((image) => (
            <Figure key={image.src} {...image} />
          ))}
        </div>
      );

    case "video":
      return <Video {...block} />;

    default:
      return null;
  }
}

function ContentBlocks({ blocks }) {
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

export default ContentBlocks;
