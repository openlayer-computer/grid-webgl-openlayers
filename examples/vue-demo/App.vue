<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue"
import Map from "ol/Map"
import View from "ol/View"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import { GredGridMap, GredLegendPanel } from "grid-webgl-openlayers/vue"
import type { GridMapView } from "grid-webgl-openlayers"
import type { GridMapPointerEvent } from "grid-webgl-openlayers"
import "ol/ol.css"

const mapEl = ref<HTMLElement | null>(null)
const map = shallowRef<Map | null>(null)
const overlay = shallowRef<GridMapView | null>(null)
const info = ref("加载中…")

onMounted(() => {
  if (!mapEl.value) return
  map.value = new Map({
    target: mapEl.value,
    view: new View({ projection: "EPSG:4326", center: [105, 30], zoom: 6 }),
    layers: [new TileLayer({ source: new OSM() })],
  })
})

onBeforeUnmount(() => {
  map.value?.setTarget(undefined)
  map.value = null
})

function onReady(view: GridMapView) {
  overlay.value = view
}

function onPointerMove(ev: GridMapPointerEvent) {
  if (ev.value != null) {
    info.value = `值: ${ev.value.toFixed(1)} | LOD: ${ev.lod}×`
  }
}
</script>

<template>
  <div class="page">
    <aside class="panel">
      <h1>Vue 叠加示例</h1>
      <p>{{ info }}</p>
    </aside>
    <div class="map-wrap">
      <div ref="mapEl" class="map" />
      <GredLegendPanel
        v-if="overlay"
        :overlay="overlay"
        legend-mode="blocks"
        title="格点值"
        placement="bottom-right"
      >
        <template #controls="{ layer }">
          <button type="button" @click="layer.toggleChoropleth()">色斑图</button>
          <button type="button" @click="layer.toggleGrid()">网格线</button>
          <button type="button" @click="layer.toggleLabels()">格点数值</button>
        </template>
      </GredLegendPanel>
    </div>
    <GredGridMap
      v-if="map"
      :map="map"
      data-url="/data/arrayData.json"
      :show-grid="false"
      @ready="onReady"
      @pointermove="onPointerMove"
    />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  width: 100vw;
  height: 100vh;
}
.panel {
  width: 280px;
  padding: 16px;
  background: #f5f5f5;
  font: 13px/1.5 system-ui, sans-serif;
}
.map-wrap {
  flex: 1;
  position: relative;
}
.map {
  width: 100%;
  height: 100%;
}
button {
  font: 11px system-ui;
  padding: 3px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
</style>
