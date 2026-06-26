"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, QrCode } from "lucide-react";
import Link from "next/link";
import { learningApi, activityApi, CheckIn, Activity, LeaderboardEntry } from "@/lib/gas";
import StatsCard from "@/components/StatsCard";
import Gallery from "@/components/Gallery";

const ROOMS = Array.from({ length: 10 }, (_, i) => `${Math.floor(i / 3) + 1}/${(i % 3) + 1}`);

export default function LearningCenterPage() {
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roomStats, setRoomStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    learningApi.getLeaderboard().then((r) => { if (r.data) setLeaderboard(r.data); });
    learningApi.getAllRoomsStats().then((r) => { if (r.data) setRoomStats(r.data); });
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      learningApi.getCheckInsByRoom(activeRoom),
activityApi.getActivitiesByRoom(activeRoom),
    ]).then(([ci, act]) => {
      if (ci.data) setCheckins(ci.data);
      if (act.data) setActivities(act.data);
      setLoading(false);
    });
  }, [activeRoom]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Link
          href="/"
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-prompt text-2xl font-bold" style={{ color: "var(--learn-primary)" }}>
            แหล่งเรียนรู้
          </h1>
          <p className="text-slate-500 text-sm">ติดตามการใช้งานห้องเรียน</p>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="card p-5 mb-6 animate-fade-in animate-delay-100">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} style={{ color: "var(--learn-primary)" }} />
            <h2 className="font-prompt font-semibold text-lg" style={{ color: "var(--learn-primary)" }}>
              Top 3 ห้องเรียนยอดนิยม
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.room}
                className="rounded-2xl p-4 text-center text-white"
                style={{
                  background: i === 0
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : i === 1
                    ? "linear-gradient(135deg, #94a3b8, #64748b)"
                    : "linear-gradient(135deg, #cd7c4a, #a86134)",
                }}
              >
                <div className="text-2xl mb-1">{medals[i]}</div>
                <p className="font-prompt font-bold text-sm">ห้อง {entry.room}</p>
                <p className="text-xs opacity-80">{entry.count} ครั้ง</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code hint */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in animate-delay-200"
        style={{ background: "var(--learn-light)", border: "2px solid var(--learn-accent)" }}
      >
        <QrCode size={24} style={{ color: "var(--learn-primary)" }} />
        <div>
          <p className="font-medium text-sm" style={{ color: "var(--learn-primary)" }}>
            เช็คอินด้วย QR Code
          </p>
          <p className="text-xs text-slate-500">
            สแกน QR Code หน้าห้องเรียนเพื่อเช็คอินอัตโนมัติ: <code>/checkin/[ห้อง]</code>
          </p>
        </div>
      </div>

      {/* Room Tabs */}
      <div className="animate-fade-in animate-delay-300">
        <p className="text-sm font-medium text-slate-500 mb-3">เลือกห้องเรียน</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all relative"
              style={
                activeRoom === room
                  ? { background: "var(--learn-primary)", color: "white" }
                  : { background: "white", color: "var(--learn-primary)", border: "2px solid var(--learn-light)" }
              }
            >
              ห้อง {room}
              {roomStats[room] > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-xs w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: "var(--learn-secondary)", fontSize: "10px" }}
                >
                  {roomStats[room] > 9 ? "9+" : roomStats[room]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Room Content */}
        {loading ? (
          <div className="card p-8 text-center text-slate-400">กำลังโหลด...</div>
        ) : (
          <div className="space-y-5">
            <StatsCard
              room={activeRoom}
              count={checkins.length}
              checkins={checkins}
            />
            <Gallery activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
}
