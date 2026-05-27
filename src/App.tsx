import React, { useState, useRef } from 'react';
import { SurveyResponses } from './types';
import Header from './components/Header';
import MainHero from './components/MainHero';
import QualificationCheck from './components/QualificationCheck';
import ResultDashboard from './components/ResultDashboard';
import EligibilityNotes from './components/EligibilityNotes';
import Footer from './components/Footer';
import SuccessCaseMatcher from './components/SuccessCaseMatcher';
import RepaymentPlanBuilder from './components/RepaymentPlanBuilder';
import LawyerIntroduction from './components/LawyerIntroduction';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, HeartHandshake, ShieldCheck, Info, X, Sparkles, MessageCircle, Phone, Calendar, Clock, ChevronDown, Check, MessageSquare } from 'lucide-react';

export default function App() {
  const [surveyActive, setSurveyActive] = useState(false);
  const [surveyMode, setSurveyMode] = useState<string>('general');
  const [caseMatcherActive, setCaseMatcherActive] = useState(false);
  const [planSimulatorActive, setPlanSimulatorActive] = useState(false);
  const [userResponses, setUserResponses] = useState<SurveyResponses | null>(null);
  const [brandPageActive, setBrandPageActive] = useState(false);
  const [adminPageActive, setAdminPageActive] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    // Office hours typically end around 19:00. If later, default to tomorrow.
    if (today.getHours() >= 19) {
      today.setDate(today.getDate() + 1);
    }
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDefaultTime = () => {
    const now = new Date();
    let hours = now.getHours() + 1;
    if (hours < 9) {
      hours = 9;
    } else if (hours > 19) {
      hours = 10; // next day morning
    }
    return `${String(hours).padStart(2, '0')}:00`;
  };

  // Floating consultation reservation states
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [reserveTab, setReserveTab] = useState<'phone' | 'kakao'>('phone');
  const [reservePhone, setReservePhone] = useState('');
  const [isAsap, setIsAsap] = useState(true);
  const [reserveDate, setReserveDate] = useState(getTodayDateString());
  const [reserveTime, setReserveTime] = useState(getDefaultTime());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reserveAgree, setReserveAgree] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [kakaoChannelUrl, setKakaoChannelUrl] = useState('http://pf.kakao.com/_xhTqgG/chat');

  // Load custom configuration on mount
  React.useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.kakaoChannelUrl) {
          setKakaoChannelUrl(data.kakaoChannelUrl);
        }
      })
      .catch(err => console.error("Error loading config:", err));
  }, []);

  // Reset reservation date & time to today & default when opening the card
  React.useEffect(() => {
    if (consultationOpen) {
      setIsAsap(true);
      setReserveDate(getTodayDateString());
      setReserveTime(getDefaultTime());
      setReserveAgree(false);
      setReserveError('');
    }
  }, [consultationOpen]);

  const formatPhone = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReserveError('');

    if (!reservePhone.trim()) {
      setReserveError('연락처를 입력해 주세요.');
      return;
    }

    const cleanPhone = reservePhone.replace(/[^0-9]/g, '');
    const phonePattern = /^(010|011|016|017|018|019)\d{7,8}$/;
    if (!phonePattern.test(cleanPhone)) {
      setReserveError('올바른 한국 휴대폰 번호(예: 010-1234-5678)를 입력해 주세요.');
      return;
    }

    if (!reserveAgree) {
      setReserveError('개인정보 수집 및 이용에 동의해야 실시간 상담이 가능합니다.');
      return;
    }

    // Past date/time validation
    if (!isAsap) {
      if (!reserveDate) {
        setReserveError('예약 날짜를 선택해 주세요.');
        return;
      }
      const parts = reserveDate.split('-');
      if (parts.length !== 3) {
        setReserveError('올바른 예약 날짜 형식이 아닙니다.');
        return;
      }
      const now = new Date();
      const [yearStr, monthStr, dayStr] = parts;
      const [hourStr, minStr] = reserveTime.split(':');
      const selectedDateTime = new Date(
        parseInt(yearStr, 10),
        parseInt(monthStr, 10) - 1,
        parseInt(dayStr, 10),
        parseInt(hourStr, 10),
        parseInt(minStr, 10),
        0
      );

      if (selectedDateTime < now) {
        setReserveError('과거의 날짜와 시간으로는 상담 예약을 지정하실 수 없습니다. 현재 시각 이후의 날짜와 시간으로 예약해 주세요.');
        return;
      }
    }

    setIsSubmitting(true);
    const typeLabel = reserveTab === 'phone' ? '전화상담' : '카카오톡상담';
    const postData = {
      name: `신속상담_${reserveTab === 'phone' ? '전화' : '카톡'}`,
      phone: reservePhone,
      isSimpleConsultation: true,
      difficulties: [typeLabel],
      counselorNotes: `[실시간 간편 예약]\n희망 일시: ${isAsap ? '즉시 상담 희망(가장 빠른 시간 연락)' : `${reserveDate} ${reserveTime}`}\n상담 종류: ${typeLabel}\n요청 번호: ${reservePhone}`,
    };

    fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
      .then(async res => {
        let errMessage = '상담 예약 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        if (!res.ok) {
          try {
            const errData = await res.json();
            if (errData && errData.error) {
              errMessage = errData.error;
            }
          } catch (_) {
            try {
              const text = await res.text();
              if (text) errMessage = text;
            } catch (__) {}
          }
          throw new Error(errMessage);
        }
        return res.json();
      })
      .then(data => {
        console.log('Reservation synced successfully:', data);
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setReservePhone('');
      })
      .catch(err => {
        console.error('Error saving reservation:', err);
        setIsSubmitting(false);
        setReserveError(err.message || '상담 예약 중 오류가 발생했습니다. 다시 시도해 주세요.');
      });
  };

  // References for scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const eligibilityRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const consultationRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        consultationOpen &&
        consultationRef.current &&
        !consultationRef.current.contains(e.target as Node) &&
        !privacyModalOpen
      ) {
        setConsultationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [consultationOpen, privacyModalOpen]);

  // Secure backdoor: Drag selection of registration number '610-06-65592' + Ctrl + Alt + L
  React.useEffect(() => {
    const handleBackdoorShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'l' || e.key === 'L')) {
        const selectionStr = window.getSelection()?.toString() || '';
        if (selectionStr.replace(/\s+/g, '').includes('610-06-65592')) {
          e.preventDefault();
          handleNavClick('admin');
        }
      }
    };

    window.addEventListener('keydown', handleBackdoorShortcut);
    return () => {
      window.removeEventListener('keydown', handleBackdoorShortcut);
    };
  }, []);

  React.useEffect(() => {
    const footerElement = document.getElementById('main-footer');
    if (!footerElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverFooter(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(footerElement);
    return () => {
      observer.unobserve(footerElement);
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'hero') {
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      setBrandPageActive(false);
      setAdminPageActive(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'brand' || sectionId === 'service') {
      setBrandPageActive(true);
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      setAdminPageActive(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'stories') {
      setBrandPageActive(false);
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      setAdminPageActive(false);
      setTimeout(() => {
        eligibilityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else if (sectionId === 'our-spirit') {
      setBrandPageActive(false);
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      setAdminPageActive(false);
      setTimeout(() => {
        const el = document.getElementById('our-spirit');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          eligibilityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    } else if (sectionId === 'faq') {
      setBrandPageActive(false);
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      setAdminPageActive(false);
      setTimeout(() => {
        const faqEl = document.getElementById('faq');
        if (faqEl) {
          faqEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    } else if (sectionId === 'admin') {
      setAdminPageActive(true);
      setBrandPageActive(false);
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWorryChipClick = (index: number) => {
    const faqIdMap: Record<number, number> = {
      0: 2, // 전부 최근 대출이에요. -> 최근 1년 이내 대출
      1: 5, // 전화 독촉 스트레스! -> 채무 독촉 언제 중단
      2: 4, // 코인 및 주식 투자손실 -> 최근 대출 주식 코인
      3: 3  // 배우자 몰래 진행하기! -> 직장 가족 몰래
    };
    const targetFaqId = faqIdMap[index];
    if (targetFaqId) {
      setBrandPageActive(false);
      setSurveyActive(false);
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
      setUserResponses(null);
      setAdminPageActive(false);

      const event = new CustomEvent('expand-faq', { detail: { faqId: targetFaqId } });
      window.dispatchEvent(event);

      setTimeout(() => {
        const faqItem = document.getElementById(`faq-item-${targetFaqId}`);
        if (faqItem) {
          faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const faqParent = document.getElementById('faq');
          if (faqParent) {
            faqParent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 120);
    }
  };

  const handleStartSurvey = (mode?: string) => {
    setUserResponses(null); // Reset past scores
    setBrandPageActive(false);
    setAdminPageActive(false);
    if (mode === 'case') {
      setCaseMatcherActive(true);
      setPlanSimulatorActive(false);
      setSurveyActive(false);
    } else {
      setSurveyActive(true);
      setSurveyMode(mode === 'plan' ? 'general' : (mode || 'general'));
      setCaseMatcherActive(false);
      setPlanSimulatorActive(false);
    }
    // Scroll smoothly to target survey zone
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSurveyComplete = (responses: SurveyResponses) => {
    // Send to our real-time custom API database
    fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responses)
    })
      .then(res => res.json())
      .then(data => {
        console.log('Real-time database submission synced:', data);
      })
      .catch(err => {
        console.error('Error syncing real-time database:', err);
      });

    setUserResponses(responses);
    setBrandPageActive(false);
    setAdminPageActive(false);
    // Smooth scroll back up to results dashboard
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRestartSurvey = () => {
    setUserResponses(null);
    setBrandPageActive(false);
    setAdminPageActive(false);
    setSurveyActive(true);
    setSurveyMode('general');
    setCaseMatcherActive(false);
    setPlanSimulatorActive(false);
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelSurvey = () => {
    setSurveyActive(false);
    setCaseMatcherActive(false);
    setPlanSimulatorActive(false);
    setUserResponses(null);
    setBrandPageActive(false);
    setAdminPageActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" id="main-landing-wrap">
      {/* Universal Sticky Header */}
      <Header
        onNavClick={handleNavClick}
        onStartSurvey={() => handleStartSurvey('general')}
      />

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col" id="landing-main-stage">
        
        {/* Dynamic Display Anchor Area */}
        <div ref={heroRef} className="scroll-mt-20">
          <AnimatePresence mode="wait">
            {adminPageActive ? (
              <motion.div
                key="admin-dashboard-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full"
              >
                <AdminDashboard
                  onBack={() => setAdminPageActive(false)}
                />
              </motion.div>
            ) : brandPageActive ? (
              <motion.div
                key="brand-intro-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full"
              >
                <LawyerIntroduction
                  onBack={() => setBrandPageActive(false)}
                  onStartSurvey={() => handleStartSurvey('general')}
                />
              </motion.div>
            ) : !surveyActive && !caseMatcherActive && !planSimulatorActive && !userResponses ? (
              // Case 1: Standard Homepage Intro Hero Area
              <motion.div
                key="home-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <MainHero 
                  onStartSurvey={handleStartSurvey} 
                  onWorryChipClick={handleWorryChipClick} 
                />
              </motion.div>
            ) : surveyActive && !userResponses ? (
              // Case 2: Survey Qualification Wizard in progress
              <motion.div
                key="survey-flow"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-radial from-slate-55 to-slate-105/50 py-10 md:py-16"
              >
                <div className="text-center mb-6 px-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {surveyMode === 'debt' 
                      ? '실시간 채무 탕감 시뮬레이션 계산기' 
                      : '개인회생 신청자격 정밀 진단'}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold mt-1.5 max-w-sm mx-auto">
                    {surveyMode === 'debt'
                      ? '2026년 최신 소득 및 생계비 기준을 적용해 원금 탕감비율을 즉시 계산합니다.'
                      : '실무 준칙 및 선례를 기반으로 실시간 탕감 한도를 산출해 냅니다.'}
                  </p>
                </div>
                <QualificationCheck
                  mode={surveyMode}
                  onComplete={handleSurveyComplete}
                  onCancel={handleCancelSurvey}
                />
              </motion.div>
            ) : caseMatcherActive && !userResponses ? (
              // Case 3: Success Case Matcher
              <motion.div
                key="case-matcher"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <SuccessCaseMatcher
                  onBack={handleCancelSurvey}
                  onSelectPlan={({ occupation, debtAmount }) => {
                    // pre-fill and start the survey!
                    setSurveyActive(true);
                    setSurveyMode('general');
                    setCaseMatcherActive(false);
                    setPlanSimulatorActive(false);
                  }}
                />
              </motion.div>
            ) : planSimulatorActive && !userResponses ? (
              // Case 4: 1:1 Repayment Plan Builder
              <motion.div
                key="plan-builder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <RepaymentPlanBuilder
                  onBack={handleCancelSurvey}
                  onSubmitPlan={(answers) => {
                    handleSurveyComplete(answers);
                  }}
                />
              </motion.div>
            ) : (
              // Case 3: Simulation Diagnostic report result dashboard
              <motion.div
                key="report-dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-slate-50/70 py-10 md:py-16 relative overflow-hidden"
              >
                {userResponses && (
                  <ResultDashboard
                    responses={userResponses}
                    onRestart={handleRestartSurvey}
                    onGoToMain={handleCancelSurvey}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Permanent Premium Guidelines and Stories (Scroll Trigger Point) */}
        {!surveyActive && !caseMatcherActive && !planSimulatorActive && !userResponses && !adminPageActive && !brandPageActive && (
          <div ref={eligibilityRef} className="scroll-mt-16" id="brand">
            <EligibilityNotes />
          </div>
        )}

      </main>

      {/* Universal Footer */}
      <Footer onAdminClick={() => handleNavClick('admin')} />



      {/* Floating Action Buttons Area */}
      <div
        ref={consultationRef}
        className="fixed right-4 bottom-4 z-50 animate-fade-in flex flex-col items-end"
        id="floating-consultation-buttons"
      >
        {/* Expanded Consultation Request Card */}
        <AnimatePresence>
          {consultationOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3 w-[320px] sm:w-[350px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left z-50 mr-1"
            >
              {/* Header */}
              <div className="bg-indigo-950 p-4 font-sans text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white">실시간 상담 간편 예약</h4>
                    <p className="text-xs text-zinc-300 font-medium">지정일 대표 법무사 직접 연락</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConsultationOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              {submitSuccess ? (
                <div className="p-6 text-center space-y-4 font-sans">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-sm text-slate-800">예약 접수가 완료되었습니다</h5>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      지정하신 시간에 대표 법무사가 남겨주신 연락처로 정성을 다하여 연락드리겠습니다.
                    </p>
                    <div className="pt-4 pb-1 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitSuccess(false);
                          setConsultationOpen(false);
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        확인
                      </button>
                      <a
                        href={kakaoChannelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-[#FEE500] hover:bg-[#FDD835] text-slate-900 rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
                      >
                        💬 카카오톡 대표 채널 직접 연결하기
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReservationSubmit} className="p-4 space-y-4 font-sans">
                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setReserveTab('phone')}
                      className={`py-2 px-1 rounded-lg text-sm sm:text-base font-black transition-all cursor-pointer ${
                        reserveTab === 'phone'
                          ? 'bg-slate-900 text-white shadow-3xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      📞 전화상담 신청
                    </button>
                    <button
                      type="button"
                      onClick={() => setReserveTab('kakao')}
                      className={`py-2 px-1 rounded-lg text-sm sm:text-base font-black transition-all cursor-pointer ${
                        reserveTab === 'kakao'
                          ? 'bg-[#FEE500] text-slate-900 shadow-3xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      💬 카톡상담 신청
                    </button>
                  </div>

                  {/* Input: Phone number */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500">
                      연락 받을 휴대폰 번호
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={reservePhone}
                        onChange={(e) => setReservePhone(formatPhone(e.target.value))}
                        placeholder="010-1234-5678"
                        className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold transition-all ${
                          reserveTab === 'phone' ? 'focus:border-emerald-500' : 'focus:border-[#FEE500]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 상담 신청 희망 방식 선택 (즉시 vs 예약) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-slate-500">
                      상담 희망 일정
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAsap(true);
                          setReserveError('');
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[13px] sm:text-sm font-black transition-all cursor-pointer ${
                          isAsap
                            ? 'bg-white text-slate-900 shadow-3xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        ⚡ 즉시 / 언제든 가능
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAsap(false);
                          setReserveError('');
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[13px] sm:text-sm font-black transition-all cursor-pointer ${
                          !isAsap
                            ? 'bg-white text-slate-900 shadow-3xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        📅 예약 일시 지정
                      </button>
                    </div>
                  </div>

                  {/* Grid: Date & Time selector */}
                  {isAsap ? (
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl text-[11px] sm:text-xs font-black text-emerald-800 flex items-center gap-2">
                      <span className="text-emerald-500 text-xs shrink-0">✔</span>
                      <span>확인 즉시 빠른 시간내에 연락드립니다!</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold text-slate-500">
                          원하는 예약 날짜
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="date"
                            required={!isAsap}
                            value={reserveDate}
                            min={getTodayDateString()}
                            onChange={(e) => setReserveDate(e.target.value)}
                            className={`w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold transition-all ${
                              reserveTab === 'phone' ? 'focus:border-emerald-500' : 'focus:border-[#FEE500]'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold text-slate-500">
                          약속 시간대
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <select
                            value={reserveTime}
                            onChange={(e) => setReserveTime(e.target.value)}
                            className={`w-full pl-9 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden font-bold appearance-none cursor-pointer transition-all ${
                              reserveTab === 'phone' ? 'focus:border-emerald-500' : 'focus:border-[#FEE500]'
                            }`}
                          >
                            <option value="09:00">오전 09:00</option>
                            <option value="10:00">오전 10:00</option>
                            <option value="11:00">오전 11:00</option>
                            <option value="12:00">정오 12:00</option>
                            <option value="13:00">오후 01:00</option>
                            <option value="14:00">오후 02:00</option>
                            <option value="15:00">오후 03:00</option>
                            <option value="16:00">오후 04:00</option>
                            <option value="17:00">오후 05:00</option>
                            <option value="18:00">오후 06:00</option>
                            <option value="19:00">오후 07:00</option>
                            <option value="20:00">오후 08:00</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Privacy Policy Agreement Checkbox */}
                  <div className="pt-2 pb-1 border-t border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="reserve-agree-checked"
                          checked={reserveAgree}
                          onChange={(e) => setReserveAgree(e.target.checked)}
                          className={`w-4 h-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer ${
                            reserveTab === 'phone' ? 'accent-slate-900' : 'accent-[#FEE500]'
                          }`}
                        />
                        <label
                          htmlFor="reserve-agree-checked"
                          className="text-[11px] font-black text-slate-600 cursor-pointer select-none"
                        >
                          개인정보 수집 및 이용 동의 <span className="text-red-500 font-extrabold">(필수)</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPrivacyModalOpen(true)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 underline font-extrabold cursor-pointer"
                      >
                        자세히 보기
                      </button>
                    </div>
                  </div>

                  {/* Error Indicator message */}
                  {reserveError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[11px] font-bold leading-relaxed flex items-center gap-1.5 animate-pulse">
                      <span className="shrink-0 text-red-500 font-extrabold text-xs">⚠</span>
                      <span>{reserveError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-xl text-sm sm:text-base font-black text-center transition-all cursor-pointer shadow-md select-none ${
                        reserveTab === 'phone'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-[#FEE500] text-slate-900 hover:bg-[#FADA0A]'
                      } disabled:opacity-50`}
                    >
                      {isSubmitting ? '예약 접수 중...' : `${reserveTab === 'phone' ? '📞 전화 상담 예약 완료' : '💬 카카오톡 상담 예약 완료'}`}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Anchor Button */}
        <button
          onClick={() => setConsultationOpen(prev => !prev)}
          className={`flex items-center gap-2 px-5 py-3.5 border rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 select-none font-bold group cursor-pointer ${
            isOverFooter
              ? 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-350 hover:border-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
              : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
          }`}
          title="여환동 법무사 실시간 1:1 상담신청 예약"
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 stroke-[2.3] group-hover:rotate-12 transition-transform duration-300 ${
              isOverFooter ? 'text-amber-950' : 'text-emerald-400'
            }`} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOverFooter ? 'bg-amber-800' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isOverFooter ? 'bg-amber-900' : 'bg-emerald-500'
              }`}></span>
            </span>
          </div>
          <span className={`text-xs sm:text-sm font-extrabold tracking-tight pr-0.5 ${
            isOverFooter ? 'text-slate-950 font-black' : 'text-white'
          }`}>상담신청</span>
        </button>
      </div>

      {/* Privacy Agreement Modal Overlay (Korean Law Compliant Layout) */}
      <AnimatePresence>
        {privacyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setPrivacyModalOpen(false);
                setConsultationOpen(true);
              }}
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
                  onClick={() => {
                    setPrivacyModalOpen(false);
                    setConsultationOpen(true);
                  }}
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
                    setReserveAgree(true);
                    setPrivacyModalOpen(false);
                    setConsultationOpen(true);
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

