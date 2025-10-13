'use client';
import { useParams, useRouter } from 'next/navigation';
import { CategoriesListSuccessResponse } from '@api';

type CategoryType = CategoriesListSuccessResponse['data']['categories'][0];

export function CategoryCard({ cat }: { cat: CategoryType }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Find the appropriate i18n entry for the current locale
  const catI18n =
    cat.i18n?.find((x) => x.locale === locale) ||
    cat.i18n?.find((x) => x.locale?.startsWith('en')) ||
    cat.i18n?.[0];

  const categoryName = catI18n?.name || cat.name || cat.id;
  const categoryDescription = catI18n?.description || '';
  const categoryIcon = cat.icon || '📦';

  return (
    <div
      onClick={() => router.push(`/${locale}/${cat.id}`)}
      className="p-4 rounded-2xl shadow-md border cursor-pointer hover:shadow-lg transition bg-white"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/${locale}/${cat.id}`);
        }
      }}
    >
      <div className="text-4xl">{categoryIcon}</div>
      <h2 className="font-semibold text-lg mt-2">{categoryName}</h2>
      <p className="text-sm text-gray-500">{categoryDescription}</p>
    </div>
  );
}
