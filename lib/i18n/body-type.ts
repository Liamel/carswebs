const BODY_TYPE_TRANSLATION_KEY_MAP: Record<string, string> = {
  crossover: "vehicleType.crossover",
  coupe: "vehicleType.coupe",
  hatchback: "vehicleType.hatchback",
  sedan: "vehicleType.sedan",
  suv: "vehicleType.suv",
  truck: "vehicleType.truck",
  van: "vehicleType.van",
  wagon: "vehicleType.wagon",
};

export function getBodyTypeTranslationKey(bodyType: string) {
  const normalizedBodyType = bodyType.trim().toLowerCase();
  return BODY_TYPE_TRANSLATION_KEY_MAP[normalizedBodyType] ?? null;
}
