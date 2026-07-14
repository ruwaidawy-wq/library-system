# 📚 ระบบห้องสมุด & แหล่งเรียนรู้

Next.js + Google Apps Script — พร้อม Deploy บน Vercel

---

## 🗂️ โครงสร้างไฟล์

```
library-system/
├── gas/
│   └── code.gs              ← Backend ทั้งหมด (copy ไปวางใน GAS)
├── app/
│   ├── layout.tsx            ← Root layout + Navbar
│   ├── page.tsx              ← หน้าหลัก (เลือกโซน)
│   ├── globals.css           ← Design tokens + Global styles
│   ├── library/
│   │   ├── layout.tsx        ← Library zone layout (Navy theme)
│   │   └── page.tsx          ← หน้ายืม/คืน/ประวัติ
│   ├── learning-center/
│   │   ├── layout.tsx        ← Learning zone layout (Green theme)
│   │   └── page.tsx          ← หน้า Room tabs + Leaderboard
│   └── checkin/
│       └── [roomId]/
│           └── page.tsx      ← Dynamic check-in page (QR Code)
├── components/
│   ├── Navbar.tsx            ← Navbar เปลี่ยนสีตามโซน
│   ├── library/
│   │   ├── BorrowForm.tsx    ← ฟอร์มยืมหนังสือ + เช็ค overdue
│   │   ├── ReturnForm.tsx    ← ฟอร์มคืน + ค่าปรับอัตโนมัติ/manual
│   │   └── BorrowLogTable.tsx
│   ├── StatsCard.tsx         ← สถิติห้องเรียน
│   ├── Gallery.tsx           ← แกลเลอรีภาพกิจกรรม + Lightbox
│   └── SignaturePad.tsx      ← Canvas signature input
├── lib/
│   └── gas.ts               ← API connector (TypeScript)
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 ขั้นตอน Setup

### 1. ตั้งค่า Google Sheets

สร้าง Google Spreadsheet ที่มี **5 sheet** ดังนี้:

| Sheet Name   | Columns                                                                 |
|--------------|-------------------------------------------------------------------------|
| `Books`      | ID, ชื่อหนังสือ, สถานะ                                                 |
| `Teachers`   | ชื่อ-นามสกุล, ตำแหน่ง, อีเมล (ใช้ส่งอีเมลแจ้งเตือนยืม/คืน/ใกล้ครบกำหนด) |
| `Borrow_Log` | ID, ชื่อผู้ยืม, รหัสหนังสือ, วันยืม, กำหนดคืน, วันคืนจริง, สถานะ, ค่าปรับ |
| `CheckIn_Log`| RoomNumber, ชื่อครู, ชื่อนักเรียน, สิ่งที่ได้รับ, Timestamp             |
| `Activities` | วันที่, ห้องเรียน, รหัสหนังสือ, รายละเอียด, ImageURL, Signature, ผู้บันทึก, ตำแหน่ง |

### 2. Deploy Google Apps Script

1. เปิด Google Apps Script: https://script.google.com
2. สร้าง Project ใหม่
3. Copy โค้ดจาก `gas/code.gs` วางทั้งหมด
4. แก้ไขค่า:
   ```js
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // จาก URL ของ Sheets
   const LINE_NOTIFY_TOKEN = "YOUR_LINE_TOKEN";   // จาก Line Notify
   ```
5. **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy **Web App URL**
7. รูปภาพ/ลายเซ็นที่อัปโหลด (เช็คอิน, บันทึกกิจกรรม, ทะเบียนแหล่งเรียนรู้) จะถูกอัปโหลดขึ้น Google Drive โฟลเดอร์ `LibrarySystemUploads` โดยอัตโนมัติ (แทนการฝัง base64 ลงชีตโดยตรง เพราะ Sheets จำกัดความยาวต่อเซลล์ไว้ที่ 50,000 ตัวอักษร) — ตอน Deploy ครั้งแรกหรือหลังแก้โค้ดที่แตะ `DriveApp` ระบบจะขอ authorize สิทธิ์ Drive เพิ่ม ให้กด **Allow**
8. เพื่อเปิดใช้อีเมลแจ้งเตือนกำหนดคืนหนังสือรายวัน (ส่งให้ครูที่หนังสือใกล้ครบกำหนด/เกินกำหนดคืน) ให้เปิด Apps Script editor → เลือกฟังก์ชัน `createDailyReminderTrigger` จาก dropdown ข้างปุ่ม Run → กด **Run** ครั้งเดียว (จะขอ authorize สิทธิ์ส่งอีเมลเพิ่ม ให้กด Allow) ระบบจะตั้งเวลาให้ส่งอีเมลอัตโนมัติทุกวันเวลา 08:00 น.

### 3. ตั้งค่า Environment Variable

```bash
cp .env.local.example .env.local
```

แก้ไขใน `.env.local`:
```
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

### 4. Run ในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

### 5. Deploy บน Vercel

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel

# หรือ push ขึ้น GitHub แล้วเชื่อมกับ Vercel Dashboard
# อย่าลืมเพิ่ม Environment Variable ใน Vercel:
# NEXT_PUBLIC_GAS_URL = [GAS Web App URL]
```

---

## 📱 QR Code สำหรับเช็คอิน

แต่ละห้องเรียนใช้ URL รูปแบบ:
```
https://your-domain.vercel.app/checkin/1-1
https://your-domain.vercel.app/checkin/1-2
https://your-domain.vercel.app/checkin/2-3
```

สร้าง QR Code จาก URL เหล่านี้ปริ้นติดหน้าห้อง

---

## 📌 Logic สำคัญ

### ค่าปรับ (Auto)
- คืนเกินกำหนด = จำนวนวันที่เกิน × 5 บาท
- คำนวณอัตโนมัติใน `code.gs > returnBook()`

### ค่าปรับ (Manual)
- กรณีหนังสือหาย/ชำรุด → เจ้าหน้าที่ระบุเองใน `ReturnForm.tsx`

### Overdue Check
- เมื่อเลือกครู → เรียก `checkOverdue()` ทันที
- ถ้ามีค้างยืม → แสดง Alert Box สีแดง พร้อมรายชื่อเล่ม

### Line Notify
- ส่งทุกครั้งที่มีการยืมหนังสือใหม่
- แก้ `LINE_NOTIFY_TOKEN` ใน `code.gs`
