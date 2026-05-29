import React from 'react';
import { Scale, PhoneCall, HelpCircle, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onAdminClick?: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Main Hotline and Core Anchors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-8 border-b border-slate-800">
          <div className="space-y-1.5">
            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              필요한 만큼, 꼭 필요한 방식으로
            </h4>
            <p className="text-xs text-slate-400 font-semibold max-w-sm whitespace-pre-line">
              나에게 딱 맞는 채무 탕감 맞춤 설계를 만나보세요.{"\n"}
              비밀 수임 보장 및 법무사 여환동 1:1 직접 밀착 서포트와 함께 일어섭니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <a
              href="tel:010-5410-5679"
              className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40 text-base"
            >
              <PhoneCall className="w-5 h-5 text-white animate-bounce" />
              법무사 즉시 상담 010-5410-5679
            </a>
          </div>
        </div>

        {/* Corporate bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[10px] sm:text-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white tracking-wider">상호: 법무사 여환동 사무소 | 대표 법무사 여환동</p>
            <div className="flex flex-col md:flex-row md:items-center md:gap-x-4 space-y-1 md:space-y-0">
              <p className="text-xs font-bold text-white tracking-wider">사업자등록번호: 610-06-65592</p>
              <p className="text-xs font-bold text-white tracking-wider">주소: 울산 남구 법대로14번길 18 1층</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-extrabold text-[#94a3b8]">© {currentYear} 법무사 여환동 사무소. All rights reserved.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
