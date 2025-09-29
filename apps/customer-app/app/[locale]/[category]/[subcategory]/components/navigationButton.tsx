import React from 'react';
import { QuestionGetSuccessResponse } from '@api';

interface NavigationButtonProps {
  question: QuestionGetSuccessResponse['data']['questions'][number];
  goToPreviousQuestion: () => void;
  currentQuestionIndex: number;
  isQuestionAnswered: boolean;
  goToNextQuestion: () => void;
}

export const NavigationButton = ({
  question,
  goToPreviousQuestion,
  currentQuestionIndex,
  isQuestionAnswered,
  goToNextQuestion,
}: NavigationButtonProps) => {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
      <button
        onClick={goToPreviousQuestion}
        disabled={currentQuestionIndex === 0}
        style={{
          padding: '10px 20px',
          border: '2px solid #d1d5db',
          borderRadius: 6,
          backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
          color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
          cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Previous
      </button>

      <button
        onClick={goToNextQuestion}
        disabled={!isQuestionAnswered}
        style={{
          padding: '10px 20px',
          border: '2px solid #3b82f6',
          borderRadius: 6,
          backgroundColor: !isQuestionAnswered ? '#f3f4f6' : '#3b82f6',
          color: !isQuestionAnswered ? '#9ca3af' : 'white',
          cursor: !isQuestionAnswered ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Next
      </button>
    </div>
  );
};
