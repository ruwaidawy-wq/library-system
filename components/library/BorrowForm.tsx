"use client";
import { useState, useRef, useEffect } from "react";
import { AlertCircle, Search, BookOpen, Calendar, CheckCircle, Loader2, Camera, X } from "lucide-react";
import { libraryApi, Teacher } from "@/lib/gas";

const today = new Date().toISOString().split("T")[0];

const TEACHER_LIST = [
  "นายกฤษฎา แก้วประดับ","นายสุกกรี วามะ","นางนภาพร คงสอน",
  "นายสาธิต วารีกุล","นางสาวสัณฆ์สินี ทองเจือเพชร","นายเดชา ภุมมาวงศ์",
  "นายพัทพล เพ็ชรสุวรรณ์","นายอนุสารน์ ไกรแก้ว","นางถนอมศรี แสงแก้ว",
  "นายจีระพงศ์ เพียรเจริญ","นางนิภาภรณ์ ก้งท้ง","นางไรหนับ หมัดสะอิ",
  "นางสุชาดา ทวีทรัพย์","นางสาวนูรีมัน วุนชูแก้ว","นางสาวศุภวรรณ พุทธสุภะ",
  "นางนารถฤดี อนุจันทร์","ว่าที่ ร.ต.หญิงสิริรัตน์ นกแก้ว","นางจันทนี จิตละเอียด",
  "นางสาวรัตน์ติกาล ฤทธิ์รักษา","นางสาวดุสิตา สันซัง","นายนัธทวัฒน์ มารักษา",
  "นายปรเมศร์ บำรุงหนูไหม","นางสาววรรณภา อุปการัตน์","นางสาวอรจิรา มณีรัตนสุบรรณ",
  "นางสาวอารีย์ ใบดิน","นางธีมาพร ทองเจือเพชร","นางดวงกมล อุบล",
  "นางสาวชัญญานุช สุวรรณนิตย์","นางสาวกมลวรรณ บุญมาก","นางสาวอามีร่าห์ จินเดหวา",
  "นางสาวอรอนงค์ ภูมิพงศ์ไทย","นายอริวัฒน์ สรรเพชร","นางสาววิรัลทิพย์ มุณีรัตน์",
  "นางสาวหนึ่งฤทัย แสงศรี","นางสาววิชุดา จันท์รัตนะ","นางสาวจุไรวรรณ สุวรรณมณี",
  "นางพิไลวรรณ์ ธรรมเพ็ชร","นางสาวศศิวิมล เจริญวิริยะภาพ","นางสาวพีรนุช หิรัญวงศ์",
  "นางณัฐมน สาระเจริญ","นางจุฑามาส ธีรภาพสถาพร","นางสาวเนตรทราย แหละปานแก้ว",
  "นางสุกัลญา เซ็นมุลิ","นางสาวอัมพวัน แก้วเพชร","นางสาวกิ่งกาญจน์ ตันติวุฒิ",
  "นายนุรดิน ยูโซะ","นายกิตติพงษ์ บิลหร่อหีม","นางสาวสุมณฑา บิลเดช",
  "ว่าที่ ร.ต.หญิงจินดา ทองวิเชียร","นางสาวพัชรพร หนูอ่อน","นางสุจารี ถาวรจิตต์",
  "นางสาวชุติมา เอกนก","นางสาวอาริญา เกิดชู","นางสาวฟารีนัส สามัญ",
  "ว่าที่ ร.ต.อับดุลรอฟิก ยะสะแต","นายพิศาล เพ็ชรสุวรรณ์","นางสาวชญาดา โกมาด",
  "นางสาววรางคณางค์ ลานแดง","นางสาวณัชชา เพ็ชรรัตน์","นายฐปกรณ์ หุลกิจ",
  "นางสาวณัฏฐินี คงทอง","นายรุสมาน ตาเยะ","นางสาววรรณพร เสน่หา",
  "นางภารดี คงสี","นางนริสา เส็นหลีหมีน","นางสาวจุรีรัตน์ นุรักษ์",
  "นางเยาวธิดา รัตญา","นางสาวรูวัยดา หวังยี","นายวิชยา ไชยแก้ว",
  "นางสาวประกายฟ้า ปวีณพงศ์","นางสาวธัญวลัย นวลละออง","นางสาววศินี ทิพย์รองพล",
  "นางสาวนริศรา ผิวผ่อง","นางสาวนพัฐธิกา กิตติยศพัฒน์","นางสาวสุรัสวดี ศิริพันธ์",
  "นางสาวนุชนารถ หมัดอะดั้ม","นายจารึก นุ่นศรี","นางสาวมารียะ สะอะ",
  "นายศุภวุฒิ ทองเจือเพชร","นางสาวสิรตา ทองแกมแก้ว","นางสาววันวิสา สุขสว่างผล",
  "นายรอมือลี สาและ","นางสาวมารีณีย์ ตาเยะ","นางจารุวรรณ จันทชาติ",
  "นางสิริพร หลีสุวรรณ","นางรุสณีย์ ตำหละ","นางสาวสุคนธมาศ รักเสมอ",
  "ว่าที่ ร.ต.หญิง เตชินี หมัดอาดัม","นายพชร อินทะมาตย์","นางสาวอัสมา ปรีพันธ์",
  "นางสาวจิรฐา ขุนฤทธิ์สง","นายวราห์ หมายดี","นางสาวกุลธิดา ชูมณี",
  "นางสาวคัมพิรา ชูประดิษ","นางสาววนิดา ประสมพงค์","นางสาวปภาวรา สรรเสริญ",
  "นางสาวกันย์สินี ชูมี","นางสาวอารยา บิลหรีม","นางสาวนิชการต์ เกื้อสกุล",
  "นางสาวอัยนี ดีแม","นางสาวสุนิษา คลังธาร","นางสาวนิกัษมา หนิเต็ม",
  "นางสาววรัญญา นพภาศรี","นางสาวลดาวัลย์ รัศมี","นางสาวณรัญญา อักษรชู",
  "นางสาวลักษิกา วิไลรัตน์","นางสาวศศิวรรณ เพชรรัตน์","นายไสฟูดิน สาและ",
  "นางสาวจิตนา นุ่นศรี","นางสาวพัชรี ดิสรังโส","นายทินกร เพ็ชรสุวรรณ์",
  "นายบุญเกื้อ สุขสบาย","นายอาบิต เจ๊ะมิ","นางสาวนิตยา ทองเพชรคง",
  "นางสาวพวงทอง มะณีบัว","นางสาวธัญญารัตน์ รัตนบริพันธ์","นางนิดา ณ พัทลุง",
  "นางสุนิสา ยอดแก้ว","นางสาวปิยธิดา เมืองน้อย","นางสาวไมมูน๊ะ หลีสุวรรณ",
  "นางชนิสรา ดำแก้ว","นางสาวพันธ์ทิพย์ สุขเอียด","นายซอลีฮี มะดาแฮ",
  "นางสาวโสรยา สันเบ็ญหมัด","นางยุพิน อยู่สุข","นางสุดาวดี ขวัญจินดา",
  "นางสาวธนิสร สุวรรณโณ","นางสาวนุชจรี แสงสีดำ","นางสาวชนัญญ์ทิชา มุสิแก้ว",
  "นางศิริพร หนูน้อย","นางสาวนัฐการณ์ จันทร์ช่วย","นางสาวกนกวรรณ หนูแก้ว",
  "นางสาวนุสบา ผลาวนิตย์","นางสาวจารุวรรณ จาโร","นางสาวอารตี แก้วนิล",
  "นายอนุวัฒน์ ปัตตะเน","นายวงศกร ไชยแก้ว","นางสาววรรณวนัช เอกนก",
  "นางอนันท์ แก้วพึ่งบุญ","นางสาวนภิษา สังข์น้อย","นางสาวจุฑาวรรณ์ รงฤทธิ์",
  "นายอานาส หะมีแย","นางสาวอรวี สันติเพชร","นางกาญจนา หนูคง",
  "นางสาวจันทร์จิรา ชูแว่น","นางสาวนูรี หะมะ","นายมุสลิม วุ่นชูแก้ว",
  "นางสาวเกศรา ถินะผจญ","นางสาวธัญดา อริยนันทกุล","นางสาวสุภาวดี แก้วมณี",
];

