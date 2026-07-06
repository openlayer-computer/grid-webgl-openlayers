import { defineConfig } from "vite"
import { resolve } from "node:path"

const workerFile = resolve(
  __dirname,
  "node_modules/grid-webgl-openlayers/dist/assets/gridData.worker-z5TRvtQ2.js",
)

export default defineConfig({
  resolve: {
    alias: {
      "/assets/gridData.worker-z5TRvtQ2.js": workerFile,
    },
  },
  server: {
    port: 5174,
    open: true,
  },
})
