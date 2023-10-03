const { defineConfig } = require('tsup');
const {
  esbuildPluginVersionInjector,
} = require('esbuild-plugin-version-injector');

/**
 * @param {import('tsup').Options} options
 */
module.exports = function createTsupConfig({
  entry = ['src/index.ts'],
  external = [],
  noExternal = [],
  platform = 'node',
  format = ['cjs'],
  target = 'es2022',
  skipNodeModulesBundle = true,
  clean = false,
  shims = format.includes('cjs'),
  cjsInterop = format.includes('cjs'),
  minify = false,
  terserOptions = {
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
  },
  splitting = false,
  keepNames = true,
  dts = true,
  sourcemap = false,
  esbuildPlugins = [esbuildPluginVersionInjector()],
  treeshake = false,
  ...rest
} = {}) {
  return defineConfig({
    entry,
    external,
    noExternal,
    platform,
    format,
    skipNodeModulesBundle,
    target,
    clean,
    shims,
    cjsInterop,
    minify,
    terserOptions,
    splitting,
    keepNames,
    dts,
    sourcemap,
    esbuildPlugins,
    treeshake,
    ...rest,
  });
};
