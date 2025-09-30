import React from 'react';
import { Option, QuestionTypeProps } from './types';

// Bileşen
export const QuestionType: React.FC<QuestionTypeProps> = ({
  question,
  selectedOptions,
  params,
  dateValues,
  textValues,
  numberValues,
  translation,
  handleTextChange,
  handleOptionClick,
  handleDateChange,
  handleNumberChange,
}) => {
  return (
    <div>
      {/* Date / Time input */}
      {(question.type === 'date' || question.type === 'time') && (
        <div style={{ marginTop: 12 }}>
          <input
            type={question.type === 'date' ? 'date' : 'time'}
            value={dateValues[question.id] || ''}
            onChange={(e) => handleDateChange(question.id, e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              width: '100%',
              maxWidth: 300,
              fontFamily: 'inherit',
            }}
            required={question.required}
          />
        </div>
      )}

      {/* Text input */}
      {question.type === 'text' && (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            value={textValues[question.id] || ''}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            placeholder={translation?.description || 'Enter your answer...'}
            style={{
              padding: '8px 12px',
              border: '2px solid #d1d5db',
              borderRadius: 6,
              fontSize: 14,
              width: '100%',
              maxWidth: 400,
              fontFamily: 'inherit',
            }}
            required={question.required}
          />
        </div>
      )}

      {/* Number input */}
      {question.type === 'number' && (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={numberValues[question.id] || ''}
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
              maxWidth: 200,
              fontFamily: 'inherit',
            }}
            required={question.required}
          />
        </div>
      )}

      {/* Options (single/multi select) */}
      {question.options && question.options.length > 0 && (
        <div style={{ marginTop: 12 }}>
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
            {question.options.map((option: Option) => {
              const optionTranslation =
                option.translations?.find((t) => t.locale === params.locale) ||
                option.translations?.find((t) => t.locale.startsWith('en')) ||
                option.translations?.[0];

              const isSelected =
                selectedOptions[question.id]?.includes(option.value) || false;
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
