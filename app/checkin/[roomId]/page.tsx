"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, Loader2, Edit2, Users, Calendar, Image, Printer, Pen, LogIn, ImagePlus } from "lucide-react";
import Link from "next/link";
import { learningApi, CheckIn } from "@/lib/gas";
import SignaturePad from "@/components/SignaturePad";
import RoomRegistryPanel from "@/components/learning-center/RoomRegistryPanel";

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

type Tab = "info" | "checkin" | "activity";

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
  const [ciStudent, setCiStudent] = useState("");
  const [ciTeacher, setCiTeacher] = useState("");
  const [ciReceived, setCiReceived] = useState("");
  const [ciPhotos, setCiPhotos] = useState<string[]>([]);
  const [ciSubmitting, setCiSubmitting] = useState(false);
  const [ciSuccess, setCiSuccess] = useState(false);
  const ciPhotoInputRef = useRef<HTMLInputElement>(null);

  // Activity form
  const [actDate, setActDate] = useState(new Date().toISOString().split("T")[0]);
  const [actStudents, setActStudents] = useState("");
  const [actTeachers, setActTeachers] = useState("");
  const [actDetail, setActDetail] = useState("");
  const [actKnowledge, setActKnowledge] = useState("");
  const [actPhotos, setActPhotos] = useState<string[]>([]);
  const [actRecorder, setActRecorder] = useState("");
  const [actPosition, setActPosition] = useState("");
  const [actSignature, setActSignature] = useState<string | null>(null);
  const [showSignPad, setShowSignPad] = useState(false);
  const [actSubmitting, setActSubmitting] = useState(false);
  const [actSuccess, setActSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    learningApi.getCheckInsByRoom(roomName).then((ci) => {
      if (ci.success && ci.data) setCheckins(ci.data);
      setLoading(false);
    });
  }, [roomName]);

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

  function handleCiPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setCiPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    if (!ciStudent || !ciTeacher) return;
    setCiSubmitting(true);
    const res = await learningApi.checkIn({
      roomNumber: roomName,
      teacherName: ciTeacher,
      studentName: ciStudent,
      received: ciReceived,
      imageUrl: ciPhotos.join(","),
    });
    setCiSubmitting(false);
    if (res.success) {
      setCiStudent("");
      setCiTeacher("");
      setCiReceived("");
      setCiPhotos([]);
      setShowCheckinForm(false);
      setCiSuccess(true);
      setTimeout(() => setCiSuccess(false), 4000);
      const ci = await learningApi.getCheckInsByRoom(roomName);
      if (ci.success && ci.data) setCheckins(ci.data);
    }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setActPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!actDate || !actDetail) { return; }
    setActSubmitting(true);
    const res = await fetch("/api/gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addActivity",
        date: actDate,
        roomNumber: roomName,
        students: actStudents,
        teachers: actTeachers,
        learningSource: roomName,
        activityDetail: actDetail,
        knowledge: actKnowledge,
        imageUrl: actPhotos.join(","),
        signature: actSignature || "",
        recorder: actRecorder,
        position: actPosition,
      }),
    });
    const data = await res.json();
    setActSubmitting(false);
    if (data.success) {
      setActSuccess(true);
      setActStudents("");
      setActTeachers("");
      setActDetail("");
      setActKnowledge("");
      setActPhotos([]);
      setActDate(new Date().toISOString().split("T")[0]);
      setTimeout(() => setActSuccess(false), 4000);
    }
  }

  const todayCheckins = checkins.filter(c => {
    const d = new Date(c.Timestamp).toLocaleDateString("th-TH");
    return d === new Date().toLocaleDateString("th-TH");
  }).length;

  const checkinPhotos = checkins.flatMap(c => c.รูปภาพ ? c.รูปภาพ.split(",").filter(Boolean) : []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "ทะเบียนห้อง", icon: <Edit2 size={16} /> },
    { id: "checkin", label: "ประวัติการเข้าใช้", icon: <Users size={16} /> },
    { id: "activity", label: "บันทึกกิจกรรม", icon: <Image size={16} /> },
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
      <button onClick={() => setShowCheckinForm(true)}
        className="no-print w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold mb-4 hover:opacity-90 transition-all"
        style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
        <LogIn size={18} /> เข้าใช้ห้องนี้
      </button>

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
            <form onSubmit={handleCheckin} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ชื่อนักเรียน <span className="text-red-500">*</span>
                </label>
                <input value={ciStudent} onChange={e => setCiStudent(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  ชื่อครู <span className="text-red-500">*</span>
                </label>
                <input value={ciTeacher} onChange={e => setCiTeacher(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
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
                <button type="submit" disabled={ciSubmitting || !ciStudent || !ciTeacher}
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
        <RoomRegistryPanel roomId={roomId} isAdminMode={isAdminMode} />
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
                  <img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover w-full" />
                ))}
              </div>
            </div>
          )}

          <h2 className="font-semibold text-lg mb-4" style={{ color: "#065f46" }}>
            ประวัติการเข้าใช้ ({checkins.length} ครั้ง)
          </h2>
          {checkins.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">ยังไม่มีการเข้าใช้</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...checkins].reverse().map((c, i) => {
                const photos = c.รูปภาพ ? c.รูปภาพ.split(",").filter(Boolean) : [];
                return (
                  <div key={i} className="border border-slate-100 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{c.ชื่อนักเรียน}</p>
                        <p className="text-xs text-slate-400">ครู: {c.ชื่อครู}</p>
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

      {/* TAB: บันทึกกิจกรรม */}
      {activeTab === "activity" && (
        <div className="print-area bg-white rounded-2xl shadow p-6">
          <div className="no-print flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>
              บันทึกกิจกรรม
            </h2>
            <button type="button" onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-green-400 text-xs">
              <Printer size={14} /> พิมพ์
            </button>
          </div>

          {actSuccess && (
            <div className="no-print bg-green-50 border border-green-300 rounded-xl p-3 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-700 text-sm">บันทึกกิจกรรมเรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* หัวรายงานสำหรับพิมพ์ */}
          <div className="text-center mb-3">
            <img src={LOGO_URL} alt="logo" className="mx-auto mb-2"
              style={{ width: "64px", height: "64px", objectFit: "contain" }} />
            <p className="font-bold text-base">บันทึกกิจกรรมการเข้าใช้แหล่งเรียนรู้</p>
            <p className="font-bold text-base">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
          </div>
          <div className="border-t-4 border-b-2 mb-4" style={{ borderColor: "#065f46" }} />

          <form onSubmit={handleAddActivity}>
            <table className="w-full border-collapse text-sm mb-4" style={{ border: "1px solid #000" }}>
              <tbody>
                <tr>
                  <td className="font-semibold bg-slate-50 p-2" style={{ border: "1px solid #000", width: "22%" }}>
                    วันที่ <span className="no-print text-red-500">*</span>
                  </td>
                  <td className="p-2" style={{ border: "1px solid #000", width: "28%" }}>
                    <input type="date" value={actDate} onChange={e => setActDate(e.target.value)}
                      className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                    <span className="text-sm">
                      {new Date(actDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </td>
                  <td className="font-semibold bg-slate-50 p-2" style={{ border: "1px solid #000", width: "18%" }}>แหล่งเรียนรู้</td>
                  <td className="p-2" style={{ border: "1px solid #000", width: "32%" }}>
                    <span className="text-sm font-medium">{roomName}</span>
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>รายชื่อนักเรียน</td>
                  <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                    <textarea value={actStudents} onChange={e => setActStudents(e.target.value)}
                      rows={3} placeholder="ระบุรายชื่อนักเรียน..."
                      className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ครู/ผู้ดูแล</td>
                  <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                    <textarea value={actTeachers} onChange={e => setActTeachers(e.target.value)}
                      rows={2} placeholder="ระบุรายชื่อครู..."
                      className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>
                    ลักษณะกิจกรรม <span className="no-print text-red-500">*</span>
                  </td>
                  <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                    <textarea value={actDetail} onChange={e => setActDetail(e.target.value)}
                      rows={4} placeholder="อธิบายลักษณะกิจกรรม..."
                      className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>สาระที่ได้รับ</td>
                  <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                    <textarea value={actKnowledge} onChange={e => setActKnowledge(e.target.value)}
                      rows={3} placeholder="ระบุสาระที่ได้รับ..."
                      className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                  </td>
                </tr>

                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ภาพกิจกรรม</td>
                  <td colSpan={3} className="p-2" style={{ border: "1px solid #000" }}>
                    <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
                    <button type="button" onClick={() => photoInputRef.current?.click()}
                      className="no-print flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-green-400 text-sm mb-3">
                      <Camera size={16} /> แนบรูปภาพ
                    </button>
                    {actPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {actPhotos.map((p, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setActPhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="no-print absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse text-sm" style={{ border: "1px solid #000" }}>
              <tbody>
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000", width: "22%" }}>
                    ผู้บันทึก
                  </td>
                  <td className="p-2 align-top" style={{ border: "1px solid #000", width: "28%" }}>
                    <input value={actRecorder} onChange={e => setActRecorder(e.target.value)}
                      placeholder="ชื่อผู้บันทึก"
                      className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                    <input value={actPosition} onChange={e => setActPosition(e.target.value)}
                      placeholder="ตำแหน่ง"
                      className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded" />
                    <p className="text-sm font-medium mt-1">
                      {actRecorder || "-"}{actPosition && ` (${actPosition})`}
                    </p>
                  </td>
                  <td className="font-semibold bg-slate-50 p-2 align-top text-center" style={{ border: "1px solid #000", width: "18%" }}>
                    ลายมือชื่อผู้บันทึก
                  </td>
                  <td className="p-2 text-center align-middle" style={{ border: "1px solid #000", width: "32%" }}>
                    {actSignature ? (
                      <div className="relative inline-block">
                        <img src={actSignature} alt="ลายเซ็น" className="h-14 object-contain mx-auto" />
                        <button type="button" onClick={() => setActSignature(null)}
                          className="no-print absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="no-print">
                        {showSignPad ? (
                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                            <SignaturePad zone="learn"
                              onSave={dataUrl => { setActSignature(dataUrl); setShowSignPad(false); }} />
                            <button type="button" onClick={() => setShowSignPad(false)}
                              className="text-xs text-slate-400 mt-1">ยกเลิก</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setShowSignPad(true)}
                            className="flex flex-col items-center gap-1 mx-auto text-slate-400 hover:text-green-500">
                            <Pen size={20} />
                            <span className="text-xs">กดลงลายมือชื่อ</span>
                          </button>
                        )}
                        <div className="border-b border-slate-300 mt-2 mx-2" />
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <button type="submit" disabled={actSubmitting || !actDetail}
              className="no-print w-full mt-4 py-3 rounded-xl text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "#065f46" }}>
              {actSubmitting ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><CheckCircle size={18} /> บันทึกกิจกรรม</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
