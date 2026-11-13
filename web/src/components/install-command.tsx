import { useState } from 'react';
import { installCommand, type PackageManager } from '@/lib/registry';
import { CopyButton } from './copy-button';

const managers: PackageManager[] = ['npm', 'pnpm', 'bun'];

export function InstallCommand({ name }: { name: string }) {
  const [manager, setManager] = useState<PackageManager>('bun');
  const command = installCommand(name, manager);
  return (
    <div className="install-block">
      <div
        className="segmented install-managers"
        role="group"
        aria-label="Package manager"
      >
        {managers.map((value) => (
          <button
            key={value}
            aria-pressed={manager === value}
            onClick={() => setManager(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="install-command">
        <code>{command}</code>
        <CopyButton value={command} label="Copy command" />
      </div>
    </div>
  );
}
