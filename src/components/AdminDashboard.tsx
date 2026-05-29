import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  Lock, 
  Key,
  Search, 
  Filter, 
  Trash2, 
  FileDown, 
  LogOut, 
  User, 
  Phone, 
  Clock, 
  Wallet, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  StickyNote, 
  Eye, 
  EyeOff, 
  MapPin, 
  RefreshCw,
  X,
  MessageCircle,
  Bell
} from "lucide-react";

interface Submission {
  id: string;
  name: string;
  phone: string;
  occupation: string;
  debtAmount: string;
  monthlyIncome?: string;
  dependentsCount?: string;
  hasMoreDebtThanAssets: string;
  region: string;
  difficulties: string[];
  ageGroup: string;
  status: "신청완료" | "상담중" | "서류요청" | "접수완료" | "완료" | "기각";
  counselorNotes: string;
  createdAt: string;
  updatedAt: string;
  isSimpleConsultation?: boolean;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "statistics">("list");

  // Change Password Modal States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");

  // Kakao Channel URL Modal States
  const [isKakaoUrlOpen, setIsKakaoUrlOpen] = useState(false);
  const [kakaoUrlVal, setKakaoUrlVal] = useState("");
  const [kakaoUrlError, setKakaoUrlError] = useState("");
  const [kakaoUrlSuccess, setKakaoUrlSuccess] = useState("");

  // Solapi SMS Alert Modal States
  const [isSolapiOpen, setIsSolapiOpen] = useState(false);
  const [solapiApiKey, setSolapiApiKey] = useState("");
  const [solapiApiSecret, setSolapiApiSecret] = useState("");
  const [solapiReceiverPhone, setSolapiReceiverPhone] = useState("");
  const [solapiError, setSolapiError] = useState("");
  const [solapiSuccess, setSolapiSuccess] = useState("");

  // Brand Logo and Lawyer Profile Photo Modal States
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [logoBase64, setLogoBase64] = useState("");
  const [profileBase64, setProfileBase64] = useState("");
  const [imagesError, setImagesError] = useState("");
  const [imagesSuccess, setImagesSuccess] = useState("");

  const handleOpenSolapiModal = async () => {
    setIsSolapiOpen(true);
    setSolapiError("");
    setSolapiSuccess("");
    try {
      const res = await fetch("/api/admin/solapi-config", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data) {
        setSolapiApiKey(data.solapiApiKey || "");
        setSolapiApiSecret(data.solapiApiSecret || "");
        setSolapiReceiverPhone(data.solapiReceiverPhone || "");
      }
    } catch (err) {
      console.error("Error fetching Solapi config:", err);
    }
  };

  const handleUpdateSolapi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSolapiError("");
    setSolapiSuccess("");

    if (!solapiApiKey.trim() || !solapiApiSecret.trim() || !solapiReceiverPhone.trim()) {
      setSolapiError("모든 항목을 올바르게 채워서 넣어 주십시오.");
      return;
    }

