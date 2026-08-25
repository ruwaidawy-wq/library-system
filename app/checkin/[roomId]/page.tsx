"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, Loader2, Edit2, Users, LogIn, ImagePlus, Printer } from "lucide-react";
import Link from "next/link";
import { learningApi, libraryApi, roomApi, CheckIn, RoomRegistryEntry, Teacher, Student } from "@/lib/gas";
import RoomRegistryPanel from "@/components/learning-center/RoomRegistryPanel";
import { compressImage } from "@/lib/imageUtils";
import NameTagPicker from "@/components/NameTagPicker";
import ZoomableImage from "@/components/ZoomableImage";
import { escapeHtml } from "@/lib/htmlUtils";

const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";

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

type Tab = "info" | "checkin";

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function localTimeStr(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  const roomName = ALL_ROOMS[roomId] || roomId;

  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Check-in form
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [ciStudents, setCiStudents] = useState<string[]>([]);
  const [ciTeachers, setCiTeachers] = useState<string[]>([]);
  const [ciDate, setCiDate] = useState(() => localDateStr(new Date()));
  const [ciTime, setCiTime] = useState(() => localTimeStr(new Date()));
  const [ciReceived, setCiReceived] = useState("");
  const [ciCorner, setCiCorner] = useState("");
  const [ciPhotos, setCiPhotos] = useState<string[]>([]);
  const [ciSubmitting, setCiSubmitting] = useState(false);
  const [ciSuccess, setCiSuccess] = useState(false);
  const [ciError, setCiError] = useState("");
  const [allRegistryEntries, setAllRegistryEntries] = useState<RoomRegistryEntry[]>([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [teacherRoster, setTeacherRoster] = useState<Teacher[]>([]);
  const [studentRoster, setStudentRoster] = useState<Student[]>([]);
  const ciPhotoInputRef = useRef<HTMLInputElement>(null);

  const teacherNames = teacherRoster.map((t) => t["ชื่อ-นามสกุล"]);
  const studentNames = studentRoster.map((s) => s["ชื่อ-นามสกุล"]);
  const registryEntries = allRegistryEntries.filter(e => e.สถานะ === "อนุมัติแล้ว");

  async function loadRegistry() {
    setRegistryLoading(true);
    const reg = await roomApi.getRoomRegistryByRoom(roomId);
    if (reg.success && reg.data) setAllRegistryEntries(reg.data);
    setRegistryLoading(false);
  }

  useEffect(() => {
    learningApi.getCheckInsByRoom(roomName).then((ci) => {
      if (ci.success && ci.data) setCheckins(ci.data);
      setLoading(false);
    });
    loadRegistry();
    libraryApi.getTeachers().then((res) => {
      if (res.success && res.data) setTeacherRoster(res.data);
    });
    libraryApi.getStudents().then((res) => {
      if (res.success && res.data) setStudentRoster(res.data);
    });
  }, [roomId, roomName]);

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminPassword === "admin1234") {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminError("");
    } else {
      setAdminError("รหัสผ่านไม่ถูกต้อง");
    }
  }

  async function handleCiPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const compressed = await compressImage(file);
      setCiPhotos(prev => [...prev, compressed]);
    }
  }

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (ciStudents.length === 0 || ciTeachers.length === 0 || registryEntries.length === 0 || !ciDate || !ciTime) return;
    setCiSubmitting(true);
    setCiError("");
    const combined = new Date(`${ciDate}T${ciTime}:00`);
    const res = await learningApi.checkIn({
      roomNumber: roomName,
      teacherName: ciTeachers.join("\n"),
      studentName: ciStudents.join("\n"),
      received: ciReceived,
      imageUrl: ciPhotos.join("|||"),
      corner: ciCorner,
      timestamp: isNaN(combined.getTime()) ? undefined : combined.toISOString(),
    });
    setCiSubmitting(false);
    if (res.success) {
      setCiStudents([]);
      setCiTeachers([]);
      setCiDate(localDateStr(new Date()));
      setCiTime(localTimeStr(new Date()));
      setCiReceived("");
      setCiCorner("");
      setCiPhotos([]);
      setShowCheckinForm(false);
      setCiSuccess(true);
      setTimeout(() => setCiSuccess(false), 4000);
      const ci = await learningApi.getCheckInsByRoom(roomName);
      if (ci.success && ci.data) setCheckins(ci.data);
    } else {
      setCiError(res.error || "บันทึกการเข้าใช้ไม่สำเร็จ");
    }
  }

  function handlePrintHistory() {
    const rows = checkins.map((c, i) => {
      const students = c.ชื่อนักเรียน ? escapeHtml(c.ชื่อนักเรียน.split("\n").filter(Boolean).join(", ")) : "-";
      const teachers = c.ชื่อครู ? escapeHtml(c.ชื่อครู.split("\n").filter(Boolean).join(", ")) : "-";
      const d = c.Timestamp ? new Date(c.Timestamp) : null;
      const dateStr = d ? d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-";
      const timeStr = d ? d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "-";
      const photos = c.รูปภาพ ? c.รูปภาพ.split(",").filter(Boolean) : [];
      const photosHtml = photos.length > 0
        ? `<div class="row-imgs">${photos.map((url) => `<img class="row-img" src="${escapeHtml(url)}" alt="" />`).join("")}</div>`
        : "-";
      return `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td>${dateStr}</td>
          <td style="text-align:center">${timeStr}</td>
          <td>${students}</td>
          <td>${teachers}</td>
          <td>${escapeHtml(c["แหล่งเรียนรู้ที่ใช้"]) || "-"}</td>
          <td>${escapeHtml(c.สิ่งที่ได้รับ) || "-"}</td>
          <td>${photosHtml}</td>
        </tr>
      `;
    }).join("");

    const content = `
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #1a202c; }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { width: 64px; height: 64px; object-fit: contain; }
          .header p { font-size: 14px; font-weight: 700; margin: 4px 0 0; }
          .divider { border-top: 3px solid #065f46; border-bottom: 1px solid #065f46; margin: 12px 0 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
          thead td { background: #ecfdf5; font-weight: 700; text-align: center; }
          .row-imgs { display: flex; flex-wrap: wrap; gap: 6px; }
          img.row-img { width: 110px; height: 110px; object-fit: cover; border-radius: 6px; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" alt="logo" />
          <p>ประวัติการเข้าใช้ ${roomName}</p>
          <p>ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <td style="width:4%">ลำดับ</td>
              <td style="width:11%">วันที่</td>
              <td style="width:7%">เวลา</td>
              <td style="width:14%">ชื่อนักเรียน</td>
              <td style="width:12%">ชื่อครู</td>
              <td style="width:10%">แหล่งเรียนรู้ที่ใช้</td>
              <td style="width:10%">สิ่งที่ได้รับ</td>
              <td style="width:32%">รูปภาพ</td>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
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

  const todayCheckins = checkins.filter(c => {
    const d = new Date(c.Timestamp).toLocaleDateString("th-TH");
    return d === new Date().toLocaleDateString("th-TH");
  }).length;

  const checkinPhotos = checkins.flatMap(c => c.รูปภาพ ? c.รูปภาพ.split(",").filter(Boolean) : []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "ทะเบียนห้อง", icon: <Edit2 size={16} /> },
    { id: "checkin", label: "ประวัติการเข้าใช้", icon: <Users size={16} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="no-print flex items-center gap-3 mb-2">
        <Link href="/learning-center"
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl leading-tight" style={{ color: "#065f46" }}>{roomName}</h1>
          <p className="text-slate-400 text-xs">แหล่งเรียนรู้ • ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓</p>
        </div>
        {!isAdminMode && (
          <button onClick={() => setShowAdminLogin(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            Admin
          </button>
        )}
        {isAdminMode && (
          <span className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: "#dcfce7", color: "#15803d" }}>
            ✓ Admin Mode
          </span>
        )}
      </div>

      {/* ปุ่มเข้าใช้ห้องนี้ */}
      <div className="no-print mb-4">
        <button onClick={() => setShowCheckinForm(true)} disabled={registryEntries.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:hover:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
          <LogIn size={18} /> เข้าใช้ห้องนี้
        </button>
        {registryEntries.length === 0 && (
          <p className="text-xs text-amber-600 text-center mt-2">
            ห้องนี้ยังไม่มีข้อมูลแหล่งเรียนรู้ กรุณาลงทะเบียนที่แท็บ &quot;ทะเบียนห้อง&quot; ก่อน จึงจะบันทึกการเข้าใช้ได้
          </p>
        )}
      </div>

      {ciSuccess && (
        <div className="no-print bg-green-50 border border-green-300 rounded-xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-green-700 text-sm">บันทึกการเข้าใช้เรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckinForm && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowCheckinForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#065f46" }}>เข้าใช้ {roomName}</h3>
            {ciError && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3 text-red-700 text-sm">
                {ciError}
              </div>
            )}
            <form onSubmit={handleCheckin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ชื่อนักเรียน <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(เลือกได้หลายคน)</span>
                </label>
                <NameTagPicker value={ciStudents} onChange={setCiStudents} options={studentNames}
                  placeholder="พิมพ์เพื่อค้นหาชื่อนักเรียน..." accentColor="#065f46" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ชื่อครู <span className="text-red-500">*</span> <span className="text-slate-400 font-normal">(เลือกได้หลายคน)</span>
                </label>
                <NameTagPicker value={ciTeachers} onChange={setCiTeachers} options={teacherNames}
                  placeholder="พิมพ์เพื่อค้นหาชื่อครู..." accentColor="#065f46" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    วันที่ <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={ciDate} onChange={e => setCiDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    เวลา <span className="text-red-500">*</span>
                  </label>
                  <input type="time" value={ciTime} onChange={e => setCiTime(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
                </div>
              </div>
              {registryEntries.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">แหล่งเรียนรู้ / มุมการศึกษาที่ใช้</label>
                  <select value={ciCorner} onChange={e => setCiCorner(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 appearance-none bg-white">
                    <option value="">-- ไม่ระบุ / ทั้งห้อง --</option>
                    {registryEntries.map(entry => (
                      <option key={entry.ID} value={entry.ชื่อ || entry.ประเภท || entry.ID}>
                        {entry.ชื่อ || entry.ประเภท || "ไม่ระบุชื่อ"}{entry.ประเภท ? ` (${entry.ประเภท})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">สิ่งที่ได้รับ</label>
                <input value={ciReceived} onChange={e => setCiReceived(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">แนบภาพ</label>
                <input ref={ciPhotoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCiPhoto} />
                <button type="button" onClick={() => ciPhotoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-green-400 text-sm mb-3">
                  <Camera size={16} /> แนบรูปภาพ
                </button>
                {ciPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {ciPhotos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setCiPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={ciSubmitting || ciStudents.length === 0 || ciTeachers.length === 0 || registryEntries.length === 0 || !ciDate || !ciTime}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: "#065f46" }}>
                  {ciSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  ยืนยันเข้าใช้
                </button>
                <button type="button" onClick={() => setShowCheckinForm(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 text-sm">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowAdminLogin(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#1e3a5f" }}>เข้าสู่ระบบ Admin</h3>
            {adminError && (
              <p className="text-red-600 text-sm mb-3">{adminError}</p>
            )}
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                placeholder="รหัสผ่าน Admin"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400"
              />
              <button type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: "#1e3a5f" }}>
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mini Stats */}
      <div className="no-print grid grid-cols-2 gap-3 my-4">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: "#065f46" }}>{checkins.length}</p>
          <p className="text-xs text-slate-500 mt-1">เข้าใช้ทั้งหมด</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: "#f59e0b" }}>{todayCheckins}</p>
          <p className="text-xs text-slate-500 mt-1">วันนี้</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print flex rounded-2xl p-1 mb-6" style={{ background: "#ecfdf5" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={activeTab === tab.id
              ? { background: "#065f46", color: "white" }
              : { color: "#065f46", opacity: 0.7 }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: ทะเบียนแหล่งเรียนรู้ */}
      {activeTab === "info" && (
        <RoomRegistryPanel roomId={roomId} isAdminMode={isAdminMode} entries={allRegistryEntries}
          loading={registryLoading} onReload={loadRegistry} teacherRoster={teacherRoster} />
      )}

      {/* TAB: ประวัติการเข้าใช้ */}
      {activeTab === "checkin" && (
        <div className="bg-white rounded-2xl shadow p-6">
          {checkinPhotos.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-slate-600">
                <ImagePlus size={16} /> ประมวลภาพ ({checkinPhotos.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {checkinPhotos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <ZoomableImage src={p} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>
              ประวัติการเข้าใช้ ({checkins.length} ครั้ง)
            </h2>
            {checkins.length > 0 && (
              <button type="button" onClick={handlePrintHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-green-400 text-xs">
                <Printer size={14} /> พิมพ์
              </button>
            )}
          </div>
          {checkins.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">ยังไม่มีการเข้าใช้</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...checkins].reverse().map((c, i) => {
                const photos = c.รูปภาพ ? c.รูปภาพ.split(",").filter(Boolean) : [];
                const students = c.ชื่อนักเรียน ? c.ชื่อนักเรียน.split("\n").filter(Boolean).join(", ") : "";
                const teachers = c.ชื่อครู ? c.ชื่อครู.split("\n").filter(Boolean).join(", ") : "";
                return (
                  <div key={i} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{students}</p>
                        <p className="text-xs text-slate-400">ครู: {teachers}</p>
                        {c["แหล่งเรียนรู้ที่ใช้"] && (
                          <p className="text-xs text-slate-500 mt-0.5">มุม: {c["แหล่งเรียนรู้ที่ใช้"]}</p>
                        )}
                        {c.สิ่งที่ได้รับ && (
                          <p className="text-xs text-slate-500 mt-0.5">ได้รับ: {c.สิ่งที่ได้รับ}</p>
                        )}
                      </div>
                      {photos.length > 0 && (
                        <img src={photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <p className="text-xs text-slate-400 shrink-0">
                        {c.Timestamp ? new Date(c.Timestamp).toLocaleDateString("th-TH") : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
