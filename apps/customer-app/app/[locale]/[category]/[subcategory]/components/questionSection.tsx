import React from 'react';
import { QuestionType } from './questionType';

export const QuestionSection = ({
  questions,
  currentQuestionIndex,
  params,
  dateValues,
  textValues,
  numberValues,
  selectedOptions,
  handleDateChange,
  handleTextChange,
  handleNumberChange,
  handleOptionClick,
}: any) => {
  return (
    <div>
      {(() => {
        const question = questions[currentQuestionIndex];
        if (!question) return null;

        // Find the translation for current locale
        const translation =
          question.translations?.find((t: any) => t.locale === params.locale) ||
          question.translations?.find((t: any) => t.locale?.startsWith('en')) ||
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
            <div style={{ marginBottom: 8, fontSize: 14, color: '#374151' }}>
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
    </div>
  );
};
