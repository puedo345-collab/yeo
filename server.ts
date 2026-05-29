import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Standard port is strictly 3000
const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), "submissions.json");
const ADMIN_CONFIG_PATH = path.join(process.cwd(), "admin_config.json");

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

// Ensure database file exists
function initDatabase() {
  if (!fs.existsSync(DB_FILE_PATH)) {
    const seedSubmissions: Submission[] = [
      {
        id: "sub_1",
        name: "김민재",
        phone: "010-8234-9004",
        occupation: "regular_employee",
        debtAmount: "50m_100m",
        monthlyIncome: "200_300",
        dependentsCount: "2",
        hasMoreDebtThanAssets: "yes",
        region: "seoul_metropolitan",
        difficulties: ["high_interest", "living_cost"],
        ageGroup: "30대",
        status: "상담중",
        counselorNotes: "3천만원 추가 이자 부담으로 가용 소득의 부족을 호소함. 2026 최저생계비 기준 적용하여 월 120만원 수준 조정 및 최근 대출 소명안 논의 중.",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "sub_2",
        name: "이지영",
        phone: "010-3345-7182",
        occupation: "business_owner",
        debtAmount: "over_100m",
        monthlyIncome: "300_400",
        dependentsCount: "3",
        hasMoreDebtThanAssets: "yes",
        region: "seoul_metropolitan",
        difficulties: ["debt_repayment", "guarantee"],
        ageGroup: "40대",
        status: "신청완료",
        counselorNotes: "",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "sub_3",
        name: "최성우",
        phone: "010-5561-1209",
        occupation: "freelancer_parttime",
        debtAmount: "30m_50m",
        monthlyIncome: "150_200",
        dependentsCount: "1",
        hasMoreDebtThanAssets: "yes",
        region: "other_regions",
        difficulties: ["living_cost"],
        ageGroup: "20대",
        status: "접수완료",
        counselorNotes: "단독 거주 최저생계비 소득 보충 소명서 첨부 예정. 성실 상환 의사 매우 높음.",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ];
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seedSubmissions, null, 2), "utf-8");
  }
}

initDatabase();

// Read from JSON DB
function readSubmissions(): Submission[] {
  try {
    const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return [];
  }
}

// Write to JSON DB
function writeSubmissions(data: Submission[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to database:", error);
  }
}

// In-Memory Secure Session Map to prevent Reverse Base64 password decoding
const secureSessions = new Map<string, { expiresAt: number }>();

// Helper function to hash password with a secure salt
function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

// Check input password against stored (salted hash or plaintext config)
function verifyPassword(input: string, stored: string): boolean {
  if (stored.startsWith("sha256:")) {
    const parts = stored.split(":");
    if (parts.length === 3) {
      const [, salt, hash] = parts;
      return hashPassword(input, salt) === hash;
    }
  }
  return input === stored;
}

