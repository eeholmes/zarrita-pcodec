# zarrita-pcodec

Optional zarrita-compatible `pcodec` codec extension package.

```ts
import { registry } from "zarrita";
import { registerPCodec } from "@eeholmes/zarrita-pcodec";

registerPCodec(registry);
```

The package exports a default `pcodec` codec class for decoding Zarr chunks
compressed with pcodec, plus a helper for registry setup.
