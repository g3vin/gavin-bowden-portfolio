// Minimal Code 128 (subset B) encoder. Subset B covers ASCII 32-126, which is
// everything a URL needs, so there is no code-set switching to worry about.

// The 107 standard patterns. Each digit is the width, in modules, of an
// alternating element starting with a bar: bar, space, bar, space, ...
const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
]

const START_B = 104
const STOP = 106

// Scanners need clear margins either side or they never find the symbol.
const QUIET_ZONE = 10

/**
 * Encode `text` as Code 128 subset B.
 * Returns black bars as {x, w} in module units, plus the total symbol width,
 * so a caller can drop them straight into an SVG viewBox.
 */
export function encodeCode128(text) {
  const values = [START_B]

  for (const char of text) {
    const code = char.codePointAt(0)
    if (code < 32 || code > 126) {
      throw new Error(`code128: ${JSON.stringify(char)} is outside subset B (ASCII 32-126)`)
    }
    values.push(code - 32)
  }

  // Weighted modulo-103 check digit. The start value carries weight 1, then
  // each payload symbol is weighted by its 1-based position.
  let checksum = START_B
  for (let i = 1; i < values.length; i++) {
    checksum += values[i] * i
  }
  values.push(checksum % 103)
  values.push(STOP)

  const bars = []
  let x = QUIET_ZONE

  for (const value of values) {
    const pattern = PATTERNS[value]
    for (let i = 0; i < pattern.length; i++) {
      const width = Number(pattern[i])
      // Even indexes are bars, odd are spaces.
      if (i % 2 === 0) bars.push({ x, w: width })
      x += width
    }
  }

  return { bars, width: x + QUIET_ZONE }
}
