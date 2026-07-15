/**
 * lib/pet-sprite.d.ts
 * Type declarations for the WebPet sprite engine.
 */

export interface WebPetOptions {
  sheetUrl: string;
  scale?: number;
  initialState?: string;
  storageKey?: string;
  tooltipDuration?: number;
  trackPointer?: boolean;
}

export class WebPet {
  constructor(root: HTMLElement, options: WebPetOptions);
  state: string;
  frame: number;
  position: { x: number; y: number };
  reducedMotion: boolean;
  root: HTMLElement;
  sprite: HTMLElement;
  bubble: HTMLElement;
  bubbleText: HTMLElement;
  toggle: HTMLButtonElement;
  sizeBtn: HTMLButtonElement;
  /** @deprecated use .bubble */
  tooltip: HTMLElement;
  options: Required<WebPetOptions>;
  tooltipTimer: ReturnType<typeof setTimeout>;
  setState(name: string): void;
  say(html: string): void;
  hideBubble(): void;
  lookAt(clientX: number, clientY: number): void;
  draw(row: number, column: number): void;
  tick(time: number): void;
  cycleSize(): void;
  minimize(): void;
  restore(): void;
  clamp(): void;
  updatePosition(): void;
  store(): void;
  restoreStoredState(): void;
  destroy(): void;
}
