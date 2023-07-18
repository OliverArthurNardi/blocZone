import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: 'src/index.ts',
			name: 'bloczone',
			fileName: () => `index.js`
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true
		})
	]
})
