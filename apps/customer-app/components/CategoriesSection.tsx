'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

type Stats = {
  professionals?: number;
  rating?: { value: number; reviews: number };
};
type Category = {
  id: string;
  name: string;
  description: string;
  icon?: string; // emoji/icon string from messages
  cover?: string; // optional image url
  stats?: Stats;
};

export default function CategoriesSection() {
  const t = useTranslations();
  const locale = useLocale();
  const categories = (t.raw('categories') as Category[]) || [];

  const labels = useMemo(
    () =>
      locale?.startsWith('fr')
        ? { pros: 'professionnels', reviews: 'avis' }
        : { pros: 'professionals', reviews: 'reviews' },
    [locale]
  );

  return (
    <section className="py-6">
      {categories.length === 0 ? (
        <div className="text-gray-500 text-sm">No categories to show.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/${cat.id}`}
              aria-label={`${cat.name} category`}
              title={cat.name}
              className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow"
            >
              <div className="relative h-36 bg-gray-100">
                {cat.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.cover}
                    alt={cat.name || 'Category'}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">
                    {cat.icon || '🧩'}
                  </div>
                )}
                {cat.icon && cat.cover && (
                  <div className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-1 text-lg">
                    {cat.icon}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="text-base font-bold">{cat.name}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {cat.description}
                </div>

                {(cat.stats?.professionals || cat.stats?.rating) && (
                  <div className="mt-2.5 flex gap-3 text-sm text-gray-700">
                    {typeof cat.stats?.professionals === 'number' && (
                      <span>
                        👤 {cat.stats.professionals.toLocaleString(locale)}{' '}
                        {labels.pros}
                      </span>
                    )}
                    {cat.stats?.rating && (
                      <span>
                        ⭐ {cat.stats.rating.value.toFixed(1)} (
                        {cat.stats.rating.reviews.toLocaleString(locale)}{' '}
                        {labels.reviews})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
