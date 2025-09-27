'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  const [dateValues, setDateValues] = useState<Record<number, string>>({});
  const [textValues, setTextValues] = useState<Record<number, string>>({});
  const [numberValues, setNumberValues] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { category, subcategory, locale } = params;

        // Fetch category data with proper locale
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

        // Fetch questions with proper locale
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
        // Single select: toggle selection (allow deselection)
        if (current.includes(optionValue)) {
          // If already selected, deselect it
          return { ...prev, [questionId]: [] };
        } else {
          // If not selected, select it (replace any existing selection)
          return { ...prev, [questionId]: [optionValue] };
        }
      }
    });
  };

  const handleDateChange = (questionId: number, value: string) => {
    setDateValues((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleTextChange = (questionId: number, value: string) => {
    setTextValues((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNumberChange = (questionId: number, value: string) => {
    // Only allow numeric values
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setNumberValues((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    }
  };

  const isQuestionAnswered = useCallback(
    (question: any) => {
      if (!question) {
        return false;
      }

      const questionId = question.id;

      // If not required, always return true
      if (!question.required) {
        return true;
      }

      // For required questions, check if they have valid answers
      switch (question.type) {
        case 'date':
        case 'time':
          return dateValues[questionId] && dateValues[questionId].trim() !== '';
        case 'text':
          return textValues[questionId] && textValues[questionId].trim() !== '';
        case 'number':
          return (
            numberValues[questionId] && numberValues[questionId].trim() !== ''
          );
        case 'single':
        case 'multi':
        case 'select':
          return (
            selectedOptions[questionId] &&
            selectedOptions[questionId].length > 0
          );
        default:
          return false;
      }
    },
    [dateValues, textValues, numberValues, selectedOptions]
  );

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (!activeSubcat)
    return <div style={{ padding: 12 }}>Subcategory not found.</div>;

  // Get localized subcategory name
  const subcatI18n =
    activeSubcat.i18n?.find((x: any) => x.locale === params.locale) ||
    activeSubcat.i18n?.find((x: any) => x.locale?.startsWith('en')) ||
    activeSubcat.i18n?.[0];
  const subcatName = subcatI18n?.name || activeSubcat.name || activeSubcat.slug;
  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      <p>Subcategory: {subcatName}</p>
      <p>ID: {activeSubcat.id}</p>

      <h2 style={{ marginTop: 24, marginBottom: 16 }}>Questions</h2>
      {questions.length > 0 ? (
        <div>
          <div style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>

          {(() => {
            const question = questions[currentQuestionIndex];
            if (!question) return null;

            // Find the translation for current locale
            const translation =
              question.translations?.find(
                (t: any) => t.locale === params.locale
              ) ||
              question.translations?.find((t: any) =>
                t.locale?.startsWith('en')
              ) ||
              question.translations?.[0];

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

                {/* Date/DateTime Input */}
                {(question.type === 'date' || question.type === 'time') && (
                  <div style={{ marginTop: 12 }}>
                    <input
                      type={
                        question.type === 'date'
                          ? 'date'
                          : question.type === 'time'
                          ? 'time'
                          : 'datetime-local'
                      }
                      value={dateValues[question.id] || ''}
                      onChange={(e) =>
                        handleDateChange(question.id, e.target.value)
                      }
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        width: '100%',
                        maxWidth: '300px',
                        fontFamily: 'inherit',
                      }}
                      required={question.required}
                    />
                  </div>
                )}

                {/* Text Input */}
                {question.type === 'text' && (
                  <div style={{ marginTop: 12 }}>
                    <input
                      type="text"
                      value={textValues[question.id] || ''}
                      onChange={(e) =>
                        handleTextChange(question.id, e.target.value)
                      }
                      placeholder={
                        translation?.description || 'Enter your answer...'
                      }
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        width: '100%',
                        maxWidth: '400px',
                        fontFamily: 'inherit',
                      }}
                      required={question.required}
                    />
                  </div>
                )}

                {/* Number Input */}
                {question.type === 'number' && (
                  <div style={{ marginTop: 12 }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={numberValues[question.id] || ''}
                      onChange={(e) =>
                        handleNumberChange(question.id, e.target.value)
                      }
                      onKeyPress={(e) => {
                        // Allow only numbers, decimal point, and control keys
                        if (
                          !/[0-9.]/.test(e.key) &&
                          ![
                            'Backspace',
                            'Delete',
                            'ArrowLeft',
                            'ArrowRight',
                            'Tab',
                          ].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder={
                        translation?.description || 'Enter a number...'
                      }
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: 6,
                        fontSize: 14,
                        width: '100%',
                        maxWidth: '200px',
                        fontFamily: 'inherit',
                      }}
                      required={question.required}
                    />
                  </div>
                )}

                {/* Options for multi/single select */}
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
                        // Find option translation for current locale
                        const optionTranslation =
                          option.translations?.find(
                            (t: any) => t.locale === params.locale
                          ) ||
                          option.translations?.find((t: any) =>
                            t.locale?.startsWith('en')
                          ) ||
                          option.translations?.[0];

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
          })()}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '10px 20px',
                border: '2px solid #d1d5db',
                borderRadius: 6,
                backgroundColor:
                  currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
                color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Previous
            </button>

            <button
              onClick={() => {
                console.log(
                  'Next button clicked, current question answered:',
                  isQuestionAnswered(questions[currentQuestionIndex])
                );
                goToNextQuestion();
              }}
              disabled={
                currentQuestionIndex >= questions.length - 1 ||
                !isQuestionAnswered(questions[currentQuestionIndex])
              }
              style={{
                padding: '10px 20px',
                border: '2px solid #3b82f6',
                borderRadius: 6,
                backgroundColor:
                  currentQuestionIndex >= questions.length - 1 ||
                  !isQuestionAnswered(questions[currentQuestionIndex])
                    ? '#f3f4f6'
                    : '#3b82f6',
                color:
                  currentQuestionIndex >= questions.length - 1 ||
                  !isQuestionAnswered(questions[currentQuestionIndex])
                    ? '#9ca3af'
                    : 'white',
                cursor:
                  currentQuestionIndex >= questions.length - 1 ||
                  !isQuestionAnswered(questions[currentQuestionIndex])
                    ? 'not-allowed'
                    : 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {currentQuestionIndex >= questions.length - 1
                ? 'Complete'
                : 'Next'}
            </button>
          </div>
        </div>
      ) : (
        <div>No questions found for this subcategory.</div>
      )}
    </div>
  );
}
