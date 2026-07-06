import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"
import { resolve } from "node:path"

/** GitHub Pages 项目页 base，如 /grid-webgl-openlayers/；本地 dev 为 / */
function pagesBase(): string {
  const raw = process.env.VITE_BASE_PATH ?? "/"
  if (raw === "/") return "/"
  return raw.endsWith("/") ? raw : `${raw}/`
}

export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
      publicDir: false,
      plugins: [
        vue(),
        dts({
          include: ["src/**/*.ts", "src/**/*.vue"],
          exclude: ["src/main.ts"],
          rollupTypes: true,
          insertTypesEntry: true,
        }),
      ],
      build: {
        lib: {
          entry: {
            index: resolve(__dirname, "src/index.ts"),
            vue: resolve(__dirname, "src/vue/index.ts"),
          },
          formats: ["es"],
          fileName: (_format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
          external: (id) => id === "ol" || id.startsWith("ol/") || id === "vue" || id.startsWith("vue/"),
        },
        sourcemap: true,
        emptyOutDir: true,
      },
    }
  }

  if (mode === "demo") {
    return {
      plugins: [vue()],
      base: pagesBase(),
      build: {
        outDir: "dist-demo",
        emptyOutDir: true,
      },
    }
  }

  return {
    plugins: [vue()],
    server: {
      port: 5173,
      open: true,
    },
  }
})
