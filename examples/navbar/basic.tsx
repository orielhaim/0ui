import { Navbar, NavbarButton } from '@registry/ui/navbar';
import type { ExampleConfig } from '../../web/src/lib/examples';

export const config = {
  title: 'Basic',
  description:
    'Scroll to see the navbar settle into a floating pill. Resize to try the mobile menu.',
  isolation: 'iframe',
  background: 'dark',
  controls: {
    resizable: {
      type: 'boolean',
      label: 'Resize on scroll',
      defaultValue: true,
    },
    brand: { type: 'text', label: 'Brand name', defaultValue: 'Acme' },
    elevatedAfter: {
      type: 'number',
      label: 'Scroll threshold',
      defaultValue: 16,
      min: 0,
      max: 200,
    },
  },
} satisfies ExampleConfig;

export default function Basic({
  resizable = true,
  brand = 'Acme',
  elevatedAfter = 16,
}) {
  return (
    <div className="min-h-[160vh] bg-neutral-950 text-white">
      <Navbar
        brand={
          <a href="#welcome" className="text-lg font-semibold tracking-tight">
            {brand}
          </a>
        }
        resizable={resizable}
        elevatedAfter={elevatedAfter}
        items={[
          { label: 'Product', href: '#product' },
          { label: 'Company', href: '#company' },
          { label: 'Journal', href: '#journal' },
        ]}
        actions={
          <NavbarButton href="#start" variant="primary">
            Get started
          </NavbarButton>
        }
      />
      <main id="welcome" className="mx-auto max-w-4xl px-8 py-24 text-center">
        <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
          Make room for
          <br />
          <span className="text-neutral-500">your next idea.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-neutral-400">
          A working navbar, in its own viewport.
          <br />
          Scroll down. Open the menu. Make it yours.
        </p>
        <a
          href="#product"
          className="mt-8 inline-flex rounded-full bg-orange-300 px-5 py-3 text-sm font-medium text-neutral-950"
        >
          Explore the product
        </a>
        <div
          id="product"
          className="mt-48 border-t border-white/10 py-12 text-neutral-400"
        >
          Your content starts here.
        </div>
        <div id="company" className="py-12">
          Built for what comes next.
        </div>
        <div id="journal" className="py-12 text-neutral-400">
          Notes from the team.
        </div>
        <div id="start" className="py-12">
          Let's build something.
        </div>
      </main>
    </div>
  );
}
