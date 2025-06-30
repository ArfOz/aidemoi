"use client"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import React from "react"

export default function CleaningPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const cleaning = t.raw("categories.cleaning")

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{cleaning.name}</h1>
      <p>{cleaning.description}</p>
      <div>Current language: {locale}</div>
      {/* Your cleaning page content goes here */}
    </main>
  )
}
