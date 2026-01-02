'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
