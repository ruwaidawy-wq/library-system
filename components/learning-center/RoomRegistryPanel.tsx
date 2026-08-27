"use client";
import { useRef, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Camera, Loader2, CheckCircle } from "lucide-react";
import { roomApi, RoomRegistryEntry, Teacher } from "@/lib/gas";
import ZoomableImage from "@/components/ZoomableImage";
import NameTagPicker from "@/components/NameTagPicker";

const ROOM_TYPES = [
  "ห้องเรียน", "ห้องบำบัด", "ห้องกิจกรรม", "ห้องดนตรี",
  "ห้องศิลปะ", "ห้องฝึกอาชีพ", "ห้องเรียนคู่ขนาน", "ศูนย์เทคโนโลยี", "อื่นๆ"
];

interface Props {
  roomId: string;
  isAdminMode: boolean;
  entries: RoomRegistryEntry[];
  loading: boolean;
  onReload: () => void;
  teacherRoster: Teacher[];
}

export default function RoomRegistryPanel({ roomId, isAdminMode, entries, loading, onReload, teacherRoster }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submittedPending, setSubmittedPending] = useState(false);
  const [formError, setFormError] = useState("");

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formEquip, setFormEquip] = useState("");
  const [formResponsibleList, setFormResponsibleList] = useState<string[]>([]);
  const [formEstablished, setFormEstablished] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const teacherNames = teacherRoster.map((t) => t["ชื่อ-นามสกุล"]);

  function resetForm() {
    setEditingId(null);
    setFormName("");
    setFormType("");
    setFormDesc("");
    setFormEquip("");
    setFormResponsibleList([]);
    setFormEstablished("");
    setFormPhotos([]);
  }

  function openAdd() {
    resetForm();
    setFormError("");
    setShowForm(true);
  }

  function openEdit(entry: RoomRegistryEntry) {
    setEditingId(entry.ID);
    setFormName(entry.ชื่อ || "");
    setFormType(entry.ประเภท || "");
    setFormDesc(entry.รายละเอียด || "");
    setFormEquip(entry["อุปกรณ์/สื่อ"] || "");
    setFormResponsibleList(entry.ผู้รับผิดชอบ ? entry.ผู้รับผิดชอบ.split("\n").filter(Boolean) : []);
    setFormEstablished(entry.วันที่จัดตั้ง || "");
    setFormPhotos(entry.รูปภาพURL ? entry.รูปภาพURL.split(",").filter(Boolean) : []);
    setFormError("");
    setShowForm(true);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setFormPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      name: formName,
      type: formType,
      description: formDesc,
      equipment: formEquip,
      responsible: formResponsibleList.join("\n"),
      established: formEstablished,
      imageUrl: formPhotos.join("|||"),
    };
    const isNewEntry = !editingId;
    const res = editingId
      ? await roomApi.updateRoomRegistryEntry({ id: editingId, ...payload })
      : await roomApi.addRoomRegistryEntry({
          roomId,
          ...payload,
          status: isAdminMode ? "อนุมัติแล้ว" : "รออนุมัติ",
        });
    setSaving(false);
    if (!res.success) {
      // ไม่ปิดฟอร์ม/ไม่ล้างข้อมูลที่กรอกไว้ เพื่อให้กดบันทึกซ้ำได้โดยไม่ต้องกรอกใหม่ทั้งหมด
      setFormError(res.error || "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      return;
    }
    setShowForm(false);
    resetForm();
    onReload();
    if (isNewEntry && !isAdminMode) {
      setSubmittedPending(true);
      setTimeout(() => setSubmittedPending(false), 6000);
    }
  }

  async function handleApprove(entry: RoomRegistryEntry) {
    const res = await roomApi.approveRoomRegistryEntry(entry.ID);
    if (res.success) {
      onReload();
    } else {
      alert(`อนุมัติไม่สำเร็จ: ${res.error || "กรุณาลองใหม่อีกครั้ง"}`);
    }
  }

  async function handleDelete(entry: RoomRegistryEntry) {
    if (!confirm(`ต้องการลบ "${entry.ชื่อ || entry.ประเภท || "รายการนี้"}" ใช่หรือไม่?`)) return;
    const res = await roomApi.deleteRoomRegistryEntry(entry.ID);
    if (res.success) {
      onReload();
    } else {
      alert(`ลบไม่สำเร็จ: ${res.error || "กรุณาลองใหม่อีกครั้ง"}`);
    }
  }

  // แสดงทุกรายการของห้องนี้เสมอ (รวมที่รออนุมัติด้วย) ไม่ใช่แค่โหมด Admin
  // เพื่อให้ผู้ที่ส่งข้อมูลมั่นใจว่าข้อมูลถูกส่งเข้าระบบแล้วจริง ระหว่างรอแอดมินอนุมัติ
  const visibleEntries = entries;
  const pendingCount = entries.filter(e => e.สถานะ !== "อนุมัติแล้ว").length;

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>
          ทะเบียนแหล่งเรียนรู้ {visibleEntries.length > 0 && `(${visibleEntries.length})`}
          {pendingCount > 0 && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full font-medium align-middle"
              style={{ background: "#f3e8ff", color: "#7c3aed" }}>
              รออนุมัติ {pendingCount}
            </span>
          )}
        </h2>
        {!showForm && (
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium"
            style={{ background: "#065f46" }}>
            <Plus size={16} /> เพิ่มแหล่งเรียนรู้
          </button>
        )}
      </div>

      {submittedPending && (
        <div className="bg-purple-50 border border-purple-300 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-purple-600" />
          <span className="text-purple-700 text-sm">ส่งข้อมูลเรียบร้อยแล้ว กำลังรอการอนุมัติจากแอดมิน</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border-2 border-dashed border-slate-200 rounded-xl p-4 space-y-3">
          {formError && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              ชื่อ <span className="text-red-500">*</span>
            </label>
            <input value={formName} onChange={e => setFormName(e.target.value)}
              placeholder="เช่น มุมหนังสือนิทาน, มุมของเล่นพัฒนากล้ามเนื้อ"
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              ประเภท <span className="text-red-500">*</span>
            </label>
            <select value={formType} onChange={e => setFormType(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 appearance-none bg-white">
              <option value="">-- เลือกประเภท --</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              รายละเอียด <span className="text-red-500">*</span>
            </label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              อุปกรณ์/สื่อการเรียนรู้ <span className="text-red-500">*</span>
            </label>
            <textarea value={formEquip} onChange={e => setFormEquip(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              ผู้รับผิดชอบ (เลือกได้หลายคน) <span className="text-red-500">*</span>
            </label>
            <NameTagPicker value={formResponsibleList} onChange={setFormResponsibleList} options={teacherNames}
              placeholder="พิมพ์เพื่อค้นหาชื่อผู้รับผิดชอบ..." accentColor="#065f46" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              วันที่จัดตั้ง <span className="text-red-500">*</span>
            </label>
            <input type="date" value={formEstablished} onChange={e => setFormEstablished(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              ภาพแหล่งเรียนรู้/มุมการเรียนรู้ <span className="text-red-500">*</span>
            </label>
            <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
            <button type="button" onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-green-400 text-sm mb-3">
              <Camera size={16} /> แนบภาพ
            </button>
            {formPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {formPhotos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={
              saving || !formName || !formType || !formDesc || !formEquip ||
              formResponsibleList.length === 0 || !formEstablished || formPhotos.length === 0
            }
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "#065f46" }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              บันทึก
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); setFormError(""); }}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 text-sm">
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">กำลังโหลดข้อมูล...</div>
      ) : visibleEntries.length === 0 ? (
        !showForm && (
          <p className="text-slate-300 text-sm text-center py-8">ยังไม่มีข้อมูลแหล่งเรียนรู้ในห้องนี้</p>
        )
      ) : (
        <div className="space-y-3">
          {visibleEntries.map((entry) => {
            const photos = entry.รูปภาพURL ? entry.รูปภาพURL.split(",").filter(Boolean) : [];
            const isPending = entry.สถานะ !== "อนุมัติแล้ว";
            return (
              <div key={entry.ID} className={`border rounded-xl p-4 ${isPending ? "border-purple-200 bg-purple-50/40" : "border-slate-100"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">
                      {entry.ชื่อ || "ไม่ระบุชื่อ"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: "#ecfdf5", color: "#065f46" }}>
                      {entry.ประเภท || "ไม่ระบุประเภท"}
                    </span>
                    {isPending && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                        รออนุมัติ
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isAdminMode && isPending && (
                      <button onClick={() => handleApprove(entry)}
                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 hover:text-green-600">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button onClick={() => openEdit(entry)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(entry)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <ZoomableImage src={p} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {entry.รายละเอียด && (
                  <p className="text-sm text-slate-700 mb-1">{entry.รายละเอียด}</p>
                )}
                {entry["อุปกรณ์/สื่อ"] && (
                  <p className="text-xs text-slate-500 mb-1">
                    <span className="font-medium">อุปกรณ์/สื่อ:</span> {entry["อุปกรณ์/สื่อ"]}
                  </p>
                )}
                {entry.ผู้รับผิดชอบ && (
                  <p className="text-xs text-slate-400 mt-2">
                    <span className="font-medium">ผู้รับผิดชอบ:</span>{" "}
                    {entry.ผู้รับผิดชอบ.split("\n").filter(Boolean).join(", ")}
                  </p>
                )}
                {entry.วันที่จัดตั้ง && (
                  <p className="text-xs text-slate-400 mt-1">
                    จัดตั้ง: {new Date(entry.วันที่จัดตั้ง).toLocaleDateString("th-TH")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
