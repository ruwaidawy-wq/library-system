"use client";
import { useState, useEffect, useCallback } from "react";
import { Images, Shuffle, X } from "lucide-react";

const SHOW_COUNT = 6;
const ROTATE_MS = 8000;

function pickRandom(list: string[], n: number) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// รูปจาก Drive ถูกบันทึกเป็น thumbnail ขนาด w1000 ในกริดเล็กๆ ใช้ขนาดเล็กลงพอ โหลดเร็วกว่ามาก
function thumb(url: string) {
  return url.replace(/([?&]sz=)w\d+/, "$1w500");
}

// ประมวลภาพแบบสุ่ม: แสดงทีละ 6 รูป สลับชุดใหม่อัตโนมัติทุก 8 วินาที กดรูปเพื่อดูภาพใหญ่
export default function PhotoShowcase({ title, photos, accent, loading }: {
  title: string;
  photos: string[];
  accent: string;
  loading?: boolean;
}) {
  const [shown, setShown] = useState<string[]>([]);
  const [zoomed, setZoomed] = useState<string | null>(null);

  const shuffle = useCallback(() => setShown(pickRandom(photos, SHOW_COUNT)), [photos]);

  useEffect(() => {
    shuffle();
    if (photos.length <= SHOW_COUNT) return;
    const timer = setInterval(shuffle, ROTATE_MS);
    return () => clearInterval(timer);
  }, [photos, shuffle]);

  return (
    <div className="bg-white rounded-3xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-prompt font-semibold flex items-center gap-2" style={{ color: accent }}>
          <Images size={18} /> {title}
        </h3>
        {photos.length > SHOW_COUNT && (
          <button type="button" onClick={shuffle} title="สุ่มภาพใหม่"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <Shuffle size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: SHOW_COUNT }, (_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <Images size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">ยังไม่มีภาพกิจกรรม</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {shown.map((url) => (
            <button key={url} type="button" onClick={() => setZoomed(url)}
              className="aspect-square rounded-xl overflow-hidden bg-slate-100 animate-fade-in hover:opacity-90 transition-opacity">
              <img src={thumb(url)} alt={title} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomed(null)}>
          <img src={zoomed} alt={title} className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={() => setZoomed(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
