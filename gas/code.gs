// ============================================================
// LIBRARY & LEARNING CENTER SYSTEM - Google Apps Script Backend
// ============================================================

const SPREADSHEET_ID = "1nw4ngoGTDkTZQKb_S6AX7rRsdHW2IAWsPbRWJccDWJo"; // <-- ใส่ ID ของ Google Sheets
const LINE_NOTIFY_TOKEN = "YOUR_LINE_NOTIFY_TOKEN"; // <-- ใส่ Token ของ Line Notify

// Secret ที่ต้องตรงกับ GAS_SHARED_SECRET ใน .env.local ของเว็บ (app/api/gas/route.ts เป็นผู้แนบให้อัตโนมัติ)
// กันไม่ให้คนที่เจอลิงก์ deploy นี้เรียก API ได้ตรงๆ โดยไม่ผ่านเว็บของเรา
const API_SECRET = "bef55e6be7eaed5a856b2de6c38bc5487dea7d96f10c3883";

const SHEETS = {
  BOOKS: "Books",
  TEACHERS: "Teachers",
  BORROW_LOG: "Borrow_Log",
  CHECKIN_LOG: "CheckIn_Log",
  ACTIVITIES: "Activities",
  ROOM_REGISTRY: "Room_Registry",
};

function doGet(e) {
  const params = e.parameter || {};
  if (params.action) {
    return handleRequest(e);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "GAS is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter || {};
  let postData = {};
if (e.postData) {
  try {
    postData = JSON.parse(e.postData.contents || "{}");
  } catch {
    postData = {};
  }
}
  const data = { ...params, ...postData };
  const action = data.action;

  if (data.token !== API_SECRET) {
    const output = ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
    return output;
  }

  let result;
  try {
    switch (action) {
      case "getTeachers":    result = getTeachers(); break;
      case "getBooks":       result = getBooks(); break;
      case "checkOverdue":   result = checkOverdue(data.teacherName); break;
      case "borrowBook":     result = borrowBook(data); break;
      case "approveBorrow":  result = approveBorrow(data); break;
      case "returnBook":     result = returnBook(data); break;
      case "getBorrowLog":   result = getBorrowLog(); break;
      case "checkIn":        result = checkIn(data); break;
      case "getCheckInsByRoom":   result = getCheckInsByRoom(data.roomNumber); break;
      case "getAllRoomsStats":    result = getAllRoomsStats(); break;
      case "addActivity":         result = addActivity(data); break;
      case "getActivitiesByRoom": result = getActivitiesByRoom(data.roomNumber); break;
      case "getLeaderboard":      result = getLeaderboard(); break;
      case "getActivities":        result = getActivities(); break;
case "updateActivityStatus": result = updateActivityStatus(data); break;
case "deleteActivity":       result = deleteActivity(data); break;
case "searchBook": result = searchBook(data.query); break;
case "updatePaymentStatus": result = updatePaymentStatus(data); break;
case "getRoomRegistryByRoom":  result = getRoomRegistryByRoom(data.roomId); break;
case "getRoomRegistry":        result = getRoomRegistry(); break;
case "addRoomRegistryEntry":   result = addRoomRegistryEntry(data); break;
case "updateRoomRegistryEntry":result = updateRoomRegistryEntry(data); break;
case "deleteRoomRegistryEntry":result = deleteRoomRegistryEntry(data.id); break;
case "approveRoomRegistryEntry":result = approveRoomRegistryEntry(data.id); break;
      default: result = { success: false, error: "Unknown action: " + action };

    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

const output = ContentService.createTextOutput(JSON.stringify(result))
  .setMimeType(ContentService.MimeType.JSON);
return output;
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) {
    throw new Error(`ไม่พบชีตชื่อ "${name}" ในสเปรดชีต (SPREADSHEET_ID: ${SPREADSHEET_ID}) — ตรวจสอบว่าชื่อแท็บตรงเป๊ะ (ตัวพิมพ์เล็ก/ใหญ่ ขีดล่าง) และสเปรดชีตนี้คือไฟล์เดียวกับที่ deploy ไว้`);
  }
  return sheet;
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  // ตัดช่องว่างหัว-ท้ายชื่อคอลัมน์ออก เพราะเซลล์หัวตารางบางอันมีช่องว่างแฝงอยู่
  // (เช่น "ID " แทนที่จะเป็น "ID") ทำให้ชื่อ key ไม่ตรงกับที่โค้ดฝั่งเว็บคาดหวัง
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}

function generateID(prefix) {
  return prefix + "_" + new Date().getTime();
}

// ============================================================
// IMAGE UPLOAD (เก็บรูปไว้ใน Google Drive แทนการฝัง base64 ลงชีต
// เพราะ Google Sheets จำกัดความยาวข้อความต่อเซลล์ไว้ที่ 50,000 ตัวอักษร
// ซึ่งรูปแบบ base64 มักยาวเกินนั้น ทำให้ค่าที่บันทึกถูกตัดจนภาพเสีย)
// ============================================================

const DRIVE_UPLOAD_FOLDER_NAME = "LibrarySystemUploads";

function getUploadFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_UPLOAD_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_UPLOAD_FOLDER_NAME);
}

