// 'use client';
// import React, { useMemo, useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { useLocale, useTranslations, useMessages } from 'next-intl';

// type QuestionType =
//   | 'single'
//   | 'multi'
//   | 'text'
//   | 'number'
//   | 'date'
//   | 'time'
//   | 'select';
// interface QuestionOption {
//   value: string;
//   label: string;
// }
// interface Question {
//   id: string;
//   type: QuestionType;
//   text: string;
//   required?: boolean;
//   options?: QuestionOption[]; // for single/multi/select
//   helpText?: string;
//   placeholder?: string;
//   min?: number;
//   max?: number;
//   unit?: string;
//   allowOther?: boolean; // for single/multi "Other" option
//   otherLabel?: string; // label for other input
// }

// interface Subcategory {
//   icon?: string; // from en/fr messages
//   name: string;
//   description: string;
//   questions?: Question[];
//   priceRange?: { min: number; max: number; currency?: string }; // optional price hint
// }

// interface Category {
//   id: string;
//   name: string;
//   description: string;
//   specialties?: Record<string, Subcategory>;
// }

// const titleFromSlug = (s: string) =>
//   s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// export default function SubcategoryPage() {
//   const t = useTranslations();
//   const locale = useLocale();
//   const messages = useMessages() as Record<string, any>;
//   const { category, subcategory } = useParams<{
//     category: string;
//     subcategory: string;
//   }>();

//   // Use categories from locale messages, fallback to t.raw
//   const categoriesArr = useMemo(() => {
//     const raw = (messages?.categories as unknown) ?? t.raw('categories');
//     return Array.isArray(raw) ? (raw as Category[]) : [];
//   }, [messages, t]);

//   const active = categoriesArr.find((c) => c.id === category);

//   // Simplified: resolve spec directly by key
//   const spec = active?.specialties?.[subcategory as string];

//   // Replace t.raw lookup with a safe read from messages
//   const localizedQuestions = useMemo(() => {
//     const qns =
//       messages?.questions &&
//       (messages.questions as any)[category] &&
//       (messages.questions as any)[category][subcategory];
//     return Array.isArray(qns) ? (qns as Question[]) : null;
//   }, [messages, category, subcategory]);

//   const questions = useMemo(() => {
//     if (localizedQuestions && localizedQuestions.length)
//       return localizedQuestions;
//     if (spec?.questions && spec.questions.length) return spec.questions;
//     return [];
//   }, [localizedQuestions, spec?.questions]);

//   const total = questions.length;
//   const [step, setStep] = useState(0);
//   const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const q = questions[step];

//   const setSingle = (qid: string, value: string) =>
//     setAnswers((prev) => ({ ...prev, [qid]: value }));

//   const toggleMulti = (qid: string, value: string, checked: boolean) =>
//     setAnswers((prev) => {
//       const prevArr = Array.isArray(prev[qid]) ? (prev[qid] as string[]) : [];
//       const next = checked
//         ? [...new Set([...prevArr, value])]
//         : prevArr.filter((v) => v !== value);
//       return { ...prev, [qid]: next };
//     });

//   const setOtherText = (qid: string, text: string) =>
//     setAnswers((prev) => ({ ...prev, [`${qid}__other`]: text }));

//   const isCurrentAnswered = (): boolean => {
//     if (!q) return true;
//     const v = answers[q.id];
//     if (q.type === 'multi')
//       return Array.isArray(v) ? (v as string[]).length > 0 : !q.required;
//     if (q.type === 'number') {
//       if (typeof v !== 'string' || v.trim() === '') return !q.required;
//       const num = Number(v);
//       if (Number.isNaN(num)) return false;
//       if (q.min !== undefined && num < q.min) return false;
//       if (q.max !== undefined && num > q.max) return false;
//       return true;
//     }
//     if (q.type === 'single' && v === '__other__') {
//       const ov = (answers[`${q.id}__other`] as string) || '';
//       return ov.trim() !== '' || !q.required;
//     }
//     if (typeof v === 'string') return v.trim() !== '' || !q.required;
//     return !!v || !q.required;
//   };

//   const onNext = () => {
//     setError(null);
//     if (!isCurrentAnswered()) {
//       setError('Please answer this question to continue.');
//       return;
//     }
//     if (step < total - 1) {
//       setStep((s) => s + 1);
//       return;
//     }
//     void onSubmit(); // last step -> submit
//   };

//   const onBack = () => {
//     setError(null);
//     if (step > 0) setStep((s) => s - 1);
//   };

//   const resolveAnswers = () => {
//     // If any single-select used "__other__", replace with the typed text
//     if (!questions.length) return answers;
//     const out: Record<string, string | string[]> = { ...answers };
//     questions.forEach((qq) => {
//       if (qq.type === 'single' && out[qq.id] === '__other__') {
//         const ov = (out[`${qq.id}__other`] as string) || '';
//         out[qq.id] = ov.trim();
//         delete out[`${qq.id}__other`];
//       }
//     });
//     return out;
//   };

