type PCodecDataType =
  | "float32"
  | "float64"
  | "int8"
  | "uint8"
  | "int16"
  | "uint16"
  | "int32"
  | "uint32"
  | "int64"
  | "uint64";

type PCodecWasmExports = {
  memory: WebAssembly.Memory;
  alloc(len: number): number;
  free_u8_input(ptr: number, len: number): void;
  decompress_f32(ptr: number, len: number, outLenPtr: number): number;
  decompress_f64(ptr: number, len: number, outLenPtr: number): number;
  decompress_i8(ptr: number, len: number, outLenPtr: number): number;
  decompress_u8(ptr: number, len: number, outLenPtr: number): number;
  decompress_i16(ptr: number, len: number, outLenPtr: number): number;
  decompress_u16(ptr: number, len: number, outLenPtr: number): number;
  decompress_i32(ptr: number, len: number, outLenPtr: number): number;
  decompress_u32(ptr: number, len: number, outLenPtr: number): number;
  decompress_i64(ptr: number, len: number, outLenPtr: number): number;
  decompress_u64(ptr: number, len: number, outLenPtr: number): number;
  free_f32(ptr: number, len: number): void;
  free_f64(ptr: number, len: number): void;
  free_i8(ptr: number, len: number): void;
  free_u8(ptr: number, len: number): void;
  free_i16(ptr: number, len: number): void;
  free_u16(ptr: number, len: number): void;
  free_i32(ptr: number, len: number): void;
  free_u32(ptr: number, len: number): void;
  free_i64(ptr: number, len: number): void;
  free_u64(ptr: number, len: number): void;
};

type PCodecFormat = {
  decodeExport: keyof Pick<
    PCodecWasmExports,
    | "decompress_f32"
    | "decompress_f64"
    | "decompress_i8"
    | "decompress_u8"
    | "decompress_i16"
    | "decompress_u16"
    | "decompress_i32"
    | "decompress_u32"
    | "decompress_i64"
    | "decompress_u64"
  >;
  freeExport: keyof Pick<
    PCodecWasmExports,
    | "free_f32"
    | "free_f64"
    | "free_i8"
    | "free_u8"
    | "free_i16"
    | "free_u16"
    | "free_i32"
    | "free_u32"
    | "free_i64"
    | "free_u64"
  >;
  outputType: PCodecDataType;
  arrayType:
    | Float32ArrayConstructor
    | Float64ArrayConstructor
    | Int8ArrayConstructor
    | Uint8ArrayConstructor
    | Int16ArrayConstructor
    | Uint16ArrayConstructor
    | Int32ArrayConstructor
    | Uint32ArrayConstructor
    | BigInt64ArrayConstructor
    | BigUint64ArrayConstructor;
};

export interface PCodecConfig {
  dtype?: string;
  dataType?: string;
  data_type?: string;
  type?: string;
  config?: PCodecConfig;
  configuration?: PCodecConfig;
}

interface PCodecArrayMetadata {
  dtype?: string;
  dataType?: string;
  data_type?: string;
  type?: string;
}

const formats: Record<PCodecDataType, PCodecFormat> = {
  float32: {
    decodeExport: "decompress_f32",
    freeExport: "free_f32",
    outputType: "float32",
    arrayType: Float32Array,
  },
  float64: {
    decodeExport: "decompress_f64",
    freeExport: "free_f64",
    outputType: "float64",
    arrayType: Float64Array,
  },
  int8: {
    decodeExport: "decompress_i8",
    freeExport: "free_i8",
    outputType: "int8",
    arrayType: Int8Array,
  },
  uint8: {
    decodeExport: "decompress_u8",
    freeExport: "free_u8",
    outputType: "uint8",
    arrayType: Uint8Array,
  },
  int16: {
    decodeExport: "decompress_i16",
    freeExport: "free_i16",
    outputType: "int16",
    arrayType: Int16Array,
  },
  uint16: {
    decodeExport: "decompress_u16",
    freeExport: "free_u16",
    outputType: "uint16",
    arrayType: Uint16Array,
  },
  int32: {
    decodeExport: "decompress_i32",
    freeExport: "free_i32",
    outputType: "int32",
    arrayType: Int32Array,
  },
  uint32: {
    decodeExport: "decompress_u32",
    freeExport: "free_u32",
    outputType: "uint32",
    arrayType: Uint32Array,
  },
  int64: {
    decodeExport: "decompress_i64",
    freeExport: "free_i64",
    outputType: "int64",
    arrayType: BigInt64Array,
  },
  uint64: {
    decodeExport: "decompress_u64",
    freeExport: "free_u64",
    outputType: "uint64",
    arrayType: BigUint64Array,
  },
};

