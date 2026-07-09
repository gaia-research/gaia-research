export interface ParsedArgs {
  values: { [key: string]: string };
  flags: { [key: string]: boolean };
  positionals: string[];
}

export function parseArgs(args: string[] = process.argv.slice(2)): ParsedArgs {
  const values: { [key: string]: string } = {};
  const flags: { [key: string]: boolean } = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const cleanKey = arg.slice(2);
      if (cleanKey.includes('=')) {
        const [k, ...v] = cleanKey.split('=');
        values[k] = v.join('=');
      } else {
        // Look ahead
        const next = args[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          values[cleanKey] = next;
          i++; // skip next since it's the value
        } else {
          flags[cleanKey] = true;
        }
      }
    } else {
      positionals.push(arg);
    }
  }

  return { values, flags, positionals };
}

export function requireOption(values: { [key: string]: string }, name: string, usage?: string): string {
  const val = values[name];
  if (val === undefined || val === '') {
    console.error(`Error: Missing required option --${name}`);
    if (usage) {
      console.error(usage);
    }
    process.exit(1);
  }
  return val;
}
