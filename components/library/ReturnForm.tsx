"use client";
import { useState, useEffect } from "react";
import { Search, BookMarked, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { libraryApi, Teacher, BorrowLog } from "@/lib/gas";

export default function ReturnForm() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowLog[]>([]);
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowLog | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    libraryApi.getTeachers().then((r) => { if (r.success && r.data) setTeachers(r.data); });
  }, []);

  const filteredTeachers = teachers.filter((t) =>
    t["ชื่อ-นามสกุล"].includes(query) || t.ตำแหน่ง.includes(query)
  );

  async function handleSelectTeacher(teacher: Teacher) {
    setSelectedTeacher(teacher);
    setQuery(teacher["ชื่อ-นามสกุล"]);
    setShowDropdown(false);
    setSelectedBorrow(null);
    setBorrowedBooks([]);
    setLoadingBooks(true);
    const res = await libraryApi.getBorrowLog();
    setLoadingBooks(false);
    if (res.success && res.data) {
      const active = res.data.filter(
  (b) => b.ชื่อผู้ยืม === teacher["ชื่อ-นามสกุล"] &&
    (b.สถานะ === "ยืมอยู่" || b.สถานะ === "รอยืม" || b.สถานะ === "รอคืน")
);
      setBorrowedBooks(active);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBorrow) {
      setError("กรุณาเลือกหนังสือที่ต้องการคืน");
      return;
    }
    setSubmitting(true);
    setError("");

    // ส่งคำขอคืน — Admin จะเป็นคนกำหนดค่าปรับและอนุมัติ
    const res = await libraryApi.returnBook({
      borrowId: selectedBorrow.ID,
      returnStatus: "pending",
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
      setSelectedTeacher(null);
      setQuery("");
      setBorrowedBooks([]);
      setSelectedBorrow(null);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(res.error || "เกิดข้อผิดพลาด");
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
      <h2 className="text-xl font-semibold" style={{ color: "#1e3a5f" }}>
        แบบฟอร์มคืนหนังสือ
      </h2>

      {success && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5" />
          <div>
            <p className="text-green-800 font-semibold">ส่งคำขอคืนหนังสือแล้ว!</p>
            <p className="text-green-700 text-sm mt-1">Admin จะตรวจสอบและกำหนดค่าปรับ (ถ้ามี)</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Teacher Search */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          ชื่อครูผู้ยืม
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-base outline-none focus:border-blue-400 transition-colors"
            placeholder="ค้นหาชื่อครู..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setSelectedTeacher(null); setBorrowedBooks([]); }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filteredTeachers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
              {filteredTeachers.map((t) => (
                <button key={t["ชื่อ-นามสกุล"]} type="button"
                  onClick={() => handleSelectTeacher(t)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between">
                  <span className="font-medium text-slate-800">{t["ชื่อ-นามสกุล"]}</span>
                  <span className="text-xs text-slate-400">{t.ตำแหน่ง}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loadingBooks && (
        <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">กำลังโหลดรายการหนังสือ...</span>
        </div>
      )}

      {/* Borrowed Books List */}
      {selectedTeacher && !loadingBooks && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            เลือกหนังสือที่ต้องการคืน
          </label>
          {borrowedBooks.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl">
              <BookMarked size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">ไม่มีหนังสือที่ยืมค้างอยู่</p>
            </div>
          ) : (
            <div className="space-y-3">
              {borrowedBooks.map((b) => {
                const overdue = isOverdue(b.กำหนดคืน);
                const isSelected = selectedBorrow?.ID === b.ID;
                return (
                  <button
                    key={b.ID}
                    type="button"
                    onClick={() => setSelectedBorrow(isSelected ? null : b)}
                    className="w-full text-left rounded-xl border-2 p-4 transition-all"
                    style={
                      isSelected
                        ? { borderColor: "#1e3a5f", background: "#e8f0fb" }
                        : { borderColor: overdue ? "#fca5a5" : "#e2e8f0", background: overdue ? "#fff5f5" : "white" }
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">รหัส: {b.รหัสหนังสือ}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          ยืมวันที่: {new Date(b.วันยืม).toLocaleDateString("th-TH")}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: overdue ? "#dc2626" : "#64748b" }}>
                          กำหนดคืน: {new Date(b.กำหนดคืน).toLocaleDateString("th-TH")}
                          {overdue && " ⚠ เกินกำหนด!"}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${isSelected ? "border-blue-700 bg-blue-700" : "border-slate-300"}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      {selectedBorrow && (
        <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-blue-500 mt-0.5" />
          <p className="text-blue-700 text-sm">
            เจ้าหน้าที่จะเป็นผู้ตรวจสอบสภาพหนังสือและกำหนดค่าปรับ (ถ้ามี)
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !selectedBorrow}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white text-lg font-semibold transition-all disabled:opacity-40"
        style={{ background: "#1e3a5f" }}
      >
        {submitting ? (
          <><Loader2 size={20} className="animate-spin" /> กำลังบันทึก...</>
        ) : (
          <><BookMarked size={20} /> ส่งคำขอคืนหนังสือ</>
        )}
      </button>
    </form>
  );
}