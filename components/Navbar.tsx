"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Home, Lock } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isLibrary = pathname.startsWith("/library");
  const isLearning = pathname.startsWith("/learning-center") || pathname.startsWith("/checkin");
  const isAdmin = pathname.startsWith("/admin");

  const bgColor = isLibrary
    ? "#1e3a5f"
    : isLearning
    ? "#065f46"
    : isAdmin
    ? "#1a202c"
    : "#1a202c";

  const zoneLabel = isLibrary
    ? "งานห้องสมุด"
    : isLearning
    ? "แหล่งเรียนรู้"
    : isAdmin
    ? "Admin Panel"
    : "หน้าหลัก";

  const navLinks = [
    { href: "/library", label: "ห้องสมุด", icon: <BookOpen size={14} />, active: isLibrary },
    { href: "/learning-center", label: "แหล่งเรียนรู้", icon: <GraduationCap size={14} />, active: isLearning },
    { href: "/admin", label: "Admin", icon: <Lock size={14} />, active: isAdmin },
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ background: bgColor }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold">
          {isLibrary ? (
            <BookOpen size={20} />
          ) : isLearning ? (
            <GraduationCap size={20} />
          ) : isAdmin ? (
            <Lock size={20} />
          ) : (
            <Home size={20} />
          )}
          <span className="text-sm">{zoneLabel}</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                link.active
                  ? { background: "rgba(255,255,255,0.2)", color: "white" }
                  : { color: "rgba(255,255,255,0.6)" }
              }
            >
              {link.icon}
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
