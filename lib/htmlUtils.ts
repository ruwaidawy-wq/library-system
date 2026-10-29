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

// เปิดเอกสาร HTML ในแท็บใหม่แล้วสั่งพิมพ์ (ผู้ใช้เลือก "บันทึกเป็น PDF" ได้จากหน้าต่างพิมพ์)
// เดิมสั่ง print() หลัง 800ms ตายตัว ซึ่งรูปจาก Google Drive มักโหลดไม่ทัน ทำให้รูปขึ้นบ้างไม่ขึ้นบ้าง
// จึงรอให้รูปและฟอนต์โหลดครบก่อน ส่วนรูปที่โหลดพลาด (Drive จำกัดคำขอถ้าโหลดพร้อมกันหลายรูป)
// ให้ลองโหลดใหม่อีกหนึ่งครั้งแบบเว้นจังหวะ และกันค้างไว้ที่ 20 วินาทีก่อนพิมพ์ไปเลย
const PRINT_WHEN_READY_SCRIPT = `<script>
(function () {
  var printed = false;
  function doPrint() {
    if (printed) return;
    printed = true;
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () { setTimeout(function () { window.print(); }, 300); });
  }
  function retry(img, i) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        img.onload = img.onerror = function () { resolve(); };
        var src = img.getAttribute("src");
        img.src = src + (src.indexOf("?") === -1 ? "?" : "&") + "retry=" + Date.now();
      }, 1000 + i * 300);
    });
  }
  window.addEventListener("load", function () {
    var failed = Array.prototype.filter.call(document.images, function (img) {
      return !img.naturalWidth && !/^data:/.test(img.getAttribute("src") || "");
    });
    if (failed.length === 0) return doPrint();
    Promise.all(failed.map(retry)).then(doPrint);
  });
  setTimeout(doPrint, 20000);
})();
</script>`;

export function openPrintWindow(html: string) {
  const withScript = html.includes("</body>")
    ? html.replace("</body>", `${PRINT_WHEN_READY_SCRIPT}</body>`)
    : html + PRINT_WHEN_READY_SCRIPT;
  const blob = new Blob([withScript], { type: "text/html;charset=utf-8" });
  window.open(URL.createObjectURL(blob), "_blank");
}
