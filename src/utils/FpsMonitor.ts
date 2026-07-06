import type Map from "ol/Map"

/**
 * 统计 OpenLayers 地图渲染帧率（postrender 次数/秒 + 相邻帧间隔）
 */
export class FpsMonitor {
  private el: HTMLElement
  private frameCount = 0
  private lastReport = performance.now()
  private lastPostRender = 0
  private lastFrameMs = 0

  constructor(el: HTMLElement) {
    this.el = el
    this.el.textContent = "-- FPS"
  }

  attachMap(map: Map): void {
    map.on("postrender", () => {
      const now = performance.now()
      if (this.lastPostRender > 0) {
        this.lastFrameMs = now - this.lastPostRender
      }
      this.lastPostRender = now
      this.frameCount++

      if (now - this.lastReport >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastReport))
        this.el.textContent = `${fps} FPS · ${this.lastFrameMs.toFixed(1)} ms`
        this.el.dataset.level = fps >= 50 ? "good" : fps >= 30 ? "ok" : "low"
        this.frameCount = 0
        this.lastReport = now
      }
    })

    setInterval(() => {
      if (performance.now() - this.lastReport >= 1000) {
        this.el.textContent = "0 FPS · -- ms"
        this.el.dataset.level = "idle"
        this.frameCount = 0
        this.lastReport = performance.now()
        this.lastPostRender = 0
      }
    }, 1000)
  }
}