function saveImageToDrive(dataUrl, prefix) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return dataUrl; // ไม่ใช่ base64 data URL (เช่น URL เดิมที่อัปโหลดไปแล้ว) ให้คงค่าเดิม

  const mimeType = match[1];
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, prefix + "_" + new Date().getTime());
  const file = getUploadFolder().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  // ใช้ endpoint thumbnail แทน uc?export=view เพราะ export=view มักโดน Google
  // แสดงหน้า "can't scan for viruses" แทนรูปจริงเวลาฝังใน <img>
  return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
}

function processImageField(value, prefix) {
  if (!value) return "";
  // ใช้ "|||" เป็นตัวคั่นแทน "," เพราะ data URL แต่ละอัน (data:image/png;base64,XXXX)
  // มี "," อยู่ในตัวมันเองอยู่แล้ว การ split ด้วย "," จะตัด data URL ขาดเป็นสองท่อนโดยไม่ตั้งใจ
  return String(value)
    .split("|||")
    .filter(Boolean)
    .map(item => saveImageToDrive(item.trim(), prefix))
    .join(",");
}

// ============================================================
// LIBRARY FUNCTIONS
// ============================================================

function getTeachers() {
  return { success: true, data: sheetToJSON(getSheet(SHEETS.TEACHERS)) };
}

function getBooks() {
  return { success: true, data: sheetToJSON(getSheet(SHEETS.BOOKS)) };
}

function checkOverdue(teacherName) {
  if (!teacherName) return { success: false, error: "ต้องระบุชื่อครู" };
  const data = sheetToJSON(getSheet(SHEETS.BORROW_LOG));
  const today = new Date();
  const overdueBooks = data.filter(row =>
    row["ชื่อผู้ยืม"] === teacherName &&
    row["สถานะ"] === "ยืมอยู่" &&
    new Date(row["กำหนดคืน"]) < today
  );
  return { success: true, hasOverdue: overdueBooks.length > 0, overdueBooks };
}

