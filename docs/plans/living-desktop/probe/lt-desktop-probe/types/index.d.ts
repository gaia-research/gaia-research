export type ProbeState = {
  size: number
  redraws: number
  surfaces: string
  version: string
  listing: string
  skillPrompts: string[]
  presses: number
}

declare module 'claude-code' {
  interface PluginState {
    'lt-desktop-probe': { probe: ProbeState }
  }
}
