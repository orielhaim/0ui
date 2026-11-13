# 0ui

Open-source React components, distributed through the shadcn GitHub Registry. The documentation website lives in `web/`; the registry works independently of it.

## Development

Install [Bun](https://bun.sh), then run these commands from the repository root:

```sh
bun install
bun run dev
```

The website runs at `http://localhost:3000`. The workspace has one lockfile, `bun.lock`.

```sh
bun run build          # Build and prerender the website
bun run typecheck     # Check the website, examples, registry, and Vite plugin
bun run lint
```

## Add a component

1. Write its source in `registry/ui/`.
2. Add an item to the root `registry.json`, using official fields for `name`, `title`, `description`, `categories`, `dependencies`, `registryDependencies`, `files`, and optional `meta`.
3. Optionally add default-exported React examples to `examples/<item-name>/<example-name>.tsx`.

There is no documentation generation or synchronization command. Registry changes refresh the running website. The next normal build includes the updated routes and previews. Composed registries using the official `include` field are supported, including source paths relative to the declaring registry file.

Use relative imports between files in the same registry item. Import class merging directly from `cn` and declare it in the item's `dependencies`. Examples import the original components through `@registry/`, which is a development alias for the root `registry/` directory.

## Examples and controls

An example's default export is both the live preview and the source shown in Code view. An optional named `config` export controls presentation and supported prop inputs:

```tsx
import type { ExampleConfig } from '../../web/src/lib/examples';
import { MyComponent } from '@registry/ui/my-component';

export const config = {
  title: 'Basic',
  isolation: 'inline',
  controls: {
    disabled: { type: 'boolean', label: 'Disabled', defaultValue: false },
  },
} satisfies ExampleConfig;

export default function Basic({ disabled = false }) {
  return <MyComponent disabled={disabled} />;
}
```

Controls support `boolean`, `text`, `number`, and `select`. They pass props to the same example export. Choose `isolation: 'iframe'` when an example needs its own window, scrolling, fixed positioning, or overlay context. Iframes use a dedicated route with the same discovered module. Messages accept only the same origin and parent window; values are checked against the declared controls.

`basic.tsx` is selected first. Other examples sort by filename. Components without examples still get a documentation page, installation command, dependencies, API reference, and source files.

## How discovery works

- `web/vite/registry.ts` calls the public `@shadcn/registry` APIs, `loadRegistry` and `loadRegistryItem`. It validates the official registry and resolves composition. A Vite virtual module supplies metadata, a Fumadocs page tree, and lazy imports for each item's source and props documentation. It writes no manifest to the repository.
- Fumadocs `StaticSource`/`loader` generates component navigation. TanStack Router has one `/components/$slug` route and one reusable page renderer. Unknown or removed entries return a not-found page.
- Vite's `import.meta.glob` discovers example modules and imports the same files with `?raw` for Code view. Executable examples and raw source load on demand.
- `react-docgen-typescript` extracts exported component props and JSDoc at build time. Native element props are omitted. Document complex props with JSDoc on their TypeScript declarations; the original exported types remain available in Source when extraction cannot describe a generic or polymorphic API accurately. The extractor uses the TypeScript 5.9 compiler API; website typechecking uses the template's TypeScript 7 compiler.
- Fumadocs MDX remains available under `web/content/docs/` for guides. Its search database includes guides and registry components, and is exported for browser-side search.

The browser never loads the registry from GitHub or accesses the filesystem. Component metadata is bundled; source/API payloads are split into per-item chunks. The registry loader and props extractor run only in Vite.

## Build and deployment

Nitro uses the `bun` preset. Run the server build with:

```sh
cd web
bun run start
```

The build also prerenders documentation, component pages, isolated examples, and the search index into `web/.output/public`. Fumadocs guide loader responses are cached as static assets using TanStack Start's official static server-function middleware. This allows serving the public directory from a CDN without a backend. Configure clean URLs to serve `<path>/index.html`, The search index is served as `api/search.json`. The Bun server remains available for hosts that support it.

## Official API references

- [shadcn Registry public APIs](https://github.com/shadcn-ui/ui/blob/main/packages/registry/README.md)
- [Registry composition](https://ui.shadcn.com/docs/registry/getting-started)
- [Fumadocs loader](https://www.fumadocs.dev/docs/headless/source-api)
- [TanStack Start prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- [TanStack static server functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)
- [Bun workspaces](https://bun.sh/docs/pm/workspaces)
- [`cn` API](https://github.com/shadcn-ui/cn)
