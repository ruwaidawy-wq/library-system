"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Loader2, Printer, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { statsApi, LibraryStat } from "@/lib/gas";

const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function toBuddhistYear(gregorianYear: number) {
  return String(gregorianYear + 543);
}

function percent(used: number, total: number) {
  if (!total) return "-";
  return ((used / total) * 100).toFixed(2);
}

export default function LibraryStatsPage() {
  const now = new Date();
  const [monthValue, setMonthValue] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [staffTotal, setStaffTotal] = useState("");
  const [staffUsed, setStaffUsed] = useState("");
  const [studentTotal, setStudentTotal] = useState("");
  const [studentUsed, setStudentUsed] = useState("");
  const [note, setNote] = useState("");
  const [recorder, setRecorder] = useState("");
  const [counting, setCounting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<LibraryStat[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [year, month] = monthValue.split("-").map(Number);
  const monthLabel = THAI_MONTHS[month - 1] || "";
  const yearLabel = toBuddhistYear(year);

  const loadHistory = () => {
    setLoadingHistory(true);
    statsApi.getLibraryStats().then((res) => {
      if (res.success && res.data) setHistory(res.data);
      setLoadingHistory(false);
    });
  };

  useEffect(() => { loadHistory(); }, []);

  async function handleAutoCount() {
    setCounting(true);
    const res = await statsApi.getLibraryUsageStats(monthValue);
    if (res.success && res.data) {
      setStaffUsed(String(res.data.teacherUsed));
      setStudentUsed(String(res.data.studentUsed));
    }
    setCounting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await statsApi.addLibraryStats({
      month: monthLabel,
      year: yearLabel,
      staffTotal: Number(staffTotal) || 0,
      staffUsed: Number(staffUsed) || 0,
      studentTotal: Number(studentTotal) || 0,
      studentUsed: Number(studentUsed) || 0,
      note,
      recorder,
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
      window.print();
      setNote("");
      setRecorder("");
      loadHistory();
      setTimeout(() => setSuccess(false), 4000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบสถิติเดือนนี้ใช่หรือไม่?")) return;
    await statsApi.deleteLibraryStats(id);
    loadHistory();
  }

  const staffTotalNum = Number(staffTotal) || 0;
  const staffUsedNum = Number(staffUsed) || 0;
  const studentTotalNum = Number(studentTotal) || 0;
  const studentUsedNum = Number(studentUsed) || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="no-print flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={18} /> กลับหน้าหลัก
      </Link>

      <div className="print-area bg-white rounded-2xl shadow p-6">
        {success && (
          <div className="no-print bg-green-50 border border-green-300 rounded-xl p-3 mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-700 text-sm">บันทึกสถิติการใช้บริการเรียบร้อยแล้ว!</span>
          </div>
        )}

        <div className="no-print flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ color: "#1e3a5f" }}>สถิติการใช้บริการห้องสมุด</h2>
          <button type="button" onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-blue-400 text-xs">
            <Printer size={14} /> พิมพ์
          </button>
        </div>

        <div className="text-center mb-3">
          <img src={LOGO_URL} alt="logo" className="mx-auto mb-2" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
          <p className="font-bold text-base">๑. แบบบันทึกสถิติการใช้บริการ (สำหรับตัวชี้วัดเชิงปริมาณ ข้อ ๑)</p>
          <p className="text-sm text-slate-500">วัตถุประสงค์: เพื่อสรุปภาพรวมจำนวนผู้เข้าใช้บริการในแต่ละเดือน</p>
        </div>
        <div className="border-t-4 border-b-2 mb-4" style={{ borderColor: "#1e3a5f" }} />

        <form onSubmit={handleSubmit}>
          <div className="no-print mb-4 flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">เลือกเดือน</label>
              <input type="month" value={monthValue} onChange={(e) => setMonthValue(e.target.value)}
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>
            <button type="button" onClick={handleAutoCount} disabled={counting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "#1e3a5f" }}>
              {counting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              นับอัตโนมัติ
            </button>
          </div>

          <p className="text-sm mb-3">
            สรุปสถิติการใช้บริการห้องสมุดประจำเดือน
            <span className="font-semibold mx-1">{monthLabel}</span>
            พ.ศ.
            <span className="font-semibold mx-1">{yearLabel}</span>
          </p>

          <table className="w-full border-collapse text-sm mb-2" style={{ border: "1px solid #000" }}>
            <thead>
              <tr className="bg-slate-50">
                <td className="font-semibold p-2" style={{ border: "1px solid #000", width: "28%" }}>กลุ่มเป้าหมาย</td>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000", width: "18%" }}>จำนวนทั้งหมด (คน)</td>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000", width: "18%" }}>จำนวนที่มาใช้บริการ (คน)</td>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000", width: "14%" }}>คิดเป็นร้อยละ</td>
                <td className="font-semibold p-2" style={{ border: "1px solid #000", width: "22%" }}>หมายเหตุ</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2" style={{ border: "1px solid #000" }}>๑. ครูและบุคลากร</td>
                <td className="p-1 text-center" style={{ border: "1px solid #000" }}>
                  <input type="number" min="0" value={staffTotal} onChange={(e) => setStaffTotal(e.target.value)}
                    className="print-input w-full text-center outline-none text-sm px-1 py-1 border border-slate-200 rounded" />
                </td>
                <td className="p-1 text-center" style={{ border: "1px solid #000" }}>
                  <input type="number" min="0" value={staffUsed} onChange={(e) => setStaffUsed(e.target.value)}
                    className="print-input w-full text-center outline-none text-sm px-1 py-1 border border-slate-200 rounded" />
                </td>
                <td className="p-2 text-center" style={{ border: "1px solid #000" }}>{percent(staffUsedNum, staffTotalNum)}</td>
                <td className="p-1" style={{ border: "1px solid #000" }} />
              </tr>
              <tr>
                <td className="p-2" style={{ border: "1px solid #000" }}>๒. ผู้เรียน (ไป-กลับ)</td>
                <td className="p-1 text-center" style={{ border: "1px solid #000" }}>
                  <input type="number" min="0" value={studentTotal} onChange={(e) => setStudentTotal(e.target.value)}
                    className="print-input w-full text-center outline-none text-sm px-1 py-1 border border-slate-200 rounded" />
                </td>
                <td className="p-1 text-center" style={{ border: "1px solid #000" }}>
                  <input type="number" min="0" value={studentUsed} onChange={(e) => setStudentUsed(e.target.value)}
                    className="print-input w-full text-center outline-none text-sm px-1 py-1 border border-slate-200 rounded" />
                </td>
                <td className="p-2 text-center" style={{ border: "1px solid #000" }}>{percent(studentUsedNum, studentTotalNum)}</td>
                <td className="p-1" style={{ border: "1px solid #000" }} />
              </tr>
              <tr>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>รวม</td>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>{staffTotalNum + studentTotalNum}</td>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>{staffUsedNum + studentUsedNum}</td>
                <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>
                  {percent(staffUsedNum + studentUsedNum, staffTotalNum + studentTotalNum)}
                </td>
                <td className="p-2" style={{ border: "1px solid #000" }} />
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mb-4">
            * ปุ่ม "นับอัตโนมัติ" จะนับจำนวนครู/บุคลากรและผู้เรียนที่ไม่ซ้ำกัน จากข้อมูลการยืมหนังสือและกิจกรรมห้องสมุดมีชีวิตในเดือนที่เลือก ส่วน "จำนวนทั้งหมด" กรอกเองตามจำนวนบุคลากร/ผู้เรียนทั้งหมดของหน่วยงาน
          </p>

          <table className="w-full border-collapse text-sm mb-4" style={{ border: "1px solid #000" }}>
            <tbody>
              <tr>
                <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000", width: "22%" }}>หมายเหตุ</td>
                <td className="p-1" style={{ border: "1px solid #000" }}>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                    placeholder="ระบุหมายเหตุ (ถ้ามี)..."
                    className="print-textarea w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                </td>
              </tr>
              <tr>
                <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ผู้บันทึก</td>
                <td className="p-2" style={{ border: "1px solid #000" }}>
                  <input value={recorder} onChange={(e) => setRecorder(e.target.value)}
                    placeholder="ชื่อผู้บันทึก"
                    className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                  <p className="text-sm font-medium">{recorder || "-"}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <button type="submit" disabled={submitting}
            className="no-print w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "#1e3a5f" }}>
            {submitting ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><CheckCircle size={18} /> บันทึกสถิติ</>}
          </button>
        </form>

        <div className="no-print mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-base mb-3" style={{ color: "#1e3a5f" }}>
            ประวัติการบันทึกสถิติ ({history.length})
          </h3>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 size={28} className="animate-spin text-slate-400" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีประวัติการบันทึกสถิติ</p>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((s) => (
                <div key={s.ID} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{s.เดือน} {s.ปี}</p>
                    <p className="text-xs text-slate-400">
                      ครู {s.ครูที่มาใช้บริการ}/{s.ครูทั้งหมด} • ผู้เรียน {s.ผู้เรียนที่มาใช้บริการ}/{s.ผู้เรียนทั้งหมด}
                    </p>
                  </div>
                  <button type="button" onClick={() => handleDelete(s.ID)}
                    className="shrink-0 p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-500" title="ลบ">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
