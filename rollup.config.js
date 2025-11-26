import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
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
