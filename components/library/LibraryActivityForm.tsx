"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, Loader2, Camera, X, Pen, Printer, Plus, Trash2 } from "lucide-react";
import { activityApi, Activity } from "@/lib/gas";
import { compressImage } from "@/lib/imageUtils";
import SignaturePad from "@/components/SignaturePad";

const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";
const LIBRARY_ROOM_KEY = "งานห้องสมุด";
const LIBRARY_SOURCE = "ห้องสมุดมีชีวิต";
const PASS_SCORE = 3;

const ASSESSMENT_ITEMS = [
  "แสดงความกระตือรือร้น/สนใจที่จะเข้าห้องสมุด",
  "เลือกสื่อ/หนังสือที่สนใจด้วยตนเอง",
  "มีสมาธิในการจดจ่อกับสื่อ/กิจกรรม (อย่างน้อย ๑๐-๑๕ นาที)",
  "สามารถใช้อุปกรณ์พื้นฐานในห้องสมุดได้ (เช่น เครื่องเล่นสื่อ)",
  "มีการเก็บสื่อ/อุปกรณ์เข้าที่หลังการใช้งาน",
];

type StudentAssessment = {
  name: string;
  grade: string;
  scores: number[];
  notes: string[];
};

function blankStudent(): StudentAssessment {
  return { name: "", grade: "", scores: ASSESSMENT_ITEMS.map(() => 0), notes: ASSESSMENT_ITEMS.map(() => "") };
}

function totalOf(s: StudentAssessment) {
  return s.scores.reduce((a, b) => a + b, 0);
}

function resultOf(total: number) {
  return total >= PASS_SCORE ? "มีความสนใจและพัฒนาทักษะได้ดี (ผ่านเกณฑ์)" : "ควรได้รับการกระตุ้นหรือปรับรูปแบบสื่อให้เหมาะสม";
}

