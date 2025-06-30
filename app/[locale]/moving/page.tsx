"use client"
import { useTranslations } from "next-intl"
import React from "react"

export default function MovingPage() {
  const t = useTranslations()

  // Get moving category data from the current language JSON
  const moving = t.raw("categories.moving")

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{moving.name}</h1>
      <p>{moving.description}</p>
      {/* Your moving page content goes here */}
    </main>
  )
}
