'use client';

import React, { useId, useMemo, useState } from 'react';
import postalCodes from './postal-code/postal_code.json'; // Adjust path if needed

type PostalCodeEntry = {
  name: string;
  canton: string;
  latitude: string;
  longitude: string;
};

type Suggestion = {
  code: string;
  name: string;
  label: string;
};

type PostalCodesProps = {
  onSelect?: (value: Suggestion) => void;
};

export const PostalCodes: React.FC<PostalCodesProps> = ({ onSelect }) => {
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const listId = useId();
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Flatten postal codes for search
  const postalList: Suggestion[] = useMemo(
    () =>
      Object.entries(postalCodes).flatMap(
        ([code, arr]: [string, PostalCodeEntry[]]) =>
          arr.map((entry: PostalCodeEntry) => ({
            code,
            name: entry.name,
            label: `${entry.name} (${code})`,
          }))
      ),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    if (value.length > 1) {
      const filtered = postalList.filter(
        (item) =>
          item.code.startsWith(value.trim()) ||
          item.name.toLowerCase().includes(value.trim().toLowerCase())
      );
      setSuggestions(filtered.slice(0, 10));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setAddressInput(suggestion.label);
    setSuggestions([]);
    setActiveIndex(-1);
    // Optionally, handle selection (e.g., update parent state)
    onSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="px-4 py-2 rounded-lg text-lg text-pink-700 bg-white border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
        placeholder="Sélectionnez une adresse"
        value={addressInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        aria-controls={suggestions.length > 0 ? listId : undefined}
        aria-activedescendant={
          suggestions.length > 0 && activeIndex >= 0
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
      />
      {suggestions.length > 0 && (
        <ul
          id={listId}
          className="absolute z-10 bg-white border border-pink-200 w-full mt-1 rounded shadow"
          role="listbox"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.code + s.name + idx}
              className={`px-4 py-2 cursor-pointer ${
                idx === activeIndex ? 'bg-pink-100' : 'hover:bg-pink-100'
              }`}
              onClick={() => handleSuggestionClick(s)}
              role="option"
              aria-selected={idx === activeIndex}
              id={`${listId}-option-${idx}`}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
