/**
 * lib/pet-sprite.js
 *
 * Adapted from gaia-research/pets/web/pet-sprite.js (private repo).
 * Changes from upstream:
 *   · say() uses innerHTML instead of textContent → supports inline <a> links
 *   · tooltipDuration = 0 disables auto-hide so callers can manage it themselves
 */

const CELL_WIDTH = 192;
const CELL_HEIGHT = 208;

const STATES = {
  idle:            { row: 0, frames: 6, fps: 3 },
  "running-right": { row: 1, frames: 8, fps: 10 },
  "running-left":  { row: 2, frames: 8, fps: 10 },
  waving:          { row: 3, frames: 4, fps: 5 },
  jumping:         { row: 4, frames: 5, fps: 7 },
  failed:          { row: 5, frames: 8, fps: 5 },
  waiting:         { row: 6, frames: 6, fps: 3 },
  running:         { row: 7, frames: 6, fps: 6 },
  review:          { row: 8, frames: 6, fps: 4 },
};

export class WebPet {
  constructor(root, options = {}) {
    if (!root) throw new Error("WebPet requires a mount element");
    if (!options.sheetUrl) throw new Error("WebPet requires options.sheetUrl");

    this.options = {
      scale: 0.65,
      initialState: "idle",
      storageKey: "gaia:web-pet",
      tooltipDuration: 7000,
      trackPointer: true,
      ...options,
    };
    this.root = root;
    this.state = this.options.initialState;
    this.frame = 0;
    this.position = { x: Math.max(16, innerWidth - 176), y: Math.max(72, innerHeight - 208) };
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.drag = null;
    this.pointerFrame = 0;
    this.tooltipTimer = 0;
    this.lastTick = 0;
    this.loopId = 0;

    this.render();
    this.restoreStoredState();
    this.bind();
    this.updatePosition();
    this.setState(this.state);
    this.loopId = requestAnimationFrame((time) => this.tick(time));
  }

  render() {
    this.root.className = "gaia-web-pet";
    this.root.tabIndex = 0;
    this.root.setAttribute("aria-label", "Milim and Gaia page companion. Drag or use arrow keys to move.");
    this.root.style.setProperty("--pet-scale", String(this.options.scale));
    this.root.style.setProperty("--pet-sheet", `url("${this.options.sheetUrl}")`);
    this.root.innerHTML = `
      <div class="gaia-web-pet__bubble" role="status" aria-live="polite" hidden>
        <p class="gaia-web-pet__bubble-text"></p>
        <span class="gaia-web-pet__bubble-tail" aria-hidden="true"></span>
      </div>
      <div class="gaia-web-pet__sprite" aria-hidden="true"></div>
      <div class="gaia-web-pet__controls">
        <button class="gaia-web-pet__size-btn" type="button" aria-label="Resize companion" title="Resize">▅</button>
        <button class="gaia-web-pet__toggle" type="button" aria-label="Minimize page companion">−</button>
      </div>
    `;
    this.sprite  = this.root.querySelector(".gaia-web-pet__sprite");
    this.bubble  = this.root.querySelector(".gaia-web-pet__bubble");
    this.bubbleText = this.root.querySelector(".gaia-web-pet__bubble-text");
    this.toggle  = this.root.querySelector(".gaia-web-pet__toggle");
    this.sizeBtn = this.root.querySelector(".gaia-web-pet__size-btn");
    /** @deprecated use .bubble directly */
    this.tooltip = this.bubble;
  }

  bind() {
    this.onPointerDown = (event) => {
      if (event.target === this.toggle || event.target === this.sizeBtn) return;
      this.drag = { dx: event.clientX - this.position.x, dy: event.clientY - this.position.y };
      this.root.dataset.dragging = "true";
      this.root.setPointerCapture?.(event.pointerId);
    };
    this.onPointerMove = (event) => {
      if (this.drag) {
        const prevX = this.position.x;
        this.position = { x: event.clientX - this.drag.dx, y: event.clientY - this.drag.dy };
        this.clamp();
        this.updatePosition();
        if (!this.reducedMotion) {
          const dx = this.position.x - prevX;
          if (Math.abs(dx) > 2) {
            this.draw(dx > 0 ? STATES["running-right"].row : STATES["running-left"].row, this.frame);
          }
        }
        return;
      }
      if (!this.options.trackPointer || this.reducedMotion || this.pointerFrame) return;
      this.pointerFrame = requestAnimationFrame(() => {
        this.pointerFrame = 0;
        this.lookAt(event.clientX, event.clientY);
      });
    };
    this.onPointerUp = () => {
      if (!this.drag) return;
      this.drag = null;
      this.root.dataset.dragging = "false";
      this.setState(this.state); // snap back to current state
      this.store();
    };
    this.onResize = () => { this.clamp(); this.updatePosition(); };
    this.onKeyDown = (event) => {
      const delta = event.shiftKey ? 24 : 8;
      const moves = {
        ArrowLeft:  [-delta, 0],
        ArrowRight: [ delta, 0],
        ArrowUp:    [0, -delta],
        ArrowDown:  [0,  delta],
      };
      if (!moves[event.key]) return;
      event.preventDefault();
      this.position.x += moves[event.key][0];
      this.position.y += moves[event.key][1];
      this.clamp();
      this.updatePosition();
      this.store();
    };
    this.onVisibility = () => { this.lastTick = performance.now(); };
    this.onToggle = () =>
      this.root.dataset.minimized === "true" ? this.restore() : this.minimize();
    this.onSizeBtn = () => this.cycleSize();

    this.root.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("resize", this.onResize);
    this.root.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.toggle.addEventListener("click", this.onToggle);
    this.sizeBtn.addEventListener("click", this.onSizeBtn);
  }

