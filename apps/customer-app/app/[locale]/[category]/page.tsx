import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { apiAideMoi, CategoryDetailSuccessResponse } from '@api';
import { CategoryCard } from './components';

export default async function CategoryPage({
  params,
}: {
  params: { locale: string; category: string };
}) {
  const locale = await getLocale();
  const { category } = params;
  let active: CategoryDetailSuccessResponse['data']['category'] | undefined;
  try {
    const json = await apiAideMoi.get<CategoryDetailSuccessResponse>(
      `/categories/category/${category}?languages=${locale}`
    );
    active = json?.data?.category;
  } catch {
    active = undefined;
  }

  if (!active) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Not found</h1>
        <p>Category &quot;{category}&quot; does not exist.</p>
        <Link href={`/${params.locale}`}>← Back</Link>
      </main>
    );
  }

  const catI18n =
    active.i18n?.find((x) => x.locale === locale) ||
    active.i18n?.find((x) => x.locale?.startsWith('en')) ||
    active.i18n?.[0];
  const activeName = catI18n?.name || active.name || active.id;
  const activeDesc = catI18n?.description || '';
  const activeIcon = active.icon || '📦';

  const subs = active.subcategories ?? [];

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
            {activeIcon}
          </div>
          {(activeIcon || activeName) && (
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
              <span style={{ fontSize: 22 }}>{activeIcon}</span>
              <strong style={{ fontSize: 18 }}>{activeName}</strong>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 14px', color: '#374151' }}>
          {activeDesc}
        </div>
      </section>
      {/* Subcategory cards */}
      <CategoryCard
        subs={subs}
        locale={params.locale}
        active={active}
        params={params}
      />

      <div style={{ marginTop: 16 }}>
        <Link href={`/${params.locale}`}>← Back to home</Link>
      </div>
    </main>
  );
}
