'use client';

import { useEffect, useState, useRef } from 'react';
import Link from '@/components/Link';

interface TocItem {
  value: string;
  url: string;
  depth: number;
}

interface TableOfContentsProps {
  toc?: TocItem[];
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // # (h1)과 ## (h2)까지만 필터링
  const filteredToc = toc?.filter((item) => item.depth <= 2) || [];

  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      // 현재 viewport에서 가장 위에 있는 heading 찾기
      let current = '';
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.boundingClientRect.top < window.innerHeight / 2) {
          current = entry.target.id;
        }
      });
      if (current) {
        setActiveId(current);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '0px 0px -66% 0px',
    });

    // 모든 heading 요소 observe
    filteredToc.forEach((item) => {
      const id = item.url.replace('#', '');
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [filteredToc]);

  if (!filteredToc || filteredToc.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-2">
      <h2 className="text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-gray-100">
        목차
      </h2>
      <ul className="space-y-1 text-sm">
        {filteredToc.map((item) => (
          <li key={item.url} className={item.depth === 2 ? 'ml-4' : ''}>
            <Link
              href={item.url}
              className={`inline-block py-1 transition-colors ${
                activeId === item.url.replace('#', '')
                  ? 'text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {item.value}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
