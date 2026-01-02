'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">Erro</h1>
        <p className="text-xl text-gray-600 mt-4">Algo deu errado</p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
