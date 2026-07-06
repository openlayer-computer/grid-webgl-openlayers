import { copyFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..")
const src = join(root, "data", "arrayData.json")
const destDir = join(root, "public", "data")
const dest = join(destDir, "arrayData.json")

if (!existsSync(src)) {
  console.warn("[prepare-demo-data] skip: data/arrayData.json not found")
  process.exit(0)
}

await mkdir(destDir, { recursive: true })
await copyFile(src, dest)
console.log("[prepare-demo-data] copied to public/data/arrayData.json")
