import { loadRegistry, loadRegistryItem } from '@shadcn/registry';
import { withCustomConfig } from 'react-docgen-typescript';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { loader } from 'fumadocs-core/source';

export const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

export async function readCatalog(root = repositoryRoot) {
  const registry = await loadRegistry({ cwd: root });
  const names = new Set<string>();
  for (const item of registry.items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name))
      throw new Error(`Invalid component slug: ${item.name}`);
    if (names.has(item.name))
      throw new Error(`Duplicate registry item: ${item.name}`);
    names.add(item.name);
  }
  return registry;
}

export async function readComponent(name: string, root = repositoryRoot) {
  const item = await loadRegistryItem(name, { cwd: root });
  return { ...item, files: item.files ?? [] };
}

export function registryPlugin(): Plugin {
  const catalogId = '\0virtual:registry';
  const detailPrefix = '\0virtual:registry/';
  const parser = withCustomConfig(
    resolve(repositoryRoot, 'web/tsconfig.json'),
    {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
    },
  );
  return {
    name: '0ui-registry',
    resolveId(id) {
      if (id === 'virtual:registry') return catalogId;
      if (id.startsWith('virtual:registry/')) return `\0${id}`;
    },
    async load(id) {
      if (id === catalogId) {
        const catalog = await readCatalog();
        this.addWatchFile(resolve(repositoryRoot, 'registry.json'));
        const source = loader({
          baseUrl: '/components',
          source: {
            files: catalog.items
              .filter((item) =>
                [
                  'registry:ui',
                  'registry:component',
                  'registry:block',
                ].includes(item.type),
              )
              .map((item) => ({
                type: 'page',
                path: `${item.name}.mdx`,
                slugs: [item.name],
                data: {
                  title: item.title ?? item.name,
                  description: item.description,
                },
              })),
          },
        });
        const tree = source.getPageTree();
        return `export const registry = ${JSON.stringify(catalog)};\nexport const componentTree = ${JSON.stringify(tree)};\nexport const details = {${catalog.items.map((item) => `${JSON.stringify(item.name)}: () => import(${JSON.stringify(`virtual:registry/${item.name}`)}).then(m => m.default)`).join(',')}};`;
      }
      if (id.startsWith(detailPrefix)) {
        const item = await readComponent(id.slice(detailPrefix.length));
        const files = item.files
          .map((file) => {
            const absolute = resolve(repositoryRoot, file.path);
            this.addWatchFile(absolute);
            return absolute;
          })
          .filter((file) => /\.tsx?$/.test(file));
        const api = parser.parse(files).map((component) => ({
          name: component.displayName,
          description: component.description,
          props: Object.entries(component.props).map(([name, prop]) => ({
            name,
            type: prop.type.raw ?? prop.type.name,
            required: prop.required,
            description: prop.description,
            defaultValue: prop.defaultValue?.value ?? null,
          })),
        }));
        return `export default ${JSON.stringify({ ...item, api })};`;
      }
    },
    configureServer(server) {
      server.watcher.add(repositoryRoot);
      let timer: ReturnType<typeof setTimeout>;
      const refresh = (file: string) => {
        const path = relative(repositoryRoot, file).replaceAll('\\', '/');
        if (
          path.startsWith('web/') ||
          path.startsWith('node_modules/') ||
          path.startsWith('.git/')
        )
          return;
        if (!path.endsWith('.json') && !path.startsWith('registry/')) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          for (const [id, module] of server.moduleGraph.idToModuleMap) {
            if (id.startsWith('\0virtual:registry'))
              server.moduleGraph.invalidateModule(module);
          }
          server.ws.send({ type: 'full-reload' });
        }, 80);
      };
      server.watcher
        .on('add', refresh)
        .on('change', refresh)
        .on('unlink', refresh);
      server.httpServer?.once('close', () => clearTimeout(timer));
    },
  };
}
