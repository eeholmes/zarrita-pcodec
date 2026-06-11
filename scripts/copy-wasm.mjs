import { mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const source = join(root, "src", "pcodec.wasm");
const targetDir = join(root, "dist");
const target = join(targetDir, "pcodec.wasm");

await mkdir(targetDir, { recursive: true });
await copyFile(source, target);
