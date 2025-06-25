// import { useTranslations } from "next-intl"

// export default function Home() {
//   const t = useTranslations("index")
//   return (
//     <div>
//       <h1>{t("welcome")}</h1>
//       <p>{t("description")}</p>
//     </div>
//   )
// }
import { getTranslations } from "next-intl/server"

export default async function HomePage() {
  const t = await getTranslations("Index")
  return <h1>{t("welcome")}</h1>
}
