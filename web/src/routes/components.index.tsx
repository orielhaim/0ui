import { ArrowUpRight } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { ComponentGallery } from '@/components/component-gallery';

export const Route = createFileRoute('/components/')({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === 'string' ? search.category : '',
  }),
  head: () => ({
    meta: [
      { title: 'Components · 0ui' },
      {
        name: 'description',
        content:
          'Explore interactive React components. Preview, customize, and copy the source into your project.',
      },
    ],
  }),
  component: () => {
    const { category } = Route.useSearch();
    return (
      <HomeLayout {...baseOptions()}>
        <div id="main-content" className="site-container gallery-page">
          <div className="page-intro">
            <h1>Components</h1>
            <p>Preview, customize, and make them yours.</p>
          </div>
          <ComponentGallery key={category} initialCategory={category} />
          <footer className="site-footer">
            <span>0ui. Open source, by design.</span>
            <a href="/docs/installation">
              Start building <ArrowUpRight size={13} />
            </a>
          </footer>
        </div>
      </HomeLayout>
    );
  },
});
