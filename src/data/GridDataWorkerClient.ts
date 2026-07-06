import type { ArrayDataMeta, GridLabel, GridTile } from "./gridDataCore"
import type { WorkerRequest, WorkerResponse } from "../worker/gridDataWorkerTypes"

export class GridDataWorkerClient {
  private worker: Worker
  private seq = 0
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()

  constructor() {
    this.worker = new Worker(new URL("../worker/gridData.worker.ts", import.meta.url), { type: "module" })
    this.worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data
      const p = this.pending.get(msg.id)
      if (!p) return
      this.pending.delete(msg.id)
      if (!msg.ok) {
        p.reject(new Error(msg.error))
        return
      }
      p.resolve(msg)
    }
    this.worker.onerror = () => {
      this.pending.forEach(({ reject }) => reject(new Error("worker error")))
      this.pending.clear()
    }
  }

  init(meta: ArrayDataMeta, flat: Float32Array): Promise<void> {
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
      this.worker.postMessage({ type: "init", meta, flat, id } as WorkerRequest, [flat.buffer])
    }).then(() => {})
  }

  private call<T>(req: Omit<WorkerRequest, "id">): Promise<T> {
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
      this.worker.postMessage({ ...req, id } as WorkerRequest)
    })
  }

  readWindow(extent4326: number[], zoom: number): Promise<GridTile | null> {
    return this.call<{ type: "readWindow"; tile: GridTile }>({
      type: "readWindow",
      extent4326,
      zoom,
    } as Omit<WorkerRequest, "id">)
      .then((r) => r.tile)
      .catch(() => null)
  }

  computeLabels(
    extent4326: number[],
    zoom: number,
    resolution: number,
    distancePx: number,
    precision: number,
    projCode = "EPSG:4326",
  ): Promise<GridLabel[]> {
    return this.call<{ type: "computeLabels"; labels: GridLabel[] }>({
      type: "computeLabels",
      extent4326,
      zoom,
      resolution,
      distancePx,
      precision,
      projCode,
    } as Omit<WorkerRequest, "id">)
      .then((r) => r.labels)
      .catch(() => [])
  }

  terminate(): void {
    this.worker.terminate()
  }
}
