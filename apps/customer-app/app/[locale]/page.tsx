import { getLocale, getTranslations } from 'next-intl/server';
import { CategoryCard } from '@components';
import { apiAideMoi, CategoriesListSuccessResponse } from '@api';

// Cache all fetches in this route for 60s
export const revalidate = 60;

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();

  const params = new URLSearchParams({ languages: String(locale) });

  let categoriesRes: CategoriesListSuccessResponse | null = null;
  try {
    categoriesRes = await apiAideMoi.get<CategoriesListSuccessResponse>(
      `/categories/categories?${params.toString()}`
    );
  } catch {
    // swallow and show fallback UI below
  }

  const items = categoriesRes?.data?.categories ?? [];

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{t('title')}</h1>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">
          {t('empty', { default: 'No categories found.' })}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </main>
  );
}
