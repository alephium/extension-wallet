import commonjs from '@rollup/plugin-commonjs'
import json from "@rollup/plugin-json";
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import esbuild from 'rollup-plugin-esbuild'
import generateDeclarations from 'rollup-plugin-generate-declarations'
import svelte from 'rollup-plugin-svelte'
import { terser } from 'rollup-plugin-terser'
const { preprocess } = require('./svelte.config')

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      dir: 'dist/',
      sourcemap: !production
    }
  ],
  plugins: [
    del({ targets: 'dist/*' }),

    svelte({
      preprocess,
      emitCss: false,
      compilerOptions: {
        dev: !production
      }
    }),

    resolve({
      browser: true,
      dedupe: ['svelte'],
      preferBuiltins: true
    }),

    commonjs(),
    json(),

    typescript(),

    production &&
      terser({
        compress: {
          drop_console: true
        }
      }),

    esbuild({
      minify: production
    }),
    generateDeclarations()
  ],
  watch: {
    clearScreen: false
  }
}
