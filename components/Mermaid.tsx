'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';

interface MermaidProps {
  chart: string;
  title?: string;
  caption?: string;
}

export default function Mermaid({ chart, title, caption }: MermaidProps) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState('');
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        fontFamily: 'inherit',
      });

      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart.trim());
        if (!cancelled) setSvg(svg);
      } catch (err) {
        if (!cancelled) setSvg(`<pre>${String(err)}</pre>`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, id]);

  return (
    <figure className="my-6">
      {title && (
        <div className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </div>
      )}
      <div
        className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
