'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  apiAideMoi,
  CategoryDetailSuccessResponse,
  QuestionGetSuccessResponse,
} from '@api';
import { NavigationButton, QuestionSection } from './components';

export default function Page() {
  const params = useParams() as {
    locale: string;
    category: string;
    subcategory: string;
  };

  const [questions, setQuestions] = useState<
    QuestionGetSuccessResponse['data']['questions']
  >([]);
  const [activeSubcat, setActiveSubcat] = useState<any>(null);

  // Tek state altında tüm cevapları topluyoruz
  const [answers, setAnswers] = useState<{
    date: Record<string, string>;
    time: Record<string, string>;
    text: Record<string, string>;
    number: Record<string, string>;
    options: Record<string, string[]>;
  }>({
    date: {},
    time: {},
    text: {},
    number: {},
    options: {},
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { category, subcategory, locale } = params;

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

  // --- Handlers ---
  const handleOptionClick = (
    questionId: string,
    optionValue: string,
    isMulti: boolean
  ) => {
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
  };

  const handleDateChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      date: {
        ...prev.date,
        [questionId]: value,
      },
    }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      text: {
        ...prev.text,
        [questionId]: value,
      },
    }));
  };

  const handleNumberChange = (questionId: string, value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAnswers((prev) => ({
        ...prev,
        number: {
          ...prev.number,
          [questionId]: value,
        },
      }));
    }
  };

  // --- Validation ---
  const isQuestionAnswered = useCallback(
    (question: QuestionGetSuccessResponse['data']['questions'][number]) => {
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

  // --- Navigation ---
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

  // --- UI ---
  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (!activeSubcat)
    return <div style={{ padding: 12 }}>Subcategory not found.</div>;

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

          <QuestionSection
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            params={params}
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
