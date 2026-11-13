import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsPage,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/layouts/docs/page';
import { details } from 'virtual:registry';
import { baseOptions, navigationTree } from '@/lib/layout.shared';
import {
  components,
  githubRegistry,
  repositoryUrl,
  title,
} from '@/lib/registry';
import { InstallCommand } from '@/components/install-command';
import { ComponentPreview } from '@/components/component-preview';
import { CopyButton } from '@/components/copy-button';
import { ArrowUpRight } from 'lucide-react';

export const Route = createFileRoute('/components/$slug')({
  loader: async ({ params }) => {
    if (
      !components.some((item) => item.name === params.slug) ||
      !details[params.slug]
    )
      throw notFound();
    return details[params.slug]();
  },
  head: ({ loaderData: item }) => ({
    meta: item
      ? [
          { title: `${title(item)} · 0ui` },
          { name: 'description', content: item.description ?? '' },
          { property: 'og:title', content: `${title(item)} · 0ui` },
          { property: 'og:description', content: item.description ?? '' },
        ]
      : [],
  }),
  component: ComponentPage,
});

function ComponentPage() {
  const item = Route.useLoaderData();
  const related = components.filter((component) =>
    item.registryDependencies?.some(
      (dependency) =>
        dependency === component.name ||
        dependency === `${githubRegistry}/${component.name}`,
    ),
  );
  return (
    <DocsLayout {...baseOptions()} links={[]} tree={navigationTree}>
      <DocsPage full className="max-w-none" tableOfContent={{ enabled: false }}>
        <div className="component-heading">
          <div>
            <DocsTitle>{title(item)}</DocsTitle>
            <DocsDescription>{item.description}</DocsDescription>
          </div>
          <a
            className="source-link"
            href={`${repositoryUrl}/tree/main/registry`}
            target="_blank"
            rel="noreferrer"
          >
            Source <ArrowUpRight size={14} />
          </a>
        </div>
        <ComponentPreview key={item.name} name={item.name} />
        <section className="documentation-section" id="installation">
          <h2>Installation</h2>
          <p>Add the component and its dependencies to your project.</p>
          <InstallCommand name={item.name} />
          <a className="text-link" href="/docs/installation">
            First time using 0ui? Read the installation guide.
          </a>
        </section>
        <section className="documentation-section" id="dependencies">
          <h2>Dependencies</h2>
          {item.dependencies?.length || item.registryDependencies?.length ? (
            <div className="dependency-list">
              {item.dependencies?.map((dependency) => (
                <a
                  href={`https://www.npmjs.com/package/${dependency}`}
                  key={dependency}
                  target="_blank"
                  rel="noreferrer"
                >
                  {dependency}
                  <ArrowUpRight size={12} />
                </a>
              ))}
              {item.registryDependencies?.map((dependency) => (
                <code key={dependency}>{dependency}</code>
              ))}
            </div>
          ) : (
            <p>No additional dependencies.</p>
          )}
        </section>
        <section className="documentation-section" id="api">
          <h2>API reference</h2>
          <p>
            Extracted from the component's TypeScript types and JSDoc. Native
            element attributes are inherited.
          </p>
          {item.api.length ? (
            item.api.map((api) => (
              <div key={api.name} className="api-reference">
                <h3>{api.name}</h3>
                {api.description && <p>{api.description}</p>}
                <div className="table-scroll">
                  <table>
                    <caption className="sr-only">{api.name} props</caption>
                    <thead>
                      <tr>
                        <th>Prop</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {api.props.map((prop) => (
                        <tr key={prop.name}>
                          <td>
                            <code>
                              {prop.name}
                              {prop.required ? '*' : ''}
                            </code>
                          </td>
                          <td>
                            <code>{prop.type}</code>
                          </td>
                          <td>
                            <code>{prop.defaultValue ?? '—'}</code>
                          </td>
                          <td>{prop.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p>
              See the exported types in the source files below. Add JSDoc to
              your component's props for richer documentation.
            </p>
          )}
        </section>
        <section className="documentation-section" id="source">
          <h2>Source</h2>
          <p>
            The original registry files, installed directly into your project.
          </p>
          {item.files?.map((file) => (
            <details className="source-file" key={file.path}>
              <summary>{file.path}</summary>
              <div className="code-heading">
                <a
                  href={`${repositoryUrl}/blob/main/${file.path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on GitHub <ArrowUpRight size={12} />
                </a>
                <CopyButton value={file.content ?? ''} />
              </div>
              <pre>
                <code>{file.content}</code>
              </pre>
            </details>
          ))}
        </section>
        {related.length > 0 && (
          <section className="documentation-section">
            <h2>Related components</h2>
            {related.map((component) => (
              <a
                key={component.name}
                className="text-link"
                href={`/components/${component.name}`}
              >
                {title(component)}
              </a>
            ))}
          </section>
        )}
      </DocsPage>
    </DocsLayout>
  );
}
