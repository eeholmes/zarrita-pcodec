export interface CodecRegistryLike {
  set(name: string, factory: () => Promise<unknown>): void;
}

export function registerPCodec(registry: CodecRegistryLike) {
  const factory = () => import("./PCodec.js").then((m) => m.default);

  registry.set("pcodec", factory);
  registry.set("numcodecs.pcodec", factory);
}