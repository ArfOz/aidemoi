'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

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

export default function CategoryPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { category } = useParams<{ category: string }>();

  const categoriesArr = t.raw('categories') as Category[];
  const active = categoriesArr.find((c) => c.id === category);

  if (!active) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Not found</h1>
        <p>{`Category ${category} does not exist.`}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{active.name}</h1>
      <p>{active.description}</p>

      <h2>Specialties</h2>
      <ul>
        {active.specialties &&
          Object.entries(active.specialties).map(([key, spec]) => (
            <li key={key} style={{ marginBottom: '1rem' }}>
              <Link
                href={`/${locale}/${category}/${key}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {spec.icon} {spec.name}
                </div>
                <div style={{ color: '#555' }}>{spec.description}</div>
              </Link>
            </li>
          ))}
      </ul>
    </main>
  );
}
