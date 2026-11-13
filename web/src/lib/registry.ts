import { registry } from 'virtual:registry';

export const components = registry.items.filter((item) =>
  ['registry:ui', 'registry:component', 'registry:block'].includes(item.type),
);
export const repositoryUrl = registry.homepage.replace(/\/$/, '');
export const githubRegistry = new URL(repositoryUrl).pathname.slice(1);
export function title(
  item: Pick<(typeof components)[number], 'name' | 'title'>,
) {
  return (
    item.title ??
    item.name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}
export type PackageManager = 'npm' | 'pnpm' | 'bun';
export function installCommand(name: string, manager: PackageManager = 'bun') {
  const runner = { npm: 'npx', pnpm: 'pnpm dlx', bun: 'bunx' }[manager];
  return `${runner} shadcn add ${githubRegistry}/${name}`;
}
