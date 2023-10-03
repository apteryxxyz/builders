/** @type {import('prettier').Config} */
module.exports = {
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  tailwindConfig: './apps/website/tailwind.config.js',
  singleQuote: true,
  endOfLine: 'lf',
};
