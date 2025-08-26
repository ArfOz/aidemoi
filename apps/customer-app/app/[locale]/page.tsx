import { getLocale, getTranslations } from 'next-intl/server';
import { CategoryCard } from './components/category-card';

type BackendCategory = {
  id: string;
  name?: string | null;
  icon?: string | null;
  sortOrder?: number | null;
  i18n?: Array<{
    locale: string;
    name: string;
    description?: string | null;
  }>;
};

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();

  let categories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }> = [];

  try {
    const res = await fetch(
      'http://localhost:3300/api/v1/categories/categories',
      { cache: 'no-store' }
    );

    if (res.ok) {
      const json = (await res.json()) as {
        success: boolean;
        data?: { categories?: BackendCategory[] };
      };

      const items = json?.data?.categories ?? [];
      categories = items.map((c) => {
        const match =
          c.i18n?.find((x) => x.locale === locale) ??
          c.i18n?.find((x) => x.locale?.startsWith('en')) ??
          c.i18n?.[0];
        return {
          id: c.id,
          name: match?.name ?? c.name ?? c.id,
          description: match?.description ?? '',
          icon: c.icon ?? '📁',
        };
      });
    }
  } catch {
    // On error, fall back to empty list; UI remains usable
    categories = [];
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{t('home.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>
    </main>
  );
}
