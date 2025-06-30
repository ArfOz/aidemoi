import { useTranslations } from "next-intl"
import { CategoryCard } from "./components/category-card"

export default function HomePage() {
  const t = useTranslations()

  // Get all category keys from the translation file (object keys)
  const categoryKeys = Object.keys(t.raw("categories"))

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{t("home.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categoryKeys.map((key) => {
          const cat = t.raw(`categories.${key}`)
          return (
            <CategoryCard
              key={key}
              category={{
                id: key,
                name: cat.name,
                description: cat.description,
                icon: cat.icon,
              }}
            />
          )
        })}
      </div>
    </main>
  )
}