export default function LibraryActivityForm() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [teachers, setTeachers] = useState("");
  const [activityDetail, setActivityDetail] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [recorder, setRecorder] = useState("");
  const [position, setPosition] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignPad, setShowSignPad] = useState(false);
  const [students, setStudents] = useState<StudentAssessment[]>([blankStudent()]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [history, setHistory] = useState<Activity[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadHistory = () => {
    activityApi.getActivitiesByRoom(LIBRARY_ROOM_KEY).then((res) => {
      if (res.success && res.data) setHistory(res.data);
    });
  };

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (pendingPrint) {
      window.print();
      setPendingPrint(false);
    }
  }, [pendingPrint]);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const compressed = await compressImage(file);
      setPhotos((prev) => [...prev, compressed]);
    }
  }

  function addStudent() {
    setStudents((prev) => [...prev, blankStudent()]);
  }

  function removeStudent(idx: number) {
    setStudents((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateStudent(idx: number, patch: Partial<StudentAssessment>) {
    setStudents((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function toggleScore(studentIdx: number, itemIdx: number) {
    setStudents((prev) =>
      prev.map((s, i) => {
        if (i !== studentIdx) return s;
        const scores = [...s.scores];
        scores[itemIdx] = scores[itemIdx] ? 0 : 1;
        return { ...s, scores };
      })
    );
  }

  function updateNote(studentIdx: number, itemIdx: number, value: string) {
    setStudents((prev) =>
      prev.map((s, i) => {
        if (i !== studentIdx) return s;
        const notes = [...s.notes];
        notes[itemIdx] = value;
        return { ...s, notes };
      })
    );
  }

  function resetForm() {
    setTeachers("");
    setActivityDetail("");
    setKnowledge("");
    setPhotos([]);
    setRecorder("");
    setPosition("");
    setSignature(null);
    setStudents([blankStudent()]);
    setDate(new Date().toISOString().split("T")[0]);
  }

  function loadRecordForView(act: Activity) {
    setDate(act.วันที่ ? String(act.วันที่).split("T")[0] : date);
    setTeachers(act.รายชื่อครู || "");
    setActivityDetail(act.ลักษณะกิจกรรม || "");
    setKnowledge(act.สาระที่ได้รับ || "");
    setPhotos(act.ImageURL ? act.ImageURL.split(",").filter(Boolean) : []);
    setSignature(act.Signature || null);
    setRecorder(act.ผู้บันทึก || "");
    setPosition(act.ตำแหน่ง || "");
    if (act.การประเมิน) {
      try {
        const parsed = JSON.parse(act.การประเมิน);
        if (Array.isArray(parsed) && parsed.length > 0) setStudents(parsed);
      } catch {
        // ignore parse errors, keep current students
      }
    }
    setPendingPrint(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activityDetail) return;
    setSubmitting(true);
    const studentNames = students.map((s) => s.name).filter(Boolean).join("\n");
    const assessments = JSON.stringify(students.filter((s) => s.name));
    const res = await activityApi.addActivity({
      date,
      roomNumber: LIBRARY_ROOM_KEY,
      students: studentNames,
      teachers,
      learningSource: LIBRARY_SOURCE,
      activityDetail,
      knowledge,
      imageUrl: photos.join("|||"),
      signature: signature || "",
      recorder,
      position,
      assessments,
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
      window.print();
      resetForm();
      loadHistory();
      setTimeout(() => setSuccess(false), 4000);
    }
  }

  return (
    <div className="print-area bg-white rounded-2xl shadow p-6">
      <div className="no-print flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg" style={{ color: "#1e3a5f" }}>บันทึกกิจกรรมห้องสมุดมีชีวิต</h2>
        <button type="button" onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-blue-400 text-xs">
          <Printer size={14} /> พิมพ์
        </button>
      </div>

      {success && (
        <div className="no-print bg-green-50 border border-green-300 rounded-xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-green-700 text-sm">บันทึกกิจกรรมห้องสมุดมีชีวิตเรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* หัวรายงานสำหรับพิมพ์ */}
      <div className="text-center mb-3">
        <img src={LOGO_URL} alt="logo" className="mx-auto mb-2" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
        <p className="font-bold text-base">บันทึกกิจกรรมห้องสมุดมีชีวิต</p>
        <p className="font-bold text-base">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
      </div>
      <div className="border-t-4 border-b-2 mb-4" style={{ borderColor: "#1e3a5f" }} />

      <form onSubmit={handleSubmit}>
        <table className="w-full border-collapse text-sm mb-4" style={{ border: "1px solid #000" }}>
          <tbody>
            <tr>
              <td className="font-semibold bg-slate-50 p-2" style={{ border: "1px solid #000", width: "22%" }}>
                วันที่ <span className="no-print text-red-500">*</span>
              </td>
              <td className="p-2" style={{ border: "1px solid #000", width: "78%" }} colSpan={3}>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                <span className="text-sm">
                  {new Date(date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </td>
            </tr>
            <tr>
              <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ครู/ผู้ดูแล</td>
              <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                <textarea value={teachers} onChange={(e) => setTeachers(e.target.value)}
                  rows={2} placeholder="ระบุรายชื่อครู..."
                  className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
              </td>
            </tr>
            <tr>
              <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>
                ลักษณะกิจกรรม <span className="no-print text-red-500">*</span>
              </td>
              <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                <textarea value={activityDetail} onChange={(e) => setActivityDetail(e.target.value)}
                  rows={3} placeholder="อธิบายลักษณะกิจกรรม..."
                  className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
              </td>
            </tr>
            <tr>
              <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>สาระที่ได้รับ</td>
              <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                <textarea value={knowledge} onChange={(e) => setKnowledge(e.target.value)}
                  rows={2} placeholder="ระบุสาระที่ได้รับ..."
                  className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
              </td>
            </tr>
            <tr>
              <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ภาพกิจกรรม</td>
              <td colSpan={3} className="p-2" style={{ border: "1px solid #000" }}>
                <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
                <button type="button" onClick={() => photoInputRef.current?.click()}
                  className="no-print flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 text-sm mb-3">
                  <Camera size={16} /> แนบรูปภาพ
                </button>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="no-print absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* แบบประเมินพฤติกรรมการเรียนรู้ */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm">๓. แบบประเมินพฤติกรรมการเรียนรู้ (สำหรับตัวชี้วัดเชิงคุณภาพ ข้อ ๑)</p>
              <p className="text-xs text-slate-500">วัตถุประสงค์: สังเกตความสนใจและการใช้อุปกรณ์ตามศักยภาพรายบุคคล</p>
            </div>
            <button type="button" onClick={addStudent}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium shrink-0"
              style={{ background: "#1e3a5f" }}>
              <Plus size={14} /> เพิ่มนักเรียน
            </button>
          </div>

          {students.map((s, si) => {
            const total = totalOf(s);
            return (
              <div key={si} className="mb-4" style={{ pageBreakInside: "avoid" }}>
                <div className="flex items-center gap-2 mb-2">
                  <input value={s.name} onChange={(e) => updateStudent(si, { name: e.target.value })}
                    placeholder="ชื่อ-นามสกุล ผู้เรียน"
                    className="print-input flex-1 outline-none text-sm px-2 py-1.5 border border-slate-200 rounded-lg" />
                  <input value={s.grade} onChange={(e) => updateStudent(si, { grade: e.target.value })}
                    placeholder="ระดับชั้น"
                    className="print-input w-32 outline-none text-sm px-2 py-1.5 border border-slate-200 rounded-lg" />
                  {students.length > 1 && (
                    <button type="button" onClick={() => removeStudent(si)}
                      className="no-print p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <table className="w-full border-collapse text-xs" style={{ border: "1px solid #000" }}>
                  <thead>
                    <tr className="bg-slate-50">
                      <td className="font-semibold p-1.5" style={{ border: "1px solid #000", width: "36%" }}>รายการพฤติกรรมที่สังเกต</td>
                      <td className="font-semibold p-1.5 text-center" style={{ border: "1px solid #000", width: "12%" }}>มีพฤติกรรม (๑)</td>
                      <td className="font-semibold p-1.5 text-center" style={{ border: "1px solid #000", width: "14%" }}>ไม่มีพฤติกรรม (๐)</td>
                      <td className="font-semibold p-1.5" style={{ border: "1px solid #000", width: "38%" }}>บันทึกเพิ่มเติม/พัฒนาการที่เห็น</td>
                    </tr>
                  </thead>
                  <tbody>
                    {ASSESSMENT_ITEMS.map((item, ii) => (
                      <tr key={ii}>
                        <td className="p-1.5" style={{ border: "1px solid #000" }}>{ii + 1}. {item}</td>
                        <td className="p-1.5 text-center" style={{ border: "1px solid #000" }}>
                          <button type="button" onClick={() => toggleScore(si, ii)} className="no-print">
                            {s.scores[ii] === 1 ? "✅" : "⬜"}
                          </button>
                          <span className="hidden print:inline">{s.scores[ii] === 1 ? "✓" : ""}</span>
                        </td>
                        <td className="p-1.5 text-center" style={{ border: "1px solid #000" }}>
                          <button type="button" onClick={() => toggleScore(si, ii)} className="no-print">
                            {s.scores[ii] === 0 ? "✅" : "⬜"}
                          </button>
                          <span className="hidden print:inline">{s.scores[ii] === 0 ? "✓" : ""}</span>
                        </td>
                        <td className="p-1" style={{ border: "1px solid #000" }}>
                          <input value={s.notes[ii]} onChange={(e) => updateNote(si, ii, e.target.value)}
                            className="print-input w-full outline-none text-xs px-1.5 py-1 border border-slate-200 rounded" />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="font-semibold p-1.5 text-center" colSpan={3} style={{ border: "1px solid #000" }}>รวมคะแนน</td>
                      <td className="font-semibold p-1.5" style={{ border: "1px solid #000" }}>{total} / {ASSESSMENT_ITEMS.length}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs mt-1.5" style={{ color: total >= PASS_SCORE ? "#15803d" : "#b45309" }}>
                  ผลการประเมิน: {resultOf(total)}
                </p>
              </div>
            );
          })}
          <p className="text-xs text-slate-400">
            เกณฑ์การสรุปผล: {PASS_SCORE}-{ASSESSMENT_ITEMS.length} คะแนน มีความสนใจและพัฒนาทักษะได้ดี (ผ่านเกณฑ์) | 0-{PASS_SCORE - 1} คะแนน ควรได้รับการกระตุ้นหรือปรับรูปแบบสื่อให้เหมาะสม
          </p>
        </div>

        <table className="w-full border-collapse text-sm" style={{ border: "1px solid #000" }}>
          <tbody>
            <tr>
              <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000", width: "22%" }}>ผู้บันทึก</td>
              <td className="p-2 align-top" style={{ border: "1px solid #000", width: "28%" }}>
                <input value={recorder} onChange={(e) => setRecorder(e.target.value)}
                  placeholder="ชื่อผู้บันทึก"
                  className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                <input value={position} onChange={(e) => setPosition(e.target.value)}
                  placeholder="ตำแหน่ง"
                  className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded" />
                <p className="text-sm font-medium mt-1">
                  {recorder || "-"}{position && ` (${position})`}
                </p>
              </td>
              <td className="font-semibold bg-slate-50 p-2 align-top text-center" style={{ border: "1px solid #000", width: "18%" }}>
                ลายมือชื่อผู้บันทึก
              </td>
              <td className="p-2 text-center align-middle" style={{ border: "1px solid #000", width: "32%" }}>
                {signature ? (
                  <div className="relative inline-block">
                    <img src={signature} alt="ลายเซ็น" className="h-14 object-contain mx-auto" />
                    <button type="button" onClick={() => setSignature(null)}
                      className="no-print absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="no-print">
                    {showSignPad ? (
                      <div className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                        <SignaturePad zone="library"
                          onSave={(dataUrl) => { setSignature(dataUrl); setShowSignPad(false); }} />
                        <button type="button" onClick={() => setShowSignPad(false)}
                          className="text-xs text-slate-400 mt-1">ยกเลิก</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowSignPad(true)}
                        className="flex flex-col items-center gap-1 mx-auto text-slate-400 hover:text-blue-500">
                        <Pen size={20} />
                        <span className="text-xs">กดลงลายมือชื่อ</span>
                      </button>
                    )}
                    <div className="border-b border-slate-300 mt-2 mx-2" />
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <button type="submit" disabled={submitting || !activityDetail}
          className="no-print w-full mt-4 py-3 rounded-xl text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "#1e3a5f" }}>
          {submitting ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><CheckCircle size={18} /> บันทึกกิจกรรม</>}
        </button>
      </form>

      <div className="no-print mt-8 pt-6 border-t border-slate-200">
        <h3 className="font-semibold text-base mb-3" style={{ color: "#1e3a5f" }}>
          ประวัติการบันทึกกิจกรรมห้องสมุดมีชีวิต ({history.length})
        </h3>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีประวัติการบันทึกกิจกรรม</p>
        ) : (
          <div className="space-y-2">
            {[...history].reverse().map((a) => (
              <div key={a.ID} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.ลักษณะกิจกรรม || "-"}</p>
                  <p className="text-xs text-slate-400">
                    {a.วันที่ ? new Date(a.วันที่).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : ""}
                    {a.ผู้บันทึก ? ` • ผู้บันทึก: ${a.ผู้บันทึก}` : ""}
                  </p>
                </div>
                <button type="button" onClick={() => loadRecordForView(a)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-blue-400 text-xs">
                  <Printer size={14} /> ดาวน์โหลด PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
