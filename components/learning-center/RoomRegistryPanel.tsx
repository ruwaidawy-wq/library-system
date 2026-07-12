"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Camera, Loader2, CheckCircle } from "lucide-react";
import { roomApi, RoomRegistryEntry } from "@/lib/gas";

const ROOM_TYPES = [
  "ห้องเรียน", "ห้องบำบัด", "ห้องกิจกรรม", "ห้องดนตรี",
  "ห้องศิลปะ", "ห้องฝึกอาชีพ", "ห้องเรียนคู่ขนาน", "ศูนย์เทคโนโลยี", "อื่นๆ"
];

interface Props {
  roomId: string;
  isAdminMode: boolean;
}

export default function RoomRegistryPanel({ roomId, isAdminMode }: Props) {
  const [entries, setEntries] = useState<RoomRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submittedPending, setSubmittedPending] = useState(false);

  const [formType, setFormType] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formEquip, setFormEquip] = useState("");
  const [formResponsible, setFormResponsible] = useState("");
  const [formEstablished, setFormEstablished] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await roomApi.getRoomRegistryByRoom(roomId);
    if (res.success && res.data) setEntries(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [roomId]);

  function resetForm() {
    setEditingId(null);
    setFormType("");
    setFormDesc("");
    setFormEquip("");
    setFormResponsible("");
    setFormEstablished("");
    setFormPhotos([]);
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(entry: RoomRegistryEntry) {
    setEditingId(entry.ID);
    setFormType(entry.ประเภท || "");
    setFormDesc(entry.รายละเอียด || "");
    setFormEquip(entry["อุปกรณ์/สื่อ"] || "");
    setFormResponsible(entry.ผู้รับผิดชอบ || "");
    setFormEstablished(entry.วันที่จัดตั้ง || "");
    setFormPhotos(entry.รูปภาพURL ? entry.รูปภาพURL.split(",").filter(Boolean) : []);
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
    const payload = {
      type: formType,
      description: formDesc,
      equipment: formEquip,
      responsible: formResponsible,
      established: formEstablished,
      imageUrl: formPhotos.join(","),
    };
    const isNewEntry = !editingId;
    if (editingId) {
      await roomApi.updateRoomRegistryEntry({ id: editingId, ...payload });
    } else {
      await roomApi.addRoomRegistryEntry({
        roomId,
        ...payload,
        status: isAdminMode ? "อนุมัติแล้ว" : "รออนุมัติ",
      });
    }
    setSaving(false);
    setShowForm(false);
    resetForm();
    await load();
    if (isNewEntry && !isAdminMode) {
      setSubmittedPending(true);
      setTimeout(() => setSubmittedPending(false), 6000);
    }
  }

  async function handleApprove(entry: RoomRegistryEntry) {
    await roomApi.approveRoomRegistryEntry(entry.ID);
    load();
  }

  async function handleDelete(entry: RoomRegistryEntry) {
    if (!confirm(`ต้องการลบ "${entry.ประเภท || "รายการนี้"}" ใช่หรือไม่?`)) return;
    await roomApi.deleteRoomRegistryEntry(entry.ID);
    load();
  }

  const visibleEntries = isAdminMode
    ? entries
    : entries.filter(e => e.สถานะ === "อนุมัติแล้ว");
  const pendingCount = entries.filter(e => e.สถานะ !== "อนุมัติแล้ว").length;

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>
          ทะเบียนแหล่งเรียนรู้ {visibleEntries.length > 0 && `(${visibleEntries.length})`}
          {isAdminMode && pendingCount > 0 && (
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
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">ประเภท</label>
            <select value={formType} onChange={e => setFormType(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 appearance-none bg-white">
              <option value="">-- เลือกประเภท --</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">รายละเอียด</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">อุปกรณ์/สื่อการเรียนรู้</label>
            <textarea value={formEquip} onChange={e => setFormEquip(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">ผู้รับผิดชอบ</label>
            <input value={formResponsible} onChange={e => setFormResponsible(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">วันที่จัดตั้ง</label>
            <input type="date" value={formEstablished} onChange={e => setFormEstablished(e.target.value)}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">ภาพแหล่งเรียนรู้/มุมการเรียนรู้</label>
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
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "#065f46" }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              บันทึก
            </button>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
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
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: "#ecfdf5", color: "#065f46" }}>
                      {entry.ประเภท || "ไม่ระบุประเภท"}
                    </span>
                    {isAdminMode && isPending && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                        รออนุมัติ
                      </span>
                    )}
                  </div>
                  {isAdminMode && (
                    <div className="flex gap-1">
                      {isPending && (
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
                  )}
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {photos.map((p, i) => (
                      <img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover w-full" />
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
                <div className="flex flex-wrap gap-x-4 text-xs text-slate-400 mt-2">
                  {entry.ผู้รับผิดชอบ && <span>ผู้รับผิดชอบ: {entry.ผู้รับผิดชอบ}</span>}
                  {entry.วันที่จัดตั้ง && (
                    <span>จัดตั้ง: {new Date(entry.วันที่จัดตั้ง).toLocaleDateString("th-TH")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