let wasmPromise: Promise<PCodecWasmExports> | null = null;

async function loadWasm() {
  if (!wasmPromise) {
    wasmPromise = (async () => {
      const bytes = await readWasmAsset();
      const { instance } = await WebAssembly.instantiate(bytes, {});
      return instance.exports as unknown as PCodecWasmExports;
    })();
  }
  return await wasmPromise;
}

async function readWasmAsset(): Promise<BufferSource> {
  const wasmUrl = new URL("./pcodec.wasm", import.meta.url);
  if (typeof process !== "undefined" && process.versions?.node) {
    const { readFile } = await import("node:fs/promises");
    return await readFile(wasmUrl);
  }
  const response = await fetch(wasmUrl);
  if (!response.ok) {
    throw new Error("failed to load pcodec wasm");
  }
  return await response.arrayBuffer();
}

function normalizeDataType(value: string): PCodecDataType {
  const lowered = value.trim().toLowerCase();
  const lookup: Record<string, PCodecDataType> = {
    float32: "float32",
    f32: "float32",
    "<f4": "float32",
    ">f4": "float32",
    "|f4": "float32",
    float64: "float64",
    f64: "float64",
    "<f8": "float64",
    ">f8": "float64",
    "|f8": "float64",
    int8: "int8",
    i8: "int8",
    "|i1": "int8",
    uint8: "uint8",
    u8: "uint8",
    "|u1": "uint8",
    int16: "int16",
    i16: "int16",
    "<i2": "int16",
    ">i2": "int16",
    uint16: "uint16",
    u16: "uint16",
    "<u2": "uint16",
    ">u2": "uint16",
    int32: "int32",
    i32: "int32",
    "<i4": "int32",
    ">i4": "int32",
    uint32: "uint32",
    u32: "uint32",
    "<u4": "uint32",
    ">u4": "uint32",
    int64: "int64",
    i64: "int64",
    "<i8": "int64",
    ">i8": "int64",
    uint64: "uint64",
    u64: "uint64",
    "<u8": "uint64",
    ">u8": "uint64",
  };
  const normalized = lookup[lowered];
  if (!normalized) {
    throw new Error(`unsupported pcodec dtype: ${value}`);
  }
  return normalized;
}

function resolveDataType(config: PCodecConfig, meta?: PCodecArrayMetadata): PCodecDataType {
  const current = config.dtype ?? config.dataType ?? config.data_type ?? config.type;
  if (current) {
    return normalizeDataType(current);
  }
  if (config.config) {
    return resolveDataType(config.config, meta);
  }
  if (config.configuration) {
    return resolveDataType(config.configuration, meta);
  }
  const fallback = meta?.dtype ?? meta?.dataType ?? meta?.data_type ?? meta?.type;
  if (fallback) {
    return normalizeDataType(fallback);
  }
  throw new Error("pcodec config must include a dtype");
}

function viewCtor(dataType: PCodecDataType) {
  return formats[dataType].arrayType;
}

export default class PCodec {
  static codecId = "pcodec";
  readonly kind = "bytes_to_bytes" as const;

  #dataType: PCodecDataType;

  constructor(config: PCodecConfig, meta?: PCodecArrayMetadata) {
    this.#dataType = resolveDataType(config, meta);
  }

  static fromConfig(config: PCodecConfig, meta?: PCodecArrayMetadata) {
    return new PCodec(config, meta);
  }

  encode(): never {
    throw new Error("encode not implemented");
  }

  async decode(data: Uint8Array): Promise<Uint8Array> {
    const wasm = await loadWasm();
    const format = formats[this.#dataType];
    const inputPtr = wasm.alloc(data.byteLength);
    const outLenPtr = wasm.alloc(4);
    try {
      new Uint8Array(wasm.memory.buffer, inputPtr, data.byteLength).set(data);
      const outputPtr = wasm[format.decodeExport](inputPtr, data.byteLength, outLenPtr);
      const outputLen = new DataView(wasm.memory.buffer).getUint32(outLenPtr, true);
      const typedArray = new (viewCtor(this.#dataType))(
        wasm.memory.buffer,
        outputPtr,
        outputLen
      );
      const bytes = new Uint8Array(
        typedArray.buffer,
        typedArray.byteOffset,
        typedArray.byteLength
      ).slice();
      wasm[format.freeExport](outputPtr, outputLen);
      return bytes;
    } finally {
      wasm.free_u8_input(inputPtr, data.byteLength);
      wasm.free_u8_input(outLenPtr, 4);
    }
  }
}
