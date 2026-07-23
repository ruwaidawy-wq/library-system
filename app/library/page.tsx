"use client";
import { useState, useEffect } from "react";
import { BookOpen, BookMarked, ClipboardList, ArrowLeft, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Sparkles } from "lucide-react";
import Link from "next/link";
import BorrowForm from "@/components/library/BorrowForm";
import ReturnForm from "@/components/library/ReturnForm";
import BorrowLogTable from "@/components/library/BorrowLogTable";
import BookDashboard from "@/components/library/BookDashboard";
import LibraryActivityForm from "@/components/library/LibraryActivityForm";
import { libraryApi, BorrowLog } from "@/lib/gas";

type View = "dashboard" | "borrow" | "return" | "log" | "books" | "activity";

export default function LibraryPage() {
  const [view, setView] = useState<View>("dashboard");
  const [logs, setLogs] = useState<BorrowLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    libraryApi.getBorrowLog().then((r) => {
      if (r.success && r.data) setLogs(r.data);
      setLoading(false);
    });
  }, []);

  const total = logs.length;
  const borrowing = logs.filter(l => l.สถานะ === "ยืมอยู่").length;
  const pending = logs.filter(l => l.สถานะ === "รอยืม" || l.สถานะ === "รอคืน").length;
  const returned = logs.filter(l => l.สถานะ === "คืนแล้ว").length;
  const overdue = logs.filter(l => l.สถานะ === "ยืมอยู่" && new Date(l.กำหนดคืน) < new Date()).length;
  const totalFine = logs.reduce((sum, l) => sum + (Number(l.ค่าปรับ) || 0), 0);
  const unpaid = logs.filter(l => l.ค่าปรับ > 0 && l.สถานะชำระ !== "ชำระแล้ว").length;
  const recentLogs = [...logs].reverse().slice(0, 5);

  if (view === "borrow") return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setView("dashboard")}
        className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </button>
      <BorrowForm />
    </div>
  );

  if (view === "return") return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setView("dashboard")}
        className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </button>
      <ReturnForm />
    </div>
  );

  if (view === "log") return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setView("dashboard")}
        className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </button>
      <BorrowLogTable />
    </div>
  );

  if (view === "books") return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setView("dashboard")}
        className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </button>
      <BookDashboard />
    </div>
  );

  if (view === "activity") return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setView("dashboard")}
        className="no-print flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </button>
      <LibraryActivityForm />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/"
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>งานห้องสมุด</h1>
          <p className="text-slate-400 text-sm">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <button onClick={() => setView("borrow")}
          className="rounded-2xl p-5 text-white flex flex-col items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}>
          <BookOpen size={28} />
          <span className="font-semibold text-sm">ยืมหนังสือ</span>
        </button>
        <button onClick={() => setView("return")}
          className="rounded-2xl p-5 text-white flex flex-col items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
          <BookMarked size={28} />
          <span className="font-semibold text-sm">คืนหนังสือ</span>
        </button>
        <button onClick={() => setView("books")}
          className="rounded-2xl p-5 text-white flex flex-col items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
          <BookOpen size={28} />
          <span className="font-semibold text-sm">รายการหนังสือ</span>
        </button>
        <button onClick={() => setView("log")}
          className="rounded-2xl p-5 text-white flex flex-col items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #4a5568, #718096)" }}>
          <ClipboardList size={28} />
          <span className="font-semibold text-sm">ประวัติ</span>
        </button>
        <button onClick={() => setView("activity")}
          className="rounded-2xl p-5 text-white flex flex-col items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, #b45309, #f59e0b)" }}>
          <Sparkles size={28} />
          <span className="font-semibold text-sm">ห้องสมุดมีชีวิต</span>
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "ยืมทั้งหมด", value: total, color: "#1e3a5f", icon: <BookOpen size={20} /> },
              { label: "ยืมอยู่", value: borrowing, color: "#3b82f6", icon: <TrendingUp size={20} /> },
              { label: "รอดำเนินการ", value: pending, color: "#f59e0b", icon: <Clock size={20} /> },
              { label: "คืนแล้ว", value: returned, color: "#10b981", icon: <CheckCircle size={20} /> },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                  {s.icon}
                  <span className="text-xs font-medium text-slate-500">{s.label}</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`rounded-2xl p-4 ${overdue > 0 ? "bg-red-50 border-2 border-red-200" : "bg-slate-50 border border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={18} className={overdue > 0 ? "text-red-500" : "text-slate-400"} />
                <span className="text-sm font-medium text-slate-600">เกินกำหนด</span>
              </div>
              <p className={`text-3xl font-bold ${overdue > 0 ? "text-red-600" : "text-slate-400"}`}>{overdue}</p>
              <p className="text-xs text-slate-400 mt-1">รายการ</p>
            </div>
            <div className={`rounded-2xl p-4 ${unpaid > 0 ? "bg-amber-50 border-2 border-amber-200" : "bg-slate-50 border border-slate-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={18} className={unpaid > 0 ? "text-amber-500" : "text-slate-400"} />
                <span className="text-sm font-medium text-slate-600">ค่าปรับค้างชำระ</span>
              </div>
              <p className={`text-3xl font-bold ${unpaid > 0 ? "text-amber-600" : "text-slate-400"}`}>{unpaid}</p>
              <p className="text-xs text-slate-400 mt-1">รายการ (รวม {totalFine} บาท)</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-semibold text-lg mb-4" style={{ color: "#1e3a5f" }}>
              รายการล่าสุด
            </h2>
            {recentLogs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">ยังไม่มีรายการ</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => {
                  const isOverdue = log.สถานะ === "ยืมอยู่" && new Date(log.กำหนดคืน) < new Date();
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    "ยืมอยู่": { bg: "#dbeafe", text: "#1d4ed8" },
                    "รอยืม": { bg: "#f3e8ff", text: "#7c3aed" },
                    "รอคืน": { bg: "#fef3c7", text: "#92400e" },
                    "คืนแล้ว": { bg: "#dcfce7", text: "#15803d" },
                    "หนังสือหาย": { bg: "#fee2e2", text: "#b91c1c" },
                  };
                  const c = statusColors[log.สถานะ] || { bg: "#f1f5f9", text: "#64748b" };
                  return (
                    <div key={log.ID}
                      className={`flex items-center justify-between p-3 rounded-xl border ${isOverdue ? "border-red-200 bg-red-50" : "border-slate-100"}`}>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{log.ชื่อผู้ยืม}</p>
                        <p className="text-xs text-slate-400">รหัส: {log.รหัสหนังสือ} | กำหนดคืน: {new Date(log.กำหนดคืน).toLocaleDateString("th-TH")}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ background: c.bg, color: c.text }}>
                          {log.สถานะ}
                        </span>
                        {log.ค่าปรับ > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            ค่าปรับ {log.ค่าปรับ} บาท
                          </span>
                        )}
                        {isOverdue && <span className="text-xs text-red-500">⚠ เกินกำหนด</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {logs.length > 5 && (
              <button onClick={() => setView("log")}
                className="w-full mt-3 py-2 text-sm font-medium rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
                ดูทั้งหมด ({logs.length} รายการ)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}