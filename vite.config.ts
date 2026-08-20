import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const repoName = 'text-based-space-sim';

export default defineConfig({
	base: process.env.GITHUB_PAGES === 'true' ? `/${repoName}/` : './',
	plugins: [react(), tailwindcss()],
});
