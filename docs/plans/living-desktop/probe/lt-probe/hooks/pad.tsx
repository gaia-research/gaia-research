import type { ClientModule } from 'claude-code'

type S = { x: number; y: number; downs: number }

const Pad: ClientModule<{ label: string }, S> = (props, surface) => {
  const { Text } = surface.elements
  if (surface.state === undefined) {
    surface.onPointer(ev => {
      const prev = surface.state ?? { x: 0, y: 0, downs: 0 }
      surface.setState({ x: ev.x, y: ev.y, downs: prev.downs + (ev.type === 'down' ? 1 : 0) })
    })
  }
  const s = surface.state ?? { x: 0, y: 0, downs: 0 }
  return Text({ children: `${props.label} x=${s.x} y=${s.y} downs=${s.downs}` })
}

export default Pad
