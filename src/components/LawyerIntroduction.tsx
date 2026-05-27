import React from 'react';
import { motion } from 'motion/react';
import { 
  Scale, 
  Award, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  FileCheck, 
  ThumbsUp, 
  Briefcase
} from 'lucide-react';

interface LawyerIntroductionProps {
  onBack: () => void;
  onStartSurvey: () => void;
}

export default function LawyerIntroduction({ onBack, onStartSurvey }: LawyerIntroductionProps) {
  const [imgSrc, setImgSrc] = React.useState<string>('/src/lawyer_yeo.jpg');
  const [fallbackIndex, setFallbackIndex] = React.useState(0);

  const fallbacks = [
    '/src/lawyer_yeo.jpg',
    '/src/lawyer_yeo.png',
    '/src/lawyer_yeo.jpeg',
    '/lawyer_yeo.jpg',
    '/lawyer_yeo.png',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400&h=533' // Elegant Asian professional fallback
  ];

  React.useEffect(() => {
    // Load custom profile image from config on mount
    fetch('/api/profile-image')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.image) {
          setImgSrc(data.image);
        }
      })
      .catch((err) => console.error("Error loading profile image:", err));
  }, []);

  const handleImageError = () => {
    if (imgSrc.startsWith('data:')) {
      return;
    }
    if (fallbackIndex < fallbacks.length - 1) {
      const nextIndex = fallbackIndex + 1;
      setFallbackIndex(nextIndex);
      setImgSrc(fallbacks[nextIndex]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-slate-50 min-h-screen py-10 md:py-20"
      id="lawyer-intro-page"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-emerald-600 font-extrabold text-sm transition-colors cursor-pointer mb-6"
          id="lawyer-intro-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          메인 화면으로 돌아가기
        </button>

        {/* Dynamic header banner */}
        <div className="bg-gradient-to-tr from-emerald-600 to-violet-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-xs font-bold text-white tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              신뢰의 법무 파트너
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              법무사 여환동 <br className="sm:hidden" />사무소 소개
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-bold max-w-2xl leading-relaxed">
              울산지방법원 맞춤 개인회생 진행 14년의 압도적 결정력. <br className="hidden sm:inline" />
              의뢰인의 건강한 재출발을 처음부터 성심 끝까지 직접 책임집니다.
            </p>
          </div>
        </div>

        {/* Body content cards gird */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Main profile */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-emerald-600" />
                대표 법무사 여환동의 약속
              </h2>
              
              <div className="text-sm sm:text-base text-slate-600 font-semibold space-y-4 leading-relaxed">
                <p>
                  의뢰인 한 분 한 분의 월 평균 소득 산출, 보유하고 있는 순자산 가액, 최근대출의 성실한 소명 방법, 부동산 및 임차보증금 등 자산 처리안을 <span className="text-emerald-600 font-black">법무사가 직접 개별 검토</span>합니다.
                </p>
                <p>
                  개인회생,파산 신청에 필요한 핵심 서류들인 <b>채권자목록, 변제계획안, 수입 및 지출에 관한 목록, 재산목록, 진술서</b> 등을 사무장에 위임하지 않고 <span className="text-violet-700 font-black">대표 법무사가 직접 면밀히 작성</span>합니다.
                </p>
                <p>
                  신청서 작성의 시작 단계부터 까다로운 법원의 보정 권고 대응, 개시결정(파산선고), 그리고 마지막 최종 인가결정(면책결정)에 이르는 모든 절차를 직접 안전하게 챙깁니다.
                </p>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                <div className="text-center p-3 rounded-2xl bg-slate-50/80">
                  <span className="block text-[11px] text-slate-400 font-extrabold">업계 경력</span>
                  <span className="block text-base sm:text-lg font-black text-slate-900 mt-1">14년 경력</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50/80">
                  <span className="block text-[11px] text-slate-400 font-extrabold">인가결정 누적</span>
                  <span className="block text-base sm:text-lg font-black text-slate-900 mt-1">1,000건+</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50/80">
                  <span className="block text-[11px] text-slate-400 font-extrabold">주요 법원</span>
                  <span className="block text-base sm:text-lg font-black text-emerald-600 mt-1">울산 전담</span>
                </div>
              </div>
            </div>

            {/* Core Values card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-slate-900">
                의뢰자 중심의 안심 케어 정책
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">3~5일내 신속한 추심 금지명령 접수</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      빚 독촉과 압류의 고통에서 빠르게 벗어나 안심하고 생업에만 전념하실 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">청산가치 최소 상쇄 등 맞춤형 보정율</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      주식/코인 투자 손실금 등 거주지역에 맞는 신중한 법리 전개로 청산가치 상쇄 보정을 적극 개척합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">우편물 비밀 대리수령 보장</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      자택, 온 가족, 회사 직장 동료들에게 채무 내역 및 회생 법원 우편송달물이 노출되지 않도록 안심 대리수령을 시행합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Representative lawyer profile photo card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs flex flex-col">
              <div 
                className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden"
              >
                <img
                  src={imgSrc}
                  alt="대표 법무사 여환동"
                  onError={handleImageError}
                  className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent p-5 text-white pointer-events-none">
                  <span className="text-[10px] bg-emerald-500 font-extrabold px-2 py-0.5 rounded text-white uppercase tracking-wider">대표 법무사</span>
                  <h3 className="text-lg font-black mt-1">여환동 (Yeo Hwan-dong)</h3>
                  <p className="text-xs text-emerald-350 font-bold">실무 경력 14년 · 울산 지방법원 전담</p>
                </div>
              </div>
              <div className="p-5.5 space-y-4">
                <div className="space-y-2">
                  <span className="block text-[11px] text-slate-400 font-extrabold tracking-wider uppercase">전문 분야 및 안내</span>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed font-sans">
                    개인회생·개인파산 면책 실무 14년 경력의 베테랑 법무사입니다. 사무장 위임을 일절 배제하고 사건 전반의 법리 소명을 대표 법무사가 실무적으로 직접 완수하여 명확한 책임을 보장합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact & Map */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold text-white tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                사무소 위치
              </span>
              
              <div className="space-y-2">
                <h3 className="text-base font-black">울산지방법원 바로 앞</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold font-sans">
                  울산광역시 남구 법원 인근 정식 등록 법무사 사무소
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Section bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-slate-900">나의 개인회생 자격과 탕감액은?</h3>
            <p className="text-xs text-slate-500 font-bold">설문 입력에 약 1분이 소요되며, 작성 내용은 철저히 암호화 보장됩니다.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              처음으로
            </button>
            <button
              onClick={onStartSurvey}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-violet-600 text-white font-extrabold rounded-xl text-xs tracking-wide shadow-md shadow-emerald-100 transition-colors cursor-pointer text-center"
            >
              무료 1분 진단하기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
