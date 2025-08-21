'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

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

export default function SubcategoryPage() {
  const t = useTranslations();
  const { category, subcategory } = useParams<{
    category: string;
    subcategory: string;
  }>();

  const categoriesArr = t.raw('categories') as Category[];
  const active = categoriesArr.find((c) => c.id === category);
  const spec = active?.specialties?.[subcategory];

  if (!active || !spec) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Not found</h1>
        <p>
          {active
            ? `Subcategory "${subcategory}" does not exist.`
            : `Category "${category}" does not exist.`}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{spec.name}</h1>
      <div style={{ marginTop: '0.5rem' }}>{spec.description}</div>
    </main>
  );
}
