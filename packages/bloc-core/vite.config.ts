import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@bloczone/core',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].[format].js',
        chunkFileNames: '[name].[format].js',
        assetFileNames: '[name].[ext]',
        format: 'es'
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
