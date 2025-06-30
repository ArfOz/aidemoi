"use client"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import React from "react"

export default function HandymanPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const handyman = t.raw("categories.handyman")

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{handyman.name}</h1>
      <p>{handyman.description}</p>
      <div>Current language: {locale}</div>
      {/* Your handyman page content goes here */}
    </main>
  )
}
