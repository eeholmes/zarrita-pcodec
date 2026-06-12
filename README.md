# zarrita-pcodec

Optional zarrita-compatible `pcodec` codec extension package.

```ts
import { registry } from "zarrita";
import { registerPCodec } from "@eeholmes/zarrita-pcodec";

registerPCodec(registry);
```

The package exports a default `pcodec` codec class for decoding Zarr chunks
compressed with pcodec, plus a helper for registry setup.

Test code
```
npm install icechunk-js zarrita 
npm install github:eeholmes/zarrita-pcodec
node test.mjs
```

test.mjs
```
import { IcechunkStore } from "icechunk-js";
import { open, registry } from "zarrita";
import { registerPCodec } from "@eeholmes/zarrita-pcodec";

registerPCodec(registry);

const store = await IcechunkStore.open(
  "https://earthmover-icechunk-era5.s3.amazonaws.com/icechunkV2"
);

console.log("Connected to Icechunk store");

// takes a 20 seconds just wait
const arr = await open(store.resolve("/single/spatial/blh"), { kind: "array" });

console.log("Opened /single/blh");
console.log("shape:", arr.shape);
console.log("dtype:", arr.dtype);
console.log("chunks:", arr.chunks);

const chunk = await arr.getChunk([0, 0, 0]);

console.log("Decoded first chunk");
console.log("first 10 values:", Array.from(chunk.data.slice(0, 10)));
```
