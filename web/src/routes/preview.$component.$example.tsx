import { createFileRoute, notFound } from '@tanstack/react-router';
import { components } from '@/lib/registry';
import { examplesFor } from '@/lib/examples';
import { IsolatedExample } from '@/components/component-preview';

export const Route = createFileRoute('/preview/$component/$example')({
  beforeLoad: ({ params }) => {
    if (
      !components.some((item) => item.name === params.component) ||
      !examplesFor(params.component).some((item) => item.id === params.example)
    )
      throw notFound();
  },
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: () => {
    const params = Route.useParams();
    return <IsolatedExample name={params.component} id={params.example} />;
  },
});
