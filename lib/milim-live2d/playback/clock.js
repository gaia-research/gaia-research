/*
 * PlaybackClock — vanilla reimplementation of Stretchy Studio's animationStore
 * playback tick (src/store/animationStore.js), Copyright (c) 2026 Nguyen Phan, MIT.
 * Reimplemented without zustand for milim-live2d-model, (c) 2026 Gaia Research.
 * See NOTICE at repo root.
 *
 * Holds only playback state (time/loop/fps/range) — the scene is a plain object
 * owned by the stage. tick(timestamp) advances currentTime and returns whether
 * time moved (i.e. the frame needs a redraw).
 */
export class PlaybackClock {
  constructor() {
    this.activeAnimationId = null;
    this.isPlaying = false;
    this.loop = true;
    this.loopKeyframes = false;
    this.speed = 1;
    this.fps = 30;
    this.startFrame = 0;
    this.endFrame = 0;
    this.currentTime = 0; // ms
    this.loopCount = 0;
    this._lastTimestamp = null;
  }

  play() {
    this.isPlaying = true;
    this._lastTimestamp = null;
  }

  pause() {
    this.isPlaying = false;
    this._lastTimestamp = null;
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = (this.startFrame / this.fps) * 1000;
    this._lastTimestamp = null;
    this.loopCount = 0;
  }

  seekTime(ms) {
    this.currentTime = ms;
    this._lastTimestamp = null;
    this.loopCount = 0;
  }

  seekFrame(frame) {
    this.seekTime((frame / this.fps) * 1000);
  }

  /** Switch to a clip and reset playback range from its duration/fps. */
  switchAnimation(anim) {
    if (!anim) return;
    this.activeAnimationId = anim.id;
    this.fps = anim.fps || 30;
    this.startFrame = 0;
    this.endFrame = Math.round(((anim.duration || 0) / 1000) * this.fps);
    this.currentTime = 0;
    this.loopCount = 0;
    this._lastTimestamp = null;
  }

  /** Advance time. Returns true if time moved (redraw needed). */
  tick(timestamp) {
    if (!this.isPlaying) return false;
    if (this._lastTimestamp === null) {
      this._lastTimestamp = timestamp;
      return false;
    }
    const deltaMs = (timestamp - this._lastTimestamp) * this.speed;
    const startMs = (this.startFrame / this.fps) * 1000;
    const endMs = (this.endFrame / this.fps) * 1000;
    const rangeMs = endMs - startMs;
    if (rangeMs <= 0 || deltaMs <= 0) {
      this._lastTimestamp = timestamp;
      return false;
    }
    let newTime = this.currentTime + deltaMs;
    if (newTime >= endMs) {
      if (this.loop) {
        newTime = startMs + ((newTime - startMs) % rangeMs);
        this.loopCount += 1;
      } else {
        this.isPlaying = false;
        this.currentTime = endMs;
        this._lastTimestamp = null;
        return true;
      }
    }
    this.currentTime = newTime;
    this._lastTimestamp = timestamp;
    return true;
  }
}
