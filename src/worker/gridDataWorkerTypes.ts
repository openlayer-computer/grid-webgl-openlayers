import type { ArrayDataMeta, GridLabel, GridTile } from "../data/gridDataCore"

export type WorkerRequest =
  | { id: number; type: "init"; meta: ArrayDataMeta; flat: Float32Array }
  | { id: number; type: "readWindow"; extent4326: number[]; zoom: number }
  | {
      id: number
      type: "computeLabels"
      extent4326: number[]
      zoom: number
      resolution: number
      distancePx: number
      precision: number
      projCode?: string
    }

export type WorkerResponse =
  | { id: number; ok: true; type: "init" }
  | { id: number; ok: true; type: "readWindow"; tile: GridTile }
  | { id: number; ok: true; type: "computeLabels"; labels: GridLabel[] }
  | { id: number; ok: false; error: string }
