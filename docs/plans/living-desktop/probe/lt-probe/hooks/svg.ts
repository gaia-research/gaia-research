// Builds an allowlisted SVG document of an exact character length.
const HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">'
const STYLE =
  '<style>.n{fill:#38bdf8}.l{font:11px system-ui,sans-serif;fill:#94a3b8}' +
  '@keyframes a{from{opacity:.2}to{opacity:1}}.h{animation:a 1.2s ease-out 1}' +
  '@media (prefers-reduced-motion:reduce){.h{animation:none}}</style>'
const TAIL = '</svg>'

function node(i: number): string {
  const x = 30 + ((i * 61) % 840)
  const y = 30 + ((Math.floor((i * 61) / 840) * 34) % 540)
  return `<g class="h"><title>skill ${i}</title><circle class="n" cx="${x}" cy="${y}" r="8"/><text class="l" x="${x + 11}" y="${y + 4}">skill-${i}</text></g>`
}

export function sized(target: number): string {
  let body = HEAD + STYLE
  let i = 0
  for (;;) {
    const next = node(i)
    if (body.length + next.length + TAIL.length + 32 > target) break
    body += next
    i += 1
  }
  const pad = target - body.length - TAIL.length - '<desc></desc>'.length
  if (pad > 0) body += '<desc>' + 'x'.repeat(pad) + '</desc>'
  return body + TAIL
}
