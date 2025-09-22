'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useMessages } from 'next-intl';
import { apiAideMoi, QuestionGetSuccessResponse } from '@api';

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
  options?: QuestionOption[];
  helpText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  allowOther?: boolean;
  otherLabel?: string;
}

// Simplified page; subcategory/category types omitted

export default function SubcategoryPage() {
  const { category, subcategory } = useParams<{
    category: string;
    subcategory: string;
  }>();
  const locale = useLocale();
  const messages = useMessages() as unknown as Record<string, unknown>;

  const [remoteQuestions, setRemoteQuestions] = useState<Question[] | null>(
    null
  );
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchRemote = async () => {
      setRemoteLoading(true);
      setRemoteError(null);
      try {
        // derive mapping from messages.questionsMap (supports number, numeric string, or {id|questionId})
        let mappingNumber: number | undefined;
        try {
          const qm = messages?.questionsMap as unknown;
          if (qm && typeof qm === 'object') {
            const catMap = (qm as Record<string, unknown>)[category as string];
            const mapVal =
              catMap && typeof catMap === 'object'
                ? (catMap as Record<string, unknown>)[subcategory as string]
                : (qm as Record<string, unknown>)[category as string];
            if (typeof mapVal === 'number') mappingNumber = mapVal;
            else if (typeof mapVal === 'string' && /^\d+$/.test(mapVal))
              mappingNumber = Number(mapVal);
            else if (typeof mapVal === 'object' && mapVal !== null) {
              const obj = mapVal as Record<string, unknown>;
              const id = obj.id ?? obj.questionId ?? obj.question_id;
              if (typeof id === 'number') mappingNumber = id;
              else if (typeof id === 'string' && /^\d+$/.test(id))
                mappingNumber = Number(id);
            }
          }
        } catch {
          /* ignore */
        }

        const questionId = mappingNumber ?? 19;
        const res = await apiAideMoi.get<QuestionGetSuccessResponse>(
          `/questions/question/${questionId}?lang=${locale}`
        );

        const body = res;

        console.log('Fetched question data:', body, questionId);
        if (!body || !body.data || !body.data.questions) {
          throw new Error('Invalid response shape');
        }

        // Normalize response (single object or array), sort by sortOrder and map to UI Question shape
        type RemoteTranslation = { locale?: string; label?: string };
        type RemoteOption = {
          id?: number;
          value: string;
          translations?: RemoteTranslation[];
        };
        type RemoteQuestion = {
          id?: number;
          type?: string;
          required?: boolean;
          sortOrder?: number;
          translations?: RemoteTranslation[];
          options?: RemoteOption[];
        };

        const raw = body.data.questions as RemoteQuestion | RemoteQuestion[];
        const arr = Array.isArray(raw) ? raw.slice() : [raw];
        arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        const mapped = arr.map((rq) => {
          const labelForLocale = (translations?: RemoteTranslation[]) => {
            if (!translations || !translations.length) return undefined;
            const byLocale = translations.find((t) => t.locale === locale);
            return byLocale?.label ?? translations[0].label;
          };

          const q: Question = {
            id: String(rq.id ?? ''),
            type: (rq.type as QuestionType) || 'text',
            text: labelForLocale(rq.translations) || 'Question',
            required: !!rq.required,
            options: rq.options
              ? rq.options.map((o) => ({
                  value: o.value,
                  label: labelForLocale(o.translations) || o.value,
                }))
              : undefined,
          };
          return q;
        });

        if (mounted) setRemoteQuestions(mapped.length ? mapped : null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (mounted) setRemoteError(msg);
      } finally {
        if (mounted) setRemoteLoading(false);
      }
    };

    fetchRemote();
    return () => {
      mounted = false;
    };
  }, [category, subcategory, locale, messages]);

  // Wizard state
  const total = remoteQuestions?.length ?? 0;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const q = remoteQuestions ? remoteQuestions[step] : undefined;

  const toggleMulti = (qid: string, value: string, checked: boolean) =>
    setAnswers((prev) => {
      const prevArr = Array.isArray(prev[qid]) ? (prev[qid] as string[]) : [];
      const next = checked
        ? [...new Set([...prevArr, value])]
        : prevArr.filter((v) => v !== value);
      return { ...prev, [qid]: next };
    });

  const isCurrentAnswered = (): boolean => {
    if (!q) return true;
    const v = answers[q.id];
    if (q.type === 'multi')
      return Array.isArray(v) ? v.length > 0 : !q.required;
    if (q.type === 'single')
      return typeof v === 'string'
        ? v.trim() !== '' || !q.required
        : !q.required;
    if (q.type === 'text' || q.type === 'number')
      return typeof v === 'string'
        ? v.trim() !== '' || !q.required
        : !q.required;
    return true;
  };

  const onNext = () => {
    setError(null);
    if (!isCurrentAnswered()) {
      setError('Please answer this question to continue.');
      return;
    }
    if (step < total - 1) {
      setStep((s) => s + 1);
      return;
    }
    void onSubmit();
  };

  const onBack = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const resolveAnswers = () => answers;

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        category,
        subcategory,
        answers: resolveAnswers(),
      };
      console.log('Submitting answers', payload);
      // TODO: send to API
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      {remoteLoading && <div>Loading question...</div>}
      {remoteError && <div style={{ color: 'crimson' }}>{remoteError}</div>}

      {!remoteLoading && !remoteQuestions && (
        <div>No remote question found.</div>
      )}

      {remoteQuestions && q && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {q.text}
          </div>
          {q.options && q.type === 'multi' && (
            <div>
              {q.options.map((opt) => {
                const arr = (answers[q.id] as string[]) || [];
                const checked = arr.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    style={{ display: 'block', marginTop: 8 }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        toggleMulti(q.id, opt.value, e.currentTarget.checked)
                      }
                    />{' '}
                    {opt.label}
                  </label>
                );
              })}
            </div>
          )}

          {error && (
            <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 16,
            }}
          >
            <button onClick={onBack} disabled={step === 0}>
              Back
            </button>
            <button
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
      )}
    </div>
  );
}