//   const onSubmit = async () => {
//     setError(null);
//     setSubmitting(true);
//     try {
//       const payload = {
//         category,
//         subcategory,
//         answers: resolveAnswers(),
//       };
//       // TODO: send to API
//       // await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
//       console.log('Submitting subcategory questionnaire:', payload);
//     } catch (e) {
//       setError('Failed to submit. Please try again.');
//       return;
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Reset the wizard when subcategory (or its questions) changes
//   useEffect(() => {
//     setStep(0);
//     setAnswers({});
//     setError(null);
//   }, [subcategory, questions.length]);

//   // Only 404 when both spec and questions are missing
//   if (
//     !active ||
//     (!spec && (!localizedQuestions || !localizedQuestions.length))
//   ) {
//     return (
//       <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
//         <h1>Not found</h1>
//         <p>
//           {!active
//             ? `Category "${category}" does not exist.`
//             : `Subcategory "${subcategory}" does not exist.`}
//         </p>
//         <Link href={`/${locale}`}>Go home</Link>
//       </main>
//     );
//   }

//   const progress = total > 0 ? Math.round(((step + 1) / total) * 100) : 0;
//   const currency = spec?.priceRange?.currency ?? 'TL';

//   return (
//     <main
//       style={{
//         padding: '1.25rem',
//         fontFamily: 'sans-serif',
//         maxWidth: 720,
//         margin: '0 auto',
//       }}
//     >
//       {/* Header with progress and price range (optional) */}
//       <div
//         style={{
//           border: '1px solid #e5e7eb',
//           borderRadius: 12,
//           overflow: 'hidden',
//         }}
//       >
//         <div
//           style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}
//         >
//           <div style={{ fontSize: 18, fontWeight: 700 }}>
//             {spec?.name || titleFromSlug(subcategory as string)}
//           </div>
//           <div
//             style={{
//               height: 6,
//               background: '#e6f4ea',
//               borderRadius: 999,
//               marginTop: 8,
//               overflow: 'hidden',
//             }}
//           >
//             <div
//               style={{
//                 width: `${progress}%`,
//                 height: '100%',
//                 background: '#34a853',
//               }}
//             />
//           </div>
//           {spec?.priceRange && (
//             <div
//               style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 marginTop: 8,
//                 color: '#4b5563',
//               }}
//             >
//               <span>Average price range:</span>
//               <span>
//                 {spec.priceRange.min} {currency} - {spec.priceRange.max}{' '}
//                 {currency}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Step content */}
//         <div style={{ padding: '1.25rem' }}>
//           {q ? (
//             <div>
//               <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
//                 {q.text} {q.required ? '*' : ''}
//               </div>
//               {q.helpText && (
//                 <div style={{ color: '#6b7280', marginBottom: 10 }}>
//                   {q.helpText}
//                 </div>
//               )}

