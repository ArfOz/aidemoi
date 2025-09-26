import React from 'react';
import { getLocale } from 'next-intl/server';
import { apiAideMoi, CategoryDetailSuccessResponse } from '@api';

export default async function Page({
  params,
}: {
  params: { locale: string; category: string; subcategory: string };
}) {
  const locale = await getLocale();
  const { category, subcategory } = params;

  // Önce kategori datasını al
  const catRes = await apiAideMoi.get<CategoryDetailSuccessResponse>(
    `/categories/category/${category}?languages=${locale}`
  );
  const activeCat = catRes?.data?.category;

  if (!activeCat) {
    return <p>Category not found.</p>;
  }

  // slug'a göre subcategory bul
  const activeSubcat = activeCat.subcategories?.find(
    (s) => s.slug === subcategory
  );

  if (!activeSubcat) {
    return <p>Subcategory not found.</p>;
  }

  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      <p>Subcategory: {activeSubcat.name}</p>
      <p>ID: {activeSubcat.id}</p>
    </div>
  );
}
