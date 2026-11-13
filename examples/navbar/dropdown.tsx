import { Navbar, NavbarButton } from '@registry/ui/navbar';
import { BookOpen, Boxes, Sparkles, Layers } from 'lucide-react';
import type { ExampleConfig } from '../../web/src/lib/examples';

export const config = {
  title: 'With dropdowns',
  description:
    'Animated navigation with grouped links, keyboard navigation, and a mobile accordion.',
  isolation: 'iframe',
  background: 'dark',
  controls: {
    resizable: {
      type: 'boolean',
      label: 'Resize on scroll',
      defaultValue: true,
    },
    position: {
      type: 'select',
      label: 'Position',
      defaultValue: 'sticky',
      options: ['sticky', 'fixed'],
    },
  },
} satisfies ExampleConfig;

export default function Dropdown({ resizable = true, position = 'sticky' }) {
  return (
    <div className="min-h-[160vh] bg-neutral-950 text-white">
      <Navbar
        brand={
          <a href="#overview" className="flex items-center gap-2 font-semibold">
            <Layers className="size-5 text-orange-300" /> Studio
          </a>
        }
        position={position === 'fixed' ? 'fixed' : 'sticky'}
        resizable={resizable}
        items={[
          {
            label: 'Explore',
            items: [
              {
                label: 'Components',
                href: '#components',
                description: 'Start with the essentials.',
                icon: <Boxes />,
              },
              {
                label: 'New releases',
                href: '#new',
                description: 'See what is taking shape.',
                icon: <Sparkles />,
              },
              {
                label: 'Documentation',
                href: '#docs',
                description: 'Find your next step.',
                icon: <BookOpen />,
              },
            ],
          },
          { label: 'About', href: '#about' },
        ]}
        actions={
          <NavbarButton href="#start" variant="accent">
            Start building
          </NavbarButton>
        }
        mobileFooter={
          <p className="text-xs text-neutral-400">
            Everything you need, within reach.
          </p>
        }
      />
      <main id="overview" className="mx-auto max-w-3xl px-8 py-28 text-center">
        <h1 className="text-5xl font-medium tracking-tight">
          A little motion.
          <br />
          <span className="text-neutral-500">A clearer direction.</span>
        </h1>
        <p className="mt-6 text-sm text-neutral-400">
          Open Explore to try the dropdown.
        </p>
        {['components', 'new', 'docs', 'about', 'start'].map((id) => (
          <section
            key={id}
            id={id}
            className="mt-28 border-t border-white/10 py-10 capitalize text-neutral-400"
          >
            {id}
          </section>
        ))}
      </main>
    </div>
  );
}
