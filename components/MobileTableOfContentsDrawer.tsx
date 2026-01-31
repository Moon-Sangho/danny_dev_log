'use client';

import { useState } from 'react';
import TableOfContents from './TableOfContents';

interface TocItem {
  value: string;
  url: string;
  depth: number;
}

interface MobileTableOfContentsDrawerProps {
  toc?: TocItem[];
}

export default function MobileTableOfContentsDrawer({
  toc,
}: MobileTableOfContentsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredToc = toc?.filter((item) => item.depth <= 2) || [];

  if (!filteredToc || filteredToc.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-2 left-2 z-40 2xl:hidden">
      {/* 통합 Card - 버튼과 리스트가 하나의 카드로 보임 */}
      <div
        className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-900 ${
          isOpen ? 'w-72' : 'w-12'
        }`}
      >
        {/* Header Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          {isOpen && (
            <svg
              className="size-4 text-gray-500 transition-transform duration-300 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>

        {/* Divider */}
        {isOpen && <div className="h-px bg-gray-200 dark:bg-gray-700" />}

        {/* Content - 높이로 smoothly 열고 닫힘 */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isOpen ? '320px' : '0px',
          }}
        >
          <div className="max-h-80 overflow-y-auto px-3 py-2">
            <TableOfContents toc={toc} />
          </div>
        </div>
      </div>
    </div>
  );
}
