// One description of what any given URL on this site *is*, used twice: the
// prerender script reads it at build time to write a real <head> into the
// static HTML that scrapers and link unfurlers get, and App.jsx reads the same
// values on client-side navigation so the live document keeps up. Two sources
// would drift, and the one that drifted would be the one crawlers see.

import { projects, projectPath, routeFor } from '../data/projects'

export const SITE_URL = 'https://gavinbowden.me'
export const SITE_HOST = 'gavinbowden.me'
export const AUTHOR = 'Gavin Bowden'
export const TAGLINE = 'I build software and ML systems. Recently at NASA Langley.'

export const PROFILES = {
  github: 'https://github.com/g3vin',
  linkedin: 'https://www.linkedin.com/in/g3vin/',
}

// The link-preview card: the top of the home page receipt, drawn wide by
// scripts/generate-og.py; redraw it if that header changes. Scrapers cache the
// image hard and by URL, so the ?v is how a redraw reaches the chats that have
// already seen the old one -- bump it when the card changes. Absolute, since
// Facebook and Slack will not resolve a relative URL.
const DEFAULT_OG = `${SITE_URL}/og.png?v=2`

const absolute = (path) => (path?.startsWith('http') ? path : `${SITE_URL}${path}`)
const projectUrl = (project) => absolute(projectPath(project.slug))

// A project's poster is almost always an image the writeup also uses, and that
// block already carries alt text written for it. Preferring it keeps the
// link-preview alt a description of the picture rather than a restatement of
// the title.
function posterAlt(project) {
  for (const block of project.blocks) {
    if (block.type === 'image' && block.src === project.poster && block.alt) return block.alt
    if (block.type === 'gallery') {
      const hit = block.images.find((image) => image.src === project.poster && image.alt)
      if (hit) return hit.alt
    }
    if (block.type === 'video' && block.poster === project.poster && block.caption) {
      return block.caption
    }
  }
  return `A screenshot from ${project.title}.`
}

// Descriptions are what Google prints under the title, so they are capped near
// the ~155 characters it will show rather than left to run on.
function truncate(text, max = 155) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).trimEnd()}…`
}

function personLd() {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: AUTHOR,
    url: `${SITE_URL}/`,
    description: TAGLINE,
    jobTitle: 'Software and machine learning engineer',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'VA',
      addressLocality: 'Hampton Roads',
      addressCountry: 'US',
    },
    sameAs: Object.values(PROFILES),
  }
}

function projectLd(project) {
  const source = project.links.find((link) => link.href.includes('github.com'))

  return {
    // A project with published source is source code; one without is a work.
    // Saying SoftwareSourceCode for something with no repository to point at
    // would be a claim the page cannot back up.
    '@type': source ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': `${projectUrl(project)}#project`,
    name: project.title,
    url: projectUrl(project),
    description: project.description,
    dateCreated: project.year,
    author: { '@id': `${SITE_URL}/#person` },
    creator: { '@id': `${SITE_URL}/#person` },
    keywords: project.stack.join(', '),
    ...(project.stack.length ? { programmingLanguage: project.stack } : {}),
    ...(project.poster ? { image: absolute(project.poster) } : {}),
    ...(source ? { codeRepository: source.href } : {}),
  }
}

function homeMeta() {
  return {
    title: `${AUTHOR} — Software & ML Engineer`,
    // The <title> a browser tab and a search result show differ in what they
    // have room for; this is the short one.
    description: `${TAGLINE} Portfolio of ${projects.length} projects across full-stack web, machine learning, and data engineering.`,
    canonical: `${SITE_URL}/`,
    image: DEFAULT_OG,
    imageAlt:
      'A receipt printed in dot-matrix type: a bear, then “Hi, I’m Gavin Bowden — I build software and ML systems. Recently at NASA Langley.”',
    // The 1200x630 card, so the dimension hints in index.html describe it.
    imageIsCard: true,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: `${SITE_URL}/`,
          name: `${AUTHOR} — Portfolio`,
          description: TAGLINE,
          inLanguage: 'en',
          publisher: { '@id': `${SITE_URL}/#person` },
        },
        personLd(),
        {
          '@type': 'ItemList',
          '@id': `${SITE_URL}/#projects`,
          name: 'Projects',
          numberOfItems: projects.length,
          itemListOrder: 'https://schema.org/ItemListUnordered',
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: projectUrl(project),
            name: project.title,
          })),
        },
      ],
    },
  }
}

