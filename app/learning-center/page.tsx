"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, QrCode, Users, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { learningApi, CheckIn, Activity, LeaderboardEntry } from "@/lib/gas";
import { activityApi } from "@/lib/gas";
import StatsCard from "@/components/StatsCard";
import Gallery from "@/components/Gallery";

const ROOMS = [
  "ห้องเรียน 1", "ห้องเรียน 2", "ห้องเรียน 3",
  "ห้องเรียน 4", "ห้องเรียน 5", "ห้องเรียน 6",
  "ห้องเรียน 7", "ห้องเรียน 8", "ห้องเรียน 9",
];

export default function LearningCenterPage() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roomStats, setRoomStats] = useState<Record<string, number>>({});
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [todayCheckins, setTodayCheckins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      learningApi.getLeaderboard(),
      learningApi.getAllRoomsStats(),
    ]).then(([lb, stats]) => {
      if (lb.data) setLeaderboard(lb.data);
      if (stats.data) {
        setRoomStats(stats.data);
        const total = Object.values(stats.data).reduce((a, b) => a + b, 0);
        setTotalCheckins(total);
      }
      setLoadingStats(false);
    });
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    setLoading(true);
    Promise.all([
      learningApi.getCheckInsByRoom(activeRoom),
      activityApi.getActivitiesByRoom(activeRoom),
    ]).then(([ci, act]) => {
      if (ci.data) {
        setCheckins(ci.data);
        const today = new Date().toLocaleDateString("th-TH");
        const todayCount = ci.data.filter(c => {
          const d = new Date(c.Timestamp).toLocaleDateString("th-TH");
          return d === today;
        }).length;
        setTodayCheckins(todayCount);
      }
      if (act.data) setActivities(act.data);
      setLoading(false);
    });
  }, [activeRoom]);

  const medals = ["🥇", "🥈", "🥉"];
  const totalActivities = Object.keys(roomStats).length;

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

      {/* Stats Overview */}
      {loadingStats ? (
        <div className="text-center py-6 text-slate-400">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "เช็คอินทั้งหมด", value: totalCheckins, color: "#065f46", icon: <Users size={20} /> },
              { label: "ห้องที่ใช้งาน", value: totalActivities, color: "#3b82f6", icon: <TrendingUp size={20} /> },
              { label: "วันนี้", value: todayCheckins, color: "#f59e0b", icon: <Calendar size={20} /> },
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
                  <button
                    key={entry.room}
                    onClick={() => setActiveRoom(entry.room)}
                    className="rounded-2xl p-4 text-center text-white transition-all hover:opacity-90 hover:-translate-y-1"
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
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QR Code link */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCode size={24} style={{ color: "#065f46" }} />
              <div>
                <p className="font-medium text-sm" style={{ color: "#065f46" }}>QR Code เช็คอิน</p>
                <p className="text-xs text-slate-500">พิมพ์ QR Code ติดหน้าห้องเรียน</p>
              </div>
            </div>
            <Link href="/qrcode"
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: "#065f46" }}>
              ดู QR Code
            </Link>
          </div>
        </>
      )}

      {/* Room Tabs */}
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500 mb-3">เลือกห้องเรียนเพื่อดูรายละเอียด</p>
        <div className="flex flex-wrap gap-2">
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => setActiveRoom(activeRoom === room ? null : room)}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all relative"
              style={
                activeRoom === room
                  ? { background: "#065f46", color: "white" }
                  : { background: "white", color: "#065f46", border: "2px solid #ecfdf5" }
              }>
              {room.replace("ห้องเตรียมความพร้อม ", "ห้อง ")}
              {roomStats[room] > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-xs w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "#059669", fontSize: "10px" }}>
                  {roomStats[room] > 9 ? "9+" : roomStats[room]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Room Detail */}
      {activeRoom && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg" style={{ color: "#065f46" }}>
              {activeRoom}
            </h2>
            <button onClick={() => setActiveRoom(null)}
              className="text-xs text-slate-400 hover:text-slate-600">
              ปิด ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400">กำลังโหลด...</div>
          ) : (
            <>
              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl shadow p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: "#065f46" }}>{checkins.length}</p>
                  <p className="text-xs text-slate-500 mt-1">เช็คอินทั้งหมด</p>
                </div>
                <div className="bg-white rounded-2xl shadow p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: "#3b82f6" }}>{activities.length}</p>
                  <p className="text-xs text-slate-500 mt-1">บันทึกกิจกรรม</p>
                </div>
              </div>

              <StatsCard room={activeRoom} count={checkins.length} checkins={checkins} />
              <Gallery activities={activities} />
            </>
          )}
        </div>
      )}
    </div>
  );
}