// ============================================================
// LIBRARY & LEARNING CENTER SYSTEM - Google Apps Script Backend
// ============================================================

const SPREADSHEET_ID = "1aXH65WG400Oc4N_kxFtLao4KesjfWlmAB8OemxtWt3Q"; // <-- ใส่ ID ของ Google Sheets
const LINE_NOTIFY_TOKEN = "YOUR_LINE_NOTIFY_TOKEN"; // <-- ใส่ Token ของ Line Notify

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
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
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
  if (book["สถานะ"] !== "พร้อมให้ยืม")
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
  for (let i = 1; i < bookData.length; i++) {
    if (bookData[i][0] === bookId) {
      bookSheet.getRange(i + 1, 3).setValue("ถูกยืม");
      break;
    }
  }

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
          returnStatus === "damaged" ? "ชำรุด" : "พร้อมให้ยืม"
        );
        break;
      }
    }
  }

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
  const { roomNumber, teacherName, studentName, received } = data;
  if (!roomNumber || !teacherName || !studentName)
    return { success: false, error: "ข้อมูลไม่ครบ" };
  const sheet = getSheet(SHEETS.CHECKIN_LOG);
  const timestamp = new Date();
  sheet.appendRow([roomNumber, teacherName, studentName, received || "", timestamp]);
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
    knowledge || "", imageUrl || "",
    signature || "", recorder, position || "",
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
function searchBook(query) {
  if (!query) return { success: false, error: "ต้องระบุคำค้นหา" };
  const books = sheetToJSON(getSheet(SHEETS.BOOKS));
  const found = books.find(b =>
    String(b["ID"]).toLowerCase() === String(query).toLowerCase() ||
    String(b["ชื่อหนังสือ"]).includes(query)
  );
  if (!found) return { success: false, error: "ไม่พบหนังสือรหัส/ชื่อ: " + query };
  if (found["สถานะ"] !== "พร้อมให้ยืม") {
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
  const { roomId, type, description, equipment, responsible, established, imageUrl, status } = data;
  if (!roomId) return { success: false, error: "ต้องระบุห้อง" };
  const sheet = getSheet(SHEETS.ROOM_REGISTRY);
  const id = generateID("REG");
  sheet.appendRow([
    id, roomId, type || "", description || "", equipment || "", responsible || "", established || "", imageUrl || "",
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
  const { id, type, description, equipment, responsible, established, imageUrl } = data;
  if (!id) return { success: false, error: "ต้องระบุ ID" };

  const sheet = getSheet(SHEETS.ROOM_REGISTRY);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIdx = headers.indexOf("ID");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      const rowIndex = i + 1;
      sheet.getRange(rowIndex, headers.indexOf("ประเภท") + 1).setValue(type || "");
      sheet.getRange(rowIndex, headers.indexOf("รายละเอียด") + 1).setValue(description || "");
      sheet.getRange(rowIndex, headers.indexOf("อุปกรณ์/สื่อ") + 1).setValue(equipment || "");
      sheet.getRange(rowIndex, headers.indexOf("ผู้รับผิดชอบ") + 1).setValue(responsible || "");
      sheet.getRange(rowIndex, headers.indexOf("วันที่จัดตั้ง") + 1).setValue(established || "");
      sheet.getRange(rowIndex, headers.indexOf("รูปภาพURL") + 1).setValue(imageUrl || "");
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