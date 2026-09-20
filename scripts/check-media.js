// A Git LFS checkout that forgot its objects leaves 131-byte text pointers
// behind, named .mp4 and served as video/mp4. Nothing fails: the poster still
// loads, the frame still draws, and the clip simply never plays -- on the
// deployed site only, since a local checkout has the real files. This has
// happened once; it is cheap to make it impossible to ship again.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const POINTER = 'version https://git-lfs.github.com/spec/v1'
const MEDIA = /\.(mp4|mov|png|jpg|jpeg|svg|pdf)$/i

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (MEDIA.test(entry.name)) yield path
  }
}

const pointers = []
for (const path of walk('dist')) {
  // A pointer file is a few hundred bytes of ASCII at most.
  if (statSync(path).size > 1024) continue
  if (readFileSync(path, 'latin1').startsWith(POINTER)) pointers.push(path)
}

if (pointers.length) {
  console.error(
    `\nBuild aborted: ${pointers.length} file(s) in dist are Git LFS pointers, not media.\n` +
      pointers.map((p) => `  ${p}`).join('\n') +
      '\n\nRun `git lfs pull` locally, or set `lfs: true` on actions/checkout in CI.\n',
  )
  process.exit(1)
}
