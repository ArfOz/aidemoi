import React from 'react';
import { QuestionSectionProps } from './types';

export const QuestionSection = ({
  questions,
  currentQuestionIndex,
  params,
  answers,
  handleDateChange,
  handleTextChange,
  handleNumberChange,
  handleOptionClick,
}: QuestionSectionProps) => {
  const question = questions[currentQuestionIndex];
  if (!question) return null;

  // Find the translation for current locale
  const translation =
    question.translations?.find((t: any) => t.locale === params.locale) ||
    question.translations?.find((t: any) => t.locale?.startsWith('en')) ||
    question.translations?.[0];

  return (
    <div
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

      <div style={{ marginBottom: 8, fontSize: 14, color: '#374151' }}>
        Type: {question.type} {question.required && '(Required)'}
      </div>

      {/* Date Input */}
      {question.type === 'date' && (
        <div style={{ marginTop: 12 }}>
          <input
            type="date"
            value={answers.date[question.id] || ''}
            onChange={(e) => handleDateChange(question.id, e.target.value)}
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

      {/* Time Input */}
      {question.type === 'time' && (
        <div style={{ marginTop: 12 }}>
          <input
            type="time"
            value={answers.time[question.id] || ''}
            onChange={(e) => handleDateChange(question.id, e.target.value)}
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
            value={answers.text[question.id] || ''}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            placeholder={translation?.description || 'Enter your answer...'}
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
            value={answers.number[question.id] || ''}
            onChange={(e) => handleNumberChange(question.id, e.target.value)}
            onKeyPress={(e) => {
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
            placeholder={translation?.description || 'Enter a number...'}
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

      {/* Options for multi/single/select */}
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
                ) ||
                option.translations?.find((t: any) =>
                  t.locale?.startsWith('en')
                ) ||
                option.translations?.[0];

              const isSelected =
                answers.options[question.id]?.includes(option.value) || false;
              const isMulti = question.type === 'multi';

              return (
                <button
                  key={option.id}
                  onClick={() =>
                    handleOptionClick(question.id, option.value, isMulti)
                  }
                  style={{
                    padding: '8px 16px',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
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
};
