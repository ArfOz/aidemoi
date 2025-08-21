'use client';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import React from 'react';

interface Specialty {
  icon: React.ReactNode;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  specialties?: Record<string, Specialty>;
}
export default function MovingPage() {
  const t = useTranslations();
  const locale = useLocale();
  // Get the categories array from the translation file
  const categoriesArr = t.raw('categories') as Category[];
  // Find the moving category by id
  const moving = categoriesArr.find((cat: Category) => cat.id === 'moving');

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{moving?.name}</h1>
      <p>{moving?.description}</p>
      <h2>Specialties</h2>
      <ul>
        {moving?.specialties &&
          Object.entries(moving.specialties).map(
            ([key, spec]: [string, Specialty]) => (
              <li key={key} style={{ marginBottom: '1rem' }}>
                <Link
                  href={`/${locale}/moving/${key}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    {spec.icon} {spec.name}
                  </div>
                  <div style={{ color: '#555' }}>{spec.description}</div>
                </Link>
              </li>
            )
          )}
      </ul>
    </main>
  );
}
