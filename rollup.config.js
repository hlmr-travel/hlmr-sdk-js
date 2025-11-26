const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/umd/hlmr-sdk.js',
      format: 'umd',
      name: 'HlmrSDK',
      sourcemap: true
    },
    {
      file: 'dist/umd/hlmr-sdk.min.js',
      format: 'umd',
      name: 'HlmrSDK',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      outDir: 'dist/umd'
    })
  ],
  external: []
};
