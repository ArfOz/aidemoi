import React from 'react';
import { NavigationButtonProps } from './types';

export function NavigationButton({
  question,
  goToPreviousQuestion,
  currentQuestionIndex,
  isQuestionAnswered,
  goToNextQuestion,
  isLast,
  onSubmit,
}: {
  question: NavigationButtonProps['question'];
  goToPreviousQuestion: NavigationButtonProps['goToPreviousQuestion'];
  currentQuestionIndex: NavigationButtonProps['currentQuestionIndex'];
  isQuestionAnswered: NavigationButtonProps['isQuestionAnswered'];
  goToNextQuestion: NavigationButtonProps['goToNextQuestion'];
  isLast: boolean;
  onSubmit: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
      <button
        type="button"
        disabled={currentQuestionIndex === 0}
        onClick={goToPreviousQuestion}
      >
        Previous
      </button>
      {isLast ? (
        <button type="submit" disabled={!isQuestionAnswered} onClick={onSubmit}>
          Submit
        </button>
      ) : (
        <button
          type="button"
          disabled={!isQuestionAnswered}
          onClick={goToNextQuestion}
        >
          Next
        </button>
      )}
    </div>
  );
}
