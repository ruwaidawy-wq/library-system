"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Loader2, ShieldCheck } from "lucide-react";
import { statsApi, PublicLibraryStats } from "@/lib/gas";
import { ALL_ROOMS } from "@/lib/rooms";
import CoverageDonut from "@/components/CoverageDonut";

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

  const totalRoomsCount = Object.keys(ALL_ROOMS).length;
  const roomsWithRegistryCount = data?.roomsWithRegistryCount || 0;
  const roomCoveragePercent = totalRoomsCount > 0
    ? Math.round((roomsWithRegistryCount / totalRoomsCount) * 100)
    : 0;

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
          {/* ภาพรวม */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
              <CoverageDonut percent={roomCoveragePercent} />
              <div>
                <p className="text-xs text-slate-500">ห้องที่มีแหล่งเรียนรู้แล้ว</p>
                <p className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
                  {roomsWithRegistryCount} <span className="text-slate-400 font-normal text-sm">จาก {totalRoomsCount} ห้อง</span>
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-center">
              <p className="text-xs text-slate-500 mb-1">แหล่งเรียนรู้ทั้งหมด</p>
              <p className="text-3xl font-bold" style={{ color: "#065f46" }}>{data?.learningResourceTotal ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-center">
              <p className="text-xs text-slate-500 mb-1">การเข้าใช้บริการห้องสมุด</p>
              <p className="text-3xl font-bold" style={{ color: "#3b82f6" }}>{data?.libraryUsageTotal ?? 0}</p>
            </div>
          </div>

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
              <div className="space-y-3">
                {roomRows.map(([room, count]) => (
                  <div key={room} title={`${room}: ${count} ครั้ง`} className="group">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-sm text-slate-700 truncate">{room}</span>
                      <span className="text-xs font-bold shrink-0" style={{ color: "#1e3a5f" }}>{count} ครั้ง</span>
                    </div>
                    <div className="relative h-4 rounded-md bg-slate-100 overflow-hidden">
                      <div className="absolute inset-y-0 left-1/4 w-px bg-white/70" />
                      <div className="absolute inset-y-0 left-1/2 w-px bg-white/70" />
                      <div className="absolute inset-y-0 left-3/4 w-px bg-white/70" />
                      <div
                        className="relative h-full rounded-md transition-all group-hover:opacity-80"
                        style={{
                          width: `${Math.max(4, (count / maxRoomCount) * 100)}%`,
                          background: "linear-gradient(90deg, #2d5a8e, #1e3a5f)",
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
                <div className="relative flex items-end gap-1.5 h-40 border-b-2 border-slate-300">
                  <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />
                  <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-200" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />
                  <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-200" />
                  {months.map((m) => (
                    <div key={m.month} title={`${monthLabel(m.month)}: ${m.count} ครั้ง`}
                      className="relative flex-1 h-full flex flex-col justify-end items-center group">
                      <span className="text-[10px] font-bold mb-1" style={{ color: "#065f46" }}>
                        {m.count > 0 ? m.count : ""}
                      </span>
                      <div
                        className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
                        style={{
                          height: `${(m.count / maxMonthCount) * 100}%`,
                          background: "linear-gradient(180deg, #059669, #065f46)",
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
