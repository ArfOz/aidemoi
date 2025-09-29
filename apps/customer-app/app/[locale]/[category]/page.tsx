import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { apiAideMoi, CategoryDetailSuccessResponse } from '@api';

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
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
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

      <div style={{ marginTop: 16 }}>
        <Link href={`/${params.locale}`}>← Back to home</Link>
      </div>
    </main>
  );
}
