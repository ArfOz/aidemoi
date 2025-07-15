// src/components/service/category-card.tsx
"use client"

import type { ReactNode } from "react"
import { useParams, useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
  description: string
  icon: ReactNode
}

export function CategoryCard({ cat }: { cat: Category }) {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || "en"

  return (
    <div
      onClick={() => router.push(`/${locale}/${cat.id}`)}
      className="p-4 rounded-2xl shadow-md border cursor-pointer hover:shadow-lg transition bg-white"
      role="button"
      tabIndex={0}
    >
      <div className="text-4xl">{cat.icon}</div>
      <h2 className="font-semibold text-lg mt-2">{cat.name}</h2>
      <p className="text-sm text-gray-500">{cat.description}</p>
    </div>
  )
}
