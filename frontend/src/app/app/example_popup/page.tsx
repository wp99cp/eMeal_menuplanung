'use client';

import TourPopup from '@/components/elements/TourPopop';
import { useRef } from 'react';

export default async function Page() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div ref={ref}>
          <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 p-2 dark:border-gray-600">
            <h1 className="mb-6">Hello, App Dashboard Page!</h1>
          </div>
        </div>
      </div>

      <TourPopup over={ref} />
    </>
  );
}
