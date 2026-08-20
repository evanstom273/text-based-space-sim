import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = 'text-based-space-sim';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const base = isGitHubPages ? `/${repoName}/` : './';
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
	base,
	plugins: [
		react(),
		tailwindcss(),
		injectBuildMeta(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg'],
			manifest: {
				name: 'Union Terminal — Starship Command',
				short_name: 'Union Terminal',
				description: 'Planetary Union command terminal — starship operations',
				theme_color: '#202020',
				background_color: '#202020',
				display: 'standalone',
				orientation: 'any',
				start_url: base,
				scope: base,
				id: base,
				icons: [
					{
						src: 'favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any',
					},
					{
						src: 'favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				navigateFallback: isGitHubPages ? `${repoName}/index.html` : 'index.html',
				globPatterns: ['**/*.{js,css,html,ico,svg,json,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'union-terminal-fonts-stylesheets',
							expiration: {
								maxEntries: 8,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'union-terminal-fonts-webfonts',
							expiration: {
								maxEntries: 16,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
				],
			},
			devOptions: {
				enabled: false,
			},
		}),
	],
	define: {
		__BUILD_ID__: JSON.stringify(buildId),
	},
});
