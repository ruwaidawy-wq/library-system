"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, X, CheckCircle, Loader2, Edit2, Save, Users, Calendar, Image } from "lucide-react";
import Link from "next/link";
import { learningApi, CheckIn } from "@/lib/gas";
import { roomApi, RoomRegistry } from "@/lib/gas";

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

const ROOM_TYPES = [
  "ห้องเรียน", "ห้องบำบัด", "ห้องกิจกรรม", "ห้องดนตรี",
  "ห้องศิลปะ", "ห้องฝึกอาชีพ", "ห้องเรียนคู่ขนาน", "ศูนย์เทคโนโลยี", "อื่นๆ"
];

type Tab = "info" | "checkin" | "activity";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  const roomName = ALL_ROOMS[roomId] || roomId;

  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [registry, setRegistry] = useState<RoomRegistry | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState("");

  // Edit form
  const [editType, setEditType] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editEquip, setEditEquip] = useState("");
  const [editResponsible, setEditResponsible] = useState("");
  const [editEstablished, setEditEstablished] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Activity form
  const [actDate, setActDate] = useState(new Date().toISOString().split("T")[0]);
  const [actStudents, setActStudents] = useState("");
  const [actTeachers, setActTeachers] = useState("");
  const [actDetail, setActDetail] = useState("");
  const [actKnowledge, setActKnowledge] = useState("");
  const [actPhotos, setActPhotos] = useState<string[]>([]);
  const [actSubmitting, setActSubmitting] = useState(false);
  const [actSuccess, setActSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      roomApi.getRoomById(roomId),
      learningApi.getCheckInsByRoom(roomName),
    ]).then(([reg, ci]) => {
      if (reg.success && reg.data) {
        setRegistry(reg.data);
        setEditType(reg.data.ประเภท || "");
        setEditDesc(reg.data.รายละเอียด || "");
        setEditEquip(reg.data["อุปกรณ์/สื่อ"] || "");
        setEditResponsible(reg.data.ผู้รับผิดชอบ || "");
        setEditEstablished(reg.data.วันที่จัดตั้ง || "");
        setEditImageUrl(reg.data.รูปภาพURL || "");
      }
      if (ci.success && ci.data) setCheckins(ci.data);
      setLoading(false);
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

  async function handleSaveRegistry() {
    setSaving(true);
    await roomApi.updateRoomRegistry({
      roomId,
      type: editType,
      description: editDesc,
      equipment: editEquip,
      responsible: editResponsible,
      imageUrl: editImageUrl,
      established: editEstablished,
    });
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
        signature: "",
        recorder: "",
        position: "",
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "ทะเบียนห้อง", icon: <Edit2 size={16} /> },
    { id: "checkin", label: "ประวัติเช็คอิน", icon: <Users size={16} /> },
    { id: "activity", label: "บันทึกกิจกรรม", icon: <Image size={16} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
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

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
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
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: "#065f46" }}>{checkins.length}</p>
          <p className="text-xs text-slate-500 mt-1">เช็คอินทั้งหมด</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-3xl font-bold" style={{ color: "#f59e0b" }}>{todayCheckins}</p>
          <p className="text-xs text-slate-500 mt-1">วันนี้</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl p-1 mb-6" style={{ background: "#ecfdf5" }}>
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

      {/* TAB: ทะเบียนห้อง */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>ทะเบียนแหล่งเรียนรู้</h2>
            {isAdminMode && (
              <button onClick={handleSaveRegistry} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: "#065f46" }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                บันทึก
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-700 text-sm">บันทึกข้อมูลเรียบร้อยแล้ว</span>
            </div>
          )}

          {/* Room Image */}
          {(editImageUrl || isAdminMode) && (
            <div>
              {editImageUrl && (
                <img src={editImageUrl} alt={roomName}
                  className="w-full h-48 object-cover rounded-xl mb-2" />
              )}
              {isAdminMode && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">URL รูปภาพห้อง</label>
                  <input
                    value={editImageUrl}
                    onChange={e => setEditImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Fields */}
          {[
            { label: "ชื่อห้อง", value: roomName, editable: false },
            { label: "ประเภท", value: editType, setter: setEditType, isSelect: true },
            { label: "รายละเอียด", value: editDesc, setter: setEditDesc, isTextarea: true },
            { label: "อุปกรณ์/สื่อการเรียนรู้", value: editEquip, setter: setEditEquip, isTextarea: true },
            { label: "ผู้รับผิดชอบ", value: editResponsible, setter: setEditResponsible },
            { label: "วันที่จัดตั้ง", value: editEstablished, setter: setEditEstablished, isDate: true },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-slate-500 mb-1">{field.label}</label>
              {!isAdminMode || field.editable === false ? (
                <p className="text-slate-800 bg-slate-50 rounded-xl px-3 py-2 text-sm min-h-[40px]">
                  {field.value || <span className="text-slate-300">ยังไม่มีข้อมูล</span>}
                </p>
              ) : field.isSelect ? (
                <select value={field.value} onChange={e => field.setter?.(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 appearance-none bg-white">
                  <option value="">-- เลือกประเภท --</option>
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : field.isTextarea ? (
                <textarea value={field.value} onChange={e => field.setter?.(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
              ) : field.isDate ? (
                <input type="date" value={field.value} onChange={e => field.setter?.(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
              ) : (
                <input value={field.value} onChange={e => field.setter?.(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB: ประวัติเช็คอิน */}
      {activeTab === "checkin" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4" style={{ color: "#065f46" }}>
            ประวัติการเช็คอิน ({checkins.length} ครั้ง)
          </h2>
          {checkins.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">ยังไม่มีการเช็คอิน</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...checkins].reverse().map((c, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{c.ชื่อนักเรียน}</p>
                      <p className="text-xs text-slate-400">ครู: {c.ชื่อครู}</p>
                      {c.สิ่งที่ได้รับ && (
                        <p className="text-xs text-slate-500 mt-0.5">ได้รับ: {c.สิ่งที่ได้รับ}</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {c.Timestamp ? new Date(c.Timestamp).toLocaleDateString("th-TH") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: บันทึกกิจกรรม */}
      {activeTab === "activity" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4" style={{ color: "#065f46" }}>
            บันทึกกิจกรรม
          </h2>

          {actSuccess && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-3 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-700 text-sm">บันทึกกิจกรรมเรียบร้อยแล้ว!</span>
            </div>
          )}

          <form onSubmit={handleAddActivity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">วันที่ <span className="text-red-500">*</span></label>
              <input type="date" value={actDate} onChange={e => setActDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">รายชื่อนักเรียน</label>
              <textarea value={actStudents} onChange={e => setActStudents(e.target.value)}
                rows={3} placeholder="ระบุรายชื่อนักเรียน..."
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ครู/ผู้ดูแล</label>
              <textarea value={actTeachers} onChange={e => setActTeachers(e.target.value)}
                rows={2} placeholder="ระบุรายชื่อครู..."
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ลักษณะกิจกรรม <span className="text-red-500">*</span></label>
              <textarea value={actDetail} onChange={e => setActDetail(e.target.value)}
                rows={4} placeholder="อธิบายลักษณะกิจกรรม..."
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">สาระที่ได้รับ</label>
              <textarea value={actKnowledge} onChange={e => setActKnowledge(e.target.value)}
                rows={3} placeholder="ระบุสาระที่ได้รับ..."
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">รูปภาพกิจกรรม</label>
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
              <button type="button" onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-green-400 text-sm mb-3">
                <Camera size={16} /> แนบรูปภาพ
              </button>
              {actPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {actPhotos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setActPhotos(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={actSubmitting || !actDetail}
              className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: "#065f46" }}>
              {actSubmitting ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><CheckCircle size={18} /> บันทึกกิจกรรม</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}