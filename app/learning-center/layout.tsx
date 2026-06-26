import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แหล่งเรียนรู้ | ระบบห้องสมุด",
};

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="zone-learn min-h-screen" style={{ background: "var(--zone-bg)" }}>
      {children}
    </div>
  );
}