function borrowBook(data) {
  const { teacherName, bookId, dueDate } = data;
  if (!teacherName || !bookId || !dueDate)
    return { success: false, error: "ข้อมูลไม่ครบ" };

  const bookSheet = getSheet(SHEETS.BOOKS);
  const books = sheetToJSON(bookSheet);
  const book = books.find(b => b["ID"] === bookId);
  if (!book) return { success: false, error: "ไม่พบหนังสือ" };
  if (book["สถานะ"] !== "ว่างอยู่")
    return { success: false, error: "หนังสือเล่มนี้ไม่พร้อมให้ยืม" };

  const logSheet = getSheet(SHEETS.BORROW_LOG);
  const id = generateID("BRW");
  const today = new Date();

// ถ้าไม่ได้ระบุวันคืน ให้คืนภายใน 7 วันอัตโนมัติ
const returnDate = dueDate ? new Date(dueDate) : new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
logSheet.appendRow([
  id, teacherName, bookId, today, returnDate, "", "รอยืม", 0
]);

  // อัปเดตสถานะหนังสือเป็น "รอยืม"
  const bookData = bookSheet.getDataRange().getValues();
  for (let i = 1; i < bookData.length; i++) {
    if (bookData[i][0] === bookId) {
      bookSheet.getRange(i + 1, 3).setValue("รอยืม");
      break;
    }
  }

  sendLineNotify(`📚 คำขอยืมหนังสือใหม่\nครู: ${teacherName}\nหนังสือ: ${book["ชื่อหนังสือ"]} (${bookId})\nกำหนดคืน: ${dueDate}`);
  return { success: true, borrowId: id };
}

function approveBorrow(data) {
  const { borrowId } = data;
  if (!borrowId) return { success: false, error: "ต้องระบุ Borrow ID" };

  const sheet = getSheet(SHEETS.BORROW_LOG);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];

  const idIdx     = headers.indexOf("ID");
  const statusIdx = headers.indexOf("สถานะ");
  const bookIdIdx = headers.indexOf("รหัสหนังสือ");

  let rowIndex = -1;
  let rowData = null;
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === borrowId) {
      rowIndex = i + 1;
      rowData = allData[i];
      break;
    }
  }
  if (rowIndex === -1) return { success: false, error: "ไม่พบรายการยืม" };
  if (rowData[statusIdx] !== "รอยืม")
    return { success: false, error: "รายการนี้ไม่ได้อยู่ในสถานะรอยืม" };

  sheet.getRange(rowIndex, statusIdx + 1).setValue("ยืมอยู่");

  const bookId = rowData[bookIdIdx];
  const bookSheet = getSheet(SHEETS.BOOKS);
  const bookData = bookSheet.getDataRange().getValues();
  let bookName = bookId;
  for (let i = 1; i < bookData.length; i++) {
    if (bookData[i][0] === bookId) {
      bookSheet.getRange(i + 1, 3).setValue("ถูกยืม");
      bookName = bookData[i][1];
      break;
    }
  }

  const teacherName = rowData[headers.indexOf("ชื่อผู้ยืม")];
  const dueDate = rowData[headers.indexOf("กำหนดคืน")];
  sendEmailSafe(getTeacherEmail(teacherName), "ยืนยันการยืมหนังสือ: " + bookName,
    `เรียนคุณครู ${teacherName}\n\nระบบห้องสมุดยืนยันการยืมหนังสือ "${bookName}" เรียบร้อยแล้ว\nกำหนดคืน: ${new Date(dueDate).toLocaleDateString("th-TH")}\n\nกรุณาคืนหนังสือภายในกำหนดเพื่อหลีกเลี่ยงค่าปรับ`);

  return { success: true };
}

