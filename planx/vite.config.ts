import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	optimizeDeps: {
		include: ['drizzle-orm'], // force pre-bundling drizzle-orm
	},
	plugins: [sveltekit(), tailwindcss()],

});
