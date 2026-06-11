import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import PCodec from "../dist/PCodec.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, "fixtures", "pcodec-int32.bin");

test("decodes pcodec int32 chunks", async () => {
  const bytes = new Uint8Array(await readFile(fixture));
  const codec = PCodec.fromConfig({ dtype: "int32" });
  const decoded = await codec.decode(bytes);
  assert.equal(decoded.byteLength, 32);
  assert.deepEqual(Array.from(new Int32Array(decoded.buffer)), [
    3,
    1,
    4,
    1,
    5,
    9,
    2,
    6,
  ]);
});

test("encode throws", () => {
  const codec = PCodec.fromConfig({ dtype: "int32" });
  assert.throws(() => codec.encode(), /encode not implemented/);
});