function returnBook(data) {
  const { borrowId, returnStatus, manualFine } = data;
  if (!borrowId) return { success: false, error: "ต้องระบุ Borrow ID" };

  const sheet = getSheet(SHEETS.BORROW_LOG);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];

  const idIdx        = headers.indexOf("ID");
  const dueDateIdx   = headers.indexOf("กำหนดคืน");
  const returnDateIdx= headers.indexOf("วันคืนจริง");
  const statusIdx    = headers.indexOf("สถานะ");
  const fineIdx      = headers.indexOf("ค่าปรับ");
  const bookIdIdx    = headers.indexOf("รหัสหนังสือ");

  let rowIndex = -1;
  let rowData = null;
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === borrowId) {
      rowIndex = i + 1;
      rowData = allData[i];
      break;
    }
  }
  if (rowIndex === -1) return { success: false, error: "ไม่พบรายการยืม" };

  const today = data.actualReturnDate ? new Date(data.actualReturnDate) : new Date();
  let fine = 0;
  let newStatus = "";
  const bookId = rowData[bookIdIdx];

  if (returnStatus === "pending") {
    // ผู้ใช้ส่งคำขอคืน — รอ Admin
    sheet.getRange(rowIndex, statusIdx + 1).setValue("รอคืน");
    // บันทึกวันคืนจริงที่ครูระบุ
    if (data.actualReturnDate) {
      sheet.getRange(rowIndex, returnDateIdx + 1).setValue(new Date(data.actualReturnDate));
    }
    return { success: true, fine: 0 };
  }

  if (returnStatus === "rejected") {
    // Admin ปฏิเสธ — กลับเป็นยืมอยู่
    sheet.getRange(rowIndex, statusIdx + 1).setValue("ยืมอยู่");
    return { success: true, fine: 0 };
  }

  if (returnStatus === "lost") {
    fine = parseFloat(manualFine) || 0;
    newStatus = "หนังสือหาย";
  } else if (returnStatus === "damaged") {
    fine = parseFloat(manualFine) || 0;
    newStatus = "หนังสือชำรุด";
  } else {
    // normal — Admin กำหนดค่าปรับเอง หรือคำนวณอัตโนมัติ
    if (manualFine && parseFloat(manualFine) > 0) {
      fine = parseFloat(manualFine);
    } else {
      const dueDate = new Date(rowData[dueDateIdx]);
// เปรียบเทียบแค่วันที่ ไม่เอาเวลา
const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
if (todayDate > dueDateOnly) {
  const diffDays = Math.ceil((todayDate - dueDateOnly) / (1000 * 60 * 60 * 24));
  fine = diffDays * 5;
} else {
  fine = 0;
}
    }
    newStatus = "คืนแล้ว";
  }

  sheet.getRange(rowIndex, returnDateIdx + 1).setValue(today);
  sheet.getRange(rowIndex, statusIdx + 1).setValue(newStatus);
  sheet.getRange(rowIndex, fineIdx + 1).setValue(fine);

  // อัปเดตสถานะหนังสือ
  if (returnStatus !== "lost") {
    const bookSheet = getSheet(SHEETS.BOOKS);
    const bookData = bookSheet.getDataRange().getValues();
    for (let i = 1; i < bookData.length; i++) {
      if (bookData[i][0] === bookId) {
        bookSheet.getRange(i + 1, 3).setValue(
          returnStatus === "damaged" ? "ชำรุด" : "ว่างอยู่"
        );
        break;
      }
    }
  }

  const teacherName = rowData[headers.indexOf("ชื่อผู้ยืม")];
  const fineText = fine > 0 ? `\nค่าปรับ: ${fine} บาท` : "";
  sendEmailSafe(getTeacherEmail(teacherName), "ยืนยันการคืนหนังสือ: " + getBookName(bookId),
    `เรียนคุณครู ${teacherName}\n\nระบบห้องสมุดบันทึกการคืนหนังสือ "${getBookName(bookId)}" เรียบร้อยแล้ว\nสถานะ: ${newStatus}${fineText}\n\nขอบคุณค่ะ`);

  return { success: true, fine };
}

function getBorrowLog() {
  return { success: true, data: sheetToJSON(getSheet(SHEETS.BORROW_LOG)) };
}

function updatePaymentStatus(data) {
  const { borrowId, paymentStatus } = data;
  const sheet = getSheet(SHEETS.BORROW_LOG);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  // เพิ่ม column "สถานะชำระ" ถ้ายังไม่มี
  let payIdx = headers.indexOf("สถานะชำระ");
  if (payIdx === -1) {
    const lastCol = headers.length + 1;
    sheet.getRange(1, lastCol).setValue("สถานะชำระ");
    payIdx = lastCol - 1;
  }

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === borrowId) {
      sheet.getRange(i + 1, payIdx + 1).setValue(paymentStatus);
      return { success: true };
    }
  }
  return { success: false, error: "ไม่พบรายการ" };
}

