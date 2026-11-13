import react from '@vitejs/plugin-react';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import {
  readCatalog,
  registryPlugin,
  repositoryRoot,
} from './vite/registry.ts';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

const registry = await readCatalog();
const guidePages = readdirSync(resolve(repositoryRoot, 'web/content/docs'), {
  recursive: true,
  encoding: 'utf8',
})
  .map((path) => path.replaceAll('\\', '/'))
  .filter((path) => /\.mdx?$/.test(path))
  .flatMap((path) => {
    const slug = path.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
    return [
      { path: `/docs${slug ? `/${slug}` : ''}` },
      { path: `/docs/${slug ? `${slug}.md` : 'index.md'}` },
    ];
  });
const examplePages = readdirSync(resolve(repositoryRoot, 'examples'), {
  recursive: true,
  encoding: 'utf8',
})
  .map((path) => path.replaceAll('\\', '/'))
  .filter((path) => /^[^/]+\/[^/]+\.tsx$/.test(path))
  .filter((path) =>
    registry.items.some((item) => item.name === path.split('/')[0]),
  )
  .map((path) => ({ path: `/preview/${path.replace(/\.tsx$/, '')}` }));

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    registryPlugin(),
    fumadocsMdx(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        failOnError: true,
        filter: ({ path }) => !path.startsWith('/og/') && !path.includes('?'),
      },
      pages: [
        { path: '/api/search.json' },
        { path: '/llms.txt' },
        { path: '/llms-full.txt' },
        ...guidePages,
        ...examplePages,
        ...registry.items
          .filter((item) =>
            ['registry:ui', 'registry:component', 'registry:block'].includes(
              item.type,
            ),
          )
          .map((item) => ({ path: `/components/${item.name}` })),
      ],
    }),
    react(),
    // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
    nitro({
      preset: 'bun',
    }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: 'tslib/tslib.es6.js',
      '@registry': resolve(repositoryRoot, 'registry'),
      '@': resolve(repositoryRoot, 'web/src'),
    },
  },
});
