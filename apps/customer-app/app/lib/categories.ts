import { cache } from 'react';
import { CategoriesListSuccessResponse } from '@api';

export type CategoryView = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const getCategories = cache(
  async (locale: string): Promise<CategoryView[]> => {
    try {
      const res = await fetch(
        'http://localhost:3300/api/v1/categories/categories',
        {
          next: { revalidate: 60 },
        }
      );
      if (!res.ok) return [];

      const json = (await res.json()) as CategoriesListSuccessResponse;
      const items = json?.data?.categories ?? [];

      return items.map((c) => {
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
    } catch {
      return [];
    }
  }
);
