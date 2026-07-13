"use client";
import { useState, useEffect } from "react";
import { Lock, LogOut, CheckCircle, XCircle, DollarSign, Loader2, RefreshCw, AlertCircle, BookOpen, ClipboardList, Trash2, Eye, EyeOff, GraduationCap } from "lucide-react";
import { libraryApi, activityApi, roomApi, BorrowLog, Activity, RoomRegistryEntry } from "@/lib/gas";

const ADMIN_PASSWORD = "admin1234";
const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";
type Tab = "borrow" | "activity" | "registry";

const ALL_ROOMS: Record<string, string> = {
  "room-1": "ห้องเรียน ๑", "room-2": "ห้องเรียน ๒", "room-3": "ห้องเรียน ๓",
  "room-4": "ห้องเรียน ๔", "room-5": "ห้องเรียน ๕", "room-6": "ห้องเรียน ๖",
  "room-7": "ห้องเรียน ๗", "room-8": "ห้องเรียน ๘", "room-9": "ห้องเรียน ๙",
  "room-10": "ห้องเรียน ๑๐ (หน่วยบริการสทิงพระ)",
  "room-11": "ห้องเรียน ๑๑ (หน่วยบริการสิงหนคร)",
  "room-12": "ห้องเรียน ๑๒ (หน่วยบริการหาดใหญ่)",
  "room-13": "ห้องเรียน ๑๓ (หน่วยบริการเทพา)",
  "room-14": "ห้องเรียน ๑๔ (หน่วยบริการสะบ้าย้อย)",
  "room-15": "ห้องเรียน ๑๕ (หน่วยบริการระโนด)",
  "room-pt": "ห้องกายภาพบำบัด",
  "room-thai": "ห้องแพทย์แผนไทย",
  "room-sport": "ห้องกิจกรรมการฟื้นฟูสมรรถภาพ การกีฬา",
  "room-art": "ห้องศิลปะบำบัด",
  "room-speech": "ห้องอรรถบำบัด",
  "room-career": "ห้องฝึกทักษะพื้นฐานอาชีพ",
  "room-music": "ห้องดนตรี",
  "room-ot": "ห้องกิจกรรมบำบัด",
  "room-autism1": "ห้องเรียนคู่ขนานบุคคลออทิสติกโรงเรียนเทศบาล 2(บ้านหาดใหญ่)",
  "room-autism2": "ห้องเรียนคู่ขนานบุคคลออทิสติกโรงเรียนวัดเจริญภูผา",
  "room-autism3": "ห้องเรียนคู่ขนานบุคคลออทิสติกโรงเรียนบ้านทำเนียบ",
  "room-ict": "ศูนย์เทคโนโลยีสารสนเทศเด็กเจ็บป่วยในโรงพยาบาลหาดใหญ่",
  "room-16": "ห้องเรียน ๑๖ (หน่วยบริการเมืองสงขลา)",
  "room-17": "ห้องเรียน ๑๗ (หน่วยบริการคลองหอยโข่ง)",
  "room-18": "ห้องเรียน ๑๘ (หน่วยบริการสะเดา)",
  "room-19": "ห้องเรียน ๑๙ (หน่วยบริการนาหม่อม)",
  "room-20": "ห้องเรียน ๒๐ (หน่วยบริการนาทวี)",
  "room-21": "ห้องเรียน ๒๑ (หน่วยบริการควนเนียง)",
  "room-22": "ห้องเรียน ๒๒ (หน่วยบริการบางกล่ำ)",
  "room-23": "ห้องเรียน ๒๓ (หน่วยบริการรัตภูมิ)",
  "room-24": "ห้องเรียน ๒๔ (หน่วยบริการกระแสสินธุ์)",
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("borrow");

  const [logs, setLogs] = useState<BorrowLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [fineInputs, setFineInputs] = useState<Record<string, string>>({});
  const [returnDateInputs, setReturnDateInputs] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [borrowSuccess, setBorrowSuccess] = useState("");

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingAct, setLoadingAct] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [actSuccess, setActSuccess] = useState("");

  const [registryEntries, setRegistryEntries] = useState<RoomRegistryEntry[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [registrySuccess, setRegistrySuccess] = useState("");
  const [registryError, setRegistryError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("รหัสผ่านไม่ถูกต้อง");
    }
  }

  async function loadLogs() {
    setLoadingLogs(true);
    const res = await libraryApi.getBorrowLog();
    if (res.success && res.data) setLogs(res.data.reverse());
    setLoadingLogs(false);
  }

  async function loadActivities() {
    setLoadingAct(true);
    const res = await activityApi.getActivities();
    if (res.success && res.data) setActivities(res.data.reverse());
    setLoadingAct(false);
  }

  async function loadRegistry() {
    setLoadingRegistry(true);
    const res = await roomApi.getRoomRegistry();
    if (res.success && res.data) {
      setRegistryEntries(res.data.reverse());
      setRegistryError("");
    } else {
      setRegistryError(res.error || "โหลดข้อมูลทะเบียนแหล่งเรียนรู้ไม่สำเร็จ");
    }
    setLoadingRegistry(false);
  }

  useEffect(() => {
    if (isLoggedIn) { loadLogs(); loadActivities(); loadRegistry(); }
  }, [isLoggedIn]);