// XSS input sanitization to strip unsafe HTML markup
function sanitizeInput(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

async function startServer() {
  const app = express();

  // Limit JSON payloads to 10MB to prevent Server Resource DoS Attacks
  app.use(express.json({ limit: "10mb" }));

  // Check admin password (supports dynamic file override or environment variable setup)
  const getAdminPassword = () => {
    try {
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        const configData = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
        if (configData && configData.adminPassword) {
          return String(configData.adminPassword);
        }
      }
    } catch (err) {
      console.error("[getAdminPassword] Error reading admin config:", err);
    }
    return process.env.ADMIN_PASSWORD || "1234";
  };

  // Helper middleware to verify token (using cryptographically secure session-lookup map)
  const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "권한이 없습니다. 로그인이 필요합니다." });
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Lazy session expiration lookup (sessions expire after 2 hours)
    const session = secureSessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      // Touch session to renew active lifespan
      session.expiresAt = Date.now() + 7200000;
      next();
    } else {
      if (session) {
        secureSessions.delete(token);
      }
      res.status(403).json({ error: "세션이 만료되었거나 권한이 맞지 않습니다." });
    }
  };

  // Helper function to send simple SMS alert via Solapi
  const sendSolapiSms = async (text: string): Promise<boolean> => {
    try {
      if (!fs.existsSync(ADMIN_CONFIG_PATH)) {
        console.log("[Solapi] Configuration file not found. Skipping send.");
        return false;
      }
      const configData = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      const apiKey = configData.solapiApiKey || "NCSILNXQCTP5G38I";
      const apiSecret = configData.solapiApiSecret || "WP9OAFRBQNU9XZRXWCU7OHGOBCTH8JKB";
      const receiverPhone = configData.solapiReceiverPhone || "01054105679";

      if (!apiKey || !apiSecret || !receiverPhone) {
        console.log("[Solapi] Credentials or recipient phone not configured. Skipping.", { apiKey, receiverPhone });
        return false;
      }

      const cleanPhone = receiverPhone.replace(/[^0-9]/g, "");
      if (!cleanPhone) {
        console.log("[Solapi] Recipient phone empty after sanitization.");
        return false;
      }

      // Solapi HMAC v4 authentication signatures
      const date = new Date().toISOString();
      const salt = crypto.randomBytes(16).toString("hex");
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(date + salt)
        .digest("hex");

      const authHeaderValue = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;

      // Payload for single transmission
      const payload = {
        message: {
          to: cleanPhone,
          from: cleanPhone, // Registered sender ID in Solapi setting (usually user's same number)
          text: text
        }
      };

      console.log(`[Solapi] Standard single dispatch triggered to ${cleanPhone}:`, text);

      // We'll perform standard POST request
      const response = await fetch("https://api.solapi.com/messages/v4/send", {
        method: "POST",
        headers: {
          "Authorization": authHeaderValue,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        console.warn(`[Solapi] Single dispatch failed (Status: ${response.status}). Trying send-many payload:`, errorDetail);

        // Fallback option: Use send-many endpoint if single /send is rejected
        const fallbackPayload = {
          messages: [
            {
              to: cleanPhone,
              from: cleanPhone,
              text: text
            }
          ]
        };

        const fallbackResponse = await fetch("https://api.solapi.com/messages/v4/send-many", {
          method: "POST",
          headers: {
            "Authorization": authHeaderValue,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(fallbackPayload)
        });

        if (!fallbackResponse.ok) {
          const fallbackErr = await fallbackResponse.text();
          console.error(`[Solapi] Fallback dispatch also failed (Status: ${fallbackResponse.status}):`, fallbackErr);
          return false;
        }

        const fbData = await fallbackResponse.json();
        console.log("[Solapi] Fallback SMS alert completed successfully:", fbData);
        return true;
      }

      const resData = await response.json();
      console.log("[Solapi] SMS alert completed successfully:", resData);
      return true;
    } catch (e) {
      console.error("[Solapi] Critical error occurred on dispatching SMS notification:", e);
      return false;
    }
  };

  // API: Get Solapi configuration
  app.get("/api/admin/solapi-config", verifyAdmin, (req, res) => {
    try {
      let configData: any = {};
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        configData = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      }
      res.json({
        solapiApiKey: configData.solapiApiKey || "NCSILNXQCTP5G38I",
        solapiApiSecret: configData.solapiApiSecret || "WP9OAFRBQNU9XZRXWCU7OHGOBCTH8JKB",
        solapiReceiverPhone: configData.solapiReceiverPhone || "01054105679"
      });
    } catch (err) {
      console.error("[getSolapiConfig] Error:", err);
      res.status(500).json({ error: "솔라피 설정을 불러오는 도중 오류가 발생했습니다." });
    }
  });

  // API: Update Solapi configuration
  app.post("/api/admin/solapi-config", verifyAdmin, (req, res) => {
    const { solapiApiKey, solapiApiSecret, solapiReceiverPhone } = req.body;
    if (!solapiApiKey || !solapiApiSecret || !solapiReceiverPhone) {
      res.status(400).json({ error: "모든 항목을 올바르게 기입해 주세요." });
      return;
    }

    try {
      let configObj: any = {};
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        configObj = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      }
      configObj.solapiApiKey = solapiApiKey.trim();
      configObj.solapiApiSecret = solapiApiSecret.trim();
      configObj.solapiReceiverPhone = solapiReceiverPhone.replace(/[^0-9]/g, "");

      fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(configObj, null, 2), "utf-8");
      res.json({ success: true, message: "솔라피 알림 설정이 안전하게 업데이트 되었습니다." });
    } catch (err) {
      console.error("[saveSolapiConfig] Error:", err);
      res.status(500).json({ error: "솔라피 설정을 저장하는 도중 서버 오류가 발생했습니다." });
    }
  });

  // API: Get App configuration info
  app.get("/api/config", (req, res) => {
    let kakaoChannelUrl = "http://pf.kakao.com/_xhTqgG/chat";
    try {
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        const configData = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
        if (configData && configData.kakaoChannelUrl) {
          kakaoChannelUrl = configData.kakaoChannelUrl;
        }
      }
    } catch (err) {
      console.error("[getConfig] Error reading config:", err);
    }
    res.json({
      hasAdminPasswordConfigured: true,
      kakaoChannelUrl,
    });
  });

  // API: Update Kakao Channel URL (Protected)
  app.post("/api/admin/kakao-url", verifyAdmin, (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      res.status(400).json({ error: "올바른 http/https 형식의 카카오 채널 URL을 입력해 주세요." });
      return;
    }

    try {
      let configObj: any = {};
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        configObj = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      }
      configObj.kakaoChannelUrl = url.trim();
      fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(configObj, null, 2), "utf-8");
      res.json({ success: true, message: "카카오톡 채널 연동 주소가 안전하게 변경되었습니다." });
    } catch (err) {
      console.error("[changeKakaoUrl] Error:", err);
      res.status(500).json({ error: "설정 저장 도중 서버 에러가 발생했습니다." });
    }
  });

  // API: Get lawyer profile image
  app.get("/api/profile-image", (req, res) => {
    try {
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        const configData = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
        if (configData && configData.profileImage) {
          res.json({ image: configData.profileImage });
          return;
        }
      }
    } catch (err) {
      console.error("[getProfileImage] Error reading profile image:", err);
    }
    // Return empty or default
    res.json({ image: null });
  });

  // API: Update lawyer profile image (Protected with verifyAdmin)
  app.post("/api/profile-image", verifyAdmin, (req, res) => {
    const { image } = req.body;
    if (image !== "" && (!image || typeof image !== "string")) {
      res.status(400).json({ error: "유효하지 않은 이미지 데이터입니다." });
      return;
    }

    try {
      let configObj: any = {};
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        configObj = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      }
      if (image === "") {
        delete configObj.profileImage;
      } else {
        configObj.profileImage = image;
      }
      fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(configObj, null, 2), "utf-8");
      res.json({ success: true, message: "프로필 이미지 설정이 완료되었습니다." });
    } catch (err) {
      console.error("[updateProfileImage] Error storing profile image:", err);
      res.status(500).json({ error: "프로필 이미지 저장 도중 오류가 발생했습니다." });
    }
  });

  // API: Get custom logo image
  app.get("/api/logo-image", (req, res) => {
    try {
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        const configData = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
        if (configData && configData.logoImage) {
          res.json({ image: configData.logoImage });
          return;
        }
      }
    } catch (err) {
      console.error("[getLogoImage] Error reading logo image:", err);
    }
    res.json({ image: null });
  });

  // API: Update custom logo image (Protected with verifyAdmin)
  app.post("/api/logo-image", verifyAdmin, (req, res) => {
    const { image } = req.body;
    if (image !== "" && (!image || typeof image !== "string")) {
      res.status(400).json({ error: "유효하지 않은 로고 이미지 데이터입니다." });
      return;
    }

    try {
      let configObj: any = {};
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        configObj = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      }
      if (image === "") {
        delete configObj.logoImage;
      } else {
        configObj.logoImage = image;
      }
      fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(configObj, null, 2), "utf-8");
      res.json({ success: true, message: "로고 이미지 설정이 완료되었습니다." });
    } catch (err) {
      console.error("[updateLogoImage] Error storing logo image:", err);
      res.status(500).json({ error: "로고 이미지 저장 도중 오류가 발생했습니다." });
    }
  });

  // API: Auth / Verification (Uses secure SHA-256 validation and returns random secure bearer token)
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;
    if (password && verifyPassword(String(password), getAdminPassword())) {
      // Generate a brand new cryptographically secure random session token
      const secureToken = crypto.randomBytes(32).toString("hex");
      secureSessions.set(secureToken, { expiresAt: Date.now() + 7200000 }); // 2 hours expiration
      res.json({ success: true, token: secureToken });
    } else {
      res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
    }
  });

  // API: Change admin password (Protected - implements secure salted hashing)
  app.post("/api/admin/change-password", verifyAdmin, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 4) {
      res.status(400).json({ error: "새 비밀번호는 최소 4자 이상이어야 합니다." });
      return;
    }

    try {
      let configObj: any = {};
      if (fs.existsSync(ADMIN_CONFIG_PATH)) {
        configObj = JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, "utf-8"));
      }
      const salt = crypto.randomBytes(16).toString("hex");
      const hash = hashPassword(newPassword.trim(), salt);
      configObj.adminPassword = `sha256:${salt}:${hash}`;
      fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(configObj, null, 2), "utf-8");
      
      // Invalidate current sessions to force relogin
      secureSessions.clear();
      
      res.json({ success: true, message: "비밀번호가 안전하게 변경되었습니다. 다시 로그인 하십시오." });
    } catch (err) {
      console.error("[ChangePassword] Error storing new password configuration:", err);
      res.status(500).json({ error: "서버 설정 보관 도중 오류가 발생했습니다." });
    }
  });

  // API: Insert new Submission
  app.post("/api/submissions", (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.phone) {
        res.status(400).json({ error: "이름과 연락처는 필수 입력항목입니다." });
        return;
      }

      const isSimple = !!body.isSimpleConsultation;

      if (!isSimple) {
        // 실시간 자격진단 완료 시 관리자페이지 저장 및 SMS 전송 기능 제거 (사용자 요청)
        res.status(200).json({ success: true, message: "실시간 자격진단 결과 전송 및 SMS 알림이 비활성화되었습니다." });
        return;
      }

      const list = readSubmissions();
      const newId = "sub_" + Math.random().toString(36).substr(2, 9);

      const newSubmission: Submission = {
        id: newId,
        name: sanitizeInput(body.name),
        phone: sanitizeInput(body.phone),
        occupation: isSimple ? "" : sanitizeInput(body.occupation || "regular_employee"),
        debtAmount: isSimple ? "" : sanitizeInput(body.debtAmount || "30m_50m"),
        monthlyIncome: isSimple ? undefined : sanitizeInput(body.monthlyIncome),
        dependentsCount: isSimple ? undefined : sanitizeInput(body.dependentsCount),
        hasMoreDebtThanAssets: isSimple ? "" : sanitizeInput(body.hasMoreDebtThanAssets || "yes"),
        region: isSimple ? "" : sanitizeInput(body.region || "seoul_metropolitan"),
        difficulties: Array.isArray(body.difficulties) ? body.difficulties.map((x: any) => sanitizeInput(String(x))) : [],
        ageGroup: isSimple ? "" : sanitizeInput(body.ageGroup || "30대"),
        status: "신청완료",
        counselorNotes: sanitizeInput(body.counselorNotes || ""),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSimpleConsultation: isSimple
      };

      list.unshift(newSubmission); // prepend so newest is first
      writeSubmissions(list);

      // Send instant SMS notification to administrator securely via Solapi (non-blocking)
      let smsText = "";
      if (isSimple) {
        const typeLabel = (body.difficulties && body.difficulties[0]) ? body.difficulties[0] : "실시간간편예약";
        const notes = body.counselorNotes || "";
        const cleanedNotes = notes.replace("[실시간 간편 예약]\n", "").replace("[실시간 간편 예약]", "").trim();
        smsText = `[실시간상담 간편예약 접수]\n상담 구분: ${typeLabel}\n의뢰인 연락처: ${body.phone}\n상세 내용:\n${cleanedNotes}`;
      } else {
        smsText = `[종합 실시간 자가진단 접수]\n의뢰인 성함: ${body.name}\n의뢰인 연락처: ${body.phone}\n상태: 신청완료 수령`;
      }

      sendSolapiSms(smsText).catch(err => {
        console.error("[Solapi] Failed to send background SMS alert:", err);
      });

      res.status(201).json({ success: true, submissionId: newId });
    } catch (routeErr: any) {
      console.error("[CRITICAL] Error in POST /api/submissions handler:", routeErr);
      res.status(500).json({ error: "상담 접수를 처리하는 도중 서버 내부 오류가 발생했습니다: " + (routeErr.message || routeErr) });
    }
  });

  // API: Get List of Submissions (Protected)
  app.get("/api/submissions", verifyAdmin, (req, res) => {
    const list = readSubmissions();
    res.json(list);
  });

  // API: Update Submission Notes/Status (Protected)
  app.patch("/api/submissions/:id", verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status, counselorNotes } = req.body;

    const list = readSubmissions();
    const index = list.findIndex(sub => sub.id === id);

    if (index === -1) {
      res.status(404).json({ error: "해당 제출물 정보를 찾을 수 없습니다." });
      return;
    }

    const updated = {
      ...list[index],
      ...(status !== undefined && { status: sanitizeInput(status) as any }),
      ...(counselorNotes !== undefined && { counselorNotes: sanitizeInput(counselorNotes) }),
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    writeSubmissions(list);

    res.json({ success: true, data: updated });
  });

  // API: Delete Submission (Protected)
  app.delete("/api/submissions/:id", verifyAdmin, (req, res) => {
    const { id } = req.params;
    const list = readSubmissions();
    const filtered = list.filter(sub => sub.id !== id);

    if (list.length === filtered.length) {
      res.status(404).json({ error: "해당 제출물 정보를 찾을 수 없습니다." });
      return;
    }

    writeSubmissions(filtered);
    res.json({ success: true, message: "접수 내역이 안전하게 영구 삭제되었습니다." });
  });

  // API: Bulk Delete Submissions (Protected)
  app.post("/api/submissions/bulk-delete", verifyAdmin, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "삭제할 대상 아이디 목록이 올바르지 않습니다." });
      return;
    }

    const list = readSubmissions();
    const filtered = list.filter(sub => !ids.includes(sub.id));

    writeSubmissions(filtered);
    res.json({ success: true, message: "선택한 의뢰인 정보들이 성공적으로 영구 일괄 삭제되었습니다." });
  });

  // Use Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Real-time Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
