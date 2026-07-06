import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"
import { resolve } from "node:path"

export default defineConfig(({ mode }) => {
  if (mode === "lib") {
    return {
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

  return {
    plugins: [vue()],
    server: {
      port: 5173,
      open: true,
    },
  }
})
