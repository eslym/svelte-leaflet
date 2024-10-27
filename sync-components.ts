/// <reference types="bun" />
import { basename } from 'path';

const glob = new Bun.Glob('src/lib/*.svelte');

const pkgJson = await Bun.file('package.json').json();

const components: string[] = [...glob.scanSync('.')].map((f) => basename(f, '.svelte'));

pkgJson.exports = {
	'.': {
		types: './dist/index.d.ts',
		svelte: './dist/index.js'
	}
};

for (const name of components) {
	pkgJson.exports[`./${name}.svelte`] = {
		types: `./dist/${name}.svelte.d.ts`,
		svelte: `./dist/${name}.svelte`
	};
}

await Bun.write('package.json', JSON.stringify(pkgJson, null, 2));
await Bun.$`bunx prettier --write package.json`;

components.sort();

const indexTs = `
${components.map((n) => `import ${n} from './${n}.svelte';`).join('\n')}
export const Leaflet = {${components.join(', ')}};
export { ${components.join(', ')} };
export default Leaflet;
`;

await Bun.write('src/lib/index.ts', indexTs);
await Bun.$`bunx prettier --write src/lib/index.ts`;
