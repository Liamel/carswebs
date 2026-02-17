import type { Locale } from "@/lib/i18n/config";

type LocalizedNameFields = {
  name: string;
  nameGeo: string;
  nameEn: string;
  nameRu: string;
};

type LocalizedDescriptionFields = {
  description: string;
  descriptionGeo: string;
  descriptionEn: string;
  descriptionRu: string;
};

function pickLocalizedValue(
  locale: Locale,
  values: { geo: string; en: string; ru: string },
  fallbackValue: string,
) {
  const localized = values[locale].trim();

  if (localized) {
    return localized;
  }

  const geo = values.geo.trim();

  if (geo) {
    return geo;
  }

  return fallbackValue;
}

export function getLocalizedCarName(car: LocalizedNameFields, locale: Locale) {
  return pickLocalizedValue(
    locale,
    {
      geo: car.nameGeo,
      en: car.nameEn,
      ru: car.nameRu,
    },
    car.name,
  );
}

export function getLocalizedCarDescription(car: LocalizedDescriptionFields, locale: Locale) {
  return pickLocalizedValue(
    locale,
    {
      geo: car.descriptionGeo,
      en: car.descriptionEn,
      ru: car.descriptionRu,
    },
    car.description,
  );
}
