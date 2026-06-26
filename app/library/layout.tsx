import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "งานห้องสมุด | ระบบห้องสมุด",
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="zone-library min-h-screen" style={{ background: "var(--zone-bg)" }}>
      {children}
    </div>
  );
}
