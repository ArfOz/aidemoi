'use client';
import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

type Specialty = {
  name: string;
  description: string;
  icon?: string;
};
type Category = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  cover?: string;
  specialties?: Record<string, Specialty>;
};
export default function CategoryPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { category } = useParams<{ category: string }>();

  const categories = (t.raw('categories') as Category[]) || [];
  const active = categories.find((c) => c.id === category);

  if (!active) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Not found</h1>
        <p>Category &quot;{category}&quot; does not exist.</p>
        <Link href={`/${locale}`}>← Back</Link>
      </main>
    );
  }

  const specs = active.specialties || {};

  return (
    <main
      style={{
        padding: '1.5rem',
        fontFamily: 'sans-serif',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* Hero */}
      <section
        style={{
          marginBottom: 16,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{ position: 'relative', height: 180, background: '#f3f4f6' }}
        >
          {active.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.cover}
              alt={active.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
              }}
            >
              {active.icon || '📦'}
            </div>
          )}
          {(active.icon || active.name) && (
            <div
              style={{
                position: 'absolute',
                left: 16,
                bottom: 16,
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 22 }}>{active.icon || '📦'}</span>
              <strong style={{ fontSize: 18 }}>{active.name}</strong>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 14px', color: '#374151' }}>
          {active.description}
        </div>
      </section>

      {/* Subcategory cards */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {Object.entries(specs).map(([key, s]) => (
            <Link
              key={key}
              href={`/${locale}/${active.id}/${key}`}
              aria-label={`${s.name} subcategory`}
              title={s.name}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                background: 'white',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 28 }}>{s.icon || '📌'}</div>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                </div>
                <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
                  {s.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {Object.keys(specs).length === 0 && (
          <div style={{ color: '#6b7280', marginTop: 12 }}>
            No subcategories found.
          </div>
        )}
      </section>

      <div style={{ marginTop: 16 }}>
        <Link href={`/${locale}`}>← Back to home</Link>
      </div>
    </main>
  );
}
