module.exports = require('@builders/tsup-config')({
  entry: ['src/index.ts', 'src/entrypoints.ts', 'src/*/index.ts'],
  outDir: '.',
  onSuccess: 'rm entrypoints.js',
});
