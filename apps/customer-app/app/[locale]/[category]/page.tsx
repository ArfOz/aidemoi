import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { apiAideMoi, CategoryDetailSuccessResponse } from '@api';
import { CategoryDetailCard, SubCategoryCards } from './components';

export default async function CategoryPage({
  params,
}: {
  params: { locale: string; category: string };
}) {
  const locale = await getLocale();
  const { category } = await params;
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
      <CategoryDetailCard
        activeIcon={activeIcon}
        activeName={activeName}
        activeDesc={activeDesc}
      />
      {/* Subcategory cards */}
      <SubCategoryCards
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
