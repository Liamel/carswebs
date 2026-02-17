export const BODY_TYPE_OPTIONS = [
  "Crossover",
  "Coupe",
  "Hatchback",
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Wagon",
] as const;

const BODY_TYPE_LOOKUP = new Map(BODY_TYPE_OPTIONS.map((type) => [type.toLowerCase(), type]));

export function normalizeBodyTypeInput(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  return BODY_TYPE_LOOKUP.get(normalized) ?? null;
}
