"use client";
import { Users, Clock } from "lucide-react";

interface CheckIn {
  RoomNumber: string;
  ชื่อครู: string;
  ชื่อนักเรียน: string;
  สิ่งที่ได้รับ: string;
  Timestamp: string;
}

interface Props {
  room: string;
  count: number;
  checkins: CheckIn[];
}

export default function StatsCard({ room, count, checkins }: Props) {
  const received = checkins.filter((c) => c.สิ่งที่ได้รับ).map((c) => c.สิ่งที่ได้รับ);
  const uniqueReceived = Array.from(new Set(received));
  const recent = checkins.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "#065f46" }}>
          ห้อง {room}
        </h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-sm font-medium" style={{ background: "#065f46" }}>
          <Users size={16} />
          {count} ครั้ง
        </div>
      </div>

      {uniqueReceived.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">สิ่งที่ได้รับ</p>
          <div className="flex flex-wrap gap-2">
            {uniqueReceived.map((item) => (
              <span key={item} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#065f46" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 ? (
        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1">
            <Clock size={12} /> การเข้าใช้ล่าสุด
          </p>
          <div className="space-y-2">
            {recent.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                <div>
                  <span className="font-medium text-slate-700">{c.ชื่อนักเรียน}</span>
                  <span className="text-slate-400 text-xs ml-2">โดย {c.ชื่อครู}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {c.Timestamp ? new Date(c.Timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-4">ยังไม่มีการเข้าใช้</p>
      )}
    </div>
  );
}