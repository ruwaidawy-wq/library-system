"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { libraryApi, BorrowLog } from "@/lib/gas";

export default function BorrowLogTable() {
  const [logs, setLogs] = useState<BorrowLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await libraryApi.getBorrowLog();
    if (res.success && res.data) setLogs(res.data.reverse());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statusColor = (status: string) => {
    if (status === "ยืมอยู่") return { bg: "#dbeafe", text: "#1d4ed8" };
    if (status === "คืนแล้ว") return { bg: "#dcfce7", text: "#15803d" };
    if (status === "หนังสือหาย") return { bg: "#fee2e2", text: "#b91c1c" };
    return { bg: "#fef3c7", text: "#92400e" };
  };

  const payColor = (status?: string) => {
    if (status === "ชำระแล้ว") return { bg: "#dcfce7", text: "#15803d" };
    if (status === "ยังไม่ชำระ") return { bg: "#fee2e2", text: "#b91c1c" };
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <ClipboardList size={20} /> ประวัติการยืม
        </h2>
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-slate-400 py-8">ยังไม่มีประวัติการยืม</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const colors = statusColor(log.สถานะ);
            const payColors = payColor(log.สถานะชำระ);
            const isOverdue = log.สถานะ === "ยืมอยู่" && new Date(log.กำหนดคืน) < new Date();
            const hasFine = log.ค่าปรับ > 0;
            return (
              <div key={log.ID}
                className={`border rounded-xl p-4 ${isOverdue ? "border-red-300 bg-red-50" : "border-slate-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{log.ชื่อผู้ยืม}</p>
                    <p className="text-sm text-slate-500">รหัส: {log.รหัสหนังสือ}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      ยืม: {new Date(log.วันยืม).toLocaleDateString("th-TH")} |{" "}
                      กำหนดคืน: {new Date(log.กำหนดคืน).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: colors.bg, color: colors.text }}>
                      {log.สถานะ}
                    </span>
                    {hasFine && (
                      <span className="text-xs font-bold text-red-600">
                        ค่าปรับ: {log.ค่าปรับ} บาท
                      </span>
                    )}
                    {hasFine && payColors && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: payColors.bg, color: payColors.text }}>
                        {log.สถานะชำระ}
                      </span>
                    )}
                    {hasFine && !log.สถานะชำระ && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: "#fee2e2", color: "#b91c1c" }}>
                        ยังไม่ชำระ
                      </span>
                    )}
                    {isOverdue && (
                      <span className="text-xs text-red-500 font-medium">⚠ เกินกำหนด!</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}