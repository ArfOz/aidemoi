import { getLocale, getTranslations } from 'next-intl/server';
import { CategoryCard } from '@components';
import { Static } from '@sinclair/typebox';
import {
  apiAideMoi,
  ApiResponseSuccessSchema,
  CategoriesListResponseSchema,
  CategoriesListSuccessResponse,
  // CategoriesListResponseType,
  CategoriesListSuccessResponseSchema,
} from '@api';

type CategoriesListData = Static<typeof CategoriesListResponseSchema>;
export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();

  const params = new URLSearchParams({ languages: locale });

  let categories: CategoriesListData['categories'] = [];

  try {
    const res = await apiAideMoi.get<CategoriesListSuccessResponse>(
      `/categories/categories?${params.toString()}`
    );

    if (res.success) {
      // ✅ Artık TS biliyor: res.data.categories mevcut ve doğru tipte
      categories = res.data.categories;
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {t('empty', { default: 'No categories found.' })}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </main>
  );
}