// ============================================================
// LEARNING CENTER FUNCTIONS
// ============================================================

function checkIn(data) {
  const { roomNumber, teacherName, studentName, received, imageUrl, corner } = data;
  if (!roomNumber || !teacherName || !studentName)
    return { success: false, error: "ข้อมูลไม่ครบ" };
  const sheet = getSheet(SHEETS.CHECKIN_LOG);
  const timestamp = new Date();
  sheet.appendRow([roomNumber, teacherName, studentName, received || "", timestamp, processImageField(imageUrl, "checkin"), corner || ""]);
  return { success: true, timestamp: timestamp.toISOString() };
}

function getCheckInsByRoom(roomNumber) {
  if (!roomNumber) return { success: false, error: "ต้องระบุห้องเรียน" };
  const data = sheetToJSON(getSheet(SHEETS.CHECKIN_LOG));
  return { success: true, data: data.filter(row => String(row["RoomNumber"]) === String(roomNumber)) };
}

function getAllRoomsStats() {
  const data = sheetToJSON(getSheet(SHEETS.CHECKIN_LOG));
  const stats = {};
  data.forEach(row => {
    const room = row["RoomNumber"];
    if (!stats[room]) stats[room] = 0;
    stats[room]++;
  });
  return { success: true, data: stats };
}

function addActivity(data) {
  const { date, roomNumber, students, teachers, learningSource,
    activityDetail, knowledge, imageUrl, signature, recorder, position } = data;
  const sheet = getSheet(SHEETS.ACTIVITIES);
  const id = generateID("ACT");
  const timestamp = new Date();
  sheet.appendRow([
    id, date || timestamp.toISOString(),
    roomNumber, students || "", teachers || "",
    learningSource || "", activityDetail || "",
    knowledge || "", processImageField(imageUrl, "activity"),
    processImageField(signature, "signature"), recorder, position || "",
    "รออนุมัติ"
  ]);

  // แจ้ง Line Notify ไปยัง Admin
  sendLineNotify(`📋 บันทึกกิจกรรมใหม่\nห้อง: ${roomNumber}\nผู้บันทึก: ${recorder} (${position})\nกิจกรรม: ${activityDetail}`);

  return { success: true, id };
}

function getActivities() {
  return { success: true, data: sheetToJSON(getSheet(SHEETS.ACTIVITIES)) };
}

function updateActivityStatus(data) {
  const { id, status } = data;
  const sheet = getSheet(SHEETS.ACTIVITIES);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");
  const statusIdx = headers.indexOf("สถานะ");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(status);
      return { success: true };
    }
  }
  return { success: false, error: "ไม่พบข้อมูล" };
}

function deleteActivity(data) {
  const { id } = data;
  const sheet = getSheet(SHEETS.ACTIVITIES);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "ไม่พบข้อมูล" };
}
function getActivitiesByRoom(roomNumber) {
  if (!roomNumber) return { success: false, error: "ต้องระบุห้องเรียน" };
  const data = sheetToJSON(getSheet(SHEETS.ACTIVITIES));
  return { success: true, data: data.filter(row => String(row["ห้องเรียน"]) === String(roomNumber)) };
}

