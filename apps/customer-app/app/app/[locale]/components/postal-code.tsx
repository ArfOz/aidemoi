import React, { useState } from "react"
import postalCodes from "./postal-code/postal_code.json" // Adjust path if needed

type PostalCodeEntry = {
  name: string
  canton: string
  latitude: string
  longitude: string
}

type Suggestion = {
  code: string
  name: string
  label: string
}

export const PostalCodes: React.FC = () => {
  const [addressInput, setAddressInput] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // Flatten postal codes for search
  const postalList: Suggestion[] = Object.entries(postalCodes).flatMap(
    ([code, arr]: [string, PostalCodeEntry[]]) =>
      arr.map((entry: PostalCodeEntry) => ({
        code,
        name: entry.name,
        label: `${entry.name} (${code})`,
      }))
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddressInput(value)
    if (value.length > 1) {
      const filtered = postalList.filter(
        (item) =>
          item.code.startsWith(value) ||
          item.name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 10))
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setAddressInput(suggestion.label)
    setSuggestions([])
    // Optionally, handle selection (e.g., update parent state)
  }

  return (
    <div className="relative">
      <input
        type="text"
        className="px-4 py-2 rounded-lg text-lg text-pink-700 bg-white border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
        placeholder="Sélectionnez une adresse"
        value={addressInput}
        onChange={handleInputChange}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-pink-200 w-full mt-1 rounded shadow">
          {suggestions.map((s, idx) => (
            <li
              key={s.code + s.name + idx}
              className="px-4 py-2 hover:bg-pink-100 cursor-pointer"
              onClick={() => handleSuggestionClick(s)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