  setState(name) {
    if (!STATES[name]) throw new Error(`Unknown pet state: ${name}`);
    this.state = name;
    this.frame = 0;
    this.draw(STATES[name].row, 0);
  }

  /** Show a tooltip. `html` may contain safe inline <a> tags (no user input). */
  say(html) {
    clearTimeout(this.tooltipTimer);
    this.bubbleText.innerHTML = html || "";
    this.bubble.hidden = !html;
    if (html && this.options.tooltipDuration > 0) {
      this.tooltipTimer = setTimeout(() => { this.bubble.hidden = true; }, this.options.tooltipDuration);
    }
  }

  hideBubble() {
    this.bubble.hidden = true;
  }

  lookAt(clientX, clientY) {
    if (this.root.dataset.minimized === "true") return;
    const rect = this.root.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < 48) { this.setState("idle"); return; }
    const degrees = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const index = Math.round(degrees / 22.5) % 16;
    this.draw(index < 8 ? 9 : 10, index < 8 ? index : index - 8);
  }

  draw(row, column) {
    this.sprite.style.backgroundPosition = `${-column * CELL_WIDTH}px ${-row * CELL_HEIGHT}px`;
  }

  tick(time) {
    if (!document.hidden && !this.reducedMotion && !this.drag) {
      const config = STATES[this.state];
      if (time - this.lastTick >= 1000 / config.fps) {
        this.frame = (this.frame + 1) % config.frames;
        this.draw(config.row, this.frame);
        this.lastTick = time;
      }
    }
    this.loopId = requestAnimationFrame((next) => this.tick(next));
  }

  cycleSize() {
    const scales = [0.5, 0.65, 0.85];
    const labels = ["▂", "▅", "█"];
    const current = scales.indexOf(this.options.scale);
    const next = (current + 1) % scales.length;
    this.options.scale = scales[next];
    this.root.style.setProperty("--pet-scale", String(scales[next]));
    this.sizeBtn.textContent = labels[next];
    this.sizeBtn.setAttribute("aria-label", `Resize companion (currently ${["small","medium","large"][next]})`);
    this.clamp();
    this.updatePosition();
    this.store();
  }

  minimize() {
    this.root.dataset.minimized = "true";
    this.toggle.textContent = "+";
    this.toggle.setAttribute("aria-label", "Restore page companion");
    this.bubble.hidden = true;
    this.store();
  }

  restore() {
    this.root.dataset.minimized = "false";
    this.toggle.textContent = "−";
    this.toggle.setAttribute("aria-label", "Minimize page companion");
    this.store();
  }

  clamp() {
    const width  = CELL_WIDTH  * this.options.scale;
    const height = CELL_HEIGHT * this.options.scale;
    this.position.x = Math.min(Math.max(8, this.position.x), Math.max(8, innerWidth  - width  - 8));
    this.position.y = Math.min(Math.max(64, this.position.y), Math.max(64, innerHeight - height - 8));
  }

  updatePosition() {
    this.root.style.setProperty("--pet-x", `${this.position.x}px`);
    this.root.style.setProperty("--pet-y", `${this.position.y}px`);
  }

  store() {
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify({
        position: this.position,
        minimized: this.root.dataset.minimized === "true",
        scale: this.options.scale,
      }));
    } catch { /* ignore */ }
  }

  restoreStoredState() {
    try {
      const stored = JSON.parse(localStorage.getItem(this.options.storageKey) || "{}");
      if (stored.position) this.position = stored.position;
      this.clamp();
      if (stored.minimized) this.minimize();
      if (stored.scale) {
        this.options.scale = stored.scale;
        this.root.style.setProperty("--pet-scale", String(stored.scale));
        const scales = [0.5, 0.65, 0.85];
        const labels = ["▂", "▅", "█"];
        const idx = scales.indexOf(stored.scale);
        if (idx >= 0 && this.sizeBtn) {
          this.sizeBtn.textContent = labels[idx];
        }
      }
    } catch {
      this.clamp();
    }
  }

  destroy() {
    cancelAnimationFrame(this.loopId);
    cancelAnimationFrame(this.pointerFrame);
    clearTimeout(this.tooltipTimer);
    this.root.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("resize", this.onResize);
    this.root.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.toggle?.removeEventListener("click", this.onToggle);
    this.sizeBtn?.removeEventListener("click", this.onSizeBtn);
    this.root.replaceChildren();
  }
}
