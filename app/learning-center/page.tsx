"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Users, TrendingUp, Calendar, Search } from "lucide-react";
import Link from "next/link";
import { learningApi, LeaderboardEntry } from "@/lib/gas";

const ALL_ROOMS = [
  { id: "room-1", name: "ห้องเรียน ๑" },
  { id: "room-2", name: "ห้องเรียน ๒" },
  { id: "room-3", name: "ห้องเรียน ๓" },
  { id: "room-4", name: "ห้องเรียน ๔" },
  { id: "room-5", name: "ห้องเรียน ๕" },
  { id: "room-6", name: "ห้องเรียน ๖" },
  { id: "room-7", name: "ห้องเรียน ๗" },
  { id: "room-8", name: "ห้องเรียน ๘" },
  { id: "room-9", name: "ห้องเรียน ๙" },
  { id: "room-10", name: "ห้องเรียน ๑๐ (หน่วยบริการสทิงพระ)" },
  { id: "room-11", name: "ห้องเรียน ๑๑ (หน่วยบริการสิงหนคร)" },
  { id: "room-12", name: "ห้องเรียน ๑๒ (หน่วยบริการหาดใหญ่)" },
  { id: "room-13", name: "ห้องเรียน ๑๓ (หน่วยบริการเทพา)" },
  { id: "room-14", name: "ห้องเรียน ๑๔ (หน่วยบริการสะบ้าย้อย)" },
  { id: "room-15", name: "ห้องเรียน ๑๕ (หน่วยบริการระโนด)" },
  { id: "room-pt", name: "ห้องกายภาพบำบัด" },
  { id: "room-thai", name: "ห้องแพทย์แผนไทย" },
  { id: "room-sport", name: "ห้องกิจกรรมการฟื้นฟูสมรรถภาพ การกีฬา" },
  { id: "room-art", name: "ห้องศิลปะบำบัด" },
  { id: "room-speech", name: "ห้องอรรถบำบัด" },
  { id: "room-career", name: "ห้องฝึกทักษะพื้นฐานอาชีพ" },
  { id: "room-music", name: "ห้องดนตรี" },
  { id: "room-ot", name: "ห้องกิจกรรมบำบัด" },
  { id: "room-autism1", name: "ห้องเรียนคู่ขนานบุคคลออทิสติกโรงเรียนเทศบาล 2(บ้านหาดใหญ่)" },
  { id: "room-autism2", name: "ห้องเรียนคู่ขนานบุคคลออทิสติกโรงเรียนวัดเจริญภูผา" },
  { id: "room-autism3", name: "ห้องเรียนคู่ขนานบุคคลออทิสติกโรงเรียนบ้านทำเนียบ" },
  { id: "room-ict", name: "ศูนย์เทคโนโลยีสารสนเทศเด็กเจ็บป่วยในโรงพยาบาลหาดใหญ่" },
  { id: "room-16", name: "ห้องเรียน ๑๖ (หน่วยบริการเมืองสงขลา)" },
  { id: "room-17", name: "ห้องเรียน ๑๗ (หน่วยบริการคลองหอยโข่ง)" },
  { id: "room-18", name: "ห้องเรียน ๑๘ (หน่วยบริการสะเดา)" },
  { id: "room-19", name: "ห้องเรียน ๑๙ (หน่วยบริการนาหม่อม)" },
  { id: "room-20", name: "ห้องเรียน ๒๐ (หน่วยบริการนาทวี)" },
  { id: "room-21", name: "ห้องเรียน ๒๑ (หน่วยบริการควนเนียง)" },
  { id: "room-22", name: "ห้องเรียน ๒๒ (หน่วยบริการบางกล่ำ)" },
  { id: "room-23", name: "ห้องเรียน ๒๓ (หน่วยบริการรัตภูมิ)" },
  { id: "room-24", name: "ห้องเรียน ๒๔ (หน่วยบริการกระแสสินธุ์)" },
];

export default function LearningCenterPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roomStats, setRoomStats] = useState<Record<string, number>>({});
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      learningApi.getLeaderboard(),
      learningApi.getAllRoomsStats(),
    ]).then(([lb, stats]) => {
      if (lb.data) setLeaderboard(lb.data);
      if (stats.data) {
        setRoomStats(stats.data);
        const total = Object.values(stats.data).reduce((a: number, b: number) => a + b, 0);
        setTotalCheckins(total);
      }
      setLoadingStats(false);
    });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const activeRooms = Object.keys(roomStats).length;
  const filteredRooms = ALL_ROOMS.filter(r =>
    r.name.includes(searchQuery)
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
          <h1 className="font-bold text-2xl" style={{ color: "#065f46" }}>แหล่งเรียนรู้</h1>
          <p className="text-slate-400 text-sm">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        </div>
      </div>

      {/* Stats */}
      {loadingStats ? (
        <div className="text-center py-6 text-slate-400">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "เข้าใช้ทั้งหมด", value: totalCheckins, color: "#065f46", icon: <Users size={20} /> },
              { label: "ห้องที่ใช้งานแล้ว", value: activeRooms, color: "#3b82f6", icon: <TrendingUp size={20} /> },
              { label: "ห้องทั้งหมด", value: ALL_ROOMS.length, color: "#8b5cf6", icon: <Calendar size={20} /> },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                  {s.icon}
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={20} style={{ color: "#065f46" }} />
                <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>
                  Top 3 ห้องเรียนยอดนิยม
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {leaderboard.map((entry, i) => (
                  <Link
                    key={entry.room}
                    href={`/learning-center/${ALL_ROOMS.find(r => r.name === entry.room)?.id || entry.room}`}
                    className="rounded-2xl p-4 text-center text-white transition-all hover:opacity-90 hover:-translate-y-1 block"
                    style={{
                      background: i === 0
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : i === 1
                        ? "linear-gradient(135deg, #94a3b8, #64748b)"
                        : "linear-gradient(135deg, #cd7c4a, #a86134)",
                    }}>
                    <div className="text-2xl mb-1">{medals[i]}</div>
                    <p className="font-bold text-xs">{entry.room}</p>
                    <p className="text-xs opacity-80">{entry.count} ครั้ง</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-base outline-none focus:border-green-400"
          placeholder="ค้นหาห้องเรียน..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredRooms.map((room) => {
          const count = roomStats[room.name] || 0;
          const isActive = count > 0;
          return (
            <Link
              key={room.id}
              href={`/learning-center/${room.id}`}
              className="bg-white rounded-2xl shadow p-4 hover:shadow-md hover:-translate-y-1 transition-all relative block min-h-[132px]"
            >
              {isActive && (
                <span
                  className="absolute top-2 right-2 text-xs w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "#065f46", fontSize: "10px" }}>
                  {count > 99 ? "99+" : count}
                </span>
              )}
              <div
                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mb-3 text-lg font-bold text-white overflow-hidden"
                style={{ background: isActive ? "linear-gradient(135deg, #065f46, #059669)" : "#e2e8f0" }}>
                <span style={{ color: isActive ? "white" : "#94a3b8", fontSize: "12px" }}>
                  {room.name.match(/^ห้องเรียน\s+([๐-๙0-9]+)/)?.[1] || "🏫"}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-tight line-clamp-2 break-words min-h-[2.5rem]">{room.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {isActive ? `${count} ครั้ง` : "ยังไม่มีการเข้าใช้"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}