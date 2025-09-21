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
        if (!body || !body.data || !body.data.questions) {
          throw new Error('Invalid response shape');
        }

        if (mounted) setRemoteQuestions(body.data.questions as Question[]);
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

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      {remoteLoading && <div>Loading question...</div>}
      {remoteError && <div style={{ color: 'crimson' }}>{remoteError}</div>}
      {remoteQuestions ? (
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(remoteQuestions, null, 2)}
        </pre>
      ) : (
        !remoteLoading && <div>No remote question found.</div>
      )}
    </div>
  );
}