async function handleApprove(log: BorrowLog) {
  setProcessing(log.ID);
  const fine = parseFloat(fineInputs[log.ID] || "0") || 0;
  const actualReturnDate = returnDateInputs[log.ID] || new Date().toISOString().split("T")[0];

  const res = await fetch("/api/gas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "returnBook",
      borrowId: log.ID,
      returnStatus: "normal",
      manualFine: fine,
      actualReturnDate,
    }),
  });
const data = await res.json();
console.log("returnBook response:", data);
setProcessing(null);
if (data.success) {
    setBorrowSuccess(`อนุมัติการคืนหนังสือ ${log.รหัสหนังสือ} แล้ว`);
    setTimeout(() => setBorrowSuccess(""), 3000);
    loadLogs();
  }
}

  async function handleReject(log: BorrowLog) {
    setProcessing(log.ID);
    await libraryApi.returnBook({ borrowId: log.ID, returnStatus: "rejected" });
    setProcessing(null);
    setBorrowSuccess(`ปฏิเสธคำขอ ${log.รหัสหนังสือ} แล้ว`);
    setTimeout(() => setBorrowSuccess(""), 3000);
    loadLogs();
  }

  async function handleApproveBorrow(log: BorrowLog) {
    setProcessing(log.ID);
    const res = await fetch("/api/gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approveBorrow", borrowId: log.ID }),
    });
    const data = await res.json();
    setProcessing(null);
    if (data.success) {
      setBorrowSuccess(`อนุมัติการยืมหนังสือ ${log.รหัสหนังสือ} แล้ว`);
      setTimeout(() => setBorrowSuccess(""), 3000);
      loadLogs();
    } else {
      setBorrowSuccess(`เกิดข้อผิดพลาด: ${data.error}`);
    }
  }

  async function handleActivityDelete(act: Activity) {
    if (!confirm(`ต้องการลบบันทึกกิจกรรมของ ${act.ผู้บันทึก} ใช่หรือไม่?`)) return;
    setProcessing(act.ID);
    await activityApi.deleteActivity(act.ID);
    setProcessing(null);
    setActSuccess("ลบบันทึกกิจกรรมแล้ว");
    setTimeout(() => setActSuccess(""), 3000);
    loadActivities();
    setSelectedActivity(null);
  }

  async function handleRegistryApprove(entry: RoomRegistryEntry) {
    setProcessing(entry.ID);
    const res = await roomApi.approveRoomRegistryEntry(entry.ID);
    setProcessing(null);
    if (res.success) {
      setRegistrySuccess(`อนุมัติแหล่งเรียนรู้ "${entry.ชื่อ || entry.ประเภท || entry.ID}" แล้ว`);
      setTimeout(() => setRegistrySuccess(""), 3000);
    } else {
      setRegistryError(res.error || "อนุมัติไม่สำเร็จ");
    }
    loadRegistry();
  }

  async function handleRegistryDelete(entry: RoomRegistryEntry) {
    if (!confirm(`ต้องการลบ "${entry.ชื่อ || entry.ประเภท || "รายการนี้"}" ใช่หรือไม่?`)) return;
    setProcessing(entry.ID);
    const res = await roomApi.deleteRoomRegistryEntry(entry.ID);
    setProcessing(null);
    if (res.success) {
      setRegistrySuccess("ลบรายการแหล่งเรียนรู้แล้ว");
      setTimeout(() => setRegistrySuccess(""), 3000);
    } else {
      setRegistryError(res.error || "ลบไม่สำเร็จ");
    }
    loadRegistry();
  }

  function handleDownloadPDF(act: Activity) {
    const content = `
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #1a202c; }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { width: 80px; height: 80px; object-fit: contain; }
          .header h1 { font-size: 16px; font-weight: 700; margin: 6px 0 2px; }
          .header h2 { font-size: 14px; font-weight: 600; margin: 0 0 2px; color: #444; }
          .header p { font-size: 12px; color: #666; margin: 0; }
          .divider { border-top: 3px solid #1e3a5f; border-bottom: 1px solid #1e3a5f; margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          td { border: 1px solid #000; padding: 7px 10px; vertical-align: top; }
          .label { background: #f0f4f8; font-weight: 600; width: 28%; }
          .sig-box { text-align: center; height: 80px; vertical-align: middle; }
          img.activity-img { max-width: 100%; max-height: 180px; object-fit: cover; border-radius: 6px; }
          img.sig-img { height: 55px; object-fit: contain; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" alt="logo" />
          <h1>บันทึกกิจกรรมการเข้าใช้แหล่งเรียนรู้</h1>
          <h2>ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</h2>
          <p>สำนักบริหารงานการศึกษาพิเศษ สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน กระทรวงศึกษาธิการ</p>
        </div>
        <div class="divider"></div>
        <table>
          <tr>
            <td class="label">วันที่บันทึก</td>
            <td>${act.วันที่ ? new Date(act.วันที่).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}</td>
            <td class="label">ห้องเรียน</td>
            <td>${act.ห้องเรียน || "-"}</td>
          </tr>
          <tr>
            <td class="label">รายชื่อนักเรียน</td>
            <td colspan="3">${(act.รายชื่อนักเรียน || "-").replace(/\n/g, "<br>")}</td>
          </tr>
          <tr>
            <td class="label">ครู/ผู้ดูแล</td>
            <td colspan="3">${(act.รายชื่อครู || "-").replace(/\n/g, "<br>")}</td>
          </tr>
          <tr>
            <td class="label">แหล่งเรียนรู้</td>
            <td colspan="3">${act.แหล่งเรียนรู้ || "-"}</td>
          </tr>
          <tr>
            <td class="label">ลักษณะกิจกรรม</td>
            <td colspan="3">${(act.ลักษณะกิจกรรม || "-").replace(/\n/g, "<br>")}</td>
          </tr>
          <tr>
            <td class="label">สาระที่ได้รับ</td>
            <td colspan="3">${(act.สาระที่ได้รับ || "-").replace(/\n/g, "<br>")}</td>
          </tr>
          ${act.ImageURL ? `
          <tr>
            <td class="label">ภาพกิจกรรม</td>
            <td colspan="3"><img class="activity-img" src="${act.ImageURL}" alt="กิจกรรม" /></td>
          </tr>` : ""}
          <tr>
            <td class="label">ผู้บันทึก</td>
            <td>${act.ผู้บันทึก || "-"}<br/><small>${act.ตำแหน่ง || ""}</small></td>
            <td class="label" style="text-align:center;">ลายมือชื่อผู้บันทึก</td>
            <td class="sig-box">
              ${act.Signature ? `<img class="sig-img" src="${act.Signature}" alt="ลายเซ็น" /><br>` : "<br><br>"}
              <small>(${act.ผู้บันทึก || ""})</small><br>
              <small>${act.ตำแหน่ง || ""}</small>
            </td>
          </tr>
        </table>
        <div class="footer">พิมพ์วันที่ ${new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</div>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) { setTimeout(() => { w.print(); }, 800); }
  }

  const pending = logs.filter((l) => l.สถานะ === "รอคืน");
  const pendingBorrow = logs.filter((l) => l.สถานะ === "รอยืม");
  const active = logs.filter((l) => l.สถานะ === "ยืมอยู่");
  const done = logs.filter((l) => !["ยืมอยู่", "รอคืน", "รอยืม"].includes(l.สถานะ));

  const pendingRegistry = registryEntries.filter((e) => e.สถานะ !== "อนุมัติแล้ว");
  const approvedRegistry = registryEntries.filter((e) => e.สถานะ === "อนุมัติแล้ว");

  const statusColor = (status: string) => {
    if (status === "ยืมอยู่") return { bg: "#dbeafe", text: "#1d4ed8" };
    if (status === "รอคืน") return { bg: "#fef3c7", text: "#92400e" };
    if (status === "รอยืม") return { bg: "#f3e8ff", text: "#7c3aed" };
    if (status === "คืนแล้ว") return { bg: "#dcfce7", text: "#15803d" };
    return { bg: "#fee2e2", text: "#b91c1c" };
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}>
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#e8f0fb" }}>
              <Lock size={32} style={{ color: "#1e3a5f" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>Admin Panel</h1>
            <p className="text-slate-400 text-sm mt-1">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
          </div>
          {loginError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              <span className="text-red-700 text-sm">{loginError}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-base outline-none focus:border-blue-400"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-lg"
              style={{ background: "#1e3a5f" }}>
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>Admin Panel</h1>
          <p className="text-slate-400 text-sm">จัดการระบบห้องสมุดและแหล่งเรียนรู้</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { loadLogs(); loadActivities(); loadRegistry(); }}
            className="p-2 rounded-xl bg-white shadow text-slate-500 hover:bg-slate-50">
            <RefreshCw size={18} className={(loadingLogs || loadingAct || loadingRegistry) ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow text-slate-600 text-sm font-medium">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "รอยืม", count: pendingBorrow.length, color: "#7c3aed" },
          { label: "รอคืน", count: pending.length, color: "#f59e0b" },
          { label: "ยืมอยู่", count: active.length, color: "#3b82f6" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl p-1 mb-6" style={{ background: "#e8f0fb" }}>
        {[
          { id: "borrow" as Tab, label: "การยืม-คืนหนังสือ", icon: <BookOpen size={18} /> },
          { id: "activity" as Tab, label: "บันทึกกิจกรรม", icon: <ClipboardList size={18} /> },
          { id: "registry" as Tab, label: "ทะเบียนแหล่งเรียนรู้", icon: <GraduationCap size={18} /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all"
            style={activeTab === tab.id ? { background: "#1e3a5f", color: "white" } : { color: "#1e3a5f", opacity: 0.7 }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: BORROW ===== */}
      {activeTab === "borrow" && (
        <div className="space-y-6">
          {borrowSuccess && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">{borrowSuccess}</span>
            </div>
          )}

          {/* รอยืม */}
          {pendingBorrow.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: "#7c3aed" }}>
                <AlertCircle size={18} /> รอการอนุมัติยืม ({pendingBorrow.length})
              </h2>
              <div className="space-y-3">
                {pendingBorrow.map((log) => (
                  <div key={log.ID} className="bg-white rounded-2xl shadow p-5 border-2 border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-800">{log.ชื่อผู้ยืม}</p>
                        <p className="text-sm text-slate-500">รหัสหนังสือ: <strong>{log.รหัสหนังสือ}</strong></p>
                        <p className="text-xs text-slate-400 mt-1">
                          วันยืม: {new Date(log.วันยืม).toLocaleDateString("th-TH")} |{" "}
                          กำหนดคืน: {new Date(log.กำหนดคืน).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: "#f3e8ff", color: "#7c3aed" }}>รอยืม</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveBorrow(log)} disabled={processing === log.ID}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                        style={{ background: "#065f46" }}>
                        {processing === log.ID ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        อนุมัติการยืม
                      </button>
                      <button onClick={() => handleReject(log)} disabled={processing === log.ID}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                        style={{ background: "#dc2626" }}>
                        <XCircle size={16} /> ปฏิเสธ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* รอคืน */}
          {pending.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: "#92400e" }}>
                <AlertCircle size={18} /> รอการอนุมัติคืน ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((log) => {
                  const overdue = new Date(log.กำหนดคืน) < new Date();
                  const days = overdue ? Math.ceil((new Date().getTime() - new Date(log.กำหนดคืน).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div key={log.ID} className="bg-white rounded-2xl shadow p-5 border-2 border-amber-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-800">{log.ชื่อผู้ยืม}</p>
                          <p className="text-sm text-slate-500">รหัสหนังสือ: <strong>{log.รหัสหนังสือ}</strong></p>
                          <p className="text-xs text-slate-400 mt-1">
                            ยืม: {new Date(log.วันยืม).toLocaleDateString("th-TH")} |{" "}
                            กำหนดคืน: {new Date(log.กำหนดคืน).toLocaleDateString("th-TH")}
                          </p>
                          {overdue && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              ⚠ เกินกำหนด {days} วัน (ค่าปรับอัตโนมัติ: {days * 5} บาท)
                            </p>
                          )}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: "#fef3c7", color: "#92400e" }}>รอคืน</span>
                      </div>
                      <div className="mb-3">
  <label className="block text-xs font-medium text-slate-500 mb-1">
    วันที่คืนจริง <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    max={new Date().toISOString().split("T")[0]}
    value={returnDateInputs[log.ID] || new Date().toISOString().split("T")[0]}
    onChange={(e) => setReturnDateInputs({ ...returnDateInputs, [log.ID]: e.target.value })}
    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
  />
  <p className="text-xs text-slate-400 mt-1">ระบุวันที่ครูนำหนังสือมาคืนจริง</p>
</div>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">กำหนดค่าปรับ (บาท)</label>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="number" min="0"
                            placeholder={overdue ? `ค่าปรับอัตโนมัติ ${days * 5} บาท` : "0"}
                            value={fineInputs[log.ID] || ""}
                            onChange={(e) => setFineInputs({ ...fineInputs, [log.ID]: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(log)} disabled={processing === log.ID}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                          style={{ background: "#065f46" }}>
                          {processing === log.ID ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          อนุมัติการคืน
                        </button>
                        <button onClick={() => handleReject(log)} disabled={processing === log.ID}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                          style={{ background: "#dc2626" }}>
                          <XCircle size={16} /> ปฏิเสธ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ยืมอยู่ */}
          <div>
            <h2 className="font-semibold text-lg mb-3" style={{ color: "#1e3a5f" }}>
              หนังสือที่ยืมอยู่ ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6 bg-white rounded-2xl shadow">ไม่มีรายการ</p>
            ) : (
              <div className="space-y-2">
                {active.map((log) => {
                  const overdue = new Date(log.กำหนดคืน) < new Date();
                  const c = statusColor(log.สถานะ);
                  return (
                    <div key={log.ID} className={`bg-white rounded-2xl shadow p-4 border ${overdue ? "border-red-200" : "border-transparent"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{log.ชื่อผู้ยืม}</p>
                          <p className="text-sm text-slate-500">รหัส: {log.รหัสหนังสือ}</p>
                          <p className="text-xs text-slate-400">
                            กำหนดคืน: {new Date(log.กำหนดคืน).toLocaleDateString("th-TH")}
                            {overdue && <span className="text-red-500 ml-2">⚠ เกินกำหนด!</span>}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: c.bg, color: c.text }}>{log.สถานะ}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ประวัติ */}
          <div>
            <h2 className="font-semibold text-lg mb-3" style={{ color: "#1e3a5f" }}>
              ประวัติการยืม-คืน ({done.length})
            </h2>
            {done.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6 bg-white rounded-2xl shadow">ยังไม่มีประวัติ</p>
            ) : (
              <div className="space-y-2">
{done.map((log) => {
  const c = statusColor(log.สถานะ);
  const hasFine = log.ค่าปรับ > 0;
  return (
    <div key={log.ID} className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-slate-800">{log.ชื่อผู้ยืม}</p>
          <p className="text-xs text-slate-400">รหัส: {log.รหัสหนังสือ}</p>
          {log.วันคืนจริง && (
            <p className="text-xs text-slate-400">
              คืนวันที่: {new Date(log.วันคืนจริง).toLocaleDateString("th-TH")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: c.bg, color: c.text }}>{log.สถานะ}</span>
          {hasFine && (
            <>
              <span className="text-xs font-bold text-red-600">
                ค่าปรับ: {log.ค่าปรับ} บาท
              </span>
              {log.สถานะชำระ === "ชำระแล้ว" ? (
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: "#dcfce7", color: "#15803d" }}>
                  ✓ ชำระแล้ว
                </span>
              ) : (
                <button
                  onClick={async () => {
                    await fetch("/api/gas", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "updatePaymentStatus",
                        borrowId: log.ID,
                        paymentStatus: "ชำระแล้ว",
                      }),
                    });
                    loadLogs();
                  }}
                  className="text-xs px-2 py-1 rounded-full font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 transition-all"
                >
                  ยังไม่ชำระ → กดยืนยัน
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
})}
              </div>
            )}
          </div>
        </div>
      )}
 
 

      {/* ===== TAB: ACTIVITY ===== */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          {actSuccess && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">{actSuccess}</span>
            </div>
          )}

          {/* Modal ดูรายละเอียด */}
          {selectedActivity && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
              onClick={() => setSelectedActivity(null)}>
              <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg" style={{ color: "#065f46" }}>รายละเอียดกิจกรรม</h3>
                    <button onClick={() => setSelectedActivity(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                      <XCircle size={20} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "วันที่", value: selectedActivity.วันที่ ? new Date(selectedActivity.วันที่).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-" },
                      { label: "ห้องเรียน", value: selectedActivity.ห้องเรียน },
                      { label: "แหล่งเรียนรู้", value: selectedActivity.แหล่งเรียนรู้ },
                      { label: "รายชื่อนักเรียน", value: selectedActivity.รายชื่อนักเรียน },
                      { label: "ครู/ผู้ดูแล", value: selectedActivity.รายชื่อครู },
                      { label: "ลักษณะกิจกรรม", value: selectedActivity.ลักษณะกิจกรรม },
                      { label: "สาระที่ได้รับ", value: selectedActivity.สาระที่ได้รับ },
                      { label: "ผู้บันทึก", value: `${selectedActivity.ผู้บันทึก} (${selectedActivity.ตำแหน่ง})` },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-3">
                        <span className="font-semibold text-slate-600 w-32 shrink-0">{item.label}</span>
                        <span className="text-slate-800">{item.value || "-"}</span>
                      </div>
                    ))}
                    {selectedActivity.ImageURL && (
                      <div>
                        <p className="font-semibold text-slate-600 mb-1">ภาพกิจกรรม</p>
                        <img src={selectedActivity.ImageURL} alt="activity" className="rounded-xl w-full object-cover max-h-48" />
                      </div>
                    )}
                    {selectedActivity.Signature && (
                      <div>
                        <p className="font-semibold text-slate-600 mb-1">ลายมือชื่อ</p>
                        <img src={selectedActivity.Signature} alt="signature" className="h-16 object-contain border rounded-lg p-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => handleDownloadPDF(selectedActivity)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium"
                      style={{ background: "#1e3a5f" }}>
                      ดาวน์โหลด PDF
                    </button>
                    <button onClick={() => handleActivityDelete(selectedActivity)}
                      disabled={processing === selectedActivity.ID}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium"
                      style={{ background: "#dc2626" }}>
                      <Trash2 size={16} /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* คลังบันทึกกิจกรรม */}
          <h2 className="font-semibold text-lg" style={{ color: "#1e3a5f" }}>
            คลังบันทึกกิจกรรมทั้งหมด ({activities.length})
          </h2>
          {loadingAct ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6 bg-white rounded-2xl shadow">ยังไม่มีบันทึกกิจกรรม</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.ID} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{act.ผู้บันทึก}
                        <span className="text-xs text-slate-400 ml-2">({act.ตำแหน่ง})</span>
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        ห้อง {act.ห้องเรียน} • {act.แหล่งเรียนรู้} •{" "}
                        {act.วันที่ ? new Date(act.วันที่).toLocaleDateString("th-TH") : ""}
                      </p>
                      {act.ลักษณะกิจกรรม && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{act.ลักษณะกิจกรรม}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-3 shrink-0">
                      <button onClick={() => setSelectedActivity(act)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500" title="ดูรายละเอียด">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDownloadPDF(act)}
                        className="p-2 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-500" title="ดาวน์โหลด PDF">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button onClick={() => handleActivityDelete(act)}
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500" title="ลบ">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {act.ImageURL && (
                    <img src={act.ImageURL} alt="activity" className="w-full h-28 object-cover rounded-xl mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: REGISTRY ===== */}
      {activeTab === "registry" && (
        <div className="space-y-6">
          {registrySuccess && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-green-800 font-medium">{registrySuccess}</span>
            </div>
          )}

          {registryError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-red-800 font-medium block">{registryError}</span>
                <span className="text-red-600 text-xs">
                  ถ้าเพิ่งเพิ่มฟีเจอร์นี้ ให้ตรวจสอบว่า deploy โค้ด Apps Script (gas/code.gs) เวอร์ชันล่าสุดแล้ว และมีชีตชื่อ &quot;Room_Registry&quot; พร้อมหัวตาราง ID, RoomID, ประเภท, รายละเอียด, อุปกรณ์/สื่อ, ผู้รับผิดชอบ, วันที่จัดตั้ง, รูปภาพURL, สถานะ
                </span>
              </div>
            </div>
          )}

          {loadingRegistry ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* รออนุมัติ */}
              {pendingRegistry.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3 flex items-center gap-2" style={{ color: "#7c3aed" }}>
                    <AlertCircle size={18} /> รอการอนุมัติแหล่งเรียนรู้ ({pendingRegistry.length})
                  </h2>
                  <div className="space-y-3">
                    {pendingRegistry.map((entry) => {
                      const photos = entry.รูปภาพURL ? entry.รูปภาพURL.split(",").filter(Boolean) : [];
                      return (
                        <div key={entry.ID} className="bg-white rounded-2xl shadow p-5 border-2 border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {entry.ชื่อ || "ไม่ระบุชื่อ"}
                              </p>
                              <p className="text-xs text-slate-400">{ALL_ROOMS[entry.RoomID] || entry.RoomID}</p>
                              <p className="text-sm text-slate-500">{entry.ประเภท || "ไม่ระบุประเภท"}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{ background: "#f3e8ff", color: "#7c3aed" }}>รออนุมัติ</span>
                          </div>
                          {photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              {photos.map((p, i) => (
                                <img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover w-full" />
                              ))}
                            </div>
                          )}
                          {entry.รายละเอียด && <p className="text-sm text-slate-700 mb-1">{entry.รายละเอียด}</p>}
                          {entry.ผู้รับผิดชอบ && (
                            <p className="text-xs text-slate-400 mb-3">
                              ผู้รับผิดชอบ: {entry.ผู้รับผิดชอบ.split("\n").filter(Boolean).join(", ")}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => handleRegistryApprove(entry)} disabled={processing === entry.ID}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                              style={{ background: "#065f46" }}>
                              {processing === entry.ID ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                              อนุมัติ
                            </button>
                            <button onClick={() => handleRegistryDelete(entry)} disabled={processing === entry.ID}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                              style={{ background: "#dc2626" }}>
                              <XCircle size={16} /> ลบ
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* อนุมัติแล้ว */}
              <div>
                <h2 className="font-semibold text-lg mb-3" style={{ color: "#1e3a5f" }}>
                  ทะเบียนแหล่งเรียนรู้ทั้งหมด ({approvedRegistry.length})
                </h2>
                {approvedRegistry.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6 bg-white rounded-2xl shadow">ยังไม่มีรายการที่อนุมัติแล้ว</p>
                ) : (
                  <div className="space-y-2">
                    {approvedRegistry.map((entry) => (
                      <div key={entry.ID} className="bg-white rounded-2xl shadow p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {entry.ชื่อ || "ไม่ระบุชื่อ"}
                            </p>
                            <p className="text-xs text-slate-400">{ALL_ROOMS[entry.RoomID] || entry.RoomID}</p>
                            <p className="text-sm text-slate-500">{entry.ประเภท || "ไม่ระบุประเภท"}</p>
                            {entry.ผู้รับผิดชอบ && (
                              <p className="text-xs text-slate-400 mt-1">
                                ผู้รับผิดชอบ: {entry.ผู้รับผิดชอบ.split("\n").filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                          <button onClick={() => handleRegistryDelete(entry)}
                            className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500" title="ลบ">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}