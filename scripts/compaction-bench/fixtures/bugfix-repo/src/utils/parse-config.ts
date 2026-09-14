export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function splitKey(key: string): string[] {
  // Bug 1: Splitting on all dots naively breaks when dots are inside quoted keys like 'database."my.db.name".user'
  return key.split('.');
}

export function parseConfig(raw: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(raw)) {
    const parts = splitKey(key);
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      // Bug 2: Does not parse array indices like users[0].name
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  return result;
}
