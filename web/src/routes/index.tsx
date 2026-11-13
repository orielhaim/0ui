import { createFileRoute } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { baseOptions } from '@/lib/layout.shared';
import { components, title, repositoryUrl } from '@/lib/registry';
import { ComponentPreview } from '@/components/component-preview';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: '0ui · Components with considered details' },
      {
        name: 'description',
        content:
          'Open-source React components with thoughtful motion and details. Preview them live, copy the source, and make them your own.',
      },
      {
        property: 'og:title',
        content: '0ui · Components with considered details',
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured =
    components.find((item) => item.meta?.featured === true) ?? components[0];
  return (
    <HomeLayout {...baseOptions()}>
      <div id="main-content" className="site-container home-page">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Less assembly.
              <br />
              <span>More character.</span>
            </h1>
            <p>
              React components with considered details.
              <br />
              Built to move naturally. Yours to take apart.
            </p>
            <div className="hero-actions">
              <a className="button-primary" href="/components">
                Explore components <ArrowRight size={17} />
              </a>
              <a className="button-secondary" href="/docs/installation">
                Get started
              </a>
            </div>
            <div className="hero-note">
              <span className="small-dot" /> Open source. Install with shadcn.
            </div>
          </div>
          <div className="hero-aside">
            <div className="zero-mark" aria-hidden="true">
              0
            </div>
            <p>
              Your code.
              <br />
              Your next starting point.
            </p>
          </div>
        </section>
        {featured && (
          <section className="featured-section">
            <div className="section-heading">
              <h2>A closer look</h2>
              <a href={`/components/${featured.name}`}>
                {title(featured)} <ArrowUpRight size={16} />
              </a>
            </div>
            <ComponentPreview name={featured.name} />
            <div className="featured-caption">
              <p>{featured.description}</p>
              <a className="text-link" href={`/components/${featured.name}`}>
                Read the documentation <ArrowRight size={14} />
              </a>
            </div>
          </section>
        )}
        <section className="ownership-section">
          <h2>
            A starting point.
            <br />
            <span>Never a black box.</span>
          </h2>
          <div>
            <p>
              Install straight from the GitHub registry. Every component lands
              in your project as source, ready for your design, your
              conventions, and your next idea.
            </p>
            <a
              className="text-link"
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
            >
              Explore the source <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
        <footer className="site-footer">
          <span>0ui. Open source, by design.</span>
          <a href={repositoryUrl}>
            Built in the open <ArrowUpRight size={13} />
          </a>
        </footer>
      </div>
    </HomeLayout>
  );
}
