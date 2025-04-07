'use client';

import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState<number>(0);

  const handleIncrement = () => setCount((c: number) => c + 1);

  return (
    <section className="mx-auto mt-8 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:shadow-md transition-shadow duration-300">
      <div className="mb-4 text-center text-2xl font-semibold text-gray-800">
        Count: {count}
      </div>
      <button
        type="button"
        onClick={handleIncrement}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200"
      >
        Increment
      </button>
    </section>
  );
};
