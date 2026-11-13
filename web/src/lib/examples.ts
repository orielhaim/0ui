import { lazy, type ComponentType } from 'react';

export type Control =
  | { type: 'boolean'; label: string; defaultValue: boolean }
  | { type: 'text'; label: string; defaultValue: string }
  | {
      type: 'number';
      label: string;
      defaultValue: number;
      min?: number;
      max?: number;
    }
  | { type: 'select'; label: string; defaultValue: string; options: string[] };
export type ExampleConfig = {
  title?: string;
  description?: string;
  isolation?: 'iframe' | 'inline';
  background?: 'dark' | 'light';
  controls?: Record<string, Control>;
};
export type ExampleProps = Record<string, string | number | boolean>;
type ExampleModule = {
  default: ComponentType<ExampleProps>;
  config?: ExampleConfig;
};
const modules = import.meta.glob<ExampleModule>('../../../examples/*/*.tsx');
const sources = import.meta.glob<string>('../../../examples/*/*.tsx', {
  query: '?raw',
  import: 'default',
});

const examples = Object.entries(modules)
  .map(([path, load]) => ({
    id: path
      .split('/')
      .at(-1)!
      .replace(/\.tsx$/, ''),
    path,
    load,
    source: sources[path],
    Component: lazy(load),
  }))
  .sort((a, b) =>
    a.id === 'basic' ? -1 : b.id === 'basic' ? 1 : a.id.localeCompare(b.id),
  );

export function examplesFor(name: string) {
  return examples.filter((example) => example.path.split('/').at(-2) === name);
}
