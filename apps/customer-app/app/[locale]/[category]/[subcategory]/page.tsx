'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  apiAideMoi,
  CategoryDetailSuccessResponse,
  QuestionGetSuccessResponse,
} from '@api';
import { NavigationButton, QuestionSection } from './components';
import {
  AnswersState,
  I18nTranslation,
  Question,
  SubcategoryWithI18n,
} from './components/types';

// --- Page Component ---
export default function Page() {
  // --- useParams ---
  const rawParams = useParams();

  // --- Safe parameters ---
  const locale = Array.isArray(rawParams?.locale)
    ? rawParams.locale[0]
    : rawParams?.locale;
  const category = Array.isArray(rawParams?.category)
    ? rawParams.category[0]
    : rawParams?.category;
  const subcategory = Array.isArray(rawParams?.subcategory)
    ? rawParams.subcategory[0]
    : rawParams?.subcategory;

  // --- Hooks: always at the top ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeSubcat, setActiveSubcat] = useState<any>(null);
  const [answers, setAnswers] = useState<AnswersState>({
    date: {},
    time: {},
    text: {},
    number: {},
    options: {},
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- Handlers ---
  const handleOptionClick = useCallback(
    (questionId: string, optionValue: string, isMulti: boolean): void => {
      setAnswers((prev) => {
        const current = prev.options[questionId] || [];
        return {
          ...prev,
          options: {
            ...prev.options,
            [questionId]: isMulti
              ? current.includes(optionValue)
                ? current.filter((v) => v !== optionValue)
                : [...current, optionValue]
              : current.includes(optionValue)
              ? []
              : [optionValue],
          },
        };
      });
    },
    []
  );

  const handleDateChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      date: { ...prev.date, [questionId]: value },
    }));
  }, []);

  const handleTextChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      text: { ...prev.text, [questionId]: value },
    }));
  }, []);

  const handleNumberChange = useCallback(
    (questionId: string, value: string) => {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setAnswers((prev) => ({
          ...prev,
          number: { ...prev.number, [questionId]: value },
        }));
      }
    },
    []
  );

  const isQuestionAnswered = useCallback(
    (question: Question) => {
      if (!question) return false;
      if (!question.required) return true;

      const { id, type } = question;
      const value =
        type === 'date'
          ? answers.date[id]
          : type === 'time'
          ? answers.time[id]
          : type === 'text'
          ? answers.text[id]
          : type === 'number'
          ? answers.number[id]
          : ['single', 'multi', 'select'].includes(type)
          ? answers.options[id]
          : null;

      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') {
        return type === 'number'
          ? value.trim() !== '' && !isNaN(Number(value))
          : value.trim() !== '';
      }
      return false;
    },
    [answers]
  );

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // --- useEffect: unconditional, at the top ---
  useEffect(() => {
    if (!locale || !category || !subcategory) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const catRes = await apiAideMoi.get<CategoryDetailSuccessResponse>(
          `/categories/category/${category}?languages=${locale}`
        );
        const activeCat = catRes?.data?.category;
        if (!activeCat) return;

        const subcat = activeCat.subcategories?.find(
          (s) => s.slug === subcategory
        );
        if (!subcat) return;

        setActiveSubcat(subcat);

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
  }, [locale, category, subcategory]);

  // --- Early returns only in render section ---
  if (!locale || !category || !subcategory)
    return <div>Invalid URL parameters</div>;
  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (!activeSubcat)
    return <div style={{ padding: 12 }}>Subcategory not found.</div>;

  // Add these interfaces at the top of the file, after the existing imports

  // Then the selected code becomes:
  const subcatI18n: I18nTranslation | undefined =
    (activeSubcat as SubcategoryWithI18n).i18n?.find(
      (x: I18nTranslation) => x.locale === locale
    ) ||
    (activeSubcat as SubcategoryWithI18n).i18n?.find((x: I18nTranslation) =>
      x.locale.startsWith('en')
    ) ||
    (activeSubcat as SubcategoryWithI18n).i18n?.[0];
  const subcatName = subcatI18n?.name || activeSubcat.name || activeSubcat.slug;

  // --- Render ---
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

          <QuestionSection
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            params={{ locale, category, subcategory }}
            answers={answers}
            handleDateChange={handleDateChange}
            handleTextChange={handleTextChange}
            handleNumberChange={handleNumberChange}
            handleOptionClick={handleOptionClick}
          />

          <NavigationButton
            question={questions[currentQuestionIndex]}
            goToPreviousQuestion={goToPreviousQuestion}
            currentQuestionIndex={currentQuestionIndex}
            isQuestionAnswered={isQuestionAnswered(
              questions[currentQuestionIndex]
            )}
            goToNextQuestion={goToNextQuestion}
          />
        </div>
      ) : (
        <div>No questions found for this subcategory.</div>
      )}
    </div>
  );
}
