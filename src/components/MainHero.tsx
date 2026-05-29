import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, TrendingDown, ClipboardCheck, Users, HelpCircle } from 'lucide-react';

interface MainHeroProps {
  onStartSurvey: (initialMode?: string) => void;
  onWorryChipClick?: (index: number) => void;
}

export default function MainHero({ onStartSurvey, onWorryChipClick }: MainHeroProps) {
  // Config for the 2 interactive entry cards (combined from 3 original cards)
  const entranceCards = [
    {
      title: '탕감 금액 즉시 확인하기',
      subtitle: '',
      icon: <ClipboardCheck className="w-8 h-8 text-blue-700" />,
      color: 'from-blue-500/15 to-violet-500/10 hover:border-blue-400',
      actionKey: 'qualification'
    },
    {
      title: '나와 비슷한 성공사례 찾기',
      subtitle: '실제 면책사례와 비교',
      icon: <Users className="w-8 h-8 text-amber-600" />,
      color: 'from-amber-500/10 to-orange-500/10 hover:border-amber-300',
      actionKey: 'case'
    }
  ];

  const worrychips = [
    '전부 최근 대출이에요.',
    '전화 독촉 스트레스!',
    '코인 및 주식 투자손실',
    '배우자 몰래 진행하기!'
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/15 pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-[72px] md:pb-[100px] lg:pb-[130px]">
      {/* Sophisticated Background Design: Subtle Grid Pattern, Ambient Glows & Light Beam */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a04_1px,transparent_1px),linear-gradient(to_bottom,#0f172a04_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-transparent to-transparent pointer-events-none" />

      {/* Modern Ambient Glow Backdrops (Subtle pastel blue & light purple spotlights under card sections for depth) */}
      <div className="absolute top-[15%] left-[20%] w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full bg-blue-400/[0.07] blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '14s' }} />
      <div className="absolute top-[45%] right-[15%] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full bg-indigo-300/[0.05] blur-[110px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '16s' }} />
      <div className="absolute bottom-[5%] left-[30%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-slate-300/[0.05] blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl md:max-w-6xl mx-auto px-4 sm:px-8 relative z-10 text-center">
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 border border-blue-200 text-xs md:text-sm font-bold text-blue-900 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-700 animate-spin" />
          <span>신청자격 자가진단 시스템</span>
        </motion.div>

        {/* Master Titles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 sm:space-y-6"
        >
          <h2 className="text-indigo-800 font-extrabold text-sm sm:text-base md:text-xl tracking-wider uppercase">
            울산에 사시는데 다른 지역에 맡기시려고요?
          </h2>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wide text-slate-900 leading-[1.12] whitespace-pre-line">
            개인회생·개인파산
          </h1>
        </motion.div>

        {/* Introduction Cards */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 sm:mt-10 text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto font-bold leading-relaxed px-4"
        >
          울산지방법원 사건에 특화된 법무사가 있습니다.
        </motion.p>

        {/* Quick Highlight Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-1"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-3xs flex flex-col items-center justify-center text-center md:min-h-[160px]">
            <span className="text-sm font-extrabold text-blue-800 mb-2 leading-none">소득 기준 최소화</span>
            <p className="text-[18px] sm:text-[20px] font-black text-slate-800 leading-snug">
              어떤 직종이든<br className="block" /> 소득이 있다면 가능!
            </p>
          </div>
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-3xs flex flex-col items-center justify-center text-center md:min-h-[160px]">
            <span className="text-sm font-extrabold text-violet-600 mb-2 leading-none">최소 채무 허들</span>
            <p className="text-[18px] sm:text-[20px] font-black text-slate-800 leading-snug">
              총 빚 합산금액이<br className="block" /> 천만 원 이상이면 가능!
            </p>
          </div>
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-3xs flex flex-col items-center justify-center text-center md:min-h-[160px]">
            <span className="text-sm font-extrabold text-amber-600 mb-2 leading-none">순자산 보유 범위</span>
            <p className="text-[18px] sm:text-[20px] font-black text-slate-800 leading-snug">
              소유 재산 가액보다<br className="block" /> 채무가 더 많다면 가능!
            </p>
          </div>
        </motion.div>

        {/* Worry chips area */}
        <div className="mt-12 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto px-2">
          {worrychips.map((chip, index) => (
            <span
              key={index}
              onClick={() => onWorryChipClick && onWorryChipClick(index)}
              className="px-4.5 py-2.5 rounded-full bg-indigo-50/80 text-indigo-600 border border-indigo-100 text-[12.6px] font-extrabold shadow-3xs hover:bg-indigo-100/80 hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              #{chip}
            </span>
          ))}
        </div>

        {/* Action Title Block */}
        <div className="mt-16 md:mt-24 lg:mt-32 border-t border-slate-300/40 pt-16 md:pt-24 lg:pt-32">
          <div className="space-y-4 sm:space-y-6">
            <span className="text-sm sm:text-base md:text-xl font-extrabold text-violet-600 tracking-wider uppercase block">
              1분만 투자해 보세요!
            </span>
            <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight px-2 leading-[1.12]">
              나의 탕감 금액은?
            </h3>
          </div>
          <p className="mt-6 sm:mt-10 text-sm sm:text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed px-4">
            개인회생이 가능한지? 월변제금은 얼마인지?<br />
            결과를 실시간 확인할 수 있습니다.
          </p>
        </div>

        {/* Entrance Interactive Selection Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto px-1 text-left">
          {entranceCards.map((card, idx) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={idx}
              onClick={() => onStartSurvey(card.actionKey)}
              className={`p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br ${card.color} border ${
                idx === 0 ? 'border-blue-300 animate-gentle-glow' : 'border-slate-200/45'
              } shadow-3xs cursor-pointer transition-all duration-200 flex items-center ${card.subtitle ? 'sm:items-start' : 'sm:items-center'} gap-4 hover:shadow-sm relative group`}
            >
              <div className="p-4 bg-white rounded-2xl shadow-3xs shrink-0 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-extrabold text-slate-800 text-[17.15px] sm:text-[19px] flex items-center justify-between w-full gap-1.5 flex-wrap sm:flex-nowrap">
                  <span className={`${idx === 0 ? "text-blue-800 font-black tracking-tight" : ""} inline-flex items-center gap-1.5 flex-wrap`}>
                    {card.title}
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1.5 ml-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-black bg-blue-600 text-white shadow-3xs">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-100"></span>
                        </span>
                        <span>실시간 진단</span>
                      </span>
                    )}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 shrink-0 transition-all" />
                </h4>
                {card.subtitle && (
                  <p className="text-sm text-slate-500 font-bold leading-normal">{card.subtitle}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subtle timer warning */}
        <p className="mt-6 text-sm text-slate-500 font-bold tracking-wide">
          본 시뮬레이션 결과는 간이 진단 기준이며, 실제 변제액은 소득과 재산 실사 후 달라질 수 있습니다.
        </p>
      </div>
    </section>
  );
}
