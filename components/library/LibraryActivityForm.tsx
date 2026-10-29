"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, Loader2, Camera, X, Pen, Printer, Plus, Trash2, FileDown } from "lucide-react";
import { activityApi, libraryApi, Activity, Teacher, Student } from "@/lib/gas";
import { compressImage } from "@/lib/imageUtils";
import SignaturePad from "@/components/SignaturePad";
import NameSearchSelect from "@/components/NameSearchSelect";
import NameTagPicker from "@/components/NameTagPicker";
import { escapeHtml, openPrintWindow } from "@/lib/htmlUtils";

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

// ค่า "เวลา" บางรายการเก่าอาจถูก Google Sheets แปลงเป็น time serial โดยอัตโนมัติ
// แล้วส่งกลับมาเป็น ISO datetime (เช่น "1899-12-30T08:19:56.000Z") ให้ดึงเฉพาะ ชม:นาที มาแสดง
function formatTime(value?: string) {
  if (!value) return "-";
  const isoMatch = /T(\d{2}):(\d{2})/.exec(value);
  return isoMatch ? `${isoMatch[1]}:${isoMatch[2]}` : value;
}

// วันนี้ในรูป "YYYY-MM-DD" ตามเวลาเครื่อง ไม่ใช้ toISOString() เพราะเป็นเวลา UTC
// ถ้าเปิดฟอร์มก่อน 07:00 น. (เวลาไทย) จะได้วันที่ของเมื่อวานแทน
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Google Sheets แปลง "2026-10-29" ที่บันทึกไปเป็นวันที่เที่ยงคืนตามเขตเวลาไทย แล้วส่งกลับมาเป็น
// ISO แบบ UTC ("2026-10-28T17:00:00.000Z") จึงต้องแปลงเป็นวันที่ท้องถิ่นก่อนแสดง
// ห้ามตัดสตริงที่ "T" ตรงๆ ไม่งั้นวันที่จะเลื่อนไปหนึ่งวัน
function formatThaiDate(value?: string) {
  if (!value) return "-";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

type VisitType = "group" | "self";

export default function LibraryActivityForm() {
  const [visitType, setVisitType] = useState<VisitType>("group");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(todayStr());
  const [teacherList, setTeacherList] = useState<string[]>([]);
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
  const [savedRecord, setSavedRecord] = useState<Activity | null>(null);
  const [error, setError] = useState("");
  // เปลี่ยนค่านี้เพื่อ remount ฟอร์มทั้งก้อนหลังบันทึก ล้าง state ภายในของช่องค้นหาชื่อ
  // แผ่นลายเซ็น และ input ไฟล์รูปไปด้วย ไม่ใช่แค่ state ของคอมโพเนนต์นี้
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [deleteBy, setDeleteBy] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [history, setHistory] = useState<Activity[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [teacherRoster, setTeacherRoster] = useState<Teacher[]>([]);
  const [studentRoster, setStudentRoster] = useState<Student[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const teacherNames = teacherRoster.map((t) => t["ชื่อ-นามสกุล"]);
  const studentNamesRoster = studentRoster.map((s) => s["ชื่อ-นามสกุล"]);
  const gradeOptions = Array.from(
    new Set(studentRoster.map((s) => s.ระดับชั้น).filter((g): g is string => Boolean(g)))
  );
  const selfHistory = history.filter((a) => a.ประเภทการเข้าใช้ === "บันทึกการเข้าใช้ของครู");
  const groupHistory = history.filter((a) => a.ประเภทการเข้าใช้ !== "บันทึกการเข้าใช้ของครู");

  const loadHistory = async () => {
    const res = await activityApi.getActivitiesByRoom(LIBRARY_ROOM_KEY);
    if (res.success && res.data) {
      setHistory(res.data);
      setHistoryError("");
      return res.data;
    }
    setHistoryError(res.error || "โหลดประวัติไม่สำเร็จ");
    return [];
  };

  useEffect(() => {
    loadHistory();
    libraryApi.getTeachers().then((res) => {
      if (res.success && res.data) setTeacherRoster(res.data);
    });
    libraryApi.getStudents().then((res) => {
      if (res.success && res.data) setStudentRoster(res.data);
    });
  }, []);

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

  function selectStudentName(idx: number, name: string) {
    const match = studentRoster.find((s) => s["ชื่อ-นามสกุล"] === name);
    updateStudent(idx, { name, grade: match?.ระดับชั้น || "" });
  }

  function selectRecorder(name: string) {
    setRecorder(name);
    const match = teacherRoster.find((t) => t["ชื่อ-นามสกุล"] === name);
    setPosition(match?.ตำแหน่ง || "");
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
    setTime("");
    setTeacherList([]);
    setActivityDetail("");
    setKnowledge("");
    setPhotos([]);
    setRecorder("");
    setPosition("");
    setSignature(null);
    setStudents([blankStudent()]);
    setDate(todayStr());
    setShowSignPad(false);
    setError("");
    setFormKey((k) => k + 1);
  }

  // สร้าง PDF ของรายการที่บันทึกแล้วในหน้าต่างแยก (อ่านอย่างเดียว) ไม่โหลดข้อมูลกลับเข้าฟอร์ม
  // เพราะรายการที่บันทึกแล้วแก้ไขไม่ได้ ถ้าข้อมูลผิดต้องบันทึกรายการใหม่เท่านั้น
  function handleDownloadRecordPDF(act: Activity) {
    const multiline = (v?: string) => escapeHtml(v || "-").replace(/\n/g, "<br>");
    let assessed: StudentAssessment[] = [];
    if (act.การประเมิน) {
      try {
        const parsed = JSON.parse(act.การประเมิน);
        if (Array.isArray(parsed)) assessed = parsed;
      } catch {
        // ข้อมูลการประเมินเสีย ก็แค่ไม่แสดงส่วนนี้
      }
    }
    const photosHtml = (act.ImageURL || "").split(",").filter(Boolean)
      .map((url) => `<img class="activity-img" src="${escapeHtml(url)}" alt="กิจกรรม" />`).join("");
    const assessmentHtml = assessed.map((s) => {
      const scores = s.scores || [];
      const total = scores.reduce((a, b) => a + b, 0);
      return `
        <div style="page-break-inside:avoid">
          <p style="margin:12px 0 4px;font-size:13px;"><b>${escapeHtml(s.name) || "-"}</b>${s.grade ? ` (${escapeHtml(s.grade)})` : ""}</p>
          <table style="font-size:12px;">
            <tr>
              <td class="label" style="width:36%">รายการพฤติกรรมที่สังเกต</td>
              <td class="label" style="width:12%;text-align:center">มีพฤติกรรม (๑)</td>
              <td class="label" style="width:14%;text-align:center">ไม่มีพฤติกรรม (๐)</td>
              <td class="label" style="width:38%">บันทึกเพิ่มเติม/พัฒนาการที่เห็น</td>
            </tr>
            ${ASSESSMENT_ITEMS.map((item, i) => `
              <tr>
                <td>${i + 1}. ${item}</td>
                <td style="text-align:center">${scores[i] === 1 ? "✓" : ""}</td>
                <td style="text-align:center">${scores[i] === 0 ? "✓" : ""}</td>
                <td>${escapeHtml(s.notes && s.notes[i])}</td>
              </tr>
            `).join("")}
            <tr><td class="label" colspan="3" style="text-align:center">รวมคะแนน</td><td class="label">${total} / ${ASSESSMENT_ITEMS.length}</td></tr>
          </table>
          <p style="font-size:12px;margin:4px 0 0;">ผลการประเมิน: ${resultOf(total)}</p>
        </div>
      `;
    }).join("");

    const content = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>บันทึกกิจกรรมห้องสมุดมีชีวิต ${escapeHtml(formatThaiDate(act.วันที่))}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          @page { size: A4; margin: 15mm 20mm; }
          body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #1a202c; }
          .header { text-align: center; margin-bottom: 12px; }
          .header img { width: 64px; height: 64px; object-fit: contain; }
          .header p { font-size: 15px; font-weight: 700; margin: 4px 0 0; }
          .header .sub { font-size: 13px; font-weight: 400; color: #64748b; }
          .divider { border-top: 3px solid #1e3a5f; border-bottom: 1px solid #1e3a5f; margin: 12px 0 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
          .label { background: #f0f4f8; font-weight: 600; width: 22%; }
          .activity-imgs { display: flex; flex-wrap: wrap; gap: 8px; }
          img.activity-img { width: 140px; height: 140px; object-fit: cover; border-radius: 6px; }
          img.sig-img { height: 55px; object-fit: contain; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" alt="logo" />
          <p>บันทึกกิจกรรมห้องสมุดมีชีวิต</p>
          <p>ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
          <p class="sub">ประเภท: บันทึกการเข้าใช้ของนักเรียน</p>
        </div>
        <div class="divider"></div>
        <table>
          <tr><td class="label">วันที่</td><td colspan="3">${escapeHtml(formatThaiDate(act.วันที่))}</td></tr>
          <tr><td class="label">ครู/ผู้ดูแล</td><td colspan="3">${escapeHtml((act.รายชื่อครู || "").split("\n").filter(Boolean).join(", ") || "-")}</td></tr>
          <tr><td class="label">ลักษณะกิจกรรม</td><td colspan="3">${multiline(act.ลักษณะกิจกรรม)}</td></tr>
          <tr><td class="label">สาระที่ได้รับ</td><td colspan="3">${multiline(act.สาระที่ได้รับ)}</td></tr>
          ${photosHtml ? `<tr><td class="label">ภาพกิจกรรม</td><td colspan="3"><div class="activity-imgs">${photosHtml}</div></td></tr>` : ""}
        </table>
        ${assessmentHtml ? `
          <p style="font-weight:700;font-size:13px;margin:16px 0 0;">๓. แบบประเมินพฤติกรรมการเรียนรู้</p>
          <p style="font-size:12px;color:#64748b;margin:0;">วัตถุประสงค์: สังเกตความสนใจและการใช้อุปกรณ์ตามศักยภาพรายบุคคล</p>
          ${assessmentHtml}
          <p style="font-size:11px;color:#94a3b8;margin:8px 0 0;">เกณฑ์การสรุปผล: ${PASS_SCORE}-${ASSESSMENT_ITEMS.length} คะแนน มีความสนใจและพัฒนาทักษะได้ดี (ผ่านเกณฑ์) | 0-${PASS_SCORE - 1} คะแนน ควรได้รับการกระตุ้นหรือปรับรูปแบบสื่อให้เหมาะสม</p>
        ` : ""}
        <table style="margin-top:16px;page-break-inside:avoid">
          <tr>
            <td class="label">ผู้บันทึก</td>
            <td style="width:28%">${escapeHtml(act.ผู้บันทึก) || "-"}${act.ตำแหน่ง ? ` (${escapeHtml(act.ตำแหน่ง)})` : ""}</td>
            <td class="label" style="width:18%;text-align:center">ลายมือชื่อผู้บันทึก</td>
            <td style="width:32%;text-align:center;vertical-align:middle">
              ${act.Signature ? `<img class="sig-img" src="${escapeHtml(act.Signature)}" alt="ลายเซ็น" />` : "<br><br>"}
            </td>
          </tr>
        </table>
        <div class="footer">พิมพ์วันที่ ${formatThaiDate(todayStr())}</div>
      </body>
      </html>
    `;
    openPrintWindow(content);
  }

  function handlePrintSelfTable() {
    const rows = selfHistory.map((a, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${formatThaiDate(a.วันที่)}</td>
        <td style="text-align:center">${escapeHtml(formatTime(a.เวลา))}</td>
        <td>${escapeHtml(a.ผู้บันทึก) || "-"}</td>
        <td>${escapeHtml(a.ตำแหน่ง) || "-"}</td>
        <td style="text-align:center">${a.Signature ? `<img src="${escapeHtml(a.Signature)}" alt="ลายเซ็น" style="height:40px;object-fit:contain" />` : "-"}</td>
      </tr>
    `).join("");

    const content = `
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #1a202c; }
          .header { text-align: center; margin-bottom: 20px; }
          .header img { width: 64px; height: 64px; object-fit: contain; }
          .header p { font-size: 14px; font-weight: 700; margin: 4px 0 0; }
          .divider { border-top: 3px solid #1e3a5f; border-bottom: 1px solid #1e3a5f; margin: 12px 0 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td { border: 1px solid #000; padding: 6px 8px; vertical-align: middle; }
          thead td { background: #f0f4f8; font-weight: 700; text-align: center; }
          .footer { text-align: center; font-size: 11px; color: #888; margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" alt="logo" />
          <p>สถิติบันทึกการเข้าใช้ห้องสมุดของครู</p>
          <p>ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        </div>
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <td style="width:8%">ลำดับ</td>
              <td style="width:20%">วันที่</td>
              <td style="width:12%">เวลา</td>
              <td style="width:22%">ชื่อ</td>
              <td style="width:18%">ตำแหน่ง</td>
              <td style="width:20%">ลายมือชื่อ</td>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">พิมพ์วันที่ ${new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</div>
      </body>
      </html>
    `;
    openPrintWindow(content);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const canSubmit = visitType === "self" ? Boolean(recorder && time) : Boolean(activityDetail);
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    const studentNames = visitType === "self" ? "" : students.map((s) => s.name).filter(Boolean).join("\n");
    const assessments = visitType === "self" ? "[]" : JSON.stringify(students.filter((s) => s.name));
    const res = await activityApi.addActivity({
      date,
      roomNumber: LIBRARY_ROOM_KEY,
      students: studentNames,
      teachers: visitType === "self" ? recorder : teacherList.join("\n"),
      learningSource: LIBRARY_SOURCE,
      activityDetail,
      knowledge,
      imageUrl: photos.join("|||"),
      signature: signature || "",
      recorder,
      position,
      assessments,
      visitType: visitType === "self" ? "บันทึกการเข้าใช้ของครู" : "บันทึกการเข้าใช้ของนักเรียน",
      time: visitType === "self" ? time : "",
    });
    if (res.success) {
      // ล้างฟอร์มทันทีหลังบันทึกสำเร็จ รายการที่บันทึกแล้วแก้ไขไม่ได้ ถ้าต้องการ PDF
      // ให้กดจากแถบแจ้งผลหรือจากประวัติ (ไม่สั่ง window.print() ของฟอร์มตรงนี้แล้ว เพราะบนมือถือ
      // print() ไม่รอ ฟอร์มจะถูกล้างก่อนพิมพ์เสร็จ)
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
      const latest = await loadHistory();
      setSubmitting(false);
      // GAS ส่ง id กลับมาที่ระดับบนสุดของ response ({ success, id }) ไม่ได้อยู่ใน data
      const savedId = (res as { id?: string }).id;
      setSavedRecord(visitType === "group" ? latest.find((a) => a.ID === savedId) || null : null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 15000);
    } else {
      setSubmitting(false);
      setError(res.error || "บันทึกกิจกรรมไม่สำเร็จ");
    }
  }

  function openDeleteRequest(act: Activity) {
    setDeleteTarget(act);
    setDeleteBy("");
    setDeleteReason("");
    setDeleteError("");
  }

  async function submitDeleteRequest() {
    if (!deleteTarget) return;
    if (!deleteBy.trim() || !deleteReason.trim()) {
      setDeleteError("กรุณาระบุชื่อผู้แจ้งลบและเหตุผลการลบ");
      return;
    }
    setDeleteSubmitting(true);
    setDeleteError("");
    const res = await activityApi.requestDeleteActivity(deleteTarget.ID, deleteBy.trim(), deleteReason.trim());
    setDeleteSubmitting(false);
    if (res.success) {
      setDeleteTarget(null);
      await loadHistory();
    } else {
      setDeleteError(res.error || "แจ้งลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
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

      <div className="no-print flex gap-2 mb-4">
        <button type="button" onClick={() => setVisitType("group")}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors"
          style={visitType === "group"
            ? { background: "#1e3a5f", borderColor: "#1e3a5f", color: "white" }
            : { background: "white", borderColor: "#e2e8f0", color: "#64748b" }}>
          บันทึกการเข้าใช้ของนักเรียน
        </button>
        <button type="button" onClick={() => setVisitType("self")}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors"
          style={visitType === "self"
            ? { background: "#1e3a5f", borderColor: "#1e3a5f", color: "white" }
            : { background: "white", borderColor: "#e2e8f0", color: "#64748b" }}>
          บันทึกการเข้าใช้ของครู
        </button>
      </div>

      {success && (
        <div className="no-print bg-green-50 border border-green-300 rounded-xl p-3 mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span className="text-green-700 text-sm flex-1">บันทึกกิจกรรมห้องสมุดมีชีวิตเรียบร้อยแล้ว!</span>
          {savedRecord && (
            <button type="button" onClick={() => handleDownloadRecordPDF(savedRecord)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-green-300 text-green-700 hover:bg-green-100 text-xs">
              <FileDown size={14} /> PDF
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="no-print bg-red-50 border border-red-300 rounded-xl p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* หัวรายงานสำหรับพิมพ์ */}
      <div className="text-center mb-3">
        <img src={LOGO_URL} alt="logo" className="mx-auto mb-2" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
        <p className="font-bold text-base">บันทึกกิจกรรมห้องสมุดมีชีวิต</p>
        <p className="font-bold text-base">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
        <p className="text-sm text-slate-500 mt-1">
          ประเภท: {visitType === "self" ? "บันทึกการเข้าใช้ของครู" : "บันทึกการเข้าใช้ของนักเรียน"}
        </p>
      </div>
      <div className="border-t-4 border-b-2 mb-4" style={{ borderColor: "#1e3a5f" }} />

      <form key={formKey} onSubmit={handleSubmit}>
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
                  {formatThaiDate(date)}
                </span>
              </td>
            </tr>
            {visitType === "self" && (
              <tr>
                <td className="font-semibold bg-slate-50 p-2" style={{ border: "1px solid #000" }}>
                  เวลา <span className="no-print text-red-500">*</span>
                </td>
                <td className="p-2" style={{ border: "1px solid #000" }} colSpan={3}>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                  <span className="text-sm">{time || "-"}</span>
                </td>
              </tr>
            )}
            {visitType === "group" && (
              <tr>
                <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ครู/ผู้ดูแล</td>
                <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                  <div className="no-print">
                    <NameTagPicker value={teacherList} onChange={setTeacherList} options={teacherNames}
                      placeholder="พิมพ์เพื่อค้นหาชื่อครู..." accentColor="#1e3a5f" />
                  </div>
                  <p className="hidden print:block text-sm px-2 py-1">{teacherList.join(", ") || "-"}</p>
                </td>
              </tr>
            )}
            {visitType === "group" && (
              <>
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
              </>
            )}
          </tbody>
        </table>

        {/* แบบประเมินพฤติกรรมการเรียนรู้ */}
        {visitType === "group" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm">๓. แบบประเมินพฤติกรรมการเรียนรู้</p>
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
                  <div className="flex-1 no-print">
                    <NameSearchSelect value={s.name} onChange={(name) => selectStudentName(si, name)}
                      options={studentNamesRoster} placeholder="ชื่อ-นามสกุล ผู้เรียน" accentColor="#1e3a5f" />
                  </div>
                  <p className="hidden print:block flex-1 text-sm px-2 py-1.5 border-b border-slate-300">{s.name || "-"}</p>
                  <div className="w-32 shrink-0">
                    <select value={s.grade} onChange={(e) => updateStudent(si, { grade: e.target.value })}
                      className="no-print w-full outline-none text-sm px-2 py-1.5 border border-slate-200 rounded-lg bg-white">
                      <option value="">ระดับชั้น</option>
                      {gradeOptions.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <p className="hidden print:block text-sm px-2 py-1.5 border-b border-slate-300 text-center">{s.grade || "-"}</p>
                  </div>
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
        )}

        <table className="w-full border-collapse text-sm" style={{ border: "1px solid #000" }}>
          <tbody>
            <tr>
              <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000", width: "22%" }}>ผู้บันทึก</td>
              <td className="p-2 align-top" style={{ border: "1px solid #000", width: "28%" }}>
                <div className="no-print mb-1">
                  <NameSearchSelect value={recorder} onChange={selectRecorder}
                    options={teacherNames} placeholder="ชื่อผู้บันทึก" accentColor="#1e3a5f" />
                </div>
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

        <button type="submit" disabled={submitting || (visitType === "self" ? !recorder || !time : !activityDetail)}
          className="no-print w-full mt-4 py-3 rounded-xl text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "#1e3a5f" }}>
          {submitting ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><CheckCircle size={18} /> บันทึกกิจกรรม</>}
        </button>
      </form>

      {visitType === "group" && (
      <div className="no-print mt-8 pt-6 border-t border-slate-200">
        <h3 className="font-semibold text-base mb-3" style={{ color: "#1e3a5f" }}>
          ประวัติการบันทึกกิจกรรมของนักเรียน ({groupHistory.length})
        </h3>
        {historyError && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3 text-red-700 text-sm">
            โหลดประวัติไม่สำเร็จ: {historyError}
          </div>
        )}
        {groupHistory.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีประวัติการบันทึกกิจกรรม</p>
        ) : (
          <div className="space-y-2">
            {[...groupHistory].reverse().map((a) => {
              const pendingDelete = a.คำขอลบ === "รอลบ";
              return (
                <div key={a.ID} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3"
                  style={pendingDelete ? { background: "#fef2f2", borderColor: "#fecaca" } : undefined}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.ลักษณะกิจกรรม || "-"}</p>
                    <p className="text-xs text-slate-400">
                      {formatThaiDate(a.วันที่)}
                      {a.ผู้บันทึก ? ` • ผู้บันทึก: ${a.ผู้บันทึก}` : ""}
                    </p>
                    {pendingDelete && (
                      <p className="text-xs text-red-600 mt-1">
                        แจ้งลบแล้ว รอผู้ดูแลยืนยัน • โดย {a.ผู้ขอลบ || "-"} • เหตุผล: {a.เหตุผลการลบ || "-"}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => handleDownloadRecordPDF(a)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-blue-400 text-xs">
                      <FileDown size={14} /> PDF
                    </button>
                    {!pendingDelete && (
                      <button type="button" onClick={() => openDeleteRequest(a)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 text-xs">
                        <Trash2 size={14} /> แจ้งลบ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {deleteTarget && (
        <div className="no-print fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !deleteSubmitting && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1" style={{ color: "#b91c1c" }}>แจ้งลบบันทึกกิจกรรม</h3>
            <p className="text-xs text-slate-500 mb-4">
              {formatThaiDate(deleteTarget.วันที่)} • {deleteTarget.ลักษณะกิจกรรม || "-"}
              <br />บันทึกที่บันทึกแล้วแก้ไขไม่ได้ คำขอนี้จะส่งให้ผู้ดูแลระบบยืนยันการลบ หากข้อมูลผิดให้บันทึกรายการใหม่
            </p>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              ชื่อผู้แจ้งลบ <span className="text-red-500">*</span>
            </label>
            <div className="mb-3">
              <NameSearchSelect value={deleteBy} onChange={setDeleteBy}
                options={teacherNames} placeholder="พิมพ์เพื่อค้นหาชื่อ..." accentColor="#b91c1c" />
            </div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              เหตุผลการลบ <span className="text-red-500">*</span>
            </label>
            <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}
              rows={3} placeholder="เช่น บันทึกวันที่ผิด, บันทึกซ้ำ..."
              className="w-full outline-none text-sm px-3 py-2 border border-slate-200 rounded-lg resize-none mb-3" />
            {deleteError && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleteSubmitting}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-medium disabled:opacity-40">
                ยกเลิก
              </button>
              <button type="button" onClick={submitDeleteRequest}
                disabled={deleteSubmitting || !deleteBy.trim() || !deleteReason.trim()}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "#dc2626" }}>
                {deleteSubmitting ? <><Loader2 size={16} className="animate-spin" /> กำลังส่ง...</> : "ส่งคำขอลบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {visitType === "self" && (
      <div className="no-print mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base" style={{ color: "#1e3a5f" }}>
            สถิติบันทึกการเข้าใช้ของครู ({selfHistory.length})
          </h3>
          {selfHistory.length > 0 && (
            <button type="button" onClick={handlePrintSelfTable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-blue-400 text-xs">
              <Printer size={14} /> พิมพ์ตาราง
            </button>
          )}
        </div>
        {selfHistory.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีการบันทึกการเข้าใช้ของครู</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ border: "1px solid #000" }}>
              <thead>
                <tr className="bg-slate-50">
                  <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>ลำดับ</td>
                  <td className="font-semibold p-2" style={{ border: "1px solid #000" }}>วันที่</td>
                  <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>เวลา</td>
                  <td className="font-semibold p-2" style={{ border: "1px solid #000" }}>ชื่อ</td>
                  <td className="font-semibold p-2" style={{ border: "1px solid #000" }}>ตำแหน่ง</td>
                  <td className="font-semibold p-2 text-center" style={{ border: "1px solid #000" }}>ลายมือชื่อ</td>
                </tr>
              </thead>
              <tbody>
                {selfHistory.map((a, i) => (
                  <tr key={a.ID}>
                    <td className="p-2 text-center" style={{ border: "1px solid #000" }}>{i + 1}</td>
                    <td className="p-2" style={{ border: "1px solid #000" }}>
                      {formatThaiDate(a.วันที่)}
                    </td>
                    <td className="p-2 text-center" style={{ border: "1px solid #000" }}>{formatTime(a.เวลา)}</td>
                    <td className="p-2" style={{ border: "1px solid #000" }}>{a.ผู้บันทึก || "-"}</td>
                    <td className="p-2" style={{ border: "1px solid #000" }}>{a.ตำแหน่ง || "-"}</td>
                    <td className="p-2 text-center" style={{ border: "1px solid #000" }}>
                      {a.Signature ? (
                        <img src={a.Signature} alt="ลายเซ็น" className="h-10 object-contain mx-auto" />
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
