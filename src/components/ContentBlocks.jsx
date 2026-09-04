import { useEffect, useRef } from 'react'
import './ContentBlocks.css'

function Figure({ src, alt, caption, fit }) {
  const className = fit === 'contain' ? 'figure__img figure__img--contain' : 'figure__img'

  return (
    <figure className="figure">
      <img className={className} src={src} alt={alt || ''} loading="lazy" />
      {caption && <figcaption className="figure__caption">{caption}</figcaption>}
    </figure>
  )
}

function Video({ src, poster, caption, ratio }) {
  const videoRef = useRef(null)
  const [width, height] = (ratio || '').split('/').map(Number)
  const portrait = width && height && width < height

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: [0, 0.6, 1] }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="figure">
      <video
        ref={videoRef}
        className={portrait ? 'figure__video figure__video--portrait' : 'figure__video'}
        style={ratio ? { aspectRatio: ratio } : undefined}
        src={src}
        poster={poster}
        controls
        muted
        loop
        playsInline
        preload="none"
      />
      {caption && <figcaption className="figure__caption">{caption}</figcaption>}
    </figure>
  )
}

function Block({ block }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="block__heading">{block.text}</h2>

    case 'text':
      return <p className="block__text">{block.text}</p>

    case 'list':
      return (
        <ul className="block__list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )

    case 'image':
      return <Figure {...block} />

    case 'gallery':
      return (
        <div className="block__gallery">
          {block.images.map((image) => (
            <Figure key={image.src} {...image} />
          ))}
        </div>
      )

    case 'video':
      return <Video {...block} />

    default:
      return null
  }
}

function ContentBlocks({ blocks }) {
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}

export default ContentBlocks
