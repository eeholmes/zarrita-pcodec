export interface CodecRegistryLike {
  set(name: string, factory: () => Promise<unknown>): void;
}

export function registerPCodec(registry: CodecRegistryLike) {
  const factory = () => import("./PCodec").then((m) => m.default);

  registry.set("pcodec", factory);
  registry.set("numcodecs.pcodec", factory);
}