'use client';
import React from 'react';
import { useParams } from 'next/navigation';

export default function Page() {
  const { subcategory } = useParams() as { subcategory?: string };
  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      {subcategory ?? 'no-subcategory'}
    </div>
  );
}
