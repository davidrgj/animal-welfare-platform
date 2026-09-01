const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';
if (!url || !key) process.exit(0);

const directory = path.join(__dirname, '..', 'src', 'environments');
const body = (production) =>
  `export const environment = {\n  production: ${production},\n  supabaseUrl: ${JSON.stringify(url)},\n  supabaseAnonKey: ${JSON.stringify(key)}\n};\n`;

fs.writeFileSync(path.join(directory, 'environment.ts'), body(false));
fs.writeFileSync(path.join(directory, 'environment.prod.ts'), body(true));
