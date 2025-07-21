// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Pobierz domyślną konfigurację Expo
const config = getDefaultConfig(__dirname);

// 2. Pobierz aliasy ze swojego tsconfig.json
const { compilerOptions } = require('./tsconfig.json');
const aliases = {};

// 3. Przekonwertuj aliasy z tsconfig na format zrozumiały dla Metro
if (compilerOptions.paths) {
  for (const alias in compilerOptions.paths) {
    const a = alias.replace('/*', '');
    const p = compilerOptions.paths[alias][0].replace('/*', '');
    aliases[a] = path.resolve(__dirname, p);
  }
}

// 4. Ustaw extraNodeModules, aby Metro wiedziało o naszych aliasach
config.resolver.extraNodeModules = new Proxy(aliases, {
  get: (target, name) =>
    // Sprawdź, czy żądany moduł pasuje do aliasu
    name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
});

module.exports = config;