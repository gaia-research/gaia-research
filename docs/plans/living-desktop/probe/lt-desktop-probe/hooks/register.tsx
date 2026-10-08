import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { ProbeState } from '../types'
import { probeSvg } from './svg'

const PANE = 'lt-probe'
const INITIAL: ProbeState = { size: 10_000, redraws: 0, surfaces: '?', version: '?', listing: 'not read yet', skillPrompts: [], presses: 0 }
const probe = atom({ plugin: 'lt-desktop-probe', key: 'probe' } as const, INITIAL)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'lt-probe', description: 'Open the Living Tree desktop paint probe' })
    return next(e)
  })

  on('command.run', { command: 'lt-probe' }, async $ => {
    const surfaces = (await $.session.surfaces()).join(', ')
    const v = await $.session.version()
    await update($, probe, s => ({ ...s, surfaces, version: v.version }))
    await $.ui.open({ id: PANE, title: 'LT probe', columns: 110 })
    return { text: 'Living Tree probe pane opened.' }
  })

  // Observe-only: record which skill was expanded, return the engine's result untouched.
  on('skill.prompt', async ($, e, next) => {
    const result = await next(e)
    await update($, probe, s => ({ ...s, skillPrompts: [...s.skillPrompts, String(e.skill).slice(0, 60)].slice(-8) }))
    return result
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Svg, Client } = $.ui.resolve(e) as any
    const s = await read($, probe)
    const setSize = (size: number) => () => update($, probe, p => ({ ...p, size }))
    const redraw = async () => {
      for (let i = 0; i < 20; i++) {
        await update($, probe, p => ({ ...p, redraws: p.redraws + 1 }))
        await $.clock.sleep(250)
      }
    }
    const readListing = async () => {
      $.ui.toast('lt-probe: listing button pressed')
      await update($, probe, p => ({ ...p, listing: 'reading…' }))
      try {
        const u = await $.session.usage({ breakdown: 'summary' })
        const ctx = u.context as any
        const sk = ctx?.breakdown?.skills
        const text = sk
          ? `${sk.includedSkills}/${sk.totalSkills} listed · sources: ${[...new Set(sk.skillFrontmatter.map((x: any) => x.source))].join(', ')} · first: ${sk.skillFrontmatter.slice(0, 4).map((x: any) => x.name + (x.pluginName ? ' (' + x.pluginName + ')' : '')).join(', ')}`
          : `no skills breakdown (breakdown keys: ${Object.keys(ctx?.breakdown ?? {}).join(', ') || 'none'})`
        await update($, probe, p => ({ ...p, listing: text.slice(0, 600) }))
      } catch (err) {
        await update($, probe, p => ({ ...p, listing: 'error: ' + String(err).slice(0, 300) }))
      }
    }
    return (
      <Box key="root" flexDirection="column" gap={1}>
        <Text>surface {s.surfaces} · engine {s.version} · placement {e.placement ?? 'not reported'} · columns {e.bodyColumns ?? 'not reported'}</Text>
        <Box key="sizes" flexDirection="row" gap={1}>
          <Button key="s10" label="10k" onPress={setSize(10_000)} />
          <Button key="s60" label="60k" onPress={setSize(60_000)} />
          <Button key="s110" label="110k" onPress={setSize(110_000)} />
        </Box>
        <Box key="tests" flexDirection="row" gap={1}>
          <Button key="once" label="Redraw once" onPress={() => update($, probe, p => ({ ...p, redraws: p.redraws + 1 }))} />
          <Button key="redraw" label="Redraw 4×/s" onPress={redraw} />
          <Button key="list2" label="Skill listing" onPress={() => { void readListing() }} />
        </Box>
        <Box key="stage" position="relative">
          <Svg source={probeSvg(s.size, s.redraws)} alt={`Living Tree probe graph, ${s.size} characters`} isInteractive={true} />
          <Box key="hit" position="absolute" top={1} left={1}>
            <Button key="hit-node" label={`overlay · presses ${s.presses}`} onPress={() => update($, probe, p => ({ ...p, presses: p.presses + 1 }))} />
          </Box>
        </Box>
        <Client key="pad" module="./pad.tsx" props={{ label: 'Client pad' }} width={60} />
        <Text>skill listing: {s.listing}</Text>
        <Text>skill.prompt seen: {s.skillPrompts.length ? s.skillPrompts.join(', ') : 'none yet'}</Text>
      </Box>
    )
  })
}
