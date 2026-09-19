import { BEAR_ROWS, BEAR_WIDTH, BEAR_HEIGHT } from '../assets/bearDots'
import { PROJECT_ROWS } from '../assets/projectDots'
import DotMatrix from './DotMatrix'

// The mark at the top of an item receipt: the project's own logo where it has
// one, and the site's bear where it does not. Both are burned into the bear's grid
// by scripts/generate-dots.py, so the header keeps its height either way.
function ProjectLogo({ slug, className }) {
  return (
    <DotMatrix
      className={className}
      rows={PROJECT_ROWS[slug] ?? BEAR_ROWS}
      width={BEAR_WIDTH}
      height={BEAR_HEIGHT}
    />
  )
}

export default ProjectLogo
