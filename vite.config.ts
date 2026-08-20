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
				'<head>',
				`<head>
		<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
		<meta http-equiv="Pragma" content="no-cache" />
		<meta name="build-id" content="${buildId}" />`,
			);
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