type SuccessInfo = {
  teacher: string;
  bookName: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
};

export default function BorrowForm() {
  const [teacherQuery, setTeacherQuery] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [foundBook, setFoundBook] = useState<{ id: string; name: string; status: string } | null>(null);
  const [searchingBook, setSearchingBook] = useState(false);
  const [bookSearchError, setBookSearchError] = useState("");
  const [borrowDate, setBorrowDate] = useState(today);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [error, setError] = useState("");
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    libraryApi.getTeachers().then((res) => {
      if (res.success && res.data) setTeachers(res.data);
    });
  }, []);

  const teacherNames = teachers.length > 0 ? teachers.map((t) => t["ชื่อ-นามสกุล"]) : TEACHER_LIST;
  const filteredTeachers = teacherNames.filter((t) => t.includes(teacherQuery));
  const selectedTeacherEmail = teachers.find((t) => t["ชื่อ-นามสกุล"] === selectedTeacher)?.["อีเมล"];

  function handleBorrowDateChange(val: string) {
    setBorrowDate(val);
    if (val) {
      const d = new Date(val);
      d.setDate(d.getDate() + 7);
      setDueDate(d.toISOString().split("T")[0]);
    }
  }

  function compressImage(file: File, maxDim = 1200, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("no canvas context")); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    if (side === "front") setFrontPhoto(compressed);
    else setBackPhoto(compressed);
  }

  async function handleSearchBook() {
    if (!bookQuery.trim()) return;
    setSearchingBook(true);
    setFoundBook(null);
    setBookSearchError("");
    setSelectedBook("");
    try {
      const res = await fetch("/api/gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "searchBook", query: bookQuery.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFoundBook(data.data);
        setSelectedBook(data.data.id);
      } else {
        setBookSearchError(data.error || "ไม่พบหนังสือที่ค้นหา");
      }
    } catch {
      setBookSearchError("ไม่สามารถเชื่อมต่อระบบได้");
    }
    setSearchingBook(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeacher || !selectedBook || !borrowDate) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!frontPhoto) {
      setError("กรุณาถ่ายภาพปกหน้าหนังสือ");
      return;
    }
    if (!backPhoto) {
      setError("กรุณาถ่ายภาพปกหลังหนังสือ");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/gas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "borrowBook",
          teacherName: selectedTeacher,
          bookId: selectedBook,
          dueDate,
          frontPhoto,
          backPhoto,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setSuccessInfo({
          teacher: selectedTeacher,
          bookName: foundBook?.name || selectedBook,
          bookId: selectedBook,
          borrowDate: new Date(borrowDate).toLocaleDateString("th-TH", {
            year: "numeric", month: "long", day: "numeric",
          }),
          dueDate: new Date(dueDate).toLocaleDateString("th-TH", {
            year: "numeric", month: "long", day: "numeric",
          }),
        });
        setSelectedTeacher("");
        setTeacherQuery("");
        setSelectedBook("");
        setBookQuery("");
        setFoundBook(null);
        setBorrowDate(today);
        const resetDue = new Date(today);
        resetDue.setDate(resetDue.getDate() + 7);
        setDueDate(resetDue.toISOString().split("T")[0]);
        setFrontPhoto(null);
        setBackPhoto(null);
        setTimeout(() => {
          setSuccess(false);
          setSuccessInfo(null);
        }, 30000);
      } else {
        setError(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
      <h2 className="text-xl font-semibold" style={{ color: "#1e3a5f" }}>
        แบบฟอร์มยืมหนังสือ
      </h2>
{/* เงื่อนไขการยืม */}
<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm space-y-2">
  <p className="font-semibold text-amber-800">📋 เงื่อนไขการยืม-คืนหนังสือ</p>
  <ul className="text-amber-700 space-y-1 text-xs leading-relaxed">
    <li>• กำหนดคืนหนังสือภายใน <strong>7 วัน</strong> นับจากวันที่ยืม</li>
    <li>• หากคืนเกินกำหนด มีค่าปรับ <strong>วันละ 5 บาท</strong></li>
    <li>• กรณีหนังสือสูญหายหรือชำรุดเสียสภาพ ต้องชำระค่าเสียหาย <strong>ตามราคาบนปกหนังสือ</strong></li>
    <li>• ค่าปรับที่ได้รับทั้งหมดจะนำไปจัดซื้อหนังสือเพิ่มเติมให้ห้องสมุด</li>
  </ul>
</div>
      {/* Success */}
      {success && successInfo && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-800 font-semibold">ส่งคำขอยืมหนังสือสำเร็จ! รอ Admin อนุมัติ</span>
          </div>
          <div className="bg-white rounded-xl p-4 space-y-2 text-sm border border-green-200">
            <div className="flex justify-between">
              <span className="text-slate-500">ผู้ยืม</span>
              <span className="font-semibold text-slate-800">{successInfo.teacher}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">หนังสือ</span>
              <span className="font-semibold text-slate-800">{successInfo.bookName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">รหัสหนังสือ</span>
              <span className="font-semibold text-slate-800">{successInfo.bookId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">วันที่ยืม</span>
              <span className="font-semibold text-slate-800">{successInfo.borrowDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">กำหนดคืน</span>
              <span className="font-semibold text-red-600">{successInfo.dueDate}</span>
            </div>
            <div className="border-t border-green-100 pt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">ค่าปรับเกินกำหนด</span>
                <span className="font-semibold text-red-600">วันละ 5 บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">หนังสือสูญหาย/ชำรุดเสียสภาพ</span>
                <span className="font-semibold text-red-600">ราคาตามปกหนังสือ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Teacher Dropdown */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          ชื่อครูผู้ยืม <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-base outline-none focus:border-blue-400 transition-colors"
            placeholder="พิมพ์ชื่อครูเพื่อค้นหา..."
            value={teacherQuery}
            onChange={(e) => {
              setTeacherQuery(e.target.value);
              setSelectedTeacher("");
              setShowTeacherDropdown(true);
            }}
            onFocus={() => setShowTeacherDropdown(true)}
            onBlur={() => setTimeout(() => setShowTeacherDropdown(false), 200)}
          />
          {selectedTeacher && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
        {showTeacherDropdown && filteredTeachers.length > 0 && (
          <div className="border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto mt-1">
            {filteredTeachers.map((t) => (
              <button key={t} type="button"
                onMouseDown={() => {
                  setSelectedTeacher(t);
                  setTeacherQuery(t);
                  setShowTeacherDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm transition-colors">
                {t}
              </button>
            ))}
          </div>
        )}
        {selectedTeacher && selectedTeacherEmail && (
          <p className="mt-1.5 text-xs text-slate-400">
            📧 จะส่งอีเมลแจ้งเตือนไปที่: <span className="font-medium text-slate-500">{selectedTeacherEmail}</span>
          </p>
        )}
      </div>

      {/* Book Search */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          รหัสหรือชื่อหนังสือ <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-base outline-none transition-colors ${
              foundBook ? "border-green-400 bg-green-50"
                : bookSearchError ? "border-red-300"
                : "border-slate-200 focus:border-blue-400"
            }`}
            placeholder="พิมพ์รหัส เช่น ท001 แล้วกดค้นหา"
            value={bookQuery}
            onChange={(e) => {
              setBookQuery(e.target.value);
              setFoundBook(null);
              setBookSearchError("");
              setSelectedBook("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleSearchBook(); }
            }}
          />
          {searchingBook && (
            <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
          )}
        </div>
        <button type="button" onClick={handleSearchBook}
          disabled={searchingBook || !bookQuery.trim()}
          className="mt-2 w-full py-2.5 rounded-xl border-2 border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
          {searchingBook ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          ค้นหาหนังสือ
        </button>
        {foundBook && (
          <div className="mt-2 px-4 py-3 bg-green-50 border-2 border-green-300 rounded-xl flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-800">{foundBook.name}</p>
              <p className="text-xs text-green-600">รหัส: {foundBook.id} | สถานะ: {foundBook.status}</p>
            </div>
          </div>
        )}
        {bookSearchError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} /> {bookSearchError}
          </p>
        )}
      </div>

      {/* Borrow Date */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          วันที่ยืม <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="date"
            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-base outline-none focus:border-blue-400 transition-colors"
            value={borrowDate}
            max={today}
            onChange={(e) => handleBorrowDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* Due Date (auto) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-blue-700">📅 กำหนดคืนอัตโนมัติ (+7 วัน)</span>
        <span className="font-semibold text-blue-800">
          {new Date(dueDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          ถ่ายภาพปกหนังสือ <span className="text-red-500">* (บังคับ)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input ref={frontInputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={(e) => handlePhoto(e, "front")} />
            <button type="button" onClick={() => frontInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed overflow-hidden relative flex items-center justify-center transition-colors"
              style={{ borderColor: frontPhoto ? "#22c55e" : "#e2e8f0", background: frontPhoto ? "#f0fdf4" : "#f8fafc" }}>
              {frontPhoto ? (
                <>
                  <img src={frontPhoto} alt="ปกหน้า" className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFrontPhoto(null); }}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                    <X size={14} className="text-slate-600" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Camera size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="text-xs text-slate-400">ปกหน้า</p>
                </div>
              )}
            </button>
          </div>
          <div>
            <input ref={backInputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={(e) => handlePhoto(e, "back")} />
            <button type="button" onClick={() => backInputRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed overflow-hidden relative flex items-center justify-center transition-colors"
              style={{ borderColor: backPhoto ? "#22c55e" : "#e2e8f0", background: backPhoto ? "#f0fdf4" : "#f8fafc" }}>
              {backPhoto ? (
                <>
                  <img src={backPhoto} alt="ปกหลัง" className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setBackPhoto(null); }}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                    <X size={14} className="text-slate-600" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Camera size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="text-xs text-slate-400">ปกหลัง</p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      <button type="submit"
        disabled={submitting || !selectedTeacher || !selectedBook}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white text-lg font-semibold transition-all disabled:opacity-40"
        style={{ background: "#1e3a5f" }}>
        {submitting
          ? <><Loader2 size={20} className="animate-spin" /> กำลังบันทึก...</>
          : <><BookOpen size={20} /> ส่งคำขอยืมหนังสือ</>
        }
      </button>
    </form>
  );
}