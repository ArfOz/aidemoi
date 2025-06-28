import { defineRouting } from "next-intl/routing"
// export const locales = ["en", "de", "fr", "it", "tr"]
export const locales = ["en", "fr"]

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: "en",
})
