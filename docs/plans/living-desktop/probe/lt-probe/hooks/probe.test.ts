import { describe, expect, test } from 'claude-code/testing'

const PLUGIN = 'lt-probe'
const PANE = { title: 'LT probe', isFocused: false, bodyColumns: 100, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} } as const

async function refused(ui: { drawn: () => Promise<unknown> }): Promise<string | null> {
  try {
    await ui.drawn()
    return null
  } catch (error) {
    return String(error)
  }
}

describe('desktop Pane: interactive Svg graph + native controls + Client', () => {
  for (const [id, size] of [['lt-10k', 10_000], ['lt-110k', 110_000], ['lt-max', 131_072]] as const) {
    test(`${id}: the desktop table accepts an interactive Svg of ${size} characters`, async $ => {
      const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: id, props: PANE })
      expect(await refused(ui)).toBe(null)
      const svg = await ui.find({ type: 'Svg' })
      expect(svg).toBeDefined()
      expect(String(svg?.props.source).length).toBe(size)
      expect(svg?.props.isInteractive).toBe(true)
      await ui.unmount()
    })
  }

  test('lt-over: an Svg of 131,073 characters is refused on desktop', async $ => {
    let why: string | null = null
    try {
      const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'lt-over', props: PANE })
      why = await refused(ui)
      await ui.unmount()
    } catch (error) {
      why = String(error)
    }
    console.log('lt-over refusal:', why)
    expect(why).toContain('longer than 131072 characters')
  })

  test('an absolutely positioned hit-target Button over the Svg is pressable on desktop', async $ => {
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'lt-10k', props: PANE })
    const hit = await ui.find({ type: 'Button', key: 'node-0' })
    expect(hit).toBeDefined()
    const pressed = await ui.press({ key: 'node-0' })
    console.log('press result:', JSON.stringify(pressed))
    await ui.unmount()
  })

  test('a Client on desktop receives pointer events in cells', async $ => {
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'lt-10k', props: PANE })
    await ui.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'pad' } as any)
    const text = await ui.find({ type: 'Text', text: /downs=1/, in: 'pad' } as any)
    console.log('pad after pointer:', text?.text)
    expect(text).toBeDefined()
    await ui.unmount()
  })

  test('terminal: the Svg draws nothing, the native controls remain', async $ => {
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'lt-10k', props: PANE })
    expect(await refused(ui)).toBe(null)
    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect(await ui.find({ type: 'Button', key: 'focus' })).toBeDefined()
    await ui.unmount()
  })
})
