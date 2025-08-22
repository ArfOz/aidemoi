'use client';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import React, { useMemo, useState, useEffect } from 'react';

interface Specialty {
  icon: React.ReactNode;
  name: string;
  description: string;
}

type QuestionType =
  | 'single'
  | 'multi'
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'select';
interface QuestionOption {
  value: string;
  label: string;
}
interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required?: boolean;
  options?: QuestionOption[]; // for single/multi/select
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  allowOther?: boolean; // for single "Other"
  otherLabel?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  specialties?: Record<string, Specialty>;
  questions?: Question[]; // NEW: category-level questions for moving
}

export default function MovingPage() {
  const t = useTranslations();
  const locale = useLocale();
  // Get the categories array from the translation file
  const categoriesArr = t.raw('categories') as Category[];
  // Find the moving category by id
  const moving = categoriesArr.find((cat: Category) => cat.id === 'moving');

  // Questionnaire state
  const questions = useMemo(() => moving?.questions ?? [], [moving?.questions]);
  const total = questions.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const q = questions[step];

  useEffect(() => {
    // reset when locale or question set changes
    setStep(0);
    setAnswers({});
    setError(null);
  }, [locale, questions.length]);

  const setSingle = (qid: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [qid]: value }));

  const toggleMulti = (qid: string, value: string, checked: boolean) =>
    setAnswers((prev) => {
      const prevArr = Array.isArray(prev[qid]) ? (prev[qid] as string[]) : [];
      const next = checked
        ? [...new Set([...prevArr, value])]
        : prevArr.filter((v) => v !== value);
      return { ...prev, [qid]: next };
    });

  const setOtherText = (qid: string, text: string) =>
    setAnswers((prev) => ({ ...prev, [`${qid}__other`]: text }));

  const isCurrentAnswered = (): boolean => {
    if (!q) return true;
    const v = answers[q.id];
    if (q.type === 'multi')
      return Array.isArray(v) ? v.length > 0 : !q.required;
    if (q.type === 'number') {
      if (typeof v !== 'string' || v.trim() === '') return !q.required;
      const n = Number(v);
      if (Number.isNaN(n)) return false;
      if (q.min !== undefined && n < q.min) return false;
      if (q.max !== undefined && n > q.max) return false;
      return true;
    }
    if (q.type === 'single' && v === '__other__') {
      const ov = (answers[`${q.id}__other`] as string) || '';
      return ov.trim() !== '' || !q.required;
    }
    if (typeof v === 'string') return v.trim() !== '' || !q.required;
    return !!v || !q.required;
  };

  const resolveAnswers = () => {
    const out: Record<string, string | string[]> = { ...answers };
    questions.forEach((qq) => {
      if (qq.type === 'single' && out[qq.id] === '__other__') {
        const ov = (out[`${qq.id}__other`] as string) || '';
        out[qq.id] = ov.trim();
        delete out[`${qq.id}__other`];
      }
    });
    return out;
  };

  const onNext = () => {
    setError(null);
    if (!isCurrentAnswered()) {
      setError('Please answer this question to continue.');
      return;
    }
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      void onSubmit();
    }
  };

  const onBack = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        category: 'moving',
        answers: resolveAnswers(),
      };
      // TODO: send payload to API
      // await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      console.log('Submitting moving questionnaire:', payload);
    } catch {
      setError('Failed to submit. Please try again.');
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{moving?.name}</h1>
      <p>{moving?.description}</p>

      {/* Questions (category-level) */}
      {total > 0 && (
        <section
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '1rem',
            margin: '1rem 0',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Questions</div>
          {q ? (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {q.text} {q.required ? '*' : ''}
              </div>

              {q.type === 'single' && (
                <div>
                  {q.options?.map((opt) => (
                    <label
                      key={opt.value}
                      style={{ display: 'block', marginTop: 6 }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={answers[q.id] === opt.value}
                        onChange={() => setSingle(q.id, opt.value)}
                      />{' '}
                      {opt.label}
                    </label>
                  ))}
                  {q.allowOther && (
                    <div style={{ marginTop: 6 }}>
                      <label style={{ display: 'block' }}>
                        <input
                          type="radio"
                          name={q.id}
                          value="__other__"
                          checked={answers[q.id] === '__other__'}
                          onChange={() => setSingle(q.id, '__other__')}
                        />{' '}
                        {q.otherLabel || 'Other'}
                      </label>
                      {answers[q.id] === '__other__' && (
                        <input
                          type="text"
                          placeholder={q.placeholder || 'Please specify'}
                          style={{ marginTop: 6, width: '100%' }}
                          value={(answers[`${q.id}__other`] as string) || ''}
                          onChange={(e) =>
                            setOtherText(q.id, e.currentTarget.value)
                          }
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {q.type === 'multi' && (
                <div>
                  {q.options?.map((opt) => {
                    const arr = (answers[q.id] as string[]) || [];
                    const checked = arr.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        style={{ display: 'block', marginTop: 6 }}
                      >
                        <input
                          type="checkbox"
                          name={`${q.id}-${opt.value}`}
                          value={opt.value}
                          checked={checked}
                          onChange={(e) =>
                            toggleMulti(
                              q.id,
                              opt.value,
                              e.currentTarget.checked
                            )
                          }
                        />{' '}
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === 'select' && (
                <select
                  style={{ width: '100%', marginTop: 6 }}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => setSingle(q.id, e.currentTarget.value)}
                >
                  <option value="" disabled>
                    {q.placeholder || 'Select...'}
                  </option>
                  {q.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {q.type === 'text' && (
                <textarea
                  rows={4}
                  placeholder={q.placeholder}
                  style={{ width: '100%', marginTop: 6 }}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => setSingle(q.id, e.currentTarget.value)}
                />
              )}

              {q.type === 'number' && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    marginTop: 6,
                  }}
                >
                  <input
                    type="number"
                    placeholder={q.placeholder}
                    min={q.min}
                    max={q.max}
                    style={{ width: '100%' }}
                    value={(answers[q.id] as string) || ''}
                    onChange={(e) => setSingle(q.id, e.currentTarget.value)}
                  />
                  {q.unit && <span>{q.unit}</span>}
                </div>
              )}

              {q.type === 'date' && (
                <input
                  type="date"
                  style={{ width: '100%', marginTop: 6 }}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => setSingle(q.id, e.currentTarget.value)}
                />
              )}

              {q.type === 'time' && (
                <input
                  type="time"
                  style={{ width: '100%', marginTop: 6 }}
                  value={(answers[q.id] as string) || ''}
                  onChange={(e) => setSingle(q.id, e.currentTarget.value)}
                />
              )}

              {error && (
                <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!isCurrentAnswered() || submitting}
                >
                  {step === total - 1
                    ? submitting
                      ? 'Submitting...'
                      : 'Submit'
                    : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666' }}>No questions for this category.</div>
          )}
        </section>
      )}

      <h2>Specialties</h2>
      <ul>
        {moving?.specialties &&
          Object.entries(moving.specialties).map(
            ([key, spec]: [string, Specialty]) => (
              <li key={key} style={{ marginBottom: '1rem' }}>
                <Link
                  href={`/${locale}/moving/${key}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    {spec.icon} {spec.name}
                  </div>
                  <div style={{ color: '#555' }}>{spec.description}</div>
                </Link>
              </li>
            )
          )}
      </ul>
    </main>
  );
}
