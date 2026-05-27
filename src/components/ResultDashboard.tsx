import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SurveyResponses } from '../types';
import { SUCCESS_STORIES } from '../data';
import { Scale, HeartHandshake, PhoneCall, CheckCircle, ArrowRight, ShieldCheck, Award, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';

interface ResultDashboardProps {
  responses: SurveyResponses;
  onRestart: () => void;
  onGoToMain: () => void;
}

export default function ResultDashboard({ responses, onRestart, onGoToMain }: ResultDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stepMsg, setStepMsg] = useState('가입 심사 데이터 확인 중...');

  useEffect(() => {
    // Elegant Multi-stage analytic loaders
    const msgs = [
      '가입 심사 데이터 확인 중...',
      '보건복지부 고시 부양가족 생계비 매칭 중...',
      '관할 회생법원 금지명령 심판 데이터 대조 중...',
      '개인회생 최대 탕감 한도 가용 시뮬레이션 중...',
      '법무사 여환동 자격 진단 보고서 작성 완료!'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < msgs.length - 1) {
        current += 1;
        setStepMsg(msgs[current]);
      } else {
        setLoading(false);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Compute calculated estimations based on response parameters
  const getEstimationDetails = () => {
    let mockTotalDebt = 48000000;
    let originalDebtStr = '4,800만 원';
    
    switch (responses.debtAmount) {
      case 'under_10m':
        mockTotalDebt = 8500000;
        originalDebtStr = '850만 원';
        break;
      case '10m_30m':
        mockTotalDebt = 22000000;
        originalDebtStr = '2,200만 원';
        break;
      case '30m_50m':
        mockTotalDebt = 44000000;
        originalDebtStr = '4,400만 원';
        break;
      case '50m_100m':
        mockTotalDebt = 78000000;
        originalDebtStr = '7,800만 원';
        break;
      case 'over_100m':
        mockTotalDebt = 145000000;
        originalDebtStr = '1억 4,500만 원';
        break;
    }

    // --- 2026 Minimum Cost of Living Calculation Integration ---
    // 1. Determine monthly income based on selected range or fallbacks
    let estimatedIncome = 2500000;
    if (responses.monthlyIncome) {
      switch (responses.monthlyIncome) {
        case 'under_150':
          estimatedIncome = 1300000;
          break;
        case '150_200':
          estimatedIncome = 1750000;
          break;
        case '200_300':
          estimatedIncome = 2500000;
          break;
        case '300_400':
          estimatedIncome = 3500000;
          break;
        case 'over_400':
          estimatedIncome = 4500000;
          break;
        default:
          estimatedIncome = 2500000;
      }
    } else {
      switch (responses.occupation) {
        case 'regular_employee':
          estimatedIncome = 2800000;
          break;
        case 'non_regular_employee':
          estimatedIncome = 2400000;
          break;
        case 'business_owner':
          estimatedIncome = 3200000;
          break;
        case 'freelancer_parttime':
          estimatedIncome = 1950000;
          break;
        case 'no_income':
          estimatedIncome = 1200000;
          break;
      }
    }

    // 2. Determine dependents count based on selection or fallback
    let estimatedDependents = 1;
    if (responses.dependentsCount) {
      switch (responses.dependentsCount) {
        case '1':
          estimatedDependents = 1;
          break;
        case '2':
          estimatedDependents = 2;
          break;
        case '3':
          estimatedDependents = 3;
          break;
        case '4_plus':
          estimatedDependents = 4;
          break;
        default:
          estimatedDependents = 1;
      }
    } else {
      if (responses.ageGroup === '40대') {
        estimatedDependents = 2; // Default for middle aged
      }
    }

    // 2026 Statutory minimum living cost index guideline (60% of median income)
    const getMinLivingCost = (count: number) => {
      switch (count) {
        case 1: return 1538543;
        case 2: return 2519575;
        case 3: return 3215422;
        case 4: return 3896843;
        case 5: return 4534031;
        case 6: return 5133571;
        case 7: return 5709090;
        default: return 5709090 + (count - 7) * 575519;
      }
    };

    const livingCost = getMinLivingCost(estimatedDependents);

    // 3. Estimate net asset value (liquidation value) based on assets question & total debt
    let estimatedNetAsset = 10000000;
    if (responses.hasMoreDebtThanAssets === 'yes') {
      estimatedNetAsset = Math.round(mockTotalDebt * 0.1); // Small assets, 10% of debt
    } else if (responses.hasMoreDebtThanAssets === 'similar') {
      estimatedNetAsset = Math.round(mockTotalDebt * 0.75); // Assets are 75% of debt
    } else if (responses.hasMoreDebtThanAssets === 'no') {
      estimatedNetAsset = Math.round(mockTotalDebt * 1.15); // Assets are 115% of debt (exceeds debt)
    }

    // 4. Calculate available monthly repayment & total repayment
    const surplusIncome = estimatedIncome - livingCost;
    const monthlyRequiredByAsset = Math.ceil(estimatedNetAsset / 36);
    const absoluteMinRepayment = 150000;

    const availableRepayment = Math.max(
      surplusIncome,
      monthlyRequiredByAsset,
      absoluteMinRepayment
    );

    const totalRepaymentRaw = availableRepayment * 36;
    const totalRepayment = Math.min(mockTotalDebt, totalRepaymentRaw);

    // Compute basic reduction rate starting point from law simulation
    const totalSavings = Math.max(0, mockTotalDebt - totalRepayment);
    let reductionRate = mockTotalDebt > 0 ? Math.round((totalSavings / mockTotalDebt) * 100) : 0;

    // Apply baseline adjustments based on difficulty or professional support triggers
    if (responses.difficulties.includes('high_interest') || responses.difficulties.includes('overwhelming_harassment')) {
      reductionRate = Math.min(90, reductionRate + 5); // legal maximum up to 90
    }

    // Asset checks (Hard law constraints)
    let warningMsg = '';
    let eligibilityGrade = '우수 (A등급)';
    let progressColor = 'bg-emerald-500';
    let textColor = 'text-emerald-700';
    let ringColor = 'ring-emerald-100';

    if (responses.occupation === 'no_income') {
      reductionRate = 0;
      warningMsg = '※ 신청 보류 조치: 현재 일정한 소득(월급, 사업소득, 영업소득, 연금, 프리랜서 등)이 없는 상태(무직, 주부, 학생 등)로 진단되어 현행법상 지속적인 소득을 기본 전제로 하는 개인회생 신청은 현재 규정으로는 불가능합니다. 다만, 단기 아르바이트나 파트타임 등 소득 활동의 개시 채널을 즉시 안내받아 보완하시거나, 소득이 전무한 상태에서 빚을 일시에 전액 탕감(100% 면책)받는 "개인파산 및 면책 신청" 제도로의 전환 등 맞춤형 특별 조치가 가능합니다. 상세 자격 충족 요건 조율을 위해 반드시 법무사의 1:1 개별 상담을 즉시 받아보시길 권장해 드립니다.';
      eligibilityGrade = '신청 보류 (소득 보완 필요)';
      progressColor = 'bg-rose-600';
      textColor = 'text-rose-800';
      ringColor = 'ring-rose-150';
    } else if (responses.hasMoreDebtThanAssets === 'no') {
      reductionRate = 0; // Asset greater than debt is legally blocked
      warningMsg = '※ 신청 불가 우려: 보유하신 가치 재산의 합산액이 총 채무액보다 많을 경우, 채무초과 및 지급 불능 상태로 인정받지 못해 법원 심사관으로부터 기각 결정을 받게 됩니다. 다만, 일반 개인이 산정할 때 범하기 쉬운 계산 착오(담보 채무 부채의 근저당권 채무 차감 누락, 세금/체납금 반전 계산, 임차보증금 소액보증금 범위 면제 등)를 정밀 분석하여 보정하면 재산 평가 가액이 극적으로 차감되어 회생 진행이 즉시 가능해지는 사례가 매우 빈번합니다. 실제 실익 소실 위험을 피할 수 있도록 법무사와 개별 상담을 통해 재산 정밀 재평가를 꼭 받아보시길 강력 추천합니다.';
      eligibilityGrade = '기각 확률 높음 (재산 분석 요망)';
      progressColor = 'bg-amber-500';
      textColor = 'text-amber-700';
      ringColor = 'ring-amber-100';
    } else if (responses.hasMoreDebtThanAssets === 'similar') {
      reductionRate = Math.max(10, Math.min(50, reductionRate - 15)); // asset-heavy cases gets capped/reduced
      warningMsg = '※ 안내: 재산과 빚이 비슷한 수준이면, 청산가치 평가 보정 내용에 따라 탕감율이 낮아질 수 있습니다. 재산 보정을 최소화하는 법리 전개로 탕감율을 끌어올려야 합니다.';
      eligibilityGrade = '검토 가능 (B등급)';
      progressColor = 'bg-blue-500';
      textColor = 'text-blue-700';
      ringColor = 'ring-blue-100';
    } else {
      // Best case
      if (mockTotalDebt >= 50000000) {
        eligibilityGrade = '최우수 (S등급)';
        progressColor = 'bg-indigo-600';
        textColor = 'text-indigo-700';
        ringColor = 'ring-indigo-100';
        reductionRate = Math.min(90, reductionRate + 5);
      }
    }

    // Debt range hard block check
    if (responses.debtAmount === 'under_10m') {
      reductionRate = 0;
      warningMsg = '※ 주의: 총 채무금액이 1,000만 원 미만인 경우, 전형적인 개인회생 자격 미달에 속해 비용 대비 실익이 낮을 수 있습니다. 신용회복위원회의 프리워크아웃이나 개인워크아웃 절차가 보다 효율적일 수 있으니, 무리한 진행 전 자매 프로그램 연동 무상 컨설팅을 꼭 점검받으십시오.';
      eligibilityGrade = '보류 (진단 경고)';
      progressColor = 'bg-rose-500';
      textColor = 'text-rose-700';
      ringColor = 'ring-rose-100';
    }

    // Enforce bound limit
    if (reductionRate > 0) {
      reductionRate = Math.max(10, Math.min(90, reductionRate));
    }

    const mockReducedDebt = Math.round(mockTotalDebt * (1 - reductionRate / 100));
    const mockMonthlyPayment = Math.round(mockReducedDebt / 36);

    const formatWon = (num: number) => {
      if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const man = Math.round((num % 100000000) / 10000);
        return `${eok}억 ${man > 0 ? man + '만' : ''} 원`;
      }
      return `${Math.round(num / 10000).toLocaleString()}만 원`;
    };

    return {
      originalDebtStr,
      mockTotalDebt,
      reductionRate,
      mockReducedDebt,
      reducedDebtStr: formatWon(mockReducedDebt),
      savingsDebtStr: formatWon(mockTotalDebt - mockReducedDebt),
      monthlyPaymentStr: formatWon(mockMonthlyPayment),
      warningMsg,
      eligibilityGrade,
      progressColor,
      textColor,
      ringColor
    };
  };

  const est = getEstimationDetails();

  // Pick suitable story
  const getMatchedStory = () => {
    if (responses.difficulties.includes('investment_losses') || responses.occupation === 'freelancer_parttime') {
      return SUCCESS_STORIES[0]; // Crypto / Freelancer
    }
    if (responses.occupation === 'business_owner') {
      return SUCCESS_STORIES[2]; // Business fail
    }
    return SUCCESS_STORIES[1]; // Employee household debt
  };

  const matchedStory = getMatchedStory();

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 relative overflow-hidden">
          {/* Top colored accent line */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 animate-pulse" />
          
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-600 border-r-violet-600 animate-spin" />
              <Scale className="absolute inset-0 m-auto w-7 h-7 text-emerald-600 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-800">법무사 여환동 자가 시뮬레이션 작동 중</h3>
              <p className="text-sm font-semibold text-slate-500 h-6">
                {stepMsg}
              </p>
            </div>

            <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-violet-500 animate-pulse" style={{ width: '100%' }} />
            </div>

            <div className="pt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>개인정보 256bit SSL 대칭형 특수 보안 적용</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12 space-y-5.5" id="result-dashboard-stage">
      {/* Elegantly soft premium ambient glow effects behind result cards */}
      <div className="absolute top-[10%] left-[-10%] w-[380px] h-[380px] rounded-full bg-blue-400/[0.08] blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '9s' }} />
      <div className="absolute top-[45%] right-[-10%] w-[420px] h-[420px] rounded-full bg-violet-400/[0.06] blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '14s' }} />
      <div className="absolute bottom-[15%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-300/[0.05] blur-[90px] pointer-events-none -z-10" />
      
      {/* Celebration Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-1.5 flex-1 w-full text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-550/30 text-[10px] font-black tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>진단 분석 완료 • 신속 통과 요건</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              {responses.name} 님의 자격요건 검토서
            </h2>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-white/10 w-full md:w-auto shadow-inner">
            <div className="w-11 h-11 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Scale className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-300 font-bold block leading-none mb-1">나의 진단 자격 등급</span>
              <span className="text-base font-black text-emerald-400 leading-none">{est.eligibilityGrade}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Simulation Visualization Block */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-100 space-y-6 sm:space-y-8 text-left">
        
        {/* SVG reduction Visualization Row */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
            원금 탕감율 및 부채량 변화 시뮬레이션
          </h3>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Circular Gauge with SVG */}
            <div className="col-span-1 md:col-span-4 flex flex-col items-center justify-center text-center py-2 sm:py-0">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                {/* SVG circular progress */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-slate-200"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - est.reductionRate / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                {/* Text centered inside circular progress */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{est.reductionRate}%</span>
                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mt-1">예상 탕감율</span>
                </div>
              </div>
            </div>

            {/* Direct comparative indicators */}
            <div className="col-span-1 md:col-span-8 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>총 기존 채무 원금</span>
                  <span className="font-extrabold text-slate-700">{est.originalDebtStr}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Reduced Debt Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                  <span>회생 완료 후 최종 변제액</span>
                  {est.reductionRate > 0 ? (
                    <span className="font-extrabold text-emerald-700 text-right">약 {est.reducedDebtStr} (이자 전액 탕감)</span>
                  ) : (
                    <span className="font-extrabold text-amber-700 uppercase">상담을 통한 특별 보정 필요</span>
                  )}
                </div>
                <div className="w-full bg-slate-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: `${Math.max(10, 100 - est.reductionRate)}%` }}
                  />
                </div>
              </div>

              {/* Bullet savings block optimized for mobile stacking */}
              {est.reductionRate > 0 && (
                <div className="p-3 bg-emerald-100/35 rounded-xl border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs">
                  <span className="font-black text-emerald-900">법적으로 즉시 탕감 소멸되는 빚:</span>
                  <span className="font-black text-emerald-600">총 약 {est.savingsDebtStr} (탕감 완료)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Highlighted Monthly Plan Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest block">36개월 월 예상 변제금</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {est.reductionRate > 0 ? `월 약 ${est.monthlyPaymentStr}` : '별도 상담 요망'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              ※ 개인회생을 통해 본인이 매월 부담해야 하는 변제 금액 (2026년 최저생계비 기준 적용 시뮬레이션)
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-violet-100 bg-violet-50/30 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-black text-violet-700 uppercase tracking-widest block">법무사 여환동의 안심 케어</span>
            <ul className="text-[11px] text-slate-700 font-bold space-y-1">
              <li className="flex items-center gap-1.5">• 3~5일내 추심 금지명령 발령</li>
              <li className="flex items-center gap-1.5">• 주식/코인 투자 손실금 청산가치 최저 보장</li>
              <li className="flex items-center gap-1.5">• 자택/회사 등 우편 노출 안심, 대리 수령</li>
            </ul>
          </div>
        </div>

        {/* Warn msg block */}
        {est.warningMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`p-5 sm:p-6 rounded-2xl border ${
              responses.occupation === 'no_income' 
                ? 'bg-rose-50/95 border-rose-200/80 shadow-[0_4px_20px_rgba(225,29,72,0.06)]' 
                : 'bg-amber-50/95 border-amber-200/80 shadow-[0_4px_20px_rgba(245,158,11,0.06)]'
            } flex flex-row items-start gap-4 transition-all hover:scale-[1.005]`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[12px] sm:text-[13.2px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                  responses.occupation === 'no_income' ? 'bg-rose-200/60 text-rose-800' : 'bg-amber-200/60 text-amber-800'
                }`}>
                  개인회생 요건 보완 필요성
                </span>
              </div>
              <div className={`text-xs sm:text-[13px] font-bold leading-relaxed ${
                responses.occupation === 'no_income' ? 'text-rose-900/90' : 'text-amber-900/90'
              }`}>
                {est.warningMsg}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Matched Real Success Story Card */}
      {responses.occupation !== 'no_income' && responses.hasMoreDebtThanAssets !== 'no' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              의뢰인과 유사한 실제 법원 면책 선례
            </h3>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-extrabold mr-2">
                  {matchedStory.category}
                </span>
                <h4 className="font-black text-slate-800 text-base inline-block mt-1 sm:mt-0">
                  {matchedStory.title}
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-bold">{matchedStory.age} | {matchedStory.job}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-bold block">기존 총 부채</span>
                <span className="text-sm font-black text-slate-700">{matchedStory.originalDebt}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100/50">
                <span className="text-[10px] text-slate-400 font-bold block shrink-0">조정 후 부채</span>
                <span className="text-sm font-black text-violet-700">{matchedStory.reducedDebt}</span>
              </div>
              <div className="col-span-2 md:col-span-1 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-extrabold block">실제 탕감율</span>
                <span className="text-sm font-black text-emerald-700">{matchedStory.reductionRate}% 할인 면책</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed pt-2">
              "{matchedStory.description}"
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons Block */}
      <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-4">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          다시 진단하기
        </button>
        <button
          onClick={onGoToMain}
          className="w-full sm:w-auto px-10 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>메인화면 가기</span>
        </button>
      </div>

    </div>
  );
}
