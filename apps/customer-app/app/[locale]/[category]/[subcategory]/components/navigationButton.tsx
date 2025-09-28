import React from 'react';

// interface NavigationButtonProps {
//   goToPreviousQuestion: () => void;
//   currentQuestionIndex: number;
//   isQuestionAnswered: () => boolean;
//   goToNextQuestion: () => void;
// }

export const NavigationButton = ({
  questions,
  goToPreviousQuestion,
  currentQuestionIndex,
  isQuestionAnswered,
  goToNextQuestion,
}: any) => {
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
        onClick={() => {
          console.log(
            'Next button clicked, current question answered:',
            isQuestionAnswered(questions[currentQuestionIndex])
          );
          goToNextQuestion();
        }}
        disabled={
          currentQuestionIndex >= questions.length - 1 ||
          !isQuestionAnswered(questions[currentQuestionIndex])
        }
        style={{
          padding: '10px 20px',
          border: '2px solid #3b82f6',
          borderRadius: 6,
          backgroundColor:
            currentQuestionIndex >= questions.length - 1 ||
            !isQuestionAnswered(questions[currentQuestionIndex])
              ? '#f3f4f6'
              : '#3b82f6',
          color:
            currentQuestionIndex >= questions.length - 1 ||
            !isQuestionAnswered(questions[currentQuestionIndex])
              ? '#9ca3af'
              : 'white',
          cursor:
            currentQuestionIndex >= questions.length - 1 ||
            !isQuestionAnswered(questions[currentQuestionIndex])
              ? 'not-allowed'
              : 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {currentQuestionIndex >= questions.length - 1 ? 'Complete' : 'Next'}
      </button>
    </div>
  );
};
