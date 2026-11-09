const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");

// Exercise the actual TS service/helpers with a controlled device storage, without RN native modules.
exports.sourceLoader = function sourceLoader(storage) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const nodeRequire = createRequire(filename);
    const localRequire = (specifier) => {
      if (specifier === "@react-native-async-storage/async-storage")
        return storage;
      if (specifier.startsWith(".")) {
        const target = path.resolve(path.dirname(filename), specifier);
        return load(fs.existsSync(target) ? target : target + ".ts");
      }
      return nodeRequire(specifier);
    };
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    new Function(
      "require",
      "module",
      "exports",
      "__filename",
      "__dirname",
      compiled,
    )(localRequire, module, module.exports, filename, path.dirname(filename));
    return module.exports;
  }
  return load;
};
exports.memoryStorage = function memoryStorage() {
  const values = new Map();
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
  };
};
