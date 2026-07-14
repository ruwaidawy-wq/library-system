import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ระบบห้องสมุดและแหล่งเรียนรู้",
  description: "ระบบจัดการห้องสมุดและแหล่งเรียนรู้ในโรงเรียน",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sarabun antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="no-print text-center text-xs text-slate-400 py-4">
          พัฒนาโดย นางสาวรูวัยดา หวังยี ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา
        </footer>
      </body>
    </html>
  );
}