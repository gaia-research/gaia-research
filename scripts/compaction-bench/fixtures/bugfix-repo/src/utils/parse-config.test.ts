import { describe, it, expect } from 'vitest';
import { parseConfig, splitKey, ConfigError } from './parse-config';

describe('parseConfig', () => {
  it('should parse flat config keys', () => {
    const input = { port: 8080, host: 'localhost' };
    expect(parseConfig(input)).toEqual({ port: 8080, host: 'localhost' });
  });

  it('should handle nested config keys with dot notation', () => {
    const input = {
      'server.host': 'localhost',
      'server.port': 3000,
      'database."my.db.name".user': 'admin',
    };
    expect(parseConfig(input)).toEqual({
      server: { host: 'localhost', port: 3000 },
      database: { 'my.db.name': { user: 'admin' } },
    });
  });

  it('should preserve array indices in paths', () => {
    const input = {
      'users[0].name': 'Alice',
      'users[1].name': 'Bob',
    };
    expect(parseConfig(input)).toEqual({
      users: [{ name: 'Alice' }, { name: 'Bob' }],
    });
  });
});
