"use client";
import { useState } from "react";
import { BookOpen, BookMarked, ClipboardList, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BorrowForm from "@/components/library/BorrowForm";
import ReturnForm from "@/components/library/ReturnForm";
import BorrowLogTable from "@/components/library/BorrowLogTable";

type Tab = "borrow" | "return" | "log";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("borrow");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "borrow", label: "ยืมหนังสือ", icon: <BookOpen size={20} /> },
    { id: "return", label: "คืนหนังสือ", icon: <BookMarked size={20} /> },
    { id: "log", label: "ประวัติการยืม", icon: <ClipboardList size={20} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Link
          href="/"
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-prompt text-2xl font-bold" style={{ color: "var(--library-primary)" }}>
            งานห้องสมุด
          </h1>
          <p className="text-slate-500 text-sm">ยืม-คืนหนังสือ และบริหารจัดการ</p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-2xl p-1 mb-6 animate-fade-in animate-delay-100"
        style={{ background: "var(--library-light)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-200"
            style={
              activeTab === tab.id
                ? {
                    background: "var(--library-primary)",
                    color: "white",
                    boxShadow: "0 2px 12px rgba(30,58,95,0.25)",
                  }
                : { color: "var(--library-primary)", opacity: 0.7 }
            }
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in animate-delay-200">
        {activeTab === "borrow" && <BorrowForm />}
        {activeTab === "return" && <ReturnForm />}
        {activeTab === "log" && <BorrowLogTable />}
      </div>
    </div>
  );
}
