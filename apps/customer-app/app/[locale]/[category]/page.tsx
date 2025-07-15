"use client"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { ReactNode } from "react"
interface Specialty {
  icon: ReactNode
  name: string
  description: string
}

interface Category {
  id: string
  name: string
  description: string
  specialties?: Specialty[]
}

export default function CategoryPage() {
  const t = useTranslations()
  const params = useParams()
  const categoryId = params.category as string

  // Get the categories array from translations
  const categories = t.raw("categories") as Array<Category>
  const category = categories.find((cat) => cat.id === categoryId)

  if (!category) {
    return <div>Category not found</div>
  }

  console.log("Category:", category)

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{category.name}</h1>
      <p>{category.description}</p>

      {category?.specialties &&
        Object.entries(category.specialties).map(
          ([key, spec]: [string, Specialty]) => (
            <li key={key} style={{ marginBottom: "1rem" }}>
              <div style={{ fontWeight: "bold" }}>
                {spec.icon} {spec.name}
              </div>
              <div style={{ color: "#555" }}>{spec.description}</div>
            </li>
          )
        )}
    </main>
  )
}
