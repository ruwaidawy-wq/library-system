"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Loader2, ShieldCheck } from "lucide-react";
import { statsApi, PublicLibraryStats } from "@/lib/gas";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${THAI_MONTHS_SHORT[m - 1]} ${String(y + 543).slice(-2)}`;
}

export default function LibraryStatsPublicPage() {
  const [data, setData] = useState<PublicLibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    statsApi.getPublicLibraryStats().then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "โหลดข้อมูลไม่สำเร็จ");
      }
      setLoading(false);
    });
  }, []);

  const roomRows = data
    ? Object.entries(data.roomUsage).sort((a, b) => b[1] - a[1])
    : [];
  const maxRoomCount = roomRows.length > 0 ? roomRows[0][1] : 0;

  const months = data?.teacherMonthlyFrequency || [];
  const maxMonthCount = Math.max(1, ...months.map((m) => m.count));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl leading-tight" style={{ color: "#1e3a5f" }}>
            สถิติการเข้าใช้แหล่งเรียนรู้และห้องสมุด
          </h1>
          <p className="text-slate-400 text-xs">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-4 py-3 mb-6 text-xs text-slate-500">
        <ShieldCheck size={16} className="shrink-0" style={{ color: "#1e3a5f" }} />
        หน้านี้แสดงเฉพาะจำนวนครั้งการเข้าใช้บริการโดยรวม ไม่มีการเปิดเผยชื่อผู้เข้าใช้บริการรายบุคคล
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-red-700 text-sm">{error}</div>
      ) : (
        <>
          {/* จำนวนครั้งที่เข้าใช้แต่ละห้องเรียน/แหล่งเรียนรู้ */}
          <div className="bg-white rounded-2xl shadow p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} style={{ color: "#1e3a5f" }} />
              <h2 className="font-semibold text-base" style={{ color: "#1e3a5f" }}>
                จำนวนครั้งที่เข้าใช้แต่ละห้องเรียน/แหล่งเรียนรู้
              </h2>
            </div>
            {roomRows.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีข้อมูลการเข้าใช้</p>
            ) : (
              <div className="space-y-2.5">
                {roomRows.map(([room, count]) => (
                  <div key={room} title={`${room}: ${count} ครั้ง`}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-sm text-slate-700 truncate">{room}</span>
                      <span className="text-xs font-semibold text-slate-500 shrink-0">{count} ครั้ง</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, (count / maxRoomCount) * 100)}%`,
                          background: "#1e3a5f",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ความถี่การเข้าใช้ของครู รายเดือน (ไม่ระบุชื่อ) */}
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} style={{ color: "#065f46" }} />
              <h2 className="font-semibold text-base" style={{ color: "#065f46" }}>
                ความถี่การเข้าใช้ของครู รายเดือน
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">นับเฉพาะจำนวนครั้ง ไม่ระบุชื่อครู • ย้อนหลัง 12 เดือน</p>
            {months.every((m) => m.count === 0) ? (
              <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีข้อมูลการเข้าใช้</p>
            ) : (
              <>
                <div className="flex items-end gap-1.5 h-32">
                  {months.map((m) => (
                    <div key={m.month} title={`${monthLabel(m.month)}: ${m.count} ครั้ง`}
                      className="flex-1 h-full flex flex-col justify-end items-center group">
                      <span className="text-[10px] font-semibold text-slate-500 mb-1">
                        {m.count > 0 ? m.count : ""}
                      </span>
                      <div
                        className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
                        style={{
                          height: `${(m.count / maxMonthCount) * 100}%`,
                          background: "#065f46",
                          minHeight: m.count > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {months.map((m) => (
                    <div key={m.month} className="flex-1 text-center">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{monthLabel(m.month)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
