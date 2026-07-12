const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function gasRequest<T>(params: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const res = await fetch("/api/gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json as ApiResponse<T>;
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============================================================
// TYPES
// ============================================================

export type Teacher = {
  "ชื่อ-นามสกุล": string;
  ตำแหน่ง: string;
};

export type Book = {
  ID: string;
  ชื่อหนังสือ: string;
  สถานะ: string;
};

export type BorrowLog = {
  ID: string;
  ชื่อผู้ยืม: string;
  รหัสหนังสือ: string;
  วันยืม: string;
  กำหนดคืน: string;
  วันคืนจริง: string;
  สถานะ: string;
  ค่าปรับ: number;
  สถานะชำระ?: string;
};

export type CheckIn = {
  RoomNumber: string;
  ชื่อครู: string;
  ชื่อนักเรียน: string;
  สิ่งที่ได้รับ: string;
  Timestamp: string;
};

export type Activity = {
  ID: string;
  วันที่: string;
  ห้องเรียน: string;
  รหัสหนังสือ: string;
  รายชื่อนักเรียน: string;
  รายชื่อครู: string;
  แหล่งเรียนรู้: string;
  ลักษณะกิจกรรม: string;
  รายละเอียด: string;
  สาระที่ได้รับ: string;
  ImageURL: string;
  Signature: string;
  ผู้บันทึก: string;
  ตำแหน่ง: string;
  สถานะ: string;
};

export type LeaderboardEntry = {
  room: string;
  count: number;
};

// ============================================================
// LIBRARY API
// ============================================================

export const libraryApi = {
  getTeachers: () => gasRequest<Teacher[]>({ action: "getTeachers" }),

  getBooks: () => gasRequest<Book[]>({ action: "getBooks" }),

  checkOverdue: (teacherName: string) =>
    gasRequest<{ hasOverdue: boolean; overdueBooks: BorrowLog[] }>({
      action: "checkOverdue", teacherName,
    }),

  borrowBook: (data: { teacherName: string; bookId: string; dueDate: string }) =>
    gasRequest<{ borrowId: string }>({ action: "borrowBook", ...data }),

returnBook: (data: {
  borrowId: string;
  returnStatus: "normal" | "lost" | "damaged" | "pending" | "rejected";
  manualFine?: number;
  actualReturnDate?: string;
}) =>
   gasRequest<{ fine: number }>({ action: "returnBook", ...data }),

  getBorrowLog: () => gasRequest<BorrowLog[]>({ action: "getBorrowLog" }),

  updatePaymentStatus: (borrowId: string, paymentStatus: string) =>
    gasRequest({ action: "updatePaymentStatus", borrowId, paymentStatus }),
};

// ============================================================
// LEARNING CENTER API
// ============================================================

export const learningApi = {
  checkIn: (data: {
    roomNumber: string;
    teacherName: string;
    studentName: string;
    received?: string;
  }) => gasRequest<{ timestamp: string }>({ action: "checkIn", ...data }),

  getCheckInsByRoom: (roomNumber: string) =>
    gasRequest<CheckIn[]>({ action: "getCheckInsByRoom", roomNumber }),

  getAllRoomsStats: () =>
    gasRequest<Record<string, number>>({ action: "getAllRoomsStats" }),

  getLeaderboard: () =>
    gasRequest<LeaderboardEntry[]>({ action: "getLeaderboard" }),
};

// ============================================================
// ACTIVITY API
// ============================================================

export const activityApi = {
  addActivity: (data: {
    date: string;
    roomNumber: string;
    students: string;
    teachers: string;
    learningSource: string;
    activityDetail: string;
    knowledge: string;
    imageUrl: string;
    signature: string;
    recorder: string;
    position: string;
  }) => gasRequest<{ id: string }>({ action: "addActivity", ...data }),

  getActivities: () =>
    gasRequest<Activity[]>({ action: "getActivities" }),

  getActivitiesByRoom: (roomNumber: string) =>
    gasRequest<Activity[]>({ action: "getActivitiesByRoom", roomNumber }),

  updateActivityStatus: (id: string, status: string) =>
    gasRequest({ action: "updateActivityStatus", id, status }),

  deleteActivity: (id: string) =>
    gasRequest({ action: "deleteActivity", id }),
};

// ============================================================
// ROOM REGISTRY TYPE & API
// ============================================================

export type RoomRegistryEntry = {
  ID: string;
  RoomID: string;
  ประเภท: string;
  รายละเอียด: string;
  "อุปกรณ์/สื่อ": string;
  ผู้รับผิดชอบ: string;
  วันที่จัดตั้ง: string;
  รูปภาพURL: string;
  สถานะ: string;
};

export const roomApi = {
  getRoomRegistryByRoom: (roomId: string) =>
    gasRequest<RoomRegistryEntry[]>({ action: "getRoomRegistryByRoom", roomId }),

  getRoomRegistry: () =>
    gasRequest<RoomRegistryEntry[]>({ action: "getRoomRegistry" }),

  addRoomRegistryEntry: (data: {
    roomId: string;
    type?: string;
    description?: string;
    equipment?: string;
    responsible?: string;
    established?: string;
    imageUrl?: string;
    status?: string;
  }) => gasRequest<{ id: string }>({ action: "addRoomRegistryEntry", ...data }),

  approveRoomRegistryEntry: (id: string) =>
    gasRequest({ action: "approveRoomRegistryEntry", id }),

  updateRoomRegistryEntry: (data: {
    id: string;
    type?: string;
    description?: string;
    equipment?: string;
    responsible?: string;
    established?: string;
    imageUrl?: string;
  }) => gasRequest({ action: "updateRoomRegistryEntry", ...data }),

  deleteRoomRegistryEntry: (id: string) =>
    gasRequest({ action: "deleteRoomRegistryEntry", id }),
};