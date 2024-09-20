// rollup.config.js
import svgr from '@svgr/rollup'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/index.js', // Entry point of your library
  output: {
    file: 'dist/index.js',
    format: 'cjs', // CommonJS format, can also use 'esm' or 'umd'
  },
  plugins: [
    postcss({
      modules: true, // Enable CSS Modules
      extensions: ['.css'], // Handle .css files
    }),
    svgr(), // Add SVGR plugin to handle SVG imports as React components
  ],
}