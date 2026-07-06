import type { GridMapView } from "../core/GridMapView"
import type { GridLayerVisibility } from "../core/types"

/** 插槽内控制色斑 / 网格 / 标注显隐的 API */
export interface LayerControlApi {
  getVisibility: () => GridLayerVisibility | null
  setLayerVisibility: (visibility: Partial<GridLayerVisibility>) => void
  setShowChoropleth: (visible: boolean) => void
  setShowGrid: (visible: boolean) => void
  setShowLabels: (visible: boolean) => void
  toggleChoropleth: () => void
  toggleGrid: () => void
  toggleLabels: () => void
}

export function createLayerControlApi(overlay: GridMapView | null | undefined): LayerControlApi {
  return {
    getVisibility: () => overlay?.getLayerVisibility() ?? null,
    setLayerVisibility: (v) => overlay?.setLayerVisibility(v),
    setShowChoropleth: (visible) => overlay?.setShowChoropleth(visible),
    setShowGrid: (visible) => overlay?.setShowGrid(visible),
    setShowLabels: (visible) => overlay?.setShowLabels(visible),
    toggleChoropleth: () => {
      if (!overlay) return
      const v = overlay.getLayerVisibility()
      overlay.setShowChoropleth(!v.choropleth)
    },
    toggleGrid: () => {
      if (!overlay) return
      const v = overlay.getLayerVisibility()
      overlay.setShowGrid(!v.grid)
    },
    toggleLabels: () => {
      if (!overlay) return
      const v = overlay.getLayerVisibility()
      overlay.setShowLabels(!v.labels)
    },
  }
}
