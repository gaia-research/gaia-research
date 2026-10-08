import type { Register } from 'claude-code'
import { sized } from './svg'

const SIZES: Record<string, number> = { 'lt-10k': 10_000, 'lt-110k': 110_000, 'lt-max': 131_072, 'lt-over': 131_073 }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'lt-probe', description: 'Open the throwaway Living Tree probe pane' })
    return next(e)
  })

  on('command.run', { command: 'lt-probe' }, async $ => {
    await $.ui.open({ id: 'lt-110k', title: 'LT probe' })
    return { text: 'Probe pane opened.' }
  })

  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    const size = SIZES[e.requestId]
    if (size === undefined) return next(e)
    const { Box, Text, Button, Svg, Client } = $.ui.resolve(e) as any
    return (
      <Box key="root" flexDirection="column">
        <Text>probe {e.requestId}</Text>
        <Box key="stage" position="relative">
          <Svg source={sized(size)} alt={`probe graph, ${size} characters`} isInteractive={true} />
          <Box key="hit" position="absolute" top={1} left={2}>
            <Button key="node-0" label="node 0" plain={true} onPress={() => {}} />
          </Box>
        </Box>
        <Box key="rail" flexDirection="row" gap={1}>
          <Button key="focus" label="Focus" hotkey="f" onPress={() => {}} />
          <Button key="live" label="Live layer" hotkey="l" onPress={() => {}} />
        </Box>
        <Client key="pad" module="./pad.tsx" props={{ label: 'pad' }} width={24} />
      </Box>
    )
  })
}
