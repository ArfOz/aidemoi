"use client"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import React from "react"

export default function RepairPage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  const repair = t.raw("categories.repair")

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>{repair.name}</h1>
      <p>{repair.description}</p>
      <div>Current language: {locale}</div>
      {/* Your repair page content goes here */}
    </main>
  )
}
