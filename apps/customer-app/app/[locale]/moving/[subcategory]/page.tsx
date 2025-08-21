'use client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Specialty {
  icon: React.ReactNode;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  specialties?: Record<string, Specialty>;
}

export default function MovingSubcategoryPage() {
  const t = useTranslations();
  const { subcategory } = useParams<{ subcategory: string }>();

  const categoriesArr = t.raw('categories') as Category[];
  const moving = categoriesArr.find((cat: Category) => cat.id === 'moving');
  const spec = moving?.specialties?.[subcategory];

  if (!spec) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Not found</h1>
        <p>Subcategory "{subcategory}" does not exist.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{spec.name}</h1>
      <div style={{ marginTop: '0.5rem' }}>{spec.description}</div>
    </main>
  );
}
