import React from 'react';
import { motion } from 'motion/react';
import { 
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
    const loadProfile = () => {
      fetch('/api/profile-image')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.image) {
            setImgSrc(data.image);
          } else {
            setImgSrc('/src/lawyer_yeo.jpg');
          }
        })
        .catch((err) => console.error("Error loading profile image:", err));
    };

    loadProfile();

    window.addEventListener("profile-updated", loadProfile);
    return () => {
      window.removeEventListener("profile-updated", loadProfile);
    };
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
      className="bg-slate-50 min-h-screen pt-7 pb-10 md:pt-9 md:pb-20"
      id="lawyer-intro-page"
    >
      <div className="max-w-6xl mx-auto px-4">
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
        <div className="bg-gradient-to-tr from-emerald-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-sm sm:text-base font-bold text-white tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              신뢰의 법무 파트너
            </span>
            <p className="text-sm sm:text-base text-emerald-100 font-bold max-w-[104%] w-full leading-relaxed">
              울산지방법원 맞춤 개인회생 진행 14년의 압도적 결정력.<br className="hidden md:inline" /> 사무장 대행 없이 대표 법무사가 모든 실무를 직접 소행하여 신속하고 정밀한 보정 권고 대응으로 인가율을 극대화 합니다.
            </p>
          </div>
        </div>

        {/* Individual Card Layout Blocks for Responsive Adaptability */}
        {(() => {
          const contactMapCard = (
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between h-full space-y-5 border border-slate-800 shadow-lg w-full">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400 tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  사무소 오시는 길
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold bg-slate-800 px-2 py-0.5 rounded">
                  울산지방법원 앞
                </span>
              </div>

              {/* Strict Non-interactive Map Container (Completely blocks click escape or scroll hijacks) */}
              <div className="w-full h-[200px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-inner">
                {/* Visual marker text explaining location statically on top */}
                <div className="absolute top-2 left-2 z-10 bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-black flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>울산지방법원 정문 도보 5분</span>
                </div>
                
                {/* Google map embedding within total click & drag isolation */}
                <iframe
                  title="사무소 지도로 보기"
                  src="https://maps.google.com/maps?q=%EC%9A%B8%EC%82%B0%20%EB%82%A8%EA%B5%AC%20%EB%B2%95%EB%8C%80%EB%A1%9C14%EB%B2%88%EA%B8%B8%2018&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 contrast-[105%] pointer-events-none select-none"
                  tabIndex={-1}
                />
                
                {/* Cover overlay just to be 100% sure clicks do nothing */}
                <div className="absolute inset-0 bg-transparent z-5" value="click-interceptor" />
              </div>

              {/* Exact Address Section */}
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 bg-slate-950/40 px-4 py-3.5 rounded-2xl border border-slate-800/60">
                   <MapPin className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                   <div className="space-y-1 w-full">
                     <p className="font-extrabold text-sm text-slate-100 leading-snug font-sans flex justify-between items-center">
                       <span>울산 남구 법대로14번길 18, 1층</span>
                     </p>
                     <p className="text-[11px] text-slate-450 font-bold text-slate-400 leading-normal">
                       옥서초등학교 정문 앞 (울산지방법원 정문 도보 5분)
                     </p>
                   </div>
                </div>

                {/* Sub info text & direct navigation advice */}
                <div className="space-y-2 px-1">
                  <p className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>전화번호: <a href="tel:052-260-5410" className="text-emerald-400 font-black hover:underline">052-260-5410</a></span>
                  </p>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    <span>방문 안내: 건물 무료 주차가 깔끔하게 제공됩니다. 옥서초등학교 정문 맞은편 단독 건물 1층입니다.</span>
                  </p>
                </div>
              </div>
            </div>
          );

          const promiseCard = (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col justify-between h-full space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Embedded Profile Image within the same block! */}
                <div className="w-[180px] sm:w-[200px] shrink-0 bg-slate-50 border border-slate-100 p-1 rounded-2xl overflow-hidden aspect-[200/230] shadow-sm self-center md:self-start">
                  <img
                    src={imgSrc}
                    alt="대표 법무사 여환동"
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top rounded-xl transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Information area */}
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    대표 법무사 여환동의 약속
                  </h2>
                  
                  <div className="text-sm sm:text-base text-slate-600 font-semibold space-y-4 leading-relaxed">
                    <p>
                      의뢰인 한 분 한 분의 월 평균 소득 산출, 보유하고 있는 순자산 가액, 최근대출의 성실한 소명 방법, 부동산 및 임차보증금 등 자산 처리안을 <span className="text-emerald-600 font-black">법무사가 직접 개별 검토하고,</span>
                    </p>
                    <p>
                      개인회생,파산 신청에 필요한 핵심 서류들인 <b>채권자목록, 변제계획안, 수입 및 지출에 관한 목록, 재산목록, 진술서</b> 등을 <span className="text-violet-700 font-black">대표 법무사가 직접 작성해 실무적 완성도를 높이며,</span>
                    </p>
                    <p>
                      신청서 작성의 시작 단계부터 까다로운 법원의 보정 권고 대응, 개시결정(파산선고), 그리고 마지막 최종 <span className="text-emerald-600 font-black">인가결정(면책결정)에 이르는 모든 절차를 직접 안전하게 챙기도록 하겠습니다.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                <div className="text-center p-3 rounded-2xl bg-slate-50/80">
                  <span className="block text-[11px] text-slate-400 font-extrabold">실무 경력</span>
                  <span className="block text-base sm:text-lg font-black text-slate-900 mt-1">14년 경력</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50/80">
                  <span className="block text-[11px] text-slate-400 font-extrabold">인가결정 누적</span>
                  <span className="block text-base sm:text-lg font-black text-slate-900 mt-1">1,000건+</span>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50/80">
                  <span className="block text-[11px] text-slate-400 font-extrabold">주요 법원</span>
                  <span className="block text-base sm:text-lg font-black text-emerald-600 mt-1">울산지방법원</span>
                </div>
              </div>
            </div>
          );

          const coreValuesCard = (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                의뢰자 중심의 안심 케어 정책
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-[16.1px] font-black text-slate-950">3~5일내 신속한 추심 금지명령 접수</h3>
                    <p className="text-xs md:text-[13.8px] text-slate-500 font-semibold mt-1">
                      빚 독촉과 압류의 고통에서 빠르게 벗어나 안심하고 생업에만 전념하실 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-[16.1px] font-black text-slate-950">청산가치 최소 상쇄 등 맞춤형 보정율</h3>
                    <p className="text-xs md:text-[13.8px] text-slate-500 font-semibold mt-1">
                      주식/코인 투자 손실금 등 거주지역에 맞는 신중한 법리 전개로 청산가치 상쇄 보정을 적극 개척합니다.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-[16.1px] font-black text-slate-950">우편물 비밀 대리수령 보장</h3>
                    <p className="text-xs md:text-[13.8px] text-slate-500 font-semibold mt-1">
                      가족, 직장 동료들에게 채무 내역 및 법원 우편물이 노출되지 않도록 대리 수령을 시행합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );

          return (
            <>
              {/* PC Layout: High Resolution Multi-column */}
              <div className="hidden md:block space-y-6 mb-6">
                <div className="grid grid-cols-3 gap-6 items-stretch">
                  {/* LEFT COLUMN: Promise Card */}
                  <div className="col-span-2 flex flex-col">
                    {promiseCard}
                  </div>

                  {/* RIGHT COLUMN: Location Map Card */}
                  <div className="col-span-1 flex flex-col h-full justify-between">
                    {contactMapCard}
                  </div>
                </div>

                {/* BOTTOM CORE VALUES */}
                <div className="mb-10">
                  {coreValuesCard}
                </div>
              </div>

              {/* Mobile Layout: Sequenced Flow */}
              <div className="block md:hidden flex flex-col gap-6 mb-10">
                {/* Order 1: 약속 카드 (내부에 사진 포함) */}
                {promiseCard}

                {/* Order 2: 사무소 오시는 길 카드 */}
                {contactMapCard}

                {/* Order 3: 안심 케어 정책 카드 */}
                {coreValuesCard}
              </div>
            </>
          );
        })()}

        {/* Action Button Section bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl shadow-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg md:text-[20.7px] font-black text-slate-900">나의 개인회생 자격과 탕감액은?</h3>
            <p className="text-xs md:text-[13.8px] text-slate-500 font-bold">설문 입력에 약 1분이 소요되며, 작성 내용은 철저히 암호화 보장됩니다.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              메인으로
            </button>
            <button
              onClick={onStartSurvey}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-violet-600 text-white font-extrabold rounded-xl text-xs tracking-wide shadow-md shadow-emerald-100 transition-colors cursor-pointer text-center"
            >
              1분 자격 진단하기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
