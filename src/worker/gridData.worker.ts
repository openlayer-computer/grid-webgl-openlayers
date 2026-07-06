import {
  type ArrayDataMeta,
  type GridLabel,
  type GridTile,
  computeLabels,
  readWindow,
} from "../data/gridDataCore"
import type { WorkerRequest, WorkerResponse } from "./gridDataWorkerTypes"

let meta: ArrayDataMeta | null = null
let flat: Float32Array | null = null

self.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const msg = ev.data
  try {
    switch (msg.type) {
      case "init": {
        meta = msg.meta
        flat = msg.flat
        const res: WorkerResponse = { id: msg.id, ok: true, type: "init" }
        self.postMessage(res)
        break
      }
      case "readWindow": {
        if (!meta || !flat) throw new Error("worker not initialized")
        const tile = readWindow(flat, meta, msg.extent4326, msg.zoom)
        if (!tile) {
          self.postMessage({ id: msg.id, ok: false, error: "empty window" } satisfies WorkerResponse)
          break
        }
        const res: WorkerResponse = { id: msg.id, ok: true, type: "readWindow", tile }
        self.postMessage(res)
        break
      }
      case "computeLabels": {
        if (!meta || !flat) throw new Error("worker not initialized")
        const labels = computeLabels(
          flat,
          meta,
          msg.extent4326,
          msg.zoom,
          msg.resolution,
          msg.distancePx,
          msg.precision,
          msg.projCode ?? "EPSG:4326",
        )
        const res: WorkerResponse = { id: msg.id, ok: true, type: "computeLabels", labels }
        self.postMessage(res)
        break
      }
    }
  } catch (e) {
    const res: WorkerResponse = { id: msg.id, ok: false, error: String(e) }
    self.postMessage(res)
  }
}
