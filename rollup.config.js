import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import fs from 'fs';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// Inline what used to be separated out as "public/build/bundle.css"
			css: true,
			preprocess: sveltePreprocess(),
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		html({
			pathToTemplateFile: "src/static/template.html",
			replacementPattern: `<script>/* __REPLACE_ME_WITH_INLINED_JS_BUNDLE__ */</script>`,
			replacement: production ? "inline" : `<script src="build/bundle.js"></script>`,
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),
	],
	watch: {
		clearScreen: false
	}
};

function html(options){
	const {
		output = "index.html",
		pathToTemplateFile,
		replacementPattern,
		replacement
	} = options;

	return {
		name: 'rollup-plugin-html-inliner',
		async generateBundle(opts, bundle) {
			const splits = fs.readFileSync(pathToTemplateFile, 'utf-8').split(replacementPattern);
			const source = [
				splits[0],
				replacement === "inline" ? 
					`<script>${bundle[path.parse(opts.file).base].code}</script>` : 
					replacement,
				splits[1],
			].join("");

			this.emitFile({
				type: 'asset',
				source,
				name: 'Rollup HTML Asset',
				fileName: output,
			});
		}
	}
}
