import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..")
const src = join(root, "..", "data", "arrayData.json")
const destDir = join(root, "public", "data")
const dest = join(destDir, "arrayData.json")

if (!existsSync(src)) {
  console.warn("[prepare-data] skip: ../data/arrayData.json not found")
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log("[prepare-data] copied to public/data/arrayData.json")

const workerSrc = join(
  root,
  "node_modules",
  "grid-webgl-openlayers",
  "dist",
  "assets",
  "gridData.worker-z5TRvtQ2.js",
)
const workerDestDir = join(root, "public", "assets")
if (existsSync(workerSrc)) {
  mkdirSync(workerDestDir, { recursive: true })
  cpSync(workerSrc, join(workerDestDir, "gridData.worker-z5TRvtQ2.js"))
  console.log("[prepare-data] copied worker to public/assets/")
}
