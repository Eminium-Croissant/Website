const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '../public/locales');
const locales = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());
const fileName = 'common.json';

locales.forEach(locale => {
    const inPath = path.join(localesDir, locale, fileName);
    const outPath = inPath;
    try {
        const raw = fs.readFileSync(inPath, 'utf8');
        const flat = JSON.parse(raw);
        const nested = convert(flat);
        fs.writeFileSync(outPath, JSON.stringify(nested, null, 2), 'utf8');
        console.log('Wrote', outPath);
    } catch (err) {
        console.error(`Error processing ${inPath}:`, err);
    }
});

function setNested(obj, keys, value) {
  const last = keys.pop();
  let cur = obj;
  for (const k of keys) {
    if (!(k in cur) || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[last] = value;
}

function convert(flat) {
  const nested = {};
  for (const key of Object.keys(flat)) {
    const value = flat[key];
    if (key.includes('.')) {
      const parts = key.split('.');
      setNested(nested, parts.slice(), value);
    } else {
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        nested[key] = nested[key] || {};
        Object.assign(nested[key], value);
      } else {
        nested[key] = value;
      }
    }
  }
  return nested;
}

try {
  const raw = fs.readFileSync(inPath, 'utf8');
  const flat = JSON.parse(raw);
  const nested = convert(flat);
  fs.writeFileSync(outPath, JSON.stringify(nested, null, 2), 'utf8');
  console.log('Wrote', outPath);
} catch (err) {
  console.error(err);
  process.exit(1);
}

