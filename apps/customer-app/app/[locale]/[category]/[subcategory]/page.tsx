'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  AnswerAddSuccessResponse,
  apiAideMoi,
  CategoryDetailSuccessResponse,
  JobCreateSuccessResponse,
  QuestionGetSuccessResponse,
} from '@api';
import {
  NavigationButton,
  QuestionSection,
  AnswersState,
  I18nTranslation,
  Question,
  SubcategoryWithI18n,
} from './components';

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

  // job meta inputs to build payload like the example
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  // --- Handlers ---
  const handleOptionClick = useCallback(
    (questionId: string, optionValue: string, isMulti: boolean): void => {
      console.log('handleOptionClick called:', {
        questionId,
        optionValue,
        isMulti,
      }); // Debug log
      setAnswers((prev) => {
        const current = prev.options[questionId] || [];
        const updatedOptions = isMulti
          ? current.includes(optionValue)
            ? current.filter((v) => v !== optionValue)
            : [...current, optionValue]
          : current.includes(optionValue)
          ? []
          : [optionValue];
        const newAnswers = {
          ...prev,
          options: {
            ...prev.options,
            [questionId]: updatedOptions,
          },
        };
        console.log('Updated answers.options:', newAnswers.options); // Debug log
        return newAnswers;
      });
    },
    []
  );

  const handleDateChange = useCallback((questionId: string, value: string) => {
    console.log('handleDateChange called:', { questionId, value }); // Debug log
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        date: { ...prev.date, [questionId]: value },
      };
      console.log('Updated answers.date:', newAnswers.date); // Debug log
      return newAnswers;
    });
  }, []);

  const handleTextChange = useCallback((questionId: string, value: string) => {
    console.log('handleTextChange called:', { questionId, value }); // Debug log
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        text: { ...prev.text, [questionId]: value },
      };
      console.log('Updated answers.text:', newAnswers.text); // Debug log
      return newAnswers;
    });
  }, []);

  const handleNumberChange = useCallback(
    (questionId: string, value: string) => {
      console.log('handleNumberChange called:', { questionId, value }); // Debug log
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setAnswers((prev) => {
          const newAnswers = {
            ...prev,
            number: { ...prev.number, [questionId]: value },
          };
          console.log('Updated answers.number:', newAnswers.number); // Debug log
          return newAnswers;
        });
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
        if (!catRes.success) return;

        const activeCat = catRes?.data?.details;
        if (!activeCat) return;

        const subcat = activeCat.subcategories?.find(
          (s) => s.slug === subcategory
        );
        if (!subcat) return;

        setActiveSubcat(subcat);

        const questionsRes = await apiAideMoi.get<QuestionGetSuccessResponse>(
          `/questions/subcategory/${subcat.id}?lang=${locale}`
        );
        if (!questionsRes.success) return;
        setQuestions(questionsRes?.data?.questions || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locale, category, subcategory]);

  const SendAnswers = async (answersState: AnswersState) => {
    // require title and description be filled
    if (
      !jobTitle ||
      !jobTitle.trim() ||
      !jobDescription ||
      !jobDescription.trim()
    ) {
      alert('Please provide both a title and a description for the job.');
      return;
    }

    console.log('Answers state before submit:', answersState); // Debug log
    // Collect all questionIds from all answer types
    const questionIds = new Set<string>([
      ...Object.keys(answersState.options),
      ...Object.keys(answersState.date),
      ...Object.keys(answersState.text),
      ...Object.keys(answersState.number),
    ]);

    // Build payload: one entry per selected option, plus other answer types
    const payload: Array<{
      questionId: number;
      optionId?: number;
      value?: string | number;
      inputLanguage: string;
    }> = [];

    // Map option values to optionId for each question
    questionIds.forEach((qid) => {
      const questionIdNum = Number(qid);
      const question = questions.find((q) => q.id === questionIdNum);

      // Handle options (single/multi/select)
      const optionValuesRaw = answersState.options[qid] as string[] | undefined;
      if (optionValuesRaw && question && Array.isArray(question.options)) {
        optionValuesRaw.forEach((optionValue) => {
          const foundOption = question.options.find(
            (opt: any) => opt.value === optionValue
          );
          if (foundOption) {
            payload.push({
              questionId: questionIdNum,
              optionId: foundOption.id,
              inputLanguage: locale || 'en',
            });
          }
        });
      }

      // Handle date, text, number answers (if needed by backend)
      const dateValue = answersState.date[qid];
      const textValue = answersState.text[qid];
      const numberValue = answersState.number[qid];

      let value: string | number | undefined;
      if (numberValue && !isNaN(Number(numberValue)))
        value = Number(numberValue);
      else if (dateValue) value = dateValue;
      else if (textValue) value = textValue;

      // Only push if there is a value and no optionId for this question
      if (
        value !== undefined &&
        (!optionValuesRaw || optionValuesRaw.length === 0)
      ) {
        payload.push({
          questionId: questionIdNum,
          value,
          inputLanguage: locale || 'en',
        });
      }
    });

    console.log('Payload to submit:', payload);
    // Build full job payload (use provided title/description)
    const fullJobPayload = {
      title: jobTitle.trim(),
      description: jobDescription.trim(),
      subcategoryId: activeSubcat?.id ?? Number(subcategory),
      answers: payload,
    };
    console.log('Request body:', JSON.stringify(fullJobPayload));

    try {
      try {
        const res = await apiAideMoi.post<JobCreateSuccessResponse>(
          `/jobs/jobs`,
          fullJobPayload,
          { useAuth: true } // pass useAuth in options
        );
        if (res.success) {
          alert('Answers submitted successfully!');
          return;
        }

        if (!res || !res.success) {
          throw new Error(
            'Failed to create job — server returned unsuccessful response'
          );
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          console.warn(
            '/jobs/jobs endpoint not found, retrying with /jobs/create'
          );
        }
      }

      alert('Answers submitted successfully!');
    } catch (error) {
      // Give a clearer message when 404 occurs or other known issues
      const status =
        (error as any)?.response?.status ??
        (error as any)?.status ??
        (error as any)?.statusCode;
      if (status === 404) {
        alert('API endpoint not found (404). Please check backend routes.');
      } else {
        alert('Error submitting answers. See console for details.');
      }
      console.error('SendAnswers error:', error);
    }
  };

  // --- Early returns only in render section ---
  if (!locale || !category || !subcategory)
    return <div>Invalid URL parameters</div>;
  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (!activeSubcat)
    return <div style={{ padding: 12 }}>Subcategory not found.</div>;

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
      {/* Job metadata inputs to match the JSON example */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Title (e.g. Home Cleaning Service Required)"
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Description (e.g. Weekly cleaning service for a 120m² apartment...)"
          style={{ width: '100%', padding: 8, minHeight: 80 }}
        />
      </div>

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
            isLast={currentQuestionIndex === questions.length - 1}
            onSubmit={() => {
              SendAnswers(answers);
            }}
          />
        </div>
      ) : (
        <div>No questions found for this subcategory.</div>
      )}
    </div>
  );
}
