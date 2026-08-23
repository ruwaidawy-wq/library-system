// ใช้ escape ค่าที่มาจากผู้ใช้ก่อนแทรกลงในสตริง HTML ดิบ (เช่นหน้าต่างพิมพ์/PDF ที่สร้างด้วย
// window.open + document ผ่าน Blob) เพื่อกันไม่ให้ชื่อ/ข้อความที่กรอกมาโดยไม่ผ่านการยืนยันตัวตน
// (เช่น การเช็คอินห้องเรียนที่ใครก็เข้าถึงได้) แทรก tag หรือ attribute แปลกปลอมเข้าไปในเอกสารได้
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