function getLeaderboard() {
  const data = sheetToJSON(getSheet(SHEETS.CHECKIN_LOG));
  const counts = {};
  data.forEach(row => {
    const room = row["RoomNumber"];
    if (!counts[room]) counts[room] = 0;
    counts[room]++;
  });
  const sorted = Object.entries(counts)
    .map(([room, count]) => ({ room, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  return { success: true, data: sorted };
}

// ============================================================
// LINE NOTIFY
// ============================================================

function sendLineNotify(message) {
  try {
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", {
      method: "post",
      headers: { Authorization: "Bearer " + LINE_NOTIFY_TOKEN },
      payload: { message },
    });
  } catch (e) {
    Logger.log("Line Notify error: " + e.message);
  }
}

// ============================================================
// EMAIL NOTIFICATIONS (ยืม/คืนหนังสือ + แจ้งเตือนกำหนดคืนรายวัน)
// ต้องมีคอลัมน์ "อีเมล" ในชีต Teachers ถึงจะส่งอีเมลได้
// ============================================================

function getTeacherEmail(teacherName) {
  const teachers = sheetToJSON(getSheet(SHEETS.TEACHERS));
  const teacher = teachers.find(t => t["ชื่อ-นามสกุล"] === teacherName);
  return teacher ? String(teacher["อีเมล"] || "").trim() : "";
}

function getBookName(bookId) {
  const books = sheetToJSON(getSheet(SHEETS.BOOKS));
  const book = books.find(b => b["ID"] === bookId);
  return book ? book["ชื่อหนังสือ"] : bookId;
}

function sendEmailSafe(to, subject, body) {
  if (!to) return;
  try {
    MailApp.sendEmail(to, subject, body);
  } catch (e) {
    Logger.log("Email error: " + e.message);
  }
}

// สแกนรายการที่ "ยืมอยู่" ทุกวัน แล้วอีเมลแจ้งครูที่ใกล้ครบกำหนด (วันนี้/พรุ่งนี้) หรือเกินกำหนดแล้ว
// รันฟังก์ชัน createDailyReminderTrigger() ครั้งเดียวจาก Apps Script editor เพื่อตั้งเวลาอัตโนมัติ
function sendDueDateReminders() {
  const logs = sheetToJSON(getSheet(SHEETS.BORROW_LOG));
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const byTeacher = {};
  logs.forEach(log => {
    if (log["สถานะ"] !== "ยืมอยู่") return;
    const dueDate = new Date(log["กำหนดคืน"]);
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const diffDays = Math.round((dueDateOnly - todayOnly) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return; // แจ้งเฉพาะใกล้ครบกำหนด (วันนี้/พรุ่งนี้) หรือเกินกำหนดแล้ว

    const teacherName = log["ชื่อผู้ยืม"];
    const email = getTeacherEmail(teacherName);
    if (!email) return;

    if (!byTeacher[email]) byTeacher[email] = { name: teacherName, overdue: [], dueSoon: [] };
    const line = `- ${getBookName(log["รหัสหนังสือ"])} (กำหนดคืน ${dueDateOnly.toLocaleDateString("th-TH")})`;
    if (diffDays < 0) byTeacher[email].overdue.push(line);
    else byTeacher[email].dueSoon.push(line);
  });

  Object.keys(byTeacher).forEach(email => {
    const info = byTeacher[email];
    let body = `เรียนคุณครู ${info.name}\n\n`;
    if (info.overdue.length) body += `หนังสือที่เกินกำหนดคืนแล้ว:\n${info.overdue.join("\n")}\n\n`;
    if (info.dueSoon.length) body += `หนังสือที่ใกล้ครบกำหนดคืน:\n${info.dueSoon.join("\n")}\n\n`;
    body += "กรุณาคืนหนังสือที่ห้องสมุดค่ะ";
    sendEmailSafe(email, "แจ้งเตือนกำหนดคืนหนังสือ", body);
  });
}

// รันฟังก์ชันนี้เพียงครั้งเดียวจาก Apps Script editor (เลือกฟังก์ชันนี้แล้วกด Run)
// เพื่อตั้งเวลาให้ sendDueDateReminders() ทำงานอัตโนมัติทุกวันตอน 08:00 น.
function createDailyReminderTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "sendDueDateReminders") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sendDueDateReminders").timeBased().everyDays(1).atHour(8).create();
}
function searchBook(query) {
  if (!query) return { success: false, error: "ต้องระบุคำค้นหา" };
  const books = sheetToJSON(getSheet(SHEETS.BOOKS));
  const found = books.find(b =>
    String(b["ID"]).toLowerCase() === String(query).toLowerCase() ||
    String(b["ชื่อหนังสือ"]).includes(query)
  );
  if (!found) return { success: false, error: "ไม่พบหนังสือรหัส/ชื่อ: " + query };
  if (found["สถานะ"] !== "ว่างอยู่") {
    return {
      success: false,
      error: `หนังสือ "${found["ชื่อหนังสือ"]}" ไม่พร้อมให้ยืม (สถานะ: ${found["สถานะ"]})`
    };
  }
  return {
    success: true,
    data: {
      id: found["ID"],
      name: found["ชื่อหนังสือ"],
      status: found["สถานะ"],
    }
  };
}

