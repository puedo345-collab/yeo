import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTIONS } from '../data';
import { SurveyResponses } from '../types';
import { ShieldCheck, ChevronLeft, ArrowRight, User, Phone, CheckSquare, Calendar, HelpCircle, Lock, X } from 'lucide-react';

interface QualificationCheckProps {
  onComplete: (responses: SurveyResponses) => void;
  onCancel: () => void;
  mode?: string;
}

export default function QualificationCheck({ onComplete, onCancel, mode = 'general' }: QualificationCheckProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SurveyResponses>>({
    occupation: '',
    debtAmount: '',
    monthlyIncome: '',
    dependentsCount: '',
    hasMoreDebtThanAssets: '',
    region: '',
    difficulties: [],
    name: '고객',
    ageGroup: '30대',
    phone: '010-0000-0000'
  });

  const [formError, setFormError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const totalSteps = QUESTIONS.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleSingleSelect = (key: string, value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    
    if (key === 'occupation' && value === 'no_income') {
      setTimeout(() => {
        onComplete(updated as SurveyResponses);
      }, 250);
      return;
    }

    if (key === 'hasMoreDebtThanAssets' && value === 'no') {
      setTimeout(() => {
        onComplete(updated as SurveyResponses);
      }, 250);
      return;
    }

    // Auto-advance for single-choice steps (Step 0 to 5)
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 250);
    }
  };

  const toggleDifficulty = (value: string) => {
    const prevDifficulties = answers.difficulties || [];
    let updated: string[];
    if (prevDifficulties.includes(value)) {
      updated = prevDifficulties.filter((d) => d !== value);
    } else {
      updated = [...prevDifficulties, value];
    }
    setAnswers((prev) => ({ ...prev, difficulties: updated }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      // Validation for difficulties: recommended to select at least one
      if (currentStep === QUESTIONS.length - 1 && (!answers.difficulties || answers.difficulties.length === 0)) {
        setFormError('최소 한 가지 이상 고민을 선택해 주세요.');
        return;
      }
      setFormError('');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setFormError('');
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  // Submit the entire survey
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!answers.name || answers.name.trim().length === 0) {
      setFormError('성함을 입력해 주세요.');
      return;
    }
    if (!answers.ageGroup) {
      setFormError('연령대를 선택해 주세요.');
      return;
    }
    const phonePattern = /^(010|011|016|017|018|019)[- ]?\d{3,4}[- ]?\d{4}$/;
    if (!answers.phone || !phonePattern.test(answers.phone.replace(/[^0-9]/g, ''))) {
      setFormError('올바른 한국 핸드폰 번호(예: 010-1234-5678)를 입력해 주세요.');
      return;
    }
    if (!agreeTerms) {
      setFormError('개인정보 수집 및 자격 진단용 활용 약관에 동의해 주세요.');
      return;
    }

    // Call success handler
    onComplete(answers as SurveyResponses);
  };

  // Auto hyphen for phone
  const formatPhone = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
  };

  // Check if current question's option is selected
  const getSelectedValue = (key: string) => {
    return answers[key as keyof SurveyResponses] as string;
  };

  return (
    <div className="max-w-xl mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12" id="qualification-inner-container">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        
        {/* Top bar progress indicators */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              안전 암호화 자가진단 시스템
            </span>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400">
            {progressPercent}% 완료
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Content Box */}
        <div className="p-4 sm:p-8 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Step indicator */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <span>질문 {currentStep + 1} / {QUESTIONS.length}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {QUESTIONS[currentStep].title}
                </h3>
                <p className="text-[11px] sm:text-sm text-slate-500 font-bold leading-relaxed">
                  {QUESTIONS[currentStep].subtitle}
                </p>
              </div>

              {/* Multiple Options Choice list */}
              {QUESTIONS[currentStep].id !== 'difficulties' ? (
                // Single selection questions (Occupation, Debt, Asset, Region)
                <div className="space-y-2.5 pt-1">
                  {QUESTIONS[currentStep].options.map((opt) => {
                    const isSelected = getSelectedValue(QUESTIONS[currentStep].id) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSingleSelect(QUESTIONS[currentStep].id, opt.value)}
                        className={`w-full p-4.5 rounded-xl border text-left font-extrabold text-sm sm:text-base tracking-tight transition-all duration-150 cursor-pointer flex justify-between items-center active:scale-[0.99] ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/50 hover:border-slate-300/80'
                        }`}
                      >
                        <span className="pr-2">{opt.label}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Multi select question (Difficulties)
                <div className="space-y-2.5 pt-1">
                  {QUESTIONS[currentStep].options.map((opt) => {
                    const isSelected = (answers.difficulties || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleDifficulty(opt.value)}
                        className={`w-full p-4.5 rounded-xl border text-left font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? 'border-violet-600 bg-violet-50/60 text-violet-950 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50/50 hover:border-slate-300/80'
                        }`}
                      >
                        <span className="pr-1 text-slate-800">{opt.label}</span>
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-violet-600 bg-violet-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation/Submit Controls */}
          <div className="space-y-3 pt-4 border-t border-slate-100 mt-4 shrink-0">
            {formError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-2 text-center rounded-xl animate-bounce">
                ⚠️ {formError}
              </p>
            )}

            <div className="flex gap-2.5">
              {/* Back button */}
              <button
                type="button"
                onClick={handlePrev}
                className="px-4.5 py-4 rounded-xl border border-slate-250 bg-white text-slate-600 font-black hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 shrink-0 text-sm cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500 stroke-[2.5]" />
                뒤로
              </button>

              {currentStep < QUESTIONS.length - 1 ? (
                <div className="flex-1 text-center py-4 text-[13px] sm:text-sm text-slate-400 font-extrabold flex items-center justify-center select-none bg-slate-50 border border-dashed border-slate-200 rounded-xl leading-snug px-2">
                  옵션을 터치하면 다음 문항으로 자동 이동됩니다.
                </div>
              ) : (
                // Finish button
                <button
                  type="button"
                  onClick={() => {
                    setFormError('');
                    if (!answers.difficulties || answers.difficulties.length === 0) {
                      setFormError('최소 한 가지 이상 고민을 선택해 주세요.');
                      return;
                    }
                    onComplete(answers as SurveyResponses);
                  }}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 text-white font-black text-sm tracking-wide shadow-lg shadow-violet-200 hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 duration-100"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-300 stroke-[2.5]" />
                  탕감 플랜 즉시 확인하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Agreement Modal Overlay (Qualification Check Internal Modal) */}
      <AnimatePresence>
        {privacyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrivacyModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 text-left font-sans flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <span className="font-extrabold text-sm sm:text-base tracking-tight">[개인정보 수집 · 이용 동의]</span>
                <button
                  type="button"
                  onClick={() => setPrivacyModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-500">
                  상담 예약 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용하고자 하오며, 개인정보 제공자가 동의한 내용 외의 다른 목적으로 활용하지 않을 것입니다.
                </p>

                <p className="font-medium text-slate-500">
                  다만, 동의자는 거부할 권리가 있으며, 거부시에는 서비스를 이용하실 수 없습니다.
                </p>

                {/* Styled Grid Table compliant with Korea guidelines */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden mt-2 font-sans">
                  {/* Table Columns Heading */}
                  <div className="grid grid-cols-3 bg-slate-50 text-slate-850 font-black text-xs text-center border-b border-slate-200 divide-x divide-slate-200 py-3">
                    <div>목적</div>
                    <div>항목</div>
                    <div>보유 기간</div>
                  </div>

                  {/* Table Row */}
                  <div className="grid grid-cols-3 divide-x divide-slate-100 font-medium text-[11px] sm:text-xs text-slate-600 bg-white min-h-[140px]">
                    {/* Purpose column */}
                    <div className="p-4 flex items-center justify-center bg-white text-center">
                      <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs leading-normal">
                        전화 상담, 카카오톡 상담 서비스 제공
                      </span>
                    </div>

                    {/* Data values column */}
                    <div className="p-4 flex items-center justify-center bg-white text-slate-700 font-extrabold text-[11px]">
                      (필수) 연락처
                    </div>

                    {/* Retention period column */}
                    <div className="p-4 flex flex-col justify-center space-y-2 bg-white">
                      <div className="font-black text-slate-900 text-sm">1년</div>
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        단,개인정보 제공 관련 법령에 따라 보존해야하는 경우에는 법령에서 규정한 기간 동안 보관.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer with single confirmation button matching the image */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setAgreeTerms(true);
                    setPrivacyModalOpen(false);
                  }}
                  className="w-36 py-3 bg-[#3F4E65] hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-md shadow-md transition-all text-center cursor-pointer tracking-wider"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
