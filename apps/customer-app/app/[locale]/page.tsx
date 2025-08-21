import { useTranslations } from 'next-intl';
import { CategoryCard } from './components/category-card';

export default function HomePage() {
  const t = useTranslations();

  // Get the categories array directly from the translation file
  const categories = t.raw('categories') as Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;

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
