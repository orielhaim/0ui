import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({
  value,
  label = 'Copy code',
}: {
  value: string;
  label?: string;
}) {
  const [state, setState] = useState('');
  return (
    <button
      type="button"
      className="tool-button"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState('Copied');
        } catch {
          setState('Copy failed. Select the code to copy.');
        }
        setTimeout(() => setState(''), 2500);
      }}
    >
      {state === 'Copied' ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">{state || label}</span>
    </button>
  );
}