// ============================================================
// ROOM REGISTRY (ทะเบียนแหล่งเรียนรู้ / มุมการเรียนรู้)
// ============================================================

function getRoomRegistryByRoom(roomId) {
  if (!roomId) return { success: false, error: "ต้องระบุห้อง" };
  const data = sheetToJSON(getSheet(SHEETS.ROOM_REGISTRY));
  return { success: true, data: data.filter(row => String(row["RoomID"]) === String(roomId)) };
}

function getRoomRegistry() {
  return { success: true, data: sheetToJSON(getSheet(SHEETS.ROOM_REGISTRY)) };
}

function addRoomRegistryEntry(data) {
  const { roomId, name, type, description, equipment, responsible, established, imageUrl, status } = data;
  if (!roomId) return { success: false, error: "ต้องระบุห้อง" };
  const sheet = getSheet(SHEETS.ROOM_REGISTRY);
  const id = generateID("REG");
  sheet.appendRow([
    id, roomId, name || "", type || "", description || "", equipment || "", responsible || "", established || "", processImageField(imageUrl, "registry"),
    status || "รออนุมัติ"
  ]);
  return { success: true, id };
}

function approveRoomRegistryEntry(id) {
  if (!id) return { success: false, error: "ต้องระบุ ID" };
  const sheet = getSheet(SHEETS.ROOM_REGISTRY);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");
  const statusIdx = headers.indexOf("สถานะ");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.getRange(i + 1, statusIdx + 1).setValue("อนุมัติแล้ว");
      return { success: true };
    }
  }
  return { success: false, error: "ไม่พบข้อมูล" };
}

function updateRoomRegistryEntry(data) {
  const { id, name, type, description, equipment, responsible, established, imageUrl } = data;
  if (!id) return { success: false, error: "ต้องระบุ ID" };

  const sheet = getSheet(SHEETS.ROOM_REGISTRY);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      const rowIndex = i + 1;
      sheet.getRange(rowIndex, headers.indexOf("ชื่อ") + 1).setValue(name || "");
      sheet.getRange(rowIndex, headers.indexOf("ประเภท") + 1).setValue(type || "");
      sheet.getRange(rowIndex, headers.indexOf("รายละเอียด") + 1).setValue(description || "");
      sheet.getRange(rowIndex, headers.indexOf("อุปกรณ์/สื่อ") + 1).setValue(equipment || "");
      sheet.getRange(rowIndex, headers.indexOf("ผู้รับผิดชอบ") + 1).setValue(responsible || "");
      sheet.getRange(rowIndex, headers.indexOf("วันที่จัดตั้ง") + 1).setValue(established || "");
      sheet.getRange(rowIndex, headers.indexOf("รูปภาพURL") + 1).setValue(processImageField(imageUrl, "registry"));
      return { success: true };
    }
  }
  return { success: false, error: "ไม่พบข้อมูล" };
}

function deleteRoomRegistryEntry(id) {
  if (!id) return { success: false, error: "ต้องระบุ ID" };
  const sheet = getSheet(SHEETS.ROOM_REGISTRY);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "ไม่พบข้อมูล" };
}