//               {/* Render input by type */}
//               {q.type === 'single' && (
//                 <div>
//                   {q.options?.map((opt) => (
//                     <label
//                       key={opt.value}
//                       style={{
//                         display: 'block',
//                         marginTop: 8,
//                         cursor: 'pointer',
//                       }}
//                     >
//                       <input
//                         type="radio"
//                         name={q.id}
//                         value={opt.value}
//                         checked={answers[q.id] === opt.value}
//                         onChange={() => setSingle(q.id, opt.value)}
//                       />{' '}
//                       {opt.label}
//                     </label>
//                   ))}
//                   {q.allowOther && (
//                     <div style={{ marginTop: 8 }}>
//                       <label style={{ display: 'block', cursor: 'pointer' }}>
//                         <input
//                           type="radio"
//                           name={q.id}
//                           value="__other__"
//                           checked={answers[q.id] === '__other__'}
//                           onChange={() => setSingle(q.id, '__other__')}
//                         />{' '}
//                         {q.otherLabel || 'Other'}
//                       </label>
//                       {answers[q.id] === '__other__' && (
//                         <input
//                           type="text"
//                           placeholder={q.placeholder || 'Please specify'}
//                           style={{
//                             marginTop: 6,
//                             width: '100%',
//                             padding: 8,
//                             border: '1px solid #e5e7eb',
//                             borderRadius: 6,
//                           }}
//                           value={(answers[`${q.id}__other`] as string) || ''}
//                           onChange={(e) =>
//                             setOtherText(q.id, e.currentTarget.value)
//                           }
//                         />
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {q.type === 'multi' && (
//                 <div>
//                   {q.options?.map((opt) => {
//                     const arr = (answers[q.id] as string[]) || [];
//                     const checked = arr.includes(opt.value);
//                     return (
//                       <label
//                         key={opt.value}
//                         style={{
//                           display: 'block',
//                           marginTop: 8,
//                           cursor: 'pointer',
//                         }}
//                       >
//                         <input
//                           type="checkbox"
//                           name={`${q.id}-${opt.value}`}
//                           value={opt.value}
//                           checked={checked}
//                           onChange={(e) =>
//                             toggleMulti(
//                               q.id,
//                               opt.value,
//                               e.currentTarget.checked
//                             )
//                           }
//                         />{' '}
//                         {opt.label}
//                       </label>
//                     );
//                   })}
//                 </div>
//               )}

//               {q.type === 'select' && (
//                 <select
//                   style={{
//                     width: '100%',
//                     padding: 8,
//                     border: '1px solid #e5e7eb',
//                     borderRadius: 6,
//                   }}
//                   value={(answers[q.id] as string) || ''}
//                   onChange={(e) => setSingle(q.id, e.currentTarget.value)}
//                 >
//                   <option value="" disabled>
//                     {q.placeholder || 'Select...'}
//                   </option>
//                   {q.options?.map((opt) => (
//                     <option key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </option>
//                   ))}
//                 </select>
//               )}

//               {q.type === 'text' && (
//                 <textarea
//                   rows={4}
//                   placeholder={q.placeholder}
//                   style={{
//                     width: '100%',
//                     padding: 8,
//                     border: '1px solid #e5e7eb',
//                     borderRadius: 6,
//                   }}
//                   value={(answers[q.id] as string) || ''}
//                   onChange={(e) => setSingle(q.id, e.currentTarget.value)}
//                 />
//               )}

//               {q.type === 'number' && (
//                 <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                   <input
//                     type="number"
//                     placeholder={q.placeholder}
//                     min={q.min}
//                     max={q.max}
//                     style={{
//                       width: '100%',
//                       padding: 8,
//                       border: '1px solid #e5e7eb',
//                       borderRadius: 6,
//                     }}
//                     value={(answers[q.id] as string) || ''}
//                     onChange={(e) => setSingle(q.id, e.currentTarget.value)}
//                   />
//                   {q.unit && <span style={{ color: '#6b7280' }}>{q.unit}</span>}
//                 </div>
//               )}

//               {q.type === 'date' && (
//                 <input
//                   type="date"
//                   style={{
//                     width: '100%',
//                     padding: 8,
//                     border: '1px solid #e5e7eb',
//                     borderRadius: 6,
//                   }}
//                   value={(answers[q.id] as string) || ''}
//                   onChange={(e) => setSingle(q.id, e.currentTarget.value)}
//                 />
//               )}

//               {q.type === 'time' && (
//                 <input
//                   type="time"
//                   style={{
//                     width: '100%',
//                     padding: 8,
//                     border: '1px solid #e5e7eb',
//                     borderRadius: 6,
//                   }}
//                   value={(answers[q.id] as string) || ''}
//                   onChange={(e) => setSingle(q.id, e.currentTarget.value)}
//                 />
//               )}

//               {error && (
//                 <div style={{ color: 'crimson', marginTop: 10 }}>{error}</div>
//               )}

//               {/* Controls */}
//               <div
//                 style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   marginTop: 16,
//                 }}
//               >
//                 <button
//                   type="button"
//                   onClick={onBack}
//                   disabled={step === 0}
//                   style={{
//                     padding: '10px 14px',
//                     borderRadius: 8,
//                     background: step === 0 ? '#e5e7eb' : '#f3f4f6',
//                     border: '1px solid #e5e7eb',
//                     cursor: step === 0 ? 'not-allowed' : 'pointer',
//                   }}
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="button"
//                   onClick={onNext}
//                   disabled={!isCurrentAnswered() || submitting}
//                   style={{
//                     padding: '10px 14px',
//                     borderRadius: 8,
//                     background: '#34a853',
//                     color: 'white',
//                     border: 'none',
//                     opacity: !isCurrentAnswered() || submitting ? 0.6 : 1,
//                     cursor:
//                       !isCurrentAnswered() || submitting
//                         ? 'not-allowed'
//                         : 'pointer',
//                     minWidth: 120,
//                   }}
//                 >
//                   {step === total - 1
//                     ? submitting
//                       ? 'Submitting...'
//                       : 'Submit'
//                     : 'Continue'}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div style={{ color: '#6b7280' }}>
//               No questions for this subcategory.
//             </div>
//           )}
//         </div>
//       </div>

//       <div style={{ marginTop: 16 }}>
//         <Link href={`/${locale}/${category}`}>
//           &larr; Back to {active.name}
//         </Link>
//       </div>
//     </main>
//   );
// }
