import { CategoryDetailSuccessResponse } from '@api';
import Link from 'next/link';
import React from 'react';

export const CategoryCard = ({
  subs,
  locale,
  params,
  active,
}: {
  subs: CategoryDetailSuccessResponse['data']['category']['subcategories'];
  locale: string;
  params: { locale: string; category: string };
  active: CategoryDetailSuccessResponse['data']['category'] | undefined;
}) => {
  if (!active) return null;

  console.log('active category:', active);
  return (
    <section>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {subs.map((s) => {
          const sI18n =
            s.i18n?.find((x) => x.locale === locale) ||
            s.i18n?.find((x) => x.locale?.startsWith('en')) ||
            s.i18n?.[0];
          const sName = sI18n?.name || s.name || s.slug;
          const sDesc = sI18n?.description || '';
          const sIcon = s.icon || '📌';
          return (
            <Link
              key={s.slug}
              href={`/${params.locale}/${active.id}/${
                s.slug
              }?subcatId=${encodeURIComponent(s.id)}`}
              aria-label={`${sName} subcategory`}
              title={sName}
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
                  <div style={{ fontSize: 28 }}>{sIcon}</div>
                  <div style={{ fontWeight: 700 }}>{sName}</div>
                </div>
                <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
                  {sDesc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {subs.length === 0 && (
        <div style={{ color: '#6b7280', marginTop: 12 }}>
          No subcategories found.
        </div>
      )}
    </section>
  );
};
