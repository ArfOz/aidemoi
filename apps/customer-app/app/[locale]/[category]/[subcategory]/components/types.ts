import { QuestionGetSuccessResponse } from '@api';

export interface AnswersState {
  date: Record<string, string>;
  time: Record<string, string>;
  text: Record<string, string>;
  number: Record<string, string>;
  options: Record<string, string[]>;
}

export interface PageParams {
  locale: string;
  category: string;
  subcategory: string;
}

export interface QuestionSectionProps {
  questions: QuestionGetSuccessResponse['data']['questions'];
  currentQuestionIndex: number;
  params: PageParams;
  answers: AnswersState;
  handleDateChange: (questionId: string, value: string) => void;
  handleTextChange: (questionId: string, value: string) => void;
  handleNumberChange: (questionId: string, value: string) => void;
  handleOptionClick: (
    questionId: string,
    optionValue: string,
    isMulti: boolean
  ) => void;
}

export interface NavigationButtonProps {
  question: QuestionGetSuccessResponse['data']['questions'][number];
  goToPreviousQuestion: () => void;
  currentQuestionIndex: number;
  isQuestionAnswered: boolean;
  goToNextQuestion: () => void;
}

export type Question = QuestionGetSuccessResponse['data']['questions'][number];

export interface I18nTranslation {
  locale: string;
  name: string;
  // Add other translated fields as needed
}

export interface SubcategoryWithI18n {
  id: string;
  name: string;
  slug: string;
  i18n?: I18nTranslation[];
  // Add other subcategory fields as needed
}

interface OptionTranslation {
  locale: string;
  label?: string;
}

export interface Option {
  id: number;
  value: string;
  translations?: OptionTranslation[];
}

// Question type enum
export type QuestionTypeEnum =
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'multi'
  | 'single';

// Question type component props
export interface QuestionTypeProps {
  question: Question;
  dateValues: Record<number, string>;
  textValues: Record<number, string>;
  numberValues: Record<number, string>;
  translation?: { label?: string; description?: string };
  selectedOptions: Record<number, string[]>;
  handleTextChange: (id: number, value: string) => void;
  handleNumberChange: (id: number, value: string) => void;
  handleOptionClick: (
    questionId: number,
    optionValue: string,
    isMulti: boolean
  ) => void;
  handleDateChange: (id: number, value: string) => void;
  params: { locale: string };
}
