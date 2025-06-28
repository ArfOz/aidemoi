// src/components/service/category-card.tsx
"use client"

import { useRouter } from "next/navigation"

type Props = {
  category: {
    id: string
    name: string
    description: string
    icon: string
  }
}

export function CategoryCard({ category }: Props) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/request/new?category=${category.id}`)}
      className="p-4 rounded-2xl shadow-md border cursor-pointer hover:shadow-lg transition bg-white"
    >
      <div className="text-4xl">{category.icon}</div>
      <h2 className="font-semibold text-lg mt-2">{category.name}</h2>
      <p className="text-sm text-gray-500">{category.description}</p>
    </div>
  )
}
