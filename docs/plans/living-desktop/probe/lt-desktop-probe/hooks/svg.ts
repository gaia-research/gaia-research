// Probe SVG sized for a docked pane: its own theme-aware background (the host backs Svg with
// white), larger type, hover + <title> tooltips, a CSS keyframe and a SMIL animate, and two
// media-query readouts. Padding to an exact length is inert, so visuals match at every size.
const TAIL = '</svg>'
function node(i: number): string {
  const x = 50 + (i % 6) * 100
  const y = 130 + Math.floor(i / 6) * 52
  return `<g class="n"><title>skill ${i} — tooltip works</title><circle cx="${x}" cy="${y}" r="11"/><text class="l" x="${x}" y="${y + 28}" text-anchor="middle">skill-${i}</text></g>`
}
export function probeSvg(target: number, tick: number): string {
  let body =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 450">' +
    '<style>' +
    'svg{background:#f4f5f7}.bg{fill:#f4f5f7}.t{font:600 17px system-ui,sans-serif;fill:#1b1e26}.l{font:12px system-ui,sans-serif;fill:#5a6070}' +
    '.n circle{fill:#38bdf8;stroke:#0b7fb8;stroke-width:2;transition:fill .2s}.n:hover circle{fill:#f59e0b}' +
    '.pulse{transform-box:fill-box;transform-origin:center;animation:p 1.6s ease-in-out infinite}' +
    '@keyframes p{0%,100%{transform:scale(1)}50%{transform:scale(1.6)}}' +
    '.rm-on,.cs-dark{display:none}' +
    '@media (prefers-reduced-motion:reduce){.rm-on{display:inline}.rm-off{display:none}.pulse{animation:none}}' +
    '@media (prefers-color-scheme:dark){svg{background:#191b21}.bg{fill:#191b21}.t{fill:#ecebe7}.l{fill:#a3a8b4}.cs-dark{display:inline}.cs-light{display:none}}' +
    '</style>' +
    '<rect class="bg" width="720" height="450"/>' +
    `<text class="t" x="24" y="36">Probe · ${target.toLocaleString('en-US')} chars · redraw ${tick}</text>` +
    '<text class="l" x="24" y="62"><tspan class="rm-off">reduced motion: off</tspan><tspan class="rm-on">reduced motion: on</tspan> · <tspan class="cs-light">scheme: light</tspan><tspan class="cs-dark">scheme: dark</tspan> · hover a dot</text>' +
    '<circle class="pulse" cx="560" cy="32" r="9" fill="#a58ae0"/><text class="l" x="575" y="36">CSS</text>' +
    '<circle cx="560" cy="62" r="9" fill="#e094c8"><animate attributeName="r" values="5;12;5" dur="1.4s" repeatCount="indefinite"/></circle><text class="l" x="575" y="66">SMIL</text>'
  for (let i = 0; i < 30; i++) body += node(i)
  const pad = target - body.length - TAIL.length - '<desc></desc>'.length
  if (pad > 0) body += '<desc>' + 'x'.repeat(pad) + '</desc>'
  return body + TAIL
}