function projectMeta(project) {
  return {
    title: `${project.title} — ${AUTHOR}`,
    description: truncate(project.description),
    canonical: projectUrl(project),
    image: project.poster ? absolute(project.poster) : DEFAULT_OG,
    imageAlt: project.poster ? posterAlt(project) : `${AUTHOR} — ${project.title}`,
    // A poster is whatever shape the screenshot was. Claiming the card's
    // 1200x630 for it would have an unfurler crop to a box the image is not.
    imageIsCard: !project.poster,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        personLd(),
        projectLd(project),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Projects', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: project.title },
          ],
        },
      ],
    },
  }
}

function notFoundMeta() {
  return {
    title: `Page not found — ${AUTHOR}`,
    description: `That page does not exist on ${SITE_HOST}.`,
    // No canonical: pointing one at the home page would invite a search engine
    // to file this body under "/", and there is no correct URL to name here.
    canonical: null,
    image: DEFAULT_OG,
    imageAlt: 'A receipt printed in dot-matrix type, with a bear at the top.',
    imageIsCard: true,
    type: 'website',
    // Nothing here is worth indexing, and a soft 404 that ranks is worse than
    // one that does not.
    robots: 'noindex, follow',
    jsonLd: null,
  }
}

export function metaFor(path) {
  const route = routeFor(path)
  if (route.page === 'home') return homeMeta()
  if (route.page === 'project') return projectMeta(route.project)
  return notFoundMeta()
}

// Every per-page tag in the <head>, as data: [tag, attributes, text?]. The
// prerender script serialises this list into the static HTML and head.js puts
// the same list into the live document, so the two cannot disagree about which
// tags a page has. Tags that are the same on every page live in index.html.
export function headTags(meta) {
  const tags = [
    ['meta', { name: 'description', content: meta.description }],
    meta.robots && ['meta', { name: 'robots', content: meta.robots }],
    // A page with no canonical (the 404) has no URL to name here either.
    meta.canonical && ['link', { rel: 'canonical', href: meta.canonical }],
    meta.canonical && ['meta', { property: 'og:url', content: meta.canonical }],
    ['meta', { property: 'og:type', content: meta.type }],
    ['meta', { property: 'og:title', content: meta.title }],
    ['meta', { property: 'og:description', content: meta.description }],
    ['meta', { property: 'og:image', content: meta.image }],
    ['meta', { property: 'og:image:alt', content: meta.imageAlt }],
    // Only the 1200x630 card gets dimension hints. A page sharing its own
    // screenshot lets the unfurler measure the file itself rather than crop it
    // to a box it is not.
    ...(meta.imageIsCard
      ? [
          ['meta', { property: 'og:image:type', content: 'image/png' }],
          ['meta', { property: 'og:image:width', content: '1200' }],
          ['meta', { property: 'og:image:height', content: '630' }],
        ]
      : []),
    ['meta', { name: 'twitter:title', content: meta.title }],
    ['meta', { name: 'twitter:description', content: meta.description }],
    ['meta', { name: 'twitter:image', content: meta.image }],
    // Only `<` needs escaping inside a JSON-LD block, and only so that a string
    // containing "</script" cannot close the element early.
    meta.jsonLd && [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c'),
    ],
  ]
  return tags.filter(Boolean)
}

// Every URL the site is willing to be indexed at, for the sitemap.
export function indexableRoutes() {
  return ['/', ...projects.map((project) => projectPath(project.slug))]
}
