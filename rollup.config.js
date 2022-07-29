import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const build = process.env.BUILD || 'development';
const prod = build === "production";

const basePlugins = (module, target) => ([
  commonjs(),
  nodeResolve(),
  alias({
    resolve: ['.js', '.ts'],
  }),
  typescript({
    abortOnError: false,
    typescript: require('typescript'),
    tsconfigOverride: {
      compilerOptions: {
        module,
        target,
      },
    },
  })
]);

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cod.js',
        format: 'umd',
        name: 'cod',
      }
    ],
    plugins: basePlugins('esnext', 'es5')
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cod.es.js',
        format: 'es',
        name: 'cod',
      }
    ],
    plugins: basePlugins('esnext', 'esnext')
  },
  {
    input: 'src/cli.ts',
    output: [
      {
        file: 'dist/cli.js',
        format: 'cjs',
      }
    ],
    plugins: basePlugins('esnext', 'es5')
  }
]