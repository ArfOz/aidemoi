'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  apiAideMoi,
  CategoryDetailSuccessResponse,
  QuestionGetSuccessResponse,
} from '@api';
import { NavigationButton, QuestionType } from './components';

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
                <QuestionType
                  question={question}
                  dateValues={dateValues}
                  textValues={textValues}
                  numberValues={numberValues}
                  translation={translation}
                  selectedOptions={selectedOptions}
                  params={params}
                  handleDateChange={handleDateChange}
                  handleTextChange={handleTextChange}
                  handleNumberChange={handleNumberChange}
                  handleOptionClick={handleOptionClick}
                />
              </div>
            );
          })()}

          {/* Navigation Buttons */}
          <NavigationButton
            questions={questions[currentQuestionIndex]}
            goToPreviousQuestion={() => goToPreviousQuestion()}
            currentQuestionIndex={() => currentQuestionIndex}
            isQuestionAnswered={() =>
              isQuestionAnswered(questions[currentQuestionIndex])
            }
            goToNextQuestion={() => goToNextQuestion()}
          />
        </div>
      ) : (
        <div>No questions found for this subcategory.</div>
      )}
    </div>
  );
}
