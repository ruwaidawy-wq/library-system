"use client";
import { useEffect, useRef } from "react";

const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";

const ROOMS = [
  "ห้องเรียน 1",
  "ห้องเรียน 2",
  "ห้องเรียน 3",
  "ห้องเรียน 4",
  "ห้องเรียน 5",
  "ห้องเรียน 6",
  "ห้องเรียน 7",
  "ห้องเรียน 8",
  "ห้องเรียน 9",
];

function QRCodeCard({ room, baseUrl }: { room: string; baseUrl: string }) {
  const url = `${baseUrl}/checkin/${encodeURIComponent(room)}`;

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border border-slate-100">
      <img src={LOGO_URL} alt="logo" className="w-12 h-12 object-contain mb-2" />
      <p className="text-xs text-slate-400 mb-1">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
      <p className="font-bold text-slate-800 mb-3" style={{ fontFamily: "Sarabun, sans-serif" }}>
        {room}
      </p>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`}
        alt={`QR ${room}`}
        className="rounded-xl mb-3"
        style={{ width: 180, height: 180 }}
      />
      <p className="text-xs text-slate-400 mb-4">สแกนเพื่อเช็คอินเข้าใช้แหล่งเรียนรู้</p>
      <button
        onClick={() => {
          const w = window.open("", "_blank");
          if (!w) return;
          w.document.write(`
            <html>
            <head>
              <title>QR Code - ${room}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
                body { font-family: 'Sarabun', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: white; }
                .card { text-align: center; padding: 40px; border: 2px solid #e2e8f0; border-radius: 16px; max-width: 320px; }
                img.logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 12px; }
                img.qr { width: 220px; height: 220px; margin: 16px auto; display: block; }
                h1 { font-size: 20px; font-weight: 700; color: #1a202c; margin: 8px 0; }
                p { font-size: 13px; color: #64748b; margin: 4px 0; }
                .title { font-size: 14px; color: #065f46; font-weight: 600; margin-bottom: 4px; }
              </style>
            </head>
            <body>
              <div class="card">
                <img class="logo" src="${LOGO_URL}" />
                <p class="title">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
                <h1>${room}</h1>
                <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}" />
                <p>สแกน QR Code เพื่อเช็คอินเข้าใช้แหล่งเรียนรู้</p>
                <p style="font-size:11px; color:#94a3b8; margin-top:8px;">${url}</p>
              </div>
              <script>window.onload = () => window.print();</script>
            </body>
            </html>
          `);
          w.document.close();
        }}
        className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
        style={{ background: "#065f46" }}
      >
        🖨️ พิมพ์ QR Code
      </button>
    </div>
  );
}

export default function QRCodePage() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <img src={LOGO_URL} alt="logo" className="w-16 h-16 object-contain mx-auto mb-3" />
        <h1 className="text-2xl font-bold" style={{ color: "#065f46" }}>
          QR Code เช็คอินแหล่งเรียนรู้
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา
        </p>
        <button
          onClick={() => window.print()}
          className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: "#1e3a5f" }}
        >
          🖨️ พิมพ์ทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {ROOMS.map(room => (
          <QRCodeCard key={room} room={room} baseUrl={baseUrl} />
        ))}
      </div>
    </div>
  );
}