import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronLeft, Calendar, ArrowRight, ShieldCheck, PhoneCall, Wallet, Calculator, Info, X } from 'lucide-react';

import { SurveyResponses } from '../types';

interface RepaymentPlanBuilderProps {
  onBack?: () => void;
  onSubmitPlan: (answers: SurveyResponses) => void;
}

export default function RepaymentPlanBuilder({ onBack, onSubmitPlan }: RepaymentPlanBuilderProps) {
  // Simulator input parameters state
  const [totalDebt, setTotalDebt] = useState<number>(45000000); // in Won
  const [monthlyIncome, setMonthlyIncome] = useState<number>(2500000); // in Won
  const [dependents, setDependents] = useState<number>(1); // Dependents count
  const [netAsset, setNetAsset] = useState<number>(10000000); // 보유 순자산 (청산가치)
  
  // Safe contact form state
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const livingCost = getMinLivingCost(dependents);

  // --- 개인회생 실무 법리 계산법 고도화 (청산가치 보장 및 최소 가용소득) ---
  // 1) 순수 잉여소득 (조정 전 가용소득)
  const surplusIncome = monthlyIncome - livingCost;

  // 2) 청산가치(순자산) 보장을 위한 최소 월 변제기준선 (총 변제액은 재산가치보다 많아야 함)
  const monthlyRequiredByAsset = Math.ceil(netAsset / 36);

  // 3) 개인회생 최소 보증 월 변제 기본금액 (현실상 0원/극소액 변제를 막는 하한)
  const absoluteMinRepayment = 150000;

  // 4) 최종 월 예상 변제금의 산정 (부양 보정이 가해진 결과물)
  // 가용소득이 0원 이하인 경우, 생계비를 보정 차출(삭감 축소)하여 법상 15만원 혹은 (재산/36) 중 큰 금액으로 납입하게 설계됩니다.
  const availableRepayment = Math.max(
    surplusIncome,
    monthlyRequiredByAsset,
    absoluteMinRepayment
  );

  // 변제금이 소득 자체를 넘어서는 경우 감지 (회생 미성립 예방)
  const isIncomeTooLow = availableRepayment >= monthlyIncome;

  // 최종 예상 36개월 총 변제량
  const totalRepaymentRaw = availableRepayment * 36;
  const totalRepayment = Math.min(totalDebt, totalRepaymentRaw);
  const estimatedPaymentMonthly = Math.round(totalRepayment / 36);

  // 감면 탕감 수치
  const totalSavings = Math.max(0, totalDebt - totalRepayment);
  const reductionPercent = totalDebt > 0 ? Math.round((totalSavings / totalDebt) * 100) : 0;

  // 소득이 생계비에 못 미치는 '생계비 조정 대상' 가구 검출
  const isLivingCostAdjusted = monthlyIncome <= livingCost;

  const formatManWon = (won: number) => {
    return `${Math.round(won / 10000).toLocaleString()}만원`;
  };

  const phonePattern = /^(010|011|016|017|018|019)[- ]?\d{3,4}[- ]?\d{4}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!uName || uName.trim().length === 0) {
      setFormError('성함을 입력해 주세요.');
      return;
    }
    if (!uPhone || !phonePattern.test(uPhone.replace(/[^0-9]/g, ''))) {
      setFormError('올바른 한국 핸드폰 번호(예: 010-1234-5678)를 입력해 주세요.');
      return;
    }
    if (!agreeTerms) {
      setFormError('개인정보 수집 및 자격 진단 상담 활용 요건에 동의해 주세요.');
      return;
    }

    setSubmitting(true);

    // Map the sliders state into a SurveyResponse profile to trigger completion with high accuracy
    let debtOpt = '30m_50m';
    if (totalDebt < 10000000) debtOpt = 'under_10m';
    else if (totalDebt <= 30000000) debtOpt = '10m_30m';
    else if (totalDebt <= 50000000) debtOpt = '30m_50m';
    else if (totalDebt <= 100000000) debtOpt = '50m_100m';
    else debtOpt = 'over_100m';

    setTimeout(() => {
      onSubmitPlan({
        name: uName,
        phone: uPhone,
        occupation: 'regular_employee',
        debtAmount: debtOpt,
        hasMoreDebtThanAssets: 'yes',
        region: 'seoul_metropolitan',
        difficulties: ['high_interest'],
        ageGroup: '30대'
      });
      setSubmitting(false);
    }, 600);
  };

  // Fast Auto-formatter for cellphones
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 3) return setUPhone(raw);
    if (raw.length <= 7) return setUPhone(`${raw.slice(0, 3)}-${raw.slice(3)}`);
    return setUPhone(`${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Header bar */}
        <div className="bg-slate-900 px-4 sm:px-6 py-5 flex justify-between items-center text-white">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              메인으로
            </button>
          ) : (
            <div className="text-xs font-bold text-sky-400">
              법무사 여환동 자격진단
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calculator className="w-4.5 h-4.5 text-sky-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
              1:1 초정밀 부채상환 시뮬레이터
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-4">
          {/* Intro text */}
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-sky-600 font-extrabold text-xs tracking-wider uppercase bg-sky-50 border border-sky-200/50 px-3.5 py-1.5 rounded-full inline-block">
              나만을 위한 1:1 개인회생 플랜
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              맞춤형 월 변제 상환 계획기
            </h2>
          </div>

          <div className="flex flex-col gap-6 pt-2">
            
            {/* Sliders Controllers */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Wallet className="w-4 h-4 text-sky-600 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
                  상환 시뮬레이션 항목 설정
                </h3>
              </div>

              {/* Slider 1: Total Debt */}
              <div className="p-4 bg-slate-50/40 hover:bg-slate-50/80 rounded-2xl border border-slate-100 transition-all duration-200 space-y-3">
                <div className="flex justify-between items-center sm:px-1">
                  <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                    총 기존 채무액
                  </span>
                  <span className="text-base font-black text-slate-900">{formatManWon(totalDebt)}</span>
                </div>
                <div className="px-1 py-1">
                  <input
                    type="range"
                    min={10000000}
                    max={200000000}
                    step={5000000}
                    value={totalDebt}
                    onChange={(e) => {
                      const newDebt = Number(e.target.value);
                      setTotalDebt(newDebt);
                      if (netAsset > newDebt - 5000000) {
                        setNetAsset(Math.max(0, newDebt - 5000000));
                      }
                    }}
                    className="w-full accent-sky-600 h-2 bg-slate-200/80 rounded-lg cursor-pointer transition-all"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold sm:px-1">
                  <span>1,000만원</span>
                  <span>1억원</span>
                  <span>2억원</span>
                </div>
              </div>

              {/* Slider 1-2: Net Asset (Liquidation value) */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/20 to-sky-50/20 hover:from-indigo-50/45 hover:to-sky-50/45 rounded-2xl border border-indigo-100/60 transition-all duration-200 space-y-3">
                <div className="flex justify-between items-center sm:px-1">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    자산 보유 가액 (청산 가치)
                  </span>
                  <span className="text-base font-black text-indigo-700">{formatManWon(netAsset)}</span>
                </div>
                <div className="px-1 py-1">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(10000000, totalDebt - 5000000)}
                    step={1000000}
                    value={netAsset}
                    onChange={(e) => setNetAsset(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200/80 rounded-lg cursor-pointer transition-all"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold items-center sm:px-1">
                  <span>0원 (무관)</span>
                  <span className="text-indigo-600 font-black text-[9px] bg-indigo-55/80 px-2 py-0.5 rounded-full">
                    ※ 청산가치 보장 원칙 준수
                  </span>
                  <span>한계선 ({formatManWon(Math.max(10000000, totalDebt - 5000000))})</span>
                </div>
              </div>

              {/* Slider 2: Monthly Income */}
              <div className="p-4 bg-slate-50/40 hover:bg-slate-50/80 rounded-2xl border border-slate-100 transition-all duration-200 space-y-3">
                <div className="flex justify-between items-center sm:px-1">
                  <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                    본인 월 평균 소득
                  </span>
                  <span className="text-base font-black text-slate-900">{formatManWon(monthlyIncome)}</span>
                </div>
                <div className="px-1 py-1">
                  <input
                    type="range"
                    min={1200000}
                    max={6000000}
                    step={100000}
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full accent-sky-600 h-2 bg-slate-200/80 rounded-lg cursor-pointer transition-all"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold sm:px-1">
                  <span>120만원</span>
                  <span>350만원</span>
                  <span>600만원</span>
                </div>
              </div>

              {/* Selector 3: Dependents count */}
              <div className="p-4 bg-slate-50/40 hover:bg-slate-50/80 rounded-2xl border border-slate-100 transition-all duration-200 space-y-3">
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                    부양가족 수 (본인 포함)
                  </span>
                  <span className="text-[10px] bg-sky-100/85 text-sky-700 px-2.5 py-0.5 rounded-full font-extrabold">2026 최저 생계비 기준</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                    <button
                      key={count}
                      onClick={() => setDependents(count)}
                      className={`py-2 px-1 rounded-xl border text-center font-extrabold text-[11px] transition-all cursor-pointer ${
                        dependents === count
                          ? 'bg-sky-600 border-sky-600 text-white shadow-sm scale-102'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      {count}인
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 font-medium font-sans mt-2 shadow-3xs">
                  <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-800 text-[11px]">
                      {dependents}인 최저생계비: <span className="text-sky-600">{livingCost.toLocaleString()}원</span> (약 {formatManWon(livingCost)})
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-normal">
                      월 소득에서 본인 및 부양가족의 2026년 기준 최저생계비 150% 가량을 공제 보장받은 후, 남은 소득(월 가용소득)으로 변제를 개시하게 됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Visualization Card (Restructured to stretch horizontally/wide at the bottom) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 text-white shadow-xl border border-slate-800 relative overflow-hidden mt-2">
              
              {/* Subtle visual glow accent inside card */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Result Section (Left side: 7/12 cols on desktop) */}
                <div className="md:col-span-7 space-y-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 pb-5 md:pb-0 md:pr-6">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-sky-400 block border-b border-white/5 pb-2 mb-4">
                      실시간 월 변제 시뮬레이션 결과
                    </span>
                    
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-[10px] text-slate-350 font-bold block mb-0.5">36개월 납입 예정 월 변제금</span>
                        <p className="text-3xl sm:text-4xl font-black text-sky-300 leading-none tracking-tight">
                          월 {estimatedPaymentMonthly.toLocaleString()}원
                        </p>
                        <span className="text-[10px] text-sky-200/80 font-bold block mt-1">
                          (실제 부담액: 약 {formatManWon(estimatedPaymentMonthly)} / 월)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] text-slate-400 block font-semibold">3년 총 상환액</span>
                          <span className="text-xs font-black text-slate-200 block">{formatManWon(totalRepayment)}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] text-emerald-400 block font-semibold">원금 예상 탕감액</span>
                          <span className="text-xs font-black text-emerald-300 block">{formatManWon(totalSavings)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Message Section (Right side: 5/12 cols on desktop) */}
                <div className="md:col-span-5 flex flex-col justify-center pl-0 md:pl-2">
                  {isIncomeTooLow ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-bold leading-normal space-y-1 w-full">
                      <p className="font-extrabold text-rose-200">⚠️ 실질적 변제 불능 경고</p>
                      <p className="text-slate-300/90 leading-relaxed">
                        월 필수 변제 하한선({formatManWon(estimatedPaymentMonthly)})이 본인의 가용 소득 능력을 상회하여 기각 한계에 달했습니다. 추가 보정 설계 검증이 강력히 요구됩니다.
                      </p>
                    </div>
                  ) : isLivingCostAdjusted ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-bold leading-normal space-y-1 w-full">
                      <p className="font-extrabold text-amber-200">※ 특별 생계비 조정안 보정 적용</p>
                      <p className="text-slate-300/90 leading-relaxed">
                        월 소득이 최저생계비 이하지만, 생계비 축소 또는 변제 기간 연장 등을 적용한 변제계획안을 작성해야 인가 될 가능성이 높은 경우입니다.(상세 상담이 필요한 경우)
                      </p>
                    </div>
                  ) : reductionPercent > 0 ? (
                    <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex flex-col gap-2 w-full">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-slate-300 font-bold">총 채무 대비 감면율:</span>
                        <span className="text-sm font-black text-emerald-400">{reductionPercent}% 탕감 예상</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${reductionPercent}%` }} />
                      </div>
                      {estimatedPaymentMonthly * 36 >= netAsset && surplusIncome < monthlyRequiredByAsset && (
                        <p className="text-[9px] text-indigo-300 leading-normal font-semibold border-t border-white/5 pt-1.5 mt-1">
                          💡 청산가치 한계치 적용: 원재산({formatManWon(netAsset)})을 법 보장하기 위해 월 법정 하한선이 상향 보증되었습니다.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-semibold leading-normal w-full">
                      높은 소득 대비 부양가족이 많지 않아, 36개월보다 짧은 기간 이내에 변제하는 계획안을 작성해야 인가결정을 받을 수 있는 경우에 해당 될 가능성이 있습니다.(상세 상담이 필요한 경우)
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Privacy Agreement Modal Overlay (Plan Builder Internal Modal) */}
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
