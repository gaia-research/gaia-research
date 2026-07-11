/*
 * Type definitions for @gaia-research/milim-live2d-model.
 * (c) 2026 Gaia Research, MIT.
 */

export type TexImageSource = HTMLImageElement | ImageBitmap | ImageData | HTMLCanvasElement;

export interface MilimView {
  zoom: number;
  panX: number;
  panY: number;
}

export interface PointerParamMap {
  angleX?: string;
  angleY?: string;
  eyeX?: string;
  eyeY?: string;
}

export interface MilimScene {
  version?: string | number;
  canvas?: { width: number; height: number; x?: number; y?: number; bgEnabled?: boolean; bgColor?: string };
  textures?: Array<{ id: string; source?: string; url?: string; href?: string }>;
  nodes: any[];
  parameters?: Array<{ id: string; name?: string; min: number; max: number; default?: number; bindings?: any[] }>;
  animations?: Array<{ id: string; name?: string; duration: number; fps?: number; tracks?: any[] }>;
  expressions?: Array<{ id: string; name?: string; params?: Record<string, number>; blendShapes?: Record<string, number> }>;
}

export interface CreateMilimStageOptions {
  scene: MilimScene;
  textures?: Map<string, TexImageSource> | Record<string, TexImageSource>;
  autoplay?: boolean;
  transparent?: boolean;
  dpr?: number;
  initialAnimation?: string;
  view?: Partial<MilimView>;
  pointerParams?: PointerParamMap;
}

export interface MilimStage {
  play(): void;
  pause(): void;
  stop(): void;
  seek(ms: number): void;
  setAnimation(idOrName: string): boolean;
  setParam(id: string, value: number): void;
  setExpression(idOrName: string): boolean;
  setPointer(nx: number, ny: number): void;
  setView(v: Partial<MilimView>): void;
  resize(): void;
  render(): void;
  destroy(): void;
  readonly clock: PlaybackClock;
  readonly scene: MilimScene;
}

export function createMilimStage(canvas: HTMLCanvasElement, opts: CreateMilimStageOptions): MilimStage;

export function loadSceneBundle(sceneUrl: string): Promise<{ scene: MilimScene; textures: Map<string, TexImageSource> }>;
export function fetchScene(url: string): Promise<MilimScene>;
export function normalizeScene(scene: MilimScene): MilimScene;
export function loadTextures(scene: MilimScene, baseUrl?: string): Promise<Map<string, TexImageSource>>;
export function loadImage(url: string): Promise<TexImageSource>;

export function resolvePose(scene: MilimScene, clock: PlaybackClock, paramValues: Record<string, number>): Map<string, any> | null;

export class PlaybackClock {
  activeAnimationId: string | null;
  isPlaying: boolean;
  loop: boolean;
  loopKeyframes: boolean;
  speed: number;
  fps: number;
  startFrame: number;
  endFrame: number;
  currentTime: number;
  loopCount: number;
  play(): void;
  pause(): void;
  stop(): void;
  seekTime(ms: number): void;
  seekFrame(frame: number): void;
  switchAnimation(anim: { id: string; fps?: number; duration?: number }): void;
  tick(timestamp: number): boolean;
}

export class ScenePass {
  constructor(gl: WebGL2RenderingContext);
  draw(project: MilimScene, view: MilimView, poseOverrides?: Map<string, any> | null, opts?: { skipResize?: boolean }): void;
  destroy(): void;
}

export const VERSION: string;
