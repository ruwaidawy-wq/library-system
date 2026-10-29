"use client";
import { useState } from "react";
import { BarChart3, Printer } from "lucide-react";
import { ALL_ROOMS } from "@/lib/rooms";
import { openPrintWindow, escapeHtml } from "@/lib/htmlUtils";

const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";
// ห้องเรียนในศูนย์ฯ ที่พานักเรียนมาใช้ห้องสมุด (ห้อง ๑๐ ขึ้นไปเป็นหน่วยบริการนอกศูนย์)
const ROOM_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function monthKeyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}

// 12 เดือนล่าสุด (เดือนปัจจุบันก่อน)
function recentMonths() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => monthKeyOf(new Date(now.getFullYear(), now.getMonth() - i, 1)));
}

export default function LibraryRoomVisits({ visits, loading }: {
  visits: Record<string, Record<string, number>> | undefined;
  loading?: boolean;
}) {
  const months = recentMonths();
  const [month, setMonth] = useState(months[0]);

  const counts = visits?.[month] || {};
  const rows = ROOM_NUMBERS.map((n) => ({ n, name: ALL_ROOMS[`room-${n}`] || `ห้องเรียน ${n}`, count: counts[n] || 0 }));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const max = Math.max(1, ...rows.map((r) => r.count));

  function handlePrint() {
    const body = rows.map((r, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${escapeHtml(r.name)}</td>
        <td style="text-align:center">${r.count}</td>
      </tr>
    `).join("");
    openPrintWindow(`
      <html>
      <head>
        <meta charset="utf-8">
        <title>สถิติการเข้าใช้ห้องสมุด ${monthLabel(month)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #1a202c; }
          .header { text-align: center; margin-bottom: 12px; }
          .header img { width: 64px; height: 64px; object-fit: contain; }
          .header p { font-size: 15px; font-weight: 700; margin: 4px 0 0; }
          .divider { border-top: 3px solid #1e3a5f; border-bottom: 1px solid #1e3a5f; margin: 12px 0 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          td { border: 1px solid #000; padding: 6px 8px; }
          thead td, tfoot td { background: #f0f4f8; font-weight: 700; }
          thead td { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" alt="logo" />
          <p>สถิติการเข้าใช้ห้องสมุดของห้องเรียน ๑-๙</p>
          <p>ประจำเดือน ${monthLabel(month)}</p>
          <p>ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        </div>
        <div class="divider"></div>
        <table>
          <thead><tr><td style="width:12%">ลำดับ</td><td>ห้องเรียน</td><td style="width:25%">จำนวนครั้งที่เข้าใช้</td></tr></thead>
          <tbody>${body}</tbody>
          <tfoot><tr><td colspan="2" style="text-align:center">รวม</td><td style="text-align:center">${total}</td></tr></tfoot>
        </table>
      </body>
      </html>
    `);
  }

  return (
    <div className="bg-white rounded-3xl shadow p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="font-prompt font-bold text-lg flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <BarChart3 size={20} /> สถิติการเข้าใช้ห้องสมุด ห้องเรียน ๑-๙
        </h2>
        <div className="flex items-center gap-2">
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="text-sm px-3 py-1.5 border-2 border-slate-200 rounded-xl bg-white outline-none focus:border-blue-400">
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button type="button" onClick={handlePrint} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-blue-400 text-xs disabled:opacity-40">
            <Printer size={14} /> พิมพ์
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        จำนวนครั้งที่แต่ละห้องเรียนพานักเรียนมาใช้ห้องสมุด นับจากบันทึกกิจกรรมห้องสมุดมีชีวิตของนักเรียน
      </p>

      {loading ? (
        <div className="space-y-2">
          {ROOM_NUMBERS.map((n) => <div key={n} className="h-7 rounded-lg bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.n} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-600">{r.name}</span>
                <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all duration-500"
                    style={{ width: `${(r.count / max) * 100}%`, background: "linear-gradient(90deg, #1e3a5f, #4a90d9)" }} />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-semibold" style={{ color: "#1e3a5f" }}>
                  {r.count} ครั้ง
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500">รวมทั้งเดือน {monthLabel(month)}</span>
            <span className="font-bold" style={{ color: "#1e3a5f" }}>{total} ครั้ง</span>
          </div>
        </>
      )}
    </div>
  );
}
