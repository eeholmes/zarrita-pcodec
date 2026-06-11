export interface CodecRegistryLike {
  set(
    name: string,
    factory: () => Promise<unknown>
  ): void;
}

export function registerPCodec(registry: CodecRegistryLike) {
  registry.set("pcodec", () => import("./PCodec").then((m) => m.default));
}
