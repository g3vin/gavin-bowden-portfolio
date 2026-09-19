import { useEffect, useId, useRef } from "react";
import DotRipple from "./DotRipple";
import { useSlowImage, useSlowVideo } from "../lib/loading";
import { prefersReducedMotion } from "../lib/media";
import "./ContentBlocks.css";

// A block's declared ratio, e.g. '588 / 1280', read as taller than it is wide.
// Vertical media is phone media, so it is shown as an iPhone screen instead.
const isPortrait = (ratio) => {
  const [width, height] = (ratio || "").split("/").map(Number);
  return Boolean(width && height && width < height);
};

// Landscape media are desktop captures and sit in a Mac window: a title bar
// with the three traffic lights over the picture or the clip.
function Window({ children }) {
  return (
    <div className="window">
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
  const pending = useSlowImage(imgRef, src);
  const portrait = isPortrait(ratio);
  const className =
    fit === "contain" && !portrait
      ? "figure__img figure__img--contain"
      : "figure__img";
  /* A declared ratio is the picture's own, so the box is the shape of the
     picture and filling it crops nothing. Without one the picture is poured
     into the default 16/9 box, which crops whatever overflows — for a tall
     screenshot that means slicing off the top and the bottom. */
  const shape =
    ratio && !portrait && fit !== "contain"
      ? { aspectRatio: ratio, objectFit: "cover" }
      : undefined;

  const frame = (
    <div className="figure__frame">
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
        <div className="phone">{frame}</div>
      ) : (
        <Window>{frame}</Window>
      )}
      {caption && (
        <figcaption className="figure__caption">{caption}</figcaption>
      )}
    </figure>
  );
}

function Video({ src, poster, caption, ratio }) {
  const videoRef = useRef(null);
  const pending = useSlowVideo(videoRef, poster);
  const captionId = useId();
  const portrait = isPortrait(ratio);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // These are silent screen recordings that start themselves as they scroll
    // into view — motion nobody asked for. Under a reduced-motion preference
    // the clip stays on its poster frame until the reader clicks it, which is
    // the whole of what the preference asks for.
    if (prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
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

  // With the native controls gone, the window itself is the play/pause button.
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
        className="figure__video"
        /* A declared ratio is the clip's own, so filling the box crops nothing;
           it only keeps a stale cached file or a sub-pixel rounding from
           showing as a hairline gap inside the rounded frame. */
        style={
          ratio && !portrait
            ? { aspectRatio: ratio, objectFit: "cover" }
            : undefined
        }
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        onClick={toggle}
        /* Focusable and named so the click-to-pause toggle is reachable from
           the keyboard too. The caption is already the text alternative for a
           clip with no narration, so it names the video rather than being
           repeated. */
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
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
    </div>
  );

  return (
    <figure className="figure">
      {/* Landscape clips are desktop recordings and sit in a Mac window; portrait
          ones are phone recordings and take the iPhone screen's own shape. */}
      {portrait ? (
        <div className="phone">{frame}</div>
      ) : (
        <Window>{frame}</Window>
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
