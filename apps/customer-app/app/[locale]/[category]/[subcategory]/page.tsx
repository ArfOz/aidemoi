'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  apiAideMoi,
  CategoryDetailSuccessResponse,
  QuestionGetSuccessResponse,
} from '@api';

export default function Page() {
  const params = useParams() as {
    locale: string;
    category: string;
    subcategory: string;
  };
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeSubcat, setActiveSubcat] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { category, subcategory, locale } = params;

        // Fetch category data
        const catRes = await apiAideMoi.get<CategoryDetailSuccessResponse>(
          `/categories/category/${category}?languages=${locale}`
        );
        const activeCat = catRes?.data?.category;

        if (!activeCat) return;

        const subcat = activeCat.subcategories?.find(
          (s: any) => s.slug === subcategory
        );

        if (!subcat) return;

        setActiveSubcat(subcat);

        // Fetch questions
        const questionsRes = await apiAideMoi.get<QuestionGetSuccessResponse>(
          `/questions/subcategory/${subcat.id}?lang=${locale}`
        );
        setQuestions(questionsRes?.data?.questions || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  const handleOptionClick = (
    questionId: number,
    optionValue: string,
    isMulti: boolean
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[questionId] || [];

      if (isMulti) {
        // Multi-select: toggle option
        if (current.includes(optionValue)) {
          return {
            ...prev,
            [questionId]: current.filter((v) => v !== optionValue),
          };
        } else {
          return { ...prev, [questionId]: [...current, optionValue] };
        }
      } else {
        // Single select: replace selection
        return { ...prev, [questionId]: [optionValue] };
      }
    });
  };

  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (!activeSubcat)
    return <div style={{ padding: 12 }}>Subcategory not found.</div>;

  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      <p>Subcategory: {activeSubcat.name}</p>
      <p>ID: {activeSubcat.id}</p>

      <h2 style={{ marginTop: 24, marginBottom: 16 }}>Questions</h2>
      {questions.length > 0 ? (
        <div>
          {questions.map((question) => {
            const translation =
              question.translations?.find(
                (t: any) => t.locale === params.locale
              ) || question.translations?.[0];

            return (
              <div
                key={question.id}
                style={{
                  marginBottom: 24,
                  padding: 16,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  backgroundColor: '#f9fafb',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: 18,
                    color: '#111827',
                  }}
                >
                  {translation?.label || `Question ${question.id}`}
                </h3>

                {translation?.description && (
                  <p style={{ margin: '0 0 12px 0', color: '#6b7280' }}>
                    {translation.description}
                  </p>
                )}

                <div
                  style={{ marginBottom: 8, fontSize: 14, color: '#374151' }}
                >
                  Type: {question.type} {question.required && '(Required)'}
                </div>

                {question.options && question.options.length > 0 && (
                  <div>
                    <strong
                      style={{
                        fontSize: 14,
                        color: '#374151',
                        marginBottom: 8,
                        display: 'block',
                      }}
                    >
                      Options:
                    </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {question.options.map((option: any) => {
                        const optionTranslation =
                          option.translations?.find(
                            (t: any) => t.locale === params.locale
                          ) || option.translations?.[0];

                        const isSelected =
                          selectedOptions[question.id]?.includes(
                            option.value
                          ) || false;
                        const isMulti = question.type === 'multi';

                        return (
                          <button
                            key={option.id}
                            onClick={() =>
                              handleOptionClick(
                                question.id,
                                option.value,
                                isMulti
                              )
                            }
                            style={{
                              padding: '8px 16px',
                              border: `2px solid ${
                                isSelected ? '#3b82f6' : '#d1d5db'
                              }`,
                              borderRadius: 6,
                              backgroundColor: isSelected ? '#eff6ff' : 'white',
                              color: isSelected ? '#1d4ed8' : '#374151',
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: isSelected ? 600 : 400,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {optionTranslation?.label || option.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: '#6b7280' }}>
          No questions found for this subcategory.
        </p>
      )}
    </div>
  );
}
