import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react';
import {
  examplesFor,
  type ExampleConfig,
  type ExampleProps,
} from '@/lib/examples';
import { CopyButton } from './copy-button';

const viewports = [
  { Icon: Monitor, width: '100%', label: 'Desktop' },
  { Icon: Tablet, width: '768px', label: 'Tablet' },
  { Icon: Smartphone, width: '375px', label: 'Mobile' },
];

export function defaults(config: ExampleConfig): ExampleProps {
  return Object.fromEntries(
    Object.entries(config.controls ?? {}).map(([name, control]) => [
      name,
      control.defaultValue,
    ]),
  );
}

class PreviewBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <p role="alert" className="p-8">
        This example could not render. Reset the preview to try again.
      </p>
    ) : (
      this.props.children
    );
  }
}

export function ComponentPreview({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  const examples = examplesFor(name);
  const [selected, setSelected] = useState(examples[0]?.id ?? '');
  const example = examples.find((item) => item.id === selected) ?? examples[0];
  const [loaded, setLoaded] = useState<{
    path: string;
    config: ExampleConfig;
    code: string;
  }>();
  const [values, setValues] = useState<ExampleProps>({});
  const [tab, setTab] = useState('preview');
  const [width, setWidth] = useState('100%');
  const [dark, setDark] = useState(true);
  const [reset, setReset] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const frameValues = useRef(values);
  useEffect(() => {
    frameValues.current = values;
  }, [values]);
  useEffect(() => {
    let active = true;
    if (example)
      Promise.all([example.load(), example.source()]).then(([module, code]) => {
        if (!active) return;
        const config = module.config ?? {};
        setLoaded({ path: example.path, config, code });
        setValues(defaults(config));
      });
    return () => {
      active = false;
    };
  }, [example]);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: '0ui:props', values },
      window.location.origin,
    );
  }, [values]);
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === '0ui:ready'
      ) {
        frame.current?.contentWindow?.postMessage(
          { type: '0ui:props', values: frameValues.current },
          window.location.origin,
        );
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);
  if (!example)
    return (
      <div className="empty-preview">
        Examples are on their way. Explore the source below.
      </div>
    );
  const ready = loaded?.path === example.path;
  const Example = example.Component;
  const config = ready ? loaded.config : {};
  return (
    <div className={`component-preview ${compact ? 'compact-preview' : ''}`}>
      {!compact && (
        <>
          <div className="preview-toolbar">
            <div className="segmented" role="group" aria-label="Example view">
              <button
                aria-pressed={tab === 'preview'}
                onClick={() => setTab('preview')}
              >
                Preview
              </button>
              <button
                aria-pressed={tab === 'code'}
                onClick={() => setTab('code')}
              >
                Code
              </button>
            </div>
            <label className="example-select">
              <span className="sr-only">Example</span>
              <select
                disabled={!ready}
                value={example.id}
                onChange={(event) => setSelected(event.target.value)}
              >
                {examples.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id.replaceAll('-', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="viewport-tools"
              role="group"
              aria-label="Viewport width"
            >
              {viewports.map(({ Icon, width: size, label }) => (
                <button
                  key={label}
                  className="icon-button"
                  title={label}
                  aria-label={label}
                  aria-pressed={width === size}
                  onClick={() => setWidth(size)}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <button
              className="icon-button"
              aria-label="Toggle preview background"
              disabled={Boolean(config.background)}
              title={
                config.background
                  ? `This example requires a ${config.background} background`
                  : 'Toggle preview background'
              }
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="icon-button"
              aria-label="Reset preview"
              onClick={() => {
                setReset(reset + 1);
                setValues(defaults(config));
              }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </>
      )}
      {tab === 'code' && !compact ? (
        <div className="example-code">
          <div className="code-heading">
            <span>{example.path.replace('../../../', '')}</span>
            <CopyButton value={loaded?.code ?? ''} />
          </div>
          {ready ? (
            <pre><code>{loaded.code}</code></pre>
          ) : (
            <p className="p-8">Loading source…</p>
          )}
        </div>
      ) : (
        <div
          className={`preview-stage ${(config.background ?? (dark ? 'dark' : 'light')) === 'dark' ? 'preview-dark' : 'preview-light'}`}
        >
          <div
            className="preview-viewport"
            style={{ width: compact ? '100%' : width }}
          >
            {!ready ? (
              <p className="p-8" role="status">
                Loading example…
              </p>
            ) : (
              <PreviewBoundary key={`${example.id}-${reset}`}>
                {config.isolation === 'iframe' ? (
                  <iframe
                    ref={frame}
                    key={`${example.id}-${reset}`}
                    title={`${name} ${config.title ?? example.id} interactive preview`}
                    src={`/preview/${name}/${example.id}`}
                    loading={compact ? 'lazy' : 'eager'}
                  />
                ) : (
                  <Suspense fallback={<p className="p-8">Loading preview…</p>}>
                    <Example {...values} />
                  </Suspense>
                )}
              </PreviewBoundary>
            )}
          </div>
        </div>
      )}
      {!compact && ready && (
        <div className="preview-caption">
          <p>{config.description ?? config.title ?? example.id}</p>
          {Object.keys(config.controls ?? {}).length > 0 && (
            <div className="prop-controls">
              {Object.entries(config.controls ?? {}).map(([name, control]) => (
                <label key={name}>
                  <span>{control.label}</span>
                  {control.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={values[name] === true}
                      onChange={(event) =>
                        setValues({ ...values, [name]: event.target.checked })
                      }
                    />
                  ) : control.type === 'select' ? (
                    <select
                      value={String(values[name])}
                      onChange={(event) =>
                        setValues({ ...values, [name]: event.target.value })
                      }
                    >
                      {control.options.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={control.type}
                      min={control.type === 'number' ? control.min : undefined}
                      max={control.type === 'number' ? control.max : undefined}
                      value={String(values[name] ?? '')}
                      onChange={(event) =>
                        setValues({
                          ...values,
                          [name]:
                            control.type === 'number'
                              ? Number(event.target.value)
                              : event.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function IsolatedExample({ name, id }: { name: string; id: string }) {
  const example = examplesFor(name).find((item) => item.id === id);
  const [values, setValues] = useState<ExampleProps>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    let config: ExampleConfig = {};
    example?.load().then((module) => {
      if (!active) return;
      config = module.config ?? {};
      setValues(defaults(config));
      setReady(true);
      window.parent.postMessage({ type: '0ui:ready' }, window.location.origin);
    });
    const listener = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== '0ui:props'
      )
        return;
      const input: unknown = event.data.values;
      if (!input || typeof input !== 'object') return;
      const next = defaults(config);
      for (const [name, control] of Object.entries(config.controls ?? {})) {
        const value: unknown = Reflect.get(input, name);
        if (
          (control.type === 'boolean' && typeof value === 'boolean') ||
          (control.type === 'text' && typeof value === 'string') ||
          (control.type === 'select' &&
            typeof value === 'string' &&
            control.options.includes(value)) ||
          (control.type === 'number' &&
            typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= (control.min ?? -Infinity) &&
            value <= (control.max ?? Infinity))
        )
          next[name] = value;
      }
      setValues(next);
    };
    window.addEventListener('message', listener);
    return () => {
      active = false;
      window.removeEventListener('message', listener);
    };
  }, [example]);
  if (!example) return null;
  const Example = example.Component;
  return (
    <div inert={!ready}>
      <PreviewBoundary>
        <Suspense fallback={<p className="p-8">Loading preview…</p>}>
          <Example {...values} />
        </Suspense>
      </PreviewBoundary>
    </div>
  );
}
