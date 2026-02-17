export type TranslationParams = Record<string, string | number>;

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];

    if (value === undefined || value === null) {
      return `{${key}}`;
    }

    return String(value);
  });
}

function resolveMissingTranslation(key: string) {
  if (process.env.NODE_ENV !== "production") {
    return `[missing:${key}]`;
  }

  return key;
}

export function translateFromMessages(
  messages: Record<string, string>,
  key: string,
  params?: TranslationParams,
) {
  const message = messages[key] ?? resolveMissingTranslation(key);

  return interpolate(message, params);
}

export function createTranslator(messages: Record<string, string>) {
  return (key: string, params?: TranslationParams) => translateFromMessages(messages, key, params);
}
