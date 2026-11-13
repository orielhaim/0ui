import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { components, title } from '@/lib/registry';

const server = createSearchAPI('simple', {
  indexes: async () => [
    ...(await Promise.all(
      source
        .getPages()
        .map(async (page) => ({
          title: page.data.title,
          description: page.data.description,
          url: page.url,
          content: await page.data.getText('processed'),
        })),
    )),
    ...components.map((item) => ({
      title: title(item),
      description: item.description,
      url: `/components/${item.name}`,
      content: [
        item.description,
        ...(item.categories ?? []),
        ...(item.dependencies ?? []),
      ].join(' '),
    })),
  ],
});

export const Route = createFileRoute('/api/search.json')({
  server: {
    handlers: {
      GET: () => server.staticGET(),
    },
  },
});
