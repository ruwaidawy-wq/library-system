"use client";
import { useState } from "react";
import { Images, X } from "lucide-react";

interface Activity {
  วันที่: string;
  ห้องเรียน: string;
  รหัสหนังสือ: string;
  รายละเอียด: string;
  ImageURL: string;
  Signature: string;
  ผู้บันทึก: string;
  ตำแหน่ง: string;
}

interface Props {
  activities: Activity[];
}

export default function Gallery({ activities }: Props) {
  const [lightbox, setLightbox] = useState<Activity | null>(null);
  const withImages = activities.filter((a) => a.ImageURL);

  if (withImages.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-5 text-center text-slate-400">
        <Images size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">ยังไม่มีภาพกิจกรรมในห้องนี้</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "#065f46" }}>
          <Images size={18} />
          ภาพกิจกรรม ({withImages.length} รูป)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {withImages.map((act, i) => (
            <button
              key={i}
              onClick={() => setLightbox(act)}
              className="aspect-square rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity relative"
            >
              <img src={act.ImageURL} alt={act.รายละเอียด || "กิจกรรม"} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{act.รายละเอียด || ""}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.ImageURL} alt={lightbox.รายละเอียด} className="w-full max-h-80 object-cover" />
            <div className="p-4">
              <p className="font-semibold text-slate-800">{lightbox.รายละเอียด}</p>
              <p className="text-sm text-slate-500 mt-1">
                บันทึกโดย {lightbox.ผู้บันทึก}
                {lightbox.ตำแหน่ง ? ` (${lightbox.ตำแหน่ง})` : ""}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lightbox.วันที่ ? new Date(lightbox.วันที่).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : ""}
              </p>
            </div>
            <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-lg">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}