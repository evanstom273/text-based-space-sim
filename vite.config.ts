import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const repoName = 'text-based-space-sim';
const buildId = process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev';

function injectBuildMeta(): Plugin {
	return {
		name: 'inject-build-meta',
		transformIndexHtml(html) {
			return html.replace(
				/(<meta name="build-id" content=")[^"]*(" \/>)/,
				`$1${buildId}$2`,
			);
		},
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'version.json',
				source: JSON.stringify({ buildId }, null, 2),
			});
		},
	};
}

export default defineConfig({
	base: process.env.GITHUB_PAGES === 'true' ? `/${repoName}/` : './',
	plugins: [react(), tailwindcss(), injectBuildMeta()],
	define: {
		__BUILD_ID__: JSON.stringify(buildId),
	},
});
