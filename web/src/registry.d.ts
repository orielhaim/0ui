declare module 'virtual:registry' {
  import type { loadRegistry, loadRegistryItem } from '@shadcn/registry';
  export const registry: Awaited<ReturnType<typeof loadRegistry>>;
  export const componentTree: import('fumadocs-core/page-tree').Root;
  export type ComponentDetail = Awaited<ReturnType<typeof loadRegistryItem>> & {
    api: {
      name: string;
      description: string;
      props: {
        name: string;
        type: string;
        required: boolean;
        description: string;
        defaultValue: string | null;
      }[];
    }[];
  };
  export const details: Record<string, () => Promise<ComponentDetail>>;
}