    try {
      const res = await fetch("/api/admin/solapi-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          solapiApiKey: solapiApiKey.trim(),
          solapiApiSecret: solapiApiSecret.trim(),
          solapiReceiverPhone: solapiReceiverPhone.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSolapiSuccess("솔라피 실시간 상담 예약 알림 설정이 완료되었습니다!");
        setTimeout(() => {
          setIsSolapiOpen(false);
          setSolapiSuccess("");
        }, 1800);
      } else {
        setSolapiError(data.error || "솔라피 설정 저장에 에러가 발생했습니다.");
      }
    } catch (err) {
      setSolapiError("서버와 통신하는 동안 연결에 실패했습니다.");
    }
  };

  const handleOpenKakaoUrlModal = async () => {
    setIsKakaoUrlOpen(true);
    setKakaoUrlError("");
    setKakaoUrlSuccess("");
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      if (data && data.kakaoChannelUrl) {
        setKakaoUrlVal(data.kakaoChannelUrl);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  const handleUpdateKakaoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setKakaoUrlError("");
    setKakaoUrlSuccess("");

    if (!kakaoUrlVal.trim() || !kakaoUrlVal.trim().startsWith("http")) {
      setKakaoUrlError("올바른 http/https 형식의 카카오 채널 주소를 기입해 주십시오.");
      return;
    }

    try {
      const res = await fetch("/api/admin/kakao-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url: kakaoUrlVal.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setKakaoUrlSuccess("카카오톡 비즈니스 채널 주소가 안전하게 설정 변경되었습니다!");
        setTimeout(() => {
          setIsKakaoUrlOpen(false);
          setKakaoUrlSuccess("");
        }, 1800);
      } else {
        setKakaoUrlError(data.error || "카카오 채널 주소 저장 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setKakaoUrlError("네트워크 서버와 통신 도중 실패했습니다.");
    }
  };

  const handleOpenImagesModal = async () => {
    setIsImagesOpen(true);
    setImagesError("");
    setImagesSuccess("");
    try {
      // Get logo image
      const resLogo = await fetch("/api/logo-image");
      const dataLogo = await resLogo.json();
      if (dataLogo && dataLogo.image) {
        setLogoBase64(dataLogo.image);
      } else {
        setLogoBase64("");
      }
      
      // Get profile image
      const resProfile = await fetch("/api/profile-image");
      const dataProfile = await resProfile.json();
      if (dataProfile && dataProfile.image) {
        setProfileBase64(dataProfile.image);
      } else {
        setProfileBase64("");
      }
    } catch (err) {
      console.error("Error loading images config:", err);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "profile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImagesError("이미지 크기는 최대 2MB까지 지원됩니다. 다른 이미지를 선택하세요.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "logo") {
        setLogoBase64(base64);
      } else {
        setProfileBase64(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setImagesError("");
    setImagesSuccess("");

    try {
      // Update logo image
      const resLogo = await fetch("/api/logo-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: logoBase64 })
      });
      if (!resLogo.ok) {
        throw new Error("로고 업로드 중 서버 오류가 발생했습니다.");
      }

      // Update profile image
      const resProfile = await fetch("/api/profile-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: profileBase64 })
      });
      if (!resProfile.ok) {
        throw new Error("프로필 사진 업로드 중 서버 오류가 발생했습니다.");
      }

      setImagesSuccess("로고 및 프로필 사진이 성공적으로 저장되었습니다!");
      setTimeout(() => {
        setIsImagesOpen(false);
        setImagesSuccess("");
        // Reload page to re-render in Header and LawyerIntroduction
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setImagesError(err.message || "이미지 저장에 실패했습니다.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (!newPasswordVal.trim()) {
      setChangePasswordError("새 비밀번호를 입력해 주십시오.");
      return;
    }

    if (newPasswordVal.trim().length < 4) {
      setChangePasswordError("보안 강화를 위해 최소 4자 이상으로 기입해 주십시오.");
      return;
    }

    if (newPasswordVal !== confirmPasswordVal) {
      setChangePasswordError("새 비밀번호와 비밀번호 확인 입력값이 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ newPassword: newPasswordVal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangePasswordSuccess("비밀번호가 안전하게 변경되었습니다! 2초 후 보안 세션이 만료되며 새로 로그인이 필요합니다.");
        setNewPasswordVal("");
        setConfirmPasswordVal("");
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          setChangePasswordSuccess("");
          handleLogout();
        }, 2200);
      } else {
        setChangePasswordError(data.error || "비밀번호 변경 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setChangePasswordError("네트워크 서버와 통신 도중 실패했습니다.");
    }
  };

  // Load token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchSubmissions(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem("admin_token", data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        fetchSubmissions(data.token);
      } else {
        setAuthError(data.message || "비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setAuthError("서버와 통신하는 도중 오류가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setIsAuthenticated(false);
    setSubmissions([]);
    setPassword("");
  };

  const fetchSubmissions = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        // Token might have expired or changed
        handleLogout();
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, status: newStatus as any, updatedAt: new Date().toISOString() } : sub)
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ counselorNotes: notes })
      });
      if (res.ok) {
        setSubmissions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, counselorNotes: notes, updatedAt: new Date().toISOString() } : sub)
        );
      }
    } catch (err) {
      console.error("Error updating counselor notes:", err);
    }
  };

  const handleDeleteSubmission = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`[경고] ${name} 의뢰인의 무료 한도 자격 진단 데이터를 실시간 데이터베이스에서 완전히 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
      }
    } catch (err) {
      console.error("Error deleting submission:", err);
    }
  };

  const togglePhoneReveal = (id: string) => {
    setRevealedPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getMaskedPhone = (phone: string, isRevealed: boolean) => {
    if (isRevealed) return phone;
    // Format is like 010-1234-5678, we mask middle numbers
    const parts = phone.split("-");
    if (parts.length === 3) {
      return `${parts[0]}-****-${parts[2]}`;
    }
    return phone.slice(0, 3) + "****" + phone.slice(-4);
  };

  const formatOccupation = (key: string) => {
    switch (key) {
      case "regular_employee": return "직장인 (정규직)";
      case "non_regular_employee": return "직장인 (비정규직)";
      case "business_owner": return "자영업자";
      case "freelancer_parttime": return "프리랜서 / 알바";
      case "no_income": return "무직 / 소득없음";
      default: return key;
    }
  };

  const formatDebtAmount = (id: string) => {
    if (!id) return "미기재";
    const numericVal = parseInt(id, 10);
    if (!isNaN(numericVal)) {
      if (numericVal >= 10000) {
        const eok = Math.floor(numericVal / 10000);
        const man = numericVal % 10000;
        return `${eok}억 ${man > 0 ? man.toLocaleString() + '만' : ''} 원`;
      }
      return `${numericVal.toLocaleString()}만 원`;
    }
    switch (id) {
      case "under_10m": return "1천만 원 미만";
      case "10m_30m": return "1천만 원 ~ 3천만 원";
      case "30m_50m": return "3천만 원 ~ 5천만 원";
      case "50m_100m": return "5천만 원 ~ 1억 원";
      case "over_100m": return "1억 원 이상";
      default: return id;
    }
  };

  const formatIncomeRange = (id?: string) => {
    if (!id) return "미기재 (직종환산)";
    const numericVal = parseInt(id, 10);
    if (!isNaN(numericVal)) {
      return `월 ${numericVal.toLocaleString()}만 원`;
    }
    switch (id) {
      case "under_150": return "150만 원 미만";
      case "150_200": return "150만 원 ~ 200만 원";
      case "200_300": return "200만 원 ~ 300만 원";
      case "300_400": return "300만 원 ~ 400만 원";
      case "over_400": return "400만 원 이상";
      default: return id;
    }
  };

  const formatRegion = (key: string) => {
    if (!key) return "미기재";
    switch (key) {
      case "seoul_metropolitan": return "서울 / 경기 / 인천";
      case "busan_gyeongnam": return "울산 / 부산 / 경남 (전담구역)";
      case "daegu_gyeongbuk": return "대구 / 경북";
      case "daejeon_chungcheong": return "대전 / 충청";
      case "gwangju_jeolla": return "광주 / 전라";
      case "gangwon_jeju": return "강원 / 제주";
      default: return "울산 및 기타";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "신청완료": return "bg-sky-50 text-sky-700 border-sky-200/50";
      case "상담중": return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "서류요청": return "bg-violet-50 text-violet-700 border-violet-200/50";
      case "접수완료": return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "완료": return "bg-slate-100 text-slate-700 border-slate-200";
      case "기각": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  // Export Submissions to CSV format file
  const exportToCSV = () => {
    if (submissions.length === 0) {
      alert("출력할 회신 데이터가 존재하지 않습니다.");
      return;
    }

    const headers = ["ID", "성함", "연락처", "직업유형", "소득유형", "부양가족수", "채무액수", "빚이재산보다많음", "희망거주지역", "상태", "상담자노트", "접수시간"];
    const rows = submissions.map(sub => {
      const isSimple = !!sub.isSimpleConsultation || !sub.occupation;
      return [
        sub.id,
        sub.name,
        sub.phone,
        isSimple ? "미기재 (간편 예약)" : formatOccupation(sub.occupation),
        isSimple ? "미기재 (간편 예약)" : formatIncomeRange(sub.monthlyIncome),
        isSimple ? "미기재 (간편 예약)" : (sub.dependentsCount ? `${sub.dependentsCount}명` : "미지표"),
        isSimple ? "미기재 (간편 예약)" : formatDebtAmount(sub.debtAmount),
        isSimple ? "미기재 (간편 예약)" : (sub.hasMoreDebtThanAssets === "yes" ? "예" : "아니오"),
        isSimple ? "미기재 (간편 예약)" : formatRegion(sub.region),
        sub.status,
        sub.counselorNotes.replace(/\n/g, " "),
        new Date(sub.createdAt).toLocaleString("ko-KR")
      ];
    });

    // Format Excel/CSV UTF-8 string with BOM for Korean character safety
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `여환동법무사_실시간회생신청_DB_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search computation
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate high level statistics for layout
  const totalInquiries = submissions.length;
  const inConsultation = submissions.filter(s => s.status === "상담중").length;
  const newRequests = submissions.filter(s => s.status === "신청완료").length;
  const completeFiling = submissions.filter(s => s.status === "접수완료" || s.status === "완료").length;

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16" id="representative-admin-portal">
      <div className="max-w-6xl mx-auto px-4">
        {/* Verification View Modal / Card */}
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 to-violet-600" />
                
                <div className="flex flex-col items-center text-center space-y-4 mb-8 pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-lg shadow-emerald-50">
                    <Lock className="w-6 h-6 text-emerald-400 stroke-[2]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      법무사여환동사무소 관리자
                    </h1>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 tracking-wide uppercase mb-1.5">
                      관리자 등록 비밀번호 (ADMIN PASSKEY)
                    </label>
                    <input
                      type="password"
                      placeholder="설정 파일의 보안 코드를 기입하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold leading-relaxed">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 text-center bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-sm shadow-xl shadow-emerald-50 transition-all cursor-pointer"
                  >
                    로그인 하기
                  </button>
                </form>
                
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <button
                    onClick={onBack}
                    className="text-xs text-slate-400 hover:text-slate-600 font-extrabold transition-all cursor-pointer"
                  >
                    메인 홈화면으로 되돌아가기
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Admin Core Dashboard Layer */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 animate-fade-in"
            >
              {/* Header Navbar banner */}
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black tracking-wider uppercase">
                      <Database className="w-3 h-3 text-emerald-400 animate-pulse" />
                      실시간 동기화 완료
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      울산 남구 법원로 앞 14년 사무소망
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    실시간 자격진단 고객 연동 DB
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => fetchSubmissions(token || "")}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-white/5"
                    title="새로고침"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                    동기화
                  </button>
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 text-emerald-300 hover:text-emerald-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/5"
                    title="대표 비밀번호 변경"
                  >
                    <Key className="w-4 h-4 text-emerald-400" />
                    비밀번호 변경
                  </button>
                  <button
                    onClick={handleOpenImagesModal}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 text-pink-300 hover:text-pink-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/5"
                    title="대표 로고 및 법무사 스마트 프로필 사진 설정"
                  >
                    <User className="w-4 h-4 text-pink-400" />
                    디자인/사진 변경
                  </button>
                   <button
                    onClick={handleOpenKakaoUrlModal}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 text-amber-300 hover:text-amber-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/5"
                    title="카카오톡 1:1 상담 비즈니스 채널 주소 설정"
                  >
                    <MessageCircle className="w-4 h-4 text-amber-400" />
                    카톡 채널 연동
                  </button>
                  <button
                    onClick={handleOpenSolapiModal}
                    className="p-3 bg-white/5 hover:bg-white/10 active:scale-95 text-sky-300 hover:text-sky-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-white/5"
                    title="실시간 상담 예약/종합 진단 제출 시 즉시 SMS 알림 발송 설정"
                  >
                    <Bell className="w-4 h-4 text-sky-450 text-sky-400 animate-pulse" />
                    솔라피 알림 연동
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4 text-slate-950" />
                    엑셀(CSV) 내려받기
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-3 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    title="안전 로그아웃"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs">
                  <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider">누적 총 신청건수</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-950">{totalInquiries}</span>
                    <span className="text-xs text-slate-400 font-bold">건</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs">
                  <span className="block text-[11px] text-amber-500 font-black uppercase tracking-wider">신규 신청 확인</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600">{newRequests}</span>
                    <span className="text-xs text-slate-400 font-bold">건</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs">
                  <span className="block text-[11px] text-emerald-600 font-black uppercase tracking-wider">상담 진행지표</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">{inConsultation}</span>
                    <span className="text-xs text-slate-400 font-bold">건</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs">
                  <span className="block text-[11px] text-indigo-600 font-black uppercase tracking-wider">최종 인가예정건</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600">{completeFiling}</span>
                    <span className="text-xs text-slate-400 font-bold">건</span>
                  </div>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="성함 혹은 연락처 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Status Tabs filters */}
                <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
                  {["all", "신청완료", "상담중", "서류요청", "접수완료", "완료", "기각"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === filter
                          ? "bg-slate-900 border-slate-900 text-white shadow-3xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50"
                      }`}
                    >
                      {filter === "all" ? "전체 보기" : filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submissions List Container */}
              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-sm text-slate-400 font-bold">대표 행정서약 서버로부터 DB를 유도하는 중입니다...</p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 md:text-sm font-semibold">
                    조건에 해당하는 진단자 인입 데이터가 발견되지 않았습니다.
                  </div>
                ) : (
                  filteredSubmissions.map((sub, idx) => {
                    const isRevealed = !!revealedPhones[sub.id];
                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-3xs hover:shadow-xs transition-all relative overflow-hidden"
                      >
                        {/* Upper flex bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-extrabold text-sm border border-slate-200/50">
                              <User className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                 <h3 className="text-base font-black text-slate-900 leading-tight flex items-center gap-1.5">
                                   {sub.name} 
                                   <span className="text-[11px] font-bold text-slate-400">
                                     {sub.isSimpleConsultation || !sub.occupation ? "(간편 상담)" : `(${sub.ageGroup || "나이 미지정"})`}
                                   </span>
                                 </h3>
                                 {/* Region Tag */}
                                 {!(sub.isSimpleConsultation || !sub.occupation) && (
                                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black border border-slate-200/60">
                                     <MapPin className="w-3 h-3" />
                                     {formatRegion(sub.region)}
                                   </span>
                                 )}
                               </div>
                              <p className="text-slate-400 text-[10px] font-medium leading-none mt-1">
                                접수번호: <span className="font-mono text-slate-900 font-bold">{sub.id}</span> | 등록일시: {new Date(sub.createdAt).toLocaleString("ko-KR")}
                              </p>
                            </div>
                          </div>

                          {/* Status Select action and Delete */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="text-[11px] font-black text-slate-400 mr-1.5 hidden sm:inline">상태 관리:</span>
                            <select
                              value={sub.status}
                              onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                              className={`px-3 py-1.5 font-bold rounded-xl text-xs border cursor-pointer outline-none transition-colors ${getStatusColor(sub.status)}`}
                            >
                              <option value="신청완료">신청완료</option>
                              <option value="상담중">상담중</option>
                              <option value="서류요청">서류요청</option>
                              <option value="접수완료">접수완료</option>
                              <option value="완료">완료</option>
                              <option value="기각">기각</option>
                            </select>
                            
                            <button
                              onClick={() => handleDeleteSubmission(sub.id, sub.name)}
                              className="p-2.5 bg-rose-50/50 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl transition-all border border-rose-100/30 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Customer specifications grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Left Column: Essential details */}
                          <div className="space-y-3.5 bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-100">
                            {(() => {
                              const isSimple = !!sub.isSimpleConsultation || !sub.occupation;
                              return (
                                <>
                                  <h4 className="text-[11px] font-black text-slate-400 tracking-wide uppercase border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
                                    <span>{isSimple ? "간편 상담 예약 사양" : "자가진단 분석 지표"}</span>
                                    {isSimple && (
                                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-extrabold px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">간편 상담</span>
                                    )}
                                  </h4>
                                  
                                  <div className="space-y-2.5 text-xs">
                                    {/* Phone */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> 연락처
                                      </span>
                                      <span className="flex items-center gap-1.5 font-mono font-black text-slate-800">
                                        {getMaskedPhone(sub.phone, isRevealed)}
                                        <button
                                          onClick={() => togglePhoneReveal(sub.id)}
                                          className="p-1 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                                          title={isRevealed ? "가리기" : "번호 보기"}
                                        >
                                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                      </span>
                                    </div>

                                    {/* Occupation */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">직종 형태</span>
                                      <span className={`font-extrabold ${isSimple ? "text-slate-400 font-medium font-sans" : "text-slate-800"}`}>
                                        {isSimple ? "-(간편예약 미입력)" : formatOccupation(sub.occupation)}
                                      </span>
                                    </div>

                                    {/* Monthly Income */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">희망 환산 소득</span>
                                      {isSimple ? (
                                        <span className="text-slate-400 font-medium font-sans">-(간편예약 미입력)</span>
                                      ) : (
                                        <span className="font-extrabold text-slate-900 bg-teal-50 border border-teal-200 text-teal-800 px-1.5 py-0.5 rounded text-[10px]">
                                          {formatIncomeRange(sub.monthlyIncome)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Dependents */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">총 부양가족</span>
                                      <span className={`font-extrabold ${isSimple ? "text-slate-400 font-medium font-sans" : "text-slate-800"}`}>
                                        {isSimple ? "-(간편예약 미입력)" : (sub.dependentsCount ? `본인 포함 ${sub.dependentsCount}명` : "기본 1명 (본인)")}
                                      </span>
                                    </div>

                                    {/* Core asset status */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">부채 &gt; 자산 여부</span>
                                      {isSimple ? (
                                        <span className="text-slate-400 font-medium font-sans">-(간편예약 미입력)</span>
                                      ) : (
                                        <span className="font-black text-slate-900 flex items-center gap-0.5">
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                          부채가 더 많음 (적격)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                           {/* Middle Column: Debt levels & reasons */}
                           {(() => {
                             const isSimple = !!sub.isSimpleConsultation || !sub.occupation;
                             return (
                               <div className="space-y-4">
                                 <div>
                                   <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wide">
                                     입력된 무담보 채무 범위액
                                   </span>
                                   {isSimple ? (
                                     <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400 font-semibold font-sans">
                                       <Wallet className="w-4 h-4 text-slate-350" />
                                       -(간편 예약 경로 미입력)
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-1.5 mt-1.5 text-base sm:text-lg font-black text-rose-600">
                                       <Wallet className="w-5 h-5 text-rose-500" />
                                       {formatDebtAmount(sub.debtAmount)}
                                     </div>
                                   )}
                                 </div>

                                 <div>
                                   <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wide mb-1.5">
                                     연체 및 채무가 가해온 압력 사유
                                   </span>
                                   <div className="flex flex-wrap gap-1">
                                     {sub.difficulties && sub.difficulties.length > 0 ? (
                                       sub.difficulties.map((diff, index) => {
                                         let label = diff;
                                         if (diff === "high_interest") label = "고금리 대출/일수";
                                         else if (diff === "living_cost") label = "생활비 부족";
                                         else if (diff === "business_hardship") label = "사업 운영 악화";
                                         else if (diff === "scam_guarantee") label = "보증 피해";
                                         else if (diff === "investment_loss") label = "투자/주식/코인";
                                         else if (diff === "medical_cost") label = "의료/병원비";
                                         
                                         const isSpecialIcon = diff === "전화상담" || diff === "카카오톡상담";
                                         return (
                                           <span
                                             key={index}
                                             className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                                               isSpecialIcon
                                                 ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                                                 : "bg-rose-50 border-rose-100 text-rose-700"
                                             }`}
                                           >
                                             #{label}
                                           </span>
                                         );
                                       })
                                     ) : (
                                       <span className="text-slate-400 text-xs font-semibold">선택 사유 없음</span>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             );
                           })()}

                          {/* Right Column: Counselor Notes Workspace */}
                          <div className="space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-wide">
                                <StickyNote className="w-3.5 h-3.5 text-sky-500" />
                                법률상담 직무 노트 (실시간 기록)
                              </span>
                              <textarea
                                defaultValue={sub.counselorNotes || ""}
                                onBlur={(e) => handleUpdateNotes(sub.id, e.target.value)}
                                placeholder="고객 통화 내용 또는 특이 보정 사항을 기입하고 바깥을 클릭(포커스아웃)하면 자동 실시간 저장됩니다."
                                className="w-full h-24 p-3 bg-indigo-50/20 hover:bg-indigo-50/40 border border-indigo-100 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/80 transition-all placeholder:text-slate-400 placeholder:font-normal leading-relaxed"
                              />
                            </div>
                            <p className="text-[10px] text-right text-emerald-600 font-bold block leading-none">
                              ※ 입력상자를 벗어나면 서버 DB에 즉각 안전 보존됩니다.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Navigation Back */}
              <div className="pt-6 text-center border-t border-slate-200">
                <button
                  onClick={onBack}
                  className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  관리자 포탈 닫기 (메인 화면 이동)
                </button>
              </div>

              {/* Password Change Modal */}
              <AnimatePresence>
                {isChangePasswordOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsChangePasswordOpen(false);
                        setChangePasswordError("");
                      }}
                      className="absolute inset-0 bg-slate-950"
                    />

                    {/* Modal Body */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 overflow-hidden text-slate-900"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
                      
                      <button
                        onClick={() => {
                          setIsChangePasswordOpen(false);
                          setChangePasswordError("");
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                        aria-label="닫기"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="space-y-4 pt-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mx-auto sm:mx-0">
                          <Key className="w-6 h-6 text-emerald-600" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-lg font-black tracking-tight text-slate-900 text-center sm:text-left">
                            대표 관리자 패스코드 변경
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed text-center sm:text-left">
                            나만이 기억할 수 있는 보안 비밀번호로 즉각 안전하게 재설정합니다.
                          </p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                          <div className="text-left">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              새 관리자 패스코드
                            </label>
                            <input
                              type="password"
                              placeholder="새 비밀번호 입력 (최소 4자 이상)"
                              value={newPasswordVal}
                              onChange={(e) => setNewPasswordVal(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                              required
                              autoFocus
                            />
                          </div>

                          <div className="text-left">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              새 관리자 패스코드 확인
                            </label>
                            <input
                              type="password"
                              placeholder="동일하게 한 번 더 입력"
                              value={confirmPasswordVal}
                              onChange={(e) => setConfirmPasswordVal(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                              required
                            />
                          </div>

                          {changePasswordError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold text-left leading-relaxed">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{changePasswordError}</span>
                            </div>
                          )}

                          {changePasswordSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-bold text-left leading-relaxed">
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                              <span>{changePasswordSuccess}</span>
                            </div>
                          )}

                          <div className="pt-2 flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangePasswordOpen(false);
                                setChangePasswordError("");
                              }}
                              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-100 transition-colors cursor-pointer text-center"
                            >
                              변경 완료하기
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Kakao URL Setting Modal */}
              <AnimatePresence>
                {isKakaoUrlOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsKakaoUrlOpen(false);
                        setKakaoUrlError("");
                      }}
                      className="absolute inset-0 bg-slate-950"
                    />

                    {/* Modal Body */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 overflow-hidden text-slate-900"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-505 to-yellow-500 bg-[#FEE500]" />
                      
                      <button
                        onClick={() => {
                          setIsKakaoUrlOpen(false);
                          setKakaoUrlError("");
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                        aria-label="닫기"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="space-y-4 pt-2">
                        <div className="w-12 h-12 rounded-2xl bg-[#FEE500]/20 text-slate-800 flex items-center justify-center mx-auto sm:mx-0">
                          <MessageCircle className="w-6 h-6 text-amber-600" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-lg font-black tracking-tight text-slate-900 text-center sm:text-left">
                            카카오톡 비즈니스 채널 연동
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed text-center sm:text-left">
                            상담 신청 예약 완료 시 의뢰인들을 연동된 카카오톡 비즈니스 채널로 즉시 자동 연결시킵니다.
                          </p>
                        </div>

                        <form onSubmit={handleUpdateKakaoUrl} className="space-y-4 pt-2">
                          <div className="text-left">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              카카오톡 채널 주소 (Kakao Link URL)
                            </label>
                            <input
                              type="url"
                              placeholder="예: https://pf.kakao.com/_xcVaxj"
                              value={kakaoUrlVal}
                              onChange={(e) => setKakaoUrlVal(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                              required
                              autoFocus
                            />
                            <span className="block text-[10px] text-zinc-400 font-medium mt-1 leading-normal">
                              * 법인/비즈니스 카카오 채널 주소를 기입하세요. (예: http://pf.kakao.com/_XXXX)
                            </span>
                          </div>

                          {kakaoUrlError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold text-left leading-relaxed">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{kakaoUrlError}</span>
                            </div>
                          )}

                          {kakaoUrlSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-bold text-left leading-relaxed">
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                              <span>{kakaoUrlSuccess}</span>
                            </div>
                          )}

                          <div className="pt-2 flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsKakaoUrlOpen(false);
                                setKakaoUrlError("");
                              }}
                              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-3.5 bg-[#FEE500] hover:bg-[#FDD835] text-slate-900 font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                            >
                              설정 저장하기
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Solapi SMS Alert Setting Modal */}
              <AnimatePresence>
                {isSolapiOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsSolapiOpen(false);
                        setSolapiError("");
                      }}
                      className="absolute inset-0 bg-slate-950"
                    />

                    {/* Modal Body */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 overflow-hidden text-slate-900"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 to-sky-600 bg-sky-500" />
                      
                      <button
                        onClick={() => {
                          setIsSolapiOpen(false);
                          setSolapiError("");
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                        aria-label="닫기"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="space-y-4 pt-2">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto sm:mx-0">
                          <Bell className="w-6 h-6 animate-swing" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-lg font-black tracking-tight text-slate-900 text-center sm:text-left">
                            솔라피(Solapi) SMS 알림 연동
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed text-center sm:text-left">
                            의뢰인이 간편 상담 예약에 일시 지정을 완료하거나 종합 진단을 제출하면, 설정하신 관리자 연락처로 실시간 상세 정보 알림이 문자/카톡 형태로 발송됩니다.
                          </p>
                        </div>

                        <form onSubmit={handleUpdateSolapi} className="space-y-4 pt-2 text-left">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              솔라피 API Key (API_KEY)
                            </label>
                            <input
                              type="text"
                              placeholder="예: NCSOQLMBYMAXFE8U"
                              value={solapiApiKey}
                              onChange={(e) => setSolapiApiKey(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-350"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              솔라피 Secret Key
                            </label>
                            <input
                              type="password"
                              placeholder="예: 7SQ1OC8T3OE7LXBHAS..."
                              value={solapiApiSecret}
                              onChange={(e) => setSolapiApiSecret(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-350"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                              알림 전송 수신처 번호
                            </label>
                            <input
                              type="text"
                              placeholder="예: 010-5410-5679"
                              value={solapiReceiverPhone}
                              onChange={(e) => setSolapiReceiverPhone(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-350"
                              required
                            />
                            <span className="block text-[10px] text-zinc-400 font-medium mt-1 leading-normal">
                              * 이 발송 수신 번호는 솔라피 계정에 발신번호(Sender ID)로 등록이 완료된 상태여야 정상 전송됩니다.
                            </span>
                          </div>

                          {solapiError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold text-left leading-relaxed">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{solapiError}</span>
                            </div>
                          )}

                          {solapiSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-bold text-left leading-relaxed">
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                              <span>{solapiSuccess}</span>
                            </div>
                          )}

                          <div className="pt-2 flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSolapiOpen(false);
                                setSolapiError("");
                              }}
                              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-3.5 bg-sky-550 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                            >
                              알림 설정 저장
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {/* Brand Logo & Lawyer Profile Photo Setting Modal */}
              <AnimatePresence>
                {isImagesOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      onClick={() => {
                        setIsImagesOpen(false);
                        setImagesError("");
                      }}
                      className="absolute inset-0 bg-slate-950"
                    />

                    {/* Modal Body */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 border border-slate-100 overflow-hidden text-slate-900"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-500 to-rose-600 bg-pink-500" />
                      
                      <button
                        onClick={() => {
                          setIsImagesOpen(false);
                          setImagesError("");
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                        aria-label="닫기"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="space-y-4 pt-2">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto sm:mx-0">
                          <User className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-lg font-black tracking-tight text-slate-900 text-center sm:text-left">
                            로고 및 프로필 사진 설정 변경
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold leading-relaxed text-center sm:text-left">
                            헤더 로고(모바일/PC 탑 브랜드바) 및 법무사 소개 페이지 대표 프로필 사진을 직접 실시간 업로드하여 최신 상태로 조율합니다.
                          </p>
                        </div>

                        <form onSubmit={handleUpdateImages} className="space-y-5 pt-2 text-left">
                          
                          {/* Part 1: Official Logo Upload */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              1. 공식 홈페이지 로고 (추천: PNG, 크기 120x120px)
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                {logoBase64 ? (
                                  <img src={logoBase64} alt="로고 미리보기" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-xs text-slate-400 font-bold">없음</span>
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileChange(e, "logo")}
                                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                                />
                                {logoBase64 && (
                                  <button
                                    type="button"
                                    onClick={() => setLogoBase64("")}
                                    className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                                  >
                                    기본 로고(아이콘)로 초기화
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Part 2: Lawyer Portrait Photo Upload */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              2. 법무사 대표 프로필 사진 (추천: 정장 프로필 이미지)
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-18 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                {profileBase64 ? (
                                  <img src={profileBase64} alt="프로필 미리보기" className="w-full h-full object-cover object-top" />
                                ) : (
                                  <span className="text-xs text-slate-400 font-bold">없음</span>
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileChange(e, "profile")}
                                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                                />
                                {profileBase64 && (
                                  <button
                                    type="button"
                                    onClick={() => setProfileBase64("")}
                                    className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                                  >
                                    기본 프로필 사진으로 초기화
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {imagesError && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold text-left leading-relaxed">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{imagesError}</span>
                            </div>
                          )}

                          {imagesSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-bold text-left leading-relaxed">
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                              <span>{imagesSuccess}</span>
                            </div>
                          )}

                          <div className="pt-2 flex gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setIsImagesOpen(false);
                                setImagesError("");
                              }}
                              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                            >
                              설정 및 사진 저장
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
