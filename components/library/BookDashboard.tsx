"use client";
import { useEffect, useState } from "react";
import { Search, Loader2, RefreshCw, BookOpen, CheckCircle, Clock3, AlertTriangle } from "lucide-react";
import { libraryApi, Book, BorrowLog } from "@/lib/gas";

export default function BookDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [logs, setLogs] = useState<BorrowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [booksRes, logsRes] = await Promise.all([
      libraryApi.getBooks(),
      libraryApi.getBorrowLog(),
    ]);
    if (booksRes.success && booksRes.data) setBooks(booksRes.data);
    if (logsRes.success && logsRes.data) setLogs(logsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // สำหรับหนังสือที่ถูกยืม/รอยืมอยู่ หาเจ้าของรายการล่าสุดเพื่อแสดงชื่อผู้ยืม/กำหนดคืน
  const activeLogByBook = new Map<string, BorrowLog>();
  logs.forEach((log) => {
    if (log.สถานะ === "ยืมอยู่" || log.สถานะ === "รอยืม" || log.สถานะ === "รอคืน") {
      activeLogByBook.set(log.รหัสหนังสือ, log);
    }
  });

  const total = books.length;
  const available = books.filter((b) => b["สถานะ"] === "ว่างอยู่").length;
  const borrowed = books.filter((b) => activeLogByBook.has(b.ID)).length;
  const overdue = books.filter((b) => {
    const log = activeLogByBook.get(b.ID);
    return log && log.สถานะ === "ยืมอยู่" && new Date(log.กำหนดคืน) < new Date();
  }).length;

  const filteredBooks = books.filter(
    (b) => b.ชื่อหนังสือ?.includes(query) || b.ID?.toLowerCase().includes(query.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "ว่างอยู่") return { bg: "#dcfce7", text: "#15803d" };
    if (status === "รอยืม") return { bg: "#f3e8ff", text: "#7c3aed" };
    if (status === "ชำรุด") return { bg: "#fee2e2", text: "#b91c1c" };
    return { bg: "#dbeafe", text: "#1d4ed8" }; // ถูกยืม
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <BookOpen size={20} /> รายการหนังสือ
        </h2>
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "หนังสือทั้งหมด", value: total, color: "#1e3a5f", icon: <BookOpen size={18} /> },
              { label: "ว่างอยู่", value: available, color: "#15803d", icon: <CheckCircle size={18} /> },
              { label: "ถูกยืม/รอยืม", value: borrowed, color: "#1d4ed8", icon: <Clock3 size={18} /> },
              { label: "เกินกำหนด", value: overdue, color: "#b91c1c", icon: <AlertTriangle size={18} /> },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-1.5 mb-1" style={{ color: s.color }}>
                  {s.icon}
                  <span className="text-xs font-medium text-slate-500">{s.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
              placeholder="ค้นหาชื่อหนังสือ หรือรหัส..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Book list */}
          {filteredBooks.length === 0 ? (
            <p className="text-center text-slate-400 py-8">ไม่พบหนังสือ</p>
          ) : (
            <div className="space-y-2 max-h-[28rem] overflow-y-auto">
              {filteredBooks.map((book) => {
                const status = book["สถานะ"];
                const colors = statusColor(status);
                const activeLog = activeLogByBook.get(book.ID);
                const isOverdue = !!activeLog && activeLog.สถานะ === "ยืมอยู่" && new Date(activeLog.กำหนดคืน) < new Date();
                return (
                  <div key={book.ID}
                    className={`border rounded-xl p-3 ${isOverdue ? "border-red-300 bg-red-50" : "border-slate-100"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{book.ชื่อหนังสือ}</p>
                        <p className="text-xs text-slate-400">รหัส: {book.ID}</p>
                        {activeLog && (
                          <p className="text-xs text-slate-500 mt-1">
                            ผู้ยืม: {activeLog.ชื่อผู้ยืม} | กำหนดคืน: {new Date(activeLog.กำหนดคืน).toLocaleDateString("th-TH")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                          style={{ background: colors.bg, color: colors.text }}>
                          {status || "ไม่ทราบสถานะ"}
                        </span>
                        {isOverdue && (
                          <span className="text-xs text-red-500 font-medium">⚠ เกินกำหนด</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
