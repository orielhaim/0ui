import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { componentTree } from 'virtual:registry';

export const navigationTree = {
  name: 'Documentation',
  children: [
    { type: 'page', name: 'Introduction', url: '/docs' },
    { type: 'page', name: 'Installation', url: '/docs/installation' },
    { type: 'separator', name: 'Components' },
    ...componentTree.children,
  ],
} satisfies import('fumadocs-core/page-tree').Root;

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (
        <span className="brand">
          {appName}
          <span className="brand-dot" />
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      { text: 'Components', url: '/components' },
      { text: 'Documentation', url: '/docs' },
    ],
  };
}
