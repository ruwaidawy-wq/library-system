"use client";
import Link from "next/link";
import { BookOpen, GraduationCap, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6">
      {/* Header */}
<div className="text-center mb-12 animate-fade-in">
  <img
    src="https://i.postimg.cc/Vvvyp9Df/logo-resized.png"
    alt="โลโก้โรงเรียน"
    className="w-24 h-24 object-contain mx-auto mb-4"
  />
  <h1 className="font-prompt text-4xl font-bold text-slate-800 mb-3">
    ระบบห้องสมุด & แหล่งเรียนรู้
  </h1>
  <p className="text-slate-500 text-lg">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
  <p className="text-slate-400 text-sm mt-1">เลือกโซนที่ต้องการเข้าใช้งาน</p>
</div>

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* Library Zone */}
        <Link href="/library" className="group">
          <div
            className="rounded-3xl p-8 text-white cursor-pointer transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 animate-fade-in animate-delay-100"
            style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #4a90d9 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <BookOpen size={32} className="text-white" />
              </div>
              <ChevronRight
                size={24}
                className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </div>
            <h2 className="font-prompt text-2xl font-bold mb-2">งานห้องสมุด</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              ยืม-คืนหนังสือ ตรวจสอบหนังสือค้างยืม
              <br />
              และบริหารจัดการคลังหนังสือ
            </p>
            <div className="mt-6 flex gap-3">
              {["ยืมหนังสือ", "คืนหนังสือ", "ค่าปรับ"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-white/20 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>

        {/* Learning Center Zone */}
        <Link href="/learning-center" className="group">
          <div
            className="rounded-3xl p-8 text-white cursor-pointer transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2 animate-fade-in animate-delay-200"
            style={{
              background: "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={32} className="text-white" />
              </div>
              <ChevronRight
                size={24}
                className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </div>
            <h2 className="font-prompt text-2xl font-bold mb-2">แหล่งเรียนรู้</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              เช็คอินเข้าแหล่งเรียนรู้ ดูกิจกรรม
              <br />
              และติดตามอันดับแหล่งเรียนรู้ที่ใช้งานสูงสุด
            </p>
            <div className="mt-6 flex gap-3">
              {["เช็คอิน", "กิจกรรม", "Leaderboard"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-white/20 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-12 text-slate-400 text-sm animate-fade-in animate-delay-300">
        ระบบจัดการห้องสมุดและแหล่งเรียนรู้ • โครงการ Learning space for all งานห้องสมุดและแหล่งเรียนรู้ ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา
      </p>
    </div>
  );
}
