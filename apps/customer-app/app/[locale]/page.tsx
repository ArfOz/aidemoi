import { getLocale, getTranslations } from 'next-intl/server';
import { CategoryCard } from './components/category-card';
import { getCategories } from '../../lib/categories';

// Cache all fetches in this route for 60s
export const revalidate = 60;

export default async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();

  const categories = await getCategories(locale);

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
