import type { ClientModule } from 'claude-code'
type S = { x: number; y: number; downs: number; moves: number }
const Pad: ClientModule<{ label: string }, S> = (props, surface) => {
  const { Text } = surface.elements
  if (surface.state === undefined) {
    surface.onPointer(ev => {
      const p = surface.state ?? { x: 0, y: 0, downs: 0, moves: 0 }
      surface.setState({ x: ev.x, y: ev.y, downs: p.downs + (ev.type === 'down' ? 1 : 0), moves: p.moves + (ev.type === 'move' ? 1 : 0) })
    })
  }
  const s = surface.state ?? { x: 0, y: 0, downs: 0, moves: 0 }
  return Text({ children: `${props.label} · drag here · x=${s.x} y=${s.y} downs=${s.downs} moves=${s.moves}` })
}
export default Pad
