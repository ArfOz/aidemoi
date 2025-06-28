import { useTranslations } from "next-intl"
import { CategoryCard } from "./components/category-card"

export default function HomePage() {
  const t = useTranslations()

  const categories = ["moving", "repair", "cleaning", "handyman"]

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{t("home.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((key) => (
          <CategoryCard
            key={key}
            category={{
              id: key,
              name: t(`categories.${key}.name`),
              description: t(`categories.${key}.description`),
              icon: t(`categories.${key}.icon`),
            }}
          />
        ))}
      </div>
    </main>
  )
}
