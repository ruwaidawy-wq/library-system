"use client";
import { useState, useRef } from "react";
import SignaturePad from "@/components/SignaturePad";
import { Camera, Pen, CheckCircle, X, Loader2, Search, Plus } from "lucide-react";
import { activityApi } from "@/lib/gas";

const LOGO_URL = "https://i.postimg.cc/Vvvyp9Df/logo-resized.png";

const ROOMS = [
  "ห้องเตรียมความพร้อม 1","ห้องเตรียมความพร้อม 2","ห้องเตรียมความพร้อม 3",
  "ห้องเตรียมความพร้อม 4","ห้องเตรียมความพร้อม 5","ห้องเตรียมความพร้อม 6",
  "ห้องเตรียมความพร้อม 7","ห้องเตรียมความพร้อม 8","ห้องเตรียมความพร้อม 9",
];

const LEARNING_SOURCES = [
  "ห้องสมุด","ห้องคอมพิวเตอร์","ห้องวิทยาศาสตร์",
  "ห้องศิลปะ","ห้องดนตรี","สวนการเรียนรู้",
  "ห้องนิทรรศการ","ห้องกิจกรรมพิเศษ","อื่นๆ",
];

const POSITIONS = [
  "ครูผู้สอน","ครูการศึกษาพิเศษ","ครูพี่เลี้ยง",
  "นักวิชาการศึกษา","ผู้บริหาร","อื่นๆ",
];

const STUDENTS: { name: string; room: string }[] = [
  { name: "เด็กหญิงรุ่งนภา หมัดหมัน", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กหญิงภัคภัสร์ปภา ปาณะศรี", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กหญิงจัสมิน อะหวัง", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายนันทวัฒน์ เม๊าะรัตน์", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายซัลฟา ดอเลาะ", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายภูวเดช ศรีสุวรรณ", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กหญิงอารียา หมุสา", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายสกรรจ์ ไชยสาลี", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายมูฮัมหมัดฮาฟิต มะลี", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายกวินกานต์ สังขะหรี", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายวุฒิกร จันทร์รัตนะ", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กหญิงปภัสสร ชูชนะ", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายมุกตารี เจะหนิ", room: "ห้องเตรียมความพร้อม 1" },
  { name: "เด็กชายฟาเดล ใบโดย", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กชายอักรอบีน ดนหรอหมาน", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กหญิงซิลมีย์ หมัดเบ็ญหมูด", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กชายมูฮัมหมัดฮาฟิส สันดาโอ๊ะ", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กหญิงรุสณี หม๊ะบ๊ะ", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กหญิงอารีน่า บิลละหีม", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กชายธนกฤต พรรณราย", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กหญิงซูไฮลา ขรีดาโอะ", room: "ห้องเตรียมความพร้อม 2" },
  { name: "เด็กชายพลกร แก้วศรี", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กหญิงพิชชานัณ หนูแก้ว", room: "ห้องเตรียมความพร้อม 3" },
  { name: "นางสาวสุธิมา กุ้งแก้ว", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กหญิงนันธิดา รอดชู", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กชายมูฮัมหมัดฟาเอสร์ โต๊ะสลำ", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กชายมูฮำหมัดอัสลัน หวาหลำ", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กชายสิงหรัตน์ หมัดแหล๊ะ", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กชายชนกภณ ชุมนิรัตน์", room: "ห้องเตรียมความพร้อม 3" },
  { name: "เด็กชายซุลกิฟลี สาและสา", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กหญิงรัศม์ณชากร ยอดสวัสดิ์", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กชายมาวิน พม่า", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กหญิงแวฮารีซ่า เหมเภอ", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กหญิงปัญญาพร เขมาภิระโต", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กชายธีรเดช หมิดหมัน", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กชายณัฐพัชร์ หัสเส็น", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กชายมูฮัมหมัดอีดีนฟิตรี อุมา", room: "ห้องเตรียมความพร้อม 4" },
  { name: "เด็กหญิงนัจญวา มาหัด", room: "ห้องเตรียมความพร้อม 4" },
  { name: "นายนำพล แดงหลี", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายกฤชณัท ศิริรัตน์", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายอินอาม บิลลิหมัด", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายอาโนว์ชัชวาล เหมแก้ว", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายคชาเพชร บูบาสอ", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายวีระกาลย์ หมันหลี", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายฟาเดล ละหมาน", room: "ห้องเตรียมความพร้อม 5" },
  { name: "เด็กชายวันอัสรี เมาะหรัด", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กชายภูมินทร์ หิรัญวิริยะ", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กชายภคพล เกิดพันธ์", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กหญิงกชพร องอาจ", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กหญิงพัณณิตา วงค์สนิท", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กชายไซอิด โรเมล ฮอสเซ็น", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กชายอัฎฎาฮา ดุนี", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กชายอัครวินทร์ หนูหรีม", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กชายธีรวิทย์ บุญญะ", room: "ห้องเตรียมความพร้อม 6" },
  { name: "เด็กหญิงฮานิ เหนียวย้อย", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายอนาวิน เอียดวารี", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กหญิงยศวดี บัวผุด", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายชัยอนันต์ พรหมเจริญ", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายภัคดีบดินทร์ กลับกล่อม", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กหญิงอลิสสา บุญทอง", room: "ห้องเตรียมความพร้อม 7" },
  { name: "นายณนน หมุดเส็ม", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายอนุสรณ์ หัดสหมัด", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายปิยพัฒน์ โต๊ะอิด", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายศิวบุญ มีเสน", room: "ห้องเตรียมความพร้อม 7" },
  { name: "เด็กชายสราวุฒิ หนุดทอง", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กหญิงตัสนีม ดินอะ", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กหญิงวิภาวดี พาพันธ์", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กหญิงนัสรีน สือแลแม", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กหญิงราฮีมา อิบู", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กชายกวิน แซ่คุง", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กชายกิตติ์ชานันท์ เหมือนเสน", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กหญิงขวัญจิรา มูเก็ม", room: "ห้องเตรียมความพร้อม 8" },
  { name: "เด็กชายธันวา จันทพันธ์", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กหญิงกัญญาภัค สังข์ทอง", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กหญิงธัญชนก บัวชุม", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กหญิงกานต์นิชา หัสเส็น", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กหญิงอิสริญา อิสลาม", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กหญิงฮาสาน๊ะ บินเตล็บ", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กชายบุญรอด บทจร", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กชายปองพล ทองไชย", room: "ห้องเตรียมความพร้อม 9" },
  { name: "เด็กหญิงสุไรยา สอโส๊ะ", room: "ห้องเตรียมความพร้อม 9" },
];

const TEACHER_LIST = [
  { name: "นายกฤษฎา แก้วประดับ", position: "ผู้อำนวยการ" },
  { name: "นายสุกกรี วามะ", position: "รองผู้อำนวยการ" },
  { name: "นางนภาพร คงสอน", position: "รองผู้อำนวยการ" },
  { name: "นายสาธิด วารีกุล", position: "ครูชำนาญการพิเศษ" },
  { name: "นางสาวสัณฑ์สินี ทองเจือเพชร", position: "ครูชำนาญการพิเศษ" },
  { name: "นายเดชา ภุมมาวงศ์", position: "ครูชำนาญการพิเศษ" },
  { name: "นายพัทพล เพ็ชรสุวรรณ์", position: "ครูชำนาญการพิเศษ" },
  { name: "นายอนุสารน์ ไกรแก้ว", position: "ครูชำนาญการพิเศษ" },
  { name: "นางถนอมศรี แงแก้ว", position: "ครูชำนาญการพิเศษ" },
  { name: "นายจีระพงศ์ เพียรเจริญ", position: "ครูชำนาญการพิเศษ" },
  { name: "นางนิภาภรณ์ ก้งท้ง", position: "ครูชำนาญการพิเศษ" },
  { name: "นางไรหนับ หมัดสะอิ", position: "ครูชำนาญการพิเศษ" },
  { name: "นางสุชาดา ทวีทรัพย์", position: "ครูชำนาญการพิเศษ" },
  { name: "นางสาวนูรีมัน วุนชูแก้ว", position: "ครูชำนาญการพิเศษ" },
  { name: "นางสาวศุภวรรณ พุทธสุภะ", position: "ครูชำนาญการพิเศษ" },
  { name: "นางนารถฤดี อนุจันทร์", position: "ครูชำนาญการพิเศษ" },
  { name: "ว่าที่ ร.ต.หญิงสิริรัตน์ นกแก้ว", position: "ครู คศ.๓" },
  { name: "นางจันทนี จิดละเอียด", position: "ครูชำนาญการพิเศษ" },
  { name: "นางสาวรัตน์ติกาล ฤทธิ์รักษา", position: "ครูชำนาญการพิเศษ" },
  { name: "นางสาวดุสิตา สันซัง", position: "ครูชำนาญการพิเศษ" },
  { name: "นายนัธทวัฒน์ มารักษา", position: "ครูชำนาญการ" },
  { name: "นายปรเมศร์ บำรุงหนูไหม", position: "ครูชำนาญการ" },
  { name: "นางสาววรรณภา อุปการัตน์", position: "ครูชำนาญการ" },
  { name: "นางสาวอรจิรา มณีรัตนสุบรรณ", position: "ครูชำนาญการ" },
  { name: "นางสาวอารีย์ ใบดิน", position: "ครูชำนาญการ" },
  { name: "นางธีมาพร ทองเจือเพชร", position: "ครูชำนาญการ" },
  { name: "นางดวงกมล อุบล", position: "ครูชำนาญการ" },
  { name: "นางสาวชัญญานุช สุวรรณนิตย์", position: "ครูชำนาญการ" },
  { name: "นางสาวกมลวรรณ บุญมาก", position: "ครู คศ.๒" },
  { name: "นางสาวอามีร่าห์ จินเดหวา", position: "ครู คศ.๒" },
  { name: "นางสาวอรอนงค์ ภูมิพงศ์ไทย", position: "ครู คศ.๒" },
  { name: "นายอริวัฒน์ สรรเพชร", position: "ครู คศ.๒" },
  { name: "นางสาววิรัลทิพย์ มุณีรัตน์", position: "ครู คศ.๒" },
  { name: "นางสาวหนึ่งฤทัย แสงศรี", position: "ครูชำนาญการ" },
  { name: "นางสาววิชุดา จันท์รัดนะ", position: "ครูชำนาญการ" },
  { name: "นางสาวจุไรวรรณ สุวรรณมณี", position: "ครูชำนาญการ" },
  { name: "นางพิไลวรรณ์ ธรรมเพ็ชร", position: "ครูชำนาญการ" },
  { name: "นางสาวศศิวิมล เจริญวิริยะภาพ", position: "ครูชำนาญการ" },
  { name: "นางสาวพีรนุช หิรัญวงศ์", position: "ครูชำนาญการ" },
  { name: "นางณัฐมน สาระเจริญ", position: "ครูชำนาญการ" },
  { name: "นางจุฑามาส ธีรภาพสถาพร", position: "ครูชำนาญการ" },
  { name: "นางสาวเนตรทราย แหละปานแก้ว", position: "ครูชำนาญการ" },
  { name: "นางสุกัลญา เซ็นมุลิ", position: "ครูชำนาญการ" },
  { name: "นางสาวอัมพวัน แก้วเพชร", position: "ครูชำนาญการ" },
  { name: "นางสาวกิ่งกาญจน์ ตันติวุฒิ", position: "ครูชำนาญการ" },
  { name: "นายนุรดิน ยูโซะ", position: "ครูชำนาญการ" },
  { name: "นายกิตติพงษ์ บิลหร่อทีม", position: "ครู" },
  { name: "นางสาวสุมณฑา บิลเดช", position: "ครู" },
  { name: "ว่าที่ ร.ต.หญิงจินดา ทองวิเชียร", position: "ครู" },
  { name: "นางสาวพัชรพร หนูอ่อน", position: "ครู" },
  { name: "นางสุจารี ถาวรจิตต์", position: "ครู" },
  { name: "นางสาวชุติมา เอกนก", position: "ครู" },
  { name: "นางสาวอาริญา เกิดชู", position: "ครู" },
  { name: "นางสาวฟารีนัส สามัญ", position: "ครู" },
  { name: "ว่าที่ ร.ต.อับดุลรอฟิก ยะสะแต", position: "ครู" },
  { name: "นายพิศาล เพ็ชรสุวรรณ์", position: "ครู" },
  { name: "นางสาวชญาดา โกมาด", position: "ครู" },
  { name: "นางสาววรางคณางค์ ลานแดง", position: "ครู" },
  { name: "นางสาวณัชชา เพ็ชรรัตน์", position: "ครู" },
  { name: "นายฐปกรณ์ หุลกิจ", position: "ครู" },
  { name: "นางสาวณัฏฐินี คงทอง", position: "ครู" },
  { name: "นายรุสมาน ดาเยะ", position: "ครู" },
  { name: "นางสาววรรณพร เสน่หา", position: "ครู" },
  { name: "นางภารดี คงสี", position: "ครู" },
  { name: "นางนริสา เส็นหลีหมึน", position: "ครู" },
  { name: "นางสาวจุรีรัตน์ นุรักษ์", position: "ครู" },
  { name: "นางเยาวธิดา รัดญา", position: "ครู" },
  { name: "นางสาวรูวัยดา หวังยี", position: "ครู" },
  { name: "นายวิชยา ไชยแก้ว", position: "ครู" },
  { name: "นางสาวประกายฟ้า ปวีณพงศ์", position: "ครู" },
  { name: "นางสาวธัญวลัย นวลละออง", position: "ครู" },
  { name: "นางสาววศินี ทิพย์รองพล", position: "ครู" },
  { name: "นางสาวนริศรา ผิวผ่อง", position: "ครู" },
  { name: "นางสาวนพัฐธิกา กิตติยศพัฒน์", position: "ครู" },
  { name: "นางสาวสุรัสวดี ศิริพันธ์", position: "ครู" },
  { name: "นางสาวนุชนารถ หมัดอะดั้ม", position: "ครู" },
  { name: "นายจารึก นุ่นศรี", position: "ครูผู้ช่วย" },
  { name: "นางสาวมารียะ สะอะ", position: "ครูผู้ช่วย" },
  { name: "นายศุภวุฒิ ทองเจือเพชร", position: "ครูผู้ช่วย" },
  { name: "นางสาวสิรดา ทองแกมแก้ว", position: "ครูผู้ช่วย" },
  { name: "นางสาววันวิสา สุขสว่างผล", position: "ครูผู้ช่วย" },
  { name: "นายรอมือลี สาและ", position: "ครูผู้ช่วย" },
  { name: "นางสาวมารีณีย์ ตาเยะ", position: "ครูผู้ช่วย" },
  { name: "นางจารุวรรณ จันทชาติ", position: "ครูผู้สอน" },
  { name: "นางสิริพร หลีสุวรรณ", position: "ครูผู้สอน" },
  { name: "นางรุสณีย์ ด่าหละ", position: "ครูผู้สอน" },
  { name: "นางสาวสุคนธมาศ รักเสมอ", position: "ครูผู้สอน" },
  { name: "ว่าที่ ร.ต.หญิง เดชินี หมัดอาดัม", position: "ครูผู้สอน" },
  { name: "นายพชร อินทะมาตย์", position: "ครูผู้สอน" },
  { name: "นางสาวอัสมา ปรีพันธ์", position: "ครูผู้สอน" },
  { name: "นางสาวจิรฐา ขุนฤทธิ์สง", position: "ครูผู้สอน" },
  { name: "นายวราห์ หมายดี", position: "ครูผู้สอน" },
  { name: "นางสาวกุลธิดา ชูมณี", position: "ครูผู้สอน" },
  { name: "นางสาวคัมพิรา ชูประดิษ", position: "ครูผู้สอน" },
  { name: "นางสาววนิดา ประสมพงค์", position: "ครูผู้สอน" },
  { name: "นางสาวปภาวรา สรรเสริญ", position: "ครูผู้สอน" },
  { name: "นางสาวกันย์สินี ซูมิ", position: "ครูผู้สอน" },
  { name: "นางสาวอารยา บิลหรืม", position: "ครูผู้สอน" },
  { name: "นางสาวนิชการ เกื้อสกุล", position: "ครูผู้สอน" },
  { name: "นางสาวอัยนี ดีแม", position: "ครูผู้สอน" },
  { name: "นางสาวสุนิษา คลังธาร", position: "ครูผู้สอน" },
  { name: "นางสาวนิกัษมา หนิเต็ม", position: "ครูผู้สอน" },
  { name: "นางสาววรัญญา นพภาศรี", position: "ครูผู้สอน" },
  { name: "นางสาวลดาวัลย์ รัศมี", position: "ครูผู้สอน" },
  { name: "นางสาวณรัญญา อักษรชู", position: "คนครัว" },
  { name: "นางสาวลักษิกา วิไลรัตน์", position: "พนักงานพิมพ์เบรลล์" },
  { name: "นางสาวศศิวรรณ เพชรรัตน์", position: "ครูอัตราจ้าง" },
  { name: "นายไสฟูดิน สาและ", position: "ครูอัตราจ้าง" },
  { name: "นางสาวจิตนา นุ่นศรี", position: "ครูอัตราจ้าง" },
  { name: "นางสาวพัชรี ดิสรังโส", position: "ธุรการ" },
  { name: "นายทินกร เพ็ชรสุวรรณ์", position: "พนักงานขับรถยนด์" },
  { name: "นายบุญเกื้อ สุขสบาย", position: "พนักงานขับรถยนด์" },
  { name: "นายอาบิด เจ๊ะมี", position: "นักการ" },
  { name: "นางสาวนิตยา ทองเพชรคง", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวพวงทอง มะณีบัว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวธัญญารัด น์ รัดนบริพันธ์", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางนิดา ณ พัทลุง", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสุนิสา ยอดแก้ว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวปิยธิดา เมืองน้อย", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวไมมูน๊ะ หลีสุวรรณ", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางชนิสรา ด่าแก้ว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวพันธ์ทิพย์ สุขเอียด", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นายซอลีฮี มะดาแฮ", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวโสรยา สันเบ็ญหมัด", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางยุพิน อยู่สุข", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสุดาวดี ขวัญจินดา", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวธนิสร สุวรรณโณ", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวนุชจรี แงสีด่า", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวชนัญญ์ทิชา มุสิแก้ว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางศิริพร หนูน้อย", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวนัฐการณ์ จันทร์ช่วย", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวกนกวรรณ หนูแก้ว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวนุสบา ผลาวนิตย์", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวจารุวรรณ จาโร", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวอารดี แก้วนิล", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นายอนุวัฒน์ ปัดตะเน", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นายวงศกร ไชยแก้ว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาววรรณวนัช เอกนก", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางอนันท์ แก้วพึ่งบุญ", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวนภิษา สังข์น้อย", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวจุฑาวรรณ์ รงฤทธิ์", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นายอานาส หะมีแย", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวอรวี สันดิเพชร", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางกาญจนา หนูคง", position: "พี่เลี้ยงเด็กปัญญาอ่อน" },
  { name: "นางสาวจันทร์จิรา ชูแว่น", position: "พี่เลี้ยงเด็กปัญญาอ่อน" },
  { name: "นางสาวนูรี หะมะ", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นายมุสลิม วุ่นชูแก้ว", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวเกศรา ถินะผจญ", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวธัญดา อริยนันทกุล", position: "พี่เลี้ยงเด็กพิการ" },
  { name: "นางสาวสุภาวดี แก้วมณี", position: "พี่เลี้ยงเด็กพิการ" }
];


// Searchable multi-select dropdown
function MultiSelectDropdown({
  label, items, selected, onAdd, onRemove, placeholder,
}: {
  label: string;
  items: string[];
  selected: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const filtered = items.filter(i => i.includes(query) && !selected.includes(i));

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map(s => (
            <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ background: "#e8f0fb", color: "#1e3a5f" }}>
              {s}
              <button type="button" onClick={() => onRemove(s)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-8 pr-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setShow(true); }}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 200)}
        />
      </div>
      {show && filtered.length > 0 && (
        <div className="border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1 bg-white z-10 relative">
          {filtered.map(item => (
            <button key={item} type="button"
              onMouseDown={() => { onAdd(item); setQuery(""); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs transition-colors flex items-center gap-2">
              <Plus size={12} className="text-blue-400" /> {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActivityPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [room, setRoom] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [learningSource, setLearningSource] = useState("");
  const [activityDetail, setActivityDetail] = useState("");
  const [knowledge, setKnowledge] = useState("");
  const [recorder, setRecorder] = useState("");
  const [recorderPosition, setRecorderPosition] = useState("");
  const [recorderQuery, setRecorderQuery] = useState("");
  const [showRecorderDropdown, setShowRecorderDropdown] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showSignPad, setShowSignPad] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // กรองนักเรียนตามห้อง
  const studentsByRoom = room
    ? STUDENTS.filter(s => s.room === room).map(s => s.name)
    : STUDENTS.map(s => s.name);

  const filteredRecorders = TEACHER_LIST.filter(t =>
    (t.name + t.position).includes(recorderQuery)
  );

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
  }

  const thaiDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric",
  });

  // ครูพร้อมตำแหน่ง
  const teacherDisplayNames = TEACHER_LIST.map(t => `${t.name} (${t.position})`);
  const selectedTeacherDisplays = selectedTeachers.map(name => {
    const t = TEACHER_LIST.find(t => t.name === name);
    return t ? `${t.name} (${t.position})` : name;
  });

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!date || !room || !recorder || !recorderPosition) {
    setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
    return;
  }
  setSubmitting(true);
  setError("");
  try {
    const res = await fetch("/api/gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addActivity",
        date,
        roomNumber: room,
        students: selectedStudents.join("\n"),
        teachers: selectedTeacherDisplays.join("\n"),
        learningSource,
        activityDetail,
        knowledge,
        imageUrl: photos.join(","),
        signature: signature || "",
        recorder,
        position: recorderPosition,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(true);
      setDate(new Date().toISOString().split("T")[0]);
      setRoom("");
      setSelectedStudents([]);
      setSelectedTeachers([]);
      setLearningSource("");
      setActivityDetail("");
      setKnowledge("");
      setRecorder("");
      setRecorderPosition("");
      setRecorderQuery("");
      setSignature(null);
      setPhotos([]);
      setTimeout(() => setSuccess(false), 6000);
    } else {
      console.log("GAS error:", data);
      setError(data.error || "เกิดข้อผิดพลาด");
    }
  } catch (err) {
    console.log("Fetch error:", err);
    setError("ไม่สามารถเชื่อมต่อระบบได้");
  }
  setSubmitting(false);
}

  return (
    <>
      {/* Header */}
      <div className="no-print max-w-3xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#065f46" }}>บันทึกกิจกรรมการเข้าใช้แหล่งเรียนรู้</h1>
          <p className="text-slate-400 text-sm">ศูนย์การศึกษาพิเศษ เขตการศึกษา 3 จังหวัดสงขลา</p>
        </div>
        
      </div>

      
      {error && (
        <div className="no-print max-w-3xl mx-auto px-4 mb-2">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-3">
            <X size={18} className="text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="print-area max-w-3xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-2xl shadow p-6">

            {/* หัวรายงาน */}
            <div className="text-center mb-3">
              <img src={LOGO_URL} alt="logo" className="mx-auto mb-2"
                style={{ width: "72px", height: "72px", objectFit: "contain" }} />
              <p className="font-bold text-base">บันทึกกิจกรรมการเข้าใช้แหล่งเรียนรู้</p>
              <p className="font-bold text-base">ศูนย์การศึกษาพิเศษ เขตการศึกษา ๓ จังหวัดสงขลา</p>
            </div>
            <div className="border-t-4 border-b-2 mb-4" style={{ borderColor: "#1e3a5f" }} />

            {/* ตารางหลัก */}
            <table className="w-full border-collapse text-sm mb-4" style={{ border: "1px solid #000" }}>
              <tbody>
                {/* วันที่ + ห้องเรียน */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2" style={{ border: "1px solid #000", width: "22%" }}>วันที่บันทึก</td>
                  <td className="p-2" style={{ border: "1px solid #000", width: "28%" }}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1" />
                    <span className="text-sm">{thaiDate(date)}</span>
                  </td>
                  <td className="font-semibold bg-slate-50 p-2" style={{ border: "1px solid #000", width: "18%" }}>ห้องเรียน</td>
                  <td className="p-2" style={{ border: "1px solid #000", width: "32%" }}>
                    <select value={room} onChange={e => { setRoom(e.target.value); setSelectedStudents([]); }}
                      className="no-print w-full outline-none text-sm px-1 py-0.5 border border-slate-200 rounded mb-1 appearance-none bg-white">
                      <option value="">-- เลือกห้อง --</option>
                      {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {room && <span className="text-sm font-medium">{room}</span>}
                  </td>
                </tr>

                {/* รายชื่อนักเรียน */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>รายชื่อนักเรียน</td>
                  <td colSpan={3} className="p-2" style={{ border: "1px solid #000" }}>
                    <div className="no-print mb-2">
                      <MultiSelectDropdown
                        label=""
                        items={studentsByRoom}
                        selected={selectedStudents}
                        onAdd={s => setSelectedStudents(prev => [...prev, s])}
                        onRemove={s => setSelectedStudents(prev => prev.filter(x => x !== s))}
                        placeholder="ค้นหาและเลือกนักเรียน..."
                      />
                    </div>
                    {selectedStudents.length > 0 && (
                      <div className="text-sm space-y-0.5">
                        {selectedStudents.map((s, i) => (
                          <p key={i}>{i + 1}. {s}</p>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>

                {/* รายชื่อครู */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ครู/ผู้ดูแล</td>
                  <td colSpan={3} className="p-2" style={{ border: "1px solid #000" }}>
                    <div className="no-print mb-2">
                      <MultiSelectDropdown
                        label=""
                        items={teacherDisplayNames}
                        selected={selectedTeacherDisplays}
                        onAdd={display => {
                          const t = TEACHER_LIST.find(t => `${t.name} (${t.position})` === display);
                          if (t) setSelectedTeachers(prev => [...prev, t.name]);
                        }}
                        onRemove={display => {
                          const t = TEACHER_LIST.find(t => `${t.name} (${t.position})` === display);
                          if (t) setSelectedTeachers(prev => prev.filter(x => x !== t.name));
                        }}
                        placeholder="ค้นหาและเลือกครู..."
                      />
                    </div>
                    {selectedTeacherDisplays.length > 0 && (
                      <div className="text-sm space-y-0.5">
                        {selectedTeacherDisplays.map((t, i) => (
                          <p key={i}>{i + 1}. {t}</p>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>

                {/* แหล่งเรียนรู้ */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>แหล่งเรียนรู้</td>
                  <td colSpan={3} className="p-2" style={{ border: "1px solid #000" }}>
                    <div className="no-print flex flex-wrap gap-2 mb-1">
                      {LEARNING_SOURCES.map(src => (
                        <button key={src} type="button" onClick={() => setLearningSource(src)}
                          className="px-3 py-1 rounded-lg text-xs font-medium border-2 transition-all"
                          style={learningSource === src
                            ? { borderColor: "#065f46", background: "#065f46", color: "white" }
                            : { borderColor: "#e2e8f0", color: "#475569" }}>
                          {src}
                        </button>
                      ))}
                    </div>
                    {learningSource && <p className="text-sm font-medium">{learningSource}</p>}
                  </td>
                </tr>

                {/* ลักษณะกิจกรรม */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ลักษณะกิจกรรม</td>
                  <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                    <textarea value={activityDetail} onChange={e => setActivityDetail(e.target.value)}
                      rows={4} placeholder="อธิบายลักษณะกิจกรรม..."
                      className="w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                  </td>
                </tr>

                {/* สาระที่ได้รับ */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>สาระที่ได้รับ</td>
                  <td colSpan={3} className="p-1" style={{ border: "1px solid #000" }}>
                    <textarea value={knowledge} onChange={e => setKnowledge(e.target.value)}
                      rows={4} placeholder="ระบุสาระความรู้..."
                      className="w-full outline-none text-sm px-2 py-1 border border-slate-200 rounded-lg resize-none" />
                  </td>
                </tr>

                {/* ภาพกิจกรรม */}
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000" }}>ภาพกิจกรรม</td>
                  <td colSpan={3} className="p-2" style={{ border: "1px solid #000" }}>
                    <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhoto} />
                    <button type="button" onClick={() => photoInputRef.current?.click()}
                      className="no-print flex items-center gap-2 px-3 py-1.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-green-400 text-xs mb-2">
                      <Camera size={14} /> แนบรูปภาพ
                    </button>
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((p, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removePhoto(i)}
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

            {/* ส่วนลงนาม */}
            <table className="w-full border-collapse text-sm" style={{ border: "1px solid #000" }}>
              <tbody>
                <tr>
                  <td className="font-semibold bg-slate-50 p-2 align-top" style={{ border: "1px solid #000", width: "22%" }}>
                    ผู้บันทึก <span className="text-red-500">*</span>
                  </td>
                  <td className="p-2 align-top" style={{ border: "1px solid #000", width: "28%" }}>
                    {/* Recorder search */}
                    <div className="no-print relative mb-2">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="w-full pl-8 pr-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
                        placeholder="ค้นหาชื่อผู้บันทึก..."
                        value={recorderQuery}
                        onChange={e => { setRecorderQuery(e.target.value); setShowRecorderDropdown(true); setRecorder(""); }}
                        onFocus={() => setShowRecorderDropdown(true)}
                        onBlur={() => setTimeout(() => setShowRecorderDropdown(false), 200)}
                      />
                      {showRecorderDropdown && filteredRecorders.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                          {filteredRecorders.map(t => (
                            <button key={t.name} type="button"
                              onMouseDown={() => {
                                setRecorder(t.name);
                                setRecorderPosition(t.position);
                                setRecorderQuery(t.name);
                                setShowRecorderDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs transition-colors">
                              <span className="font-medium">{t.name}</span>
                              <span className="text-slate-400 ml-1">({t.position})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {recorder && (
                      <div>
                        <p className="text-sm font-medium">{recorder}</p>
                        <p className="text-xs text-slate-500">{recorderPosition}</p>
                      </div>
                    )}
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
                            <SignaturePad zone="learn"
                              onSave={dataUrl => { setSignature(dataUrl); setShowSignPad(false); }} />
                            <button type="button" onClick={() => setShowSignPad(false)}
                              className="text-xs text-slate-400 mt-1">ยกเลิก</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setShowSignPad(true)}
                            className="flex flex-col items-center gap-1 mx-auto text-slate-400 hover:text-green-500">
                            <Pen size={20} />
                            <span className="text-xs">กดลงลายมือชื่อ</span>
                          </button>
                        )}
                        <div className="border-b border-slate-300 mt-2 mx-2" />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      ({recorder || "................................"})<br />
                      {recorderPosition || "ตำแหน่ง................................"}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
{success && (
  <div className="no-print max-w-3xl mx-auto px-4 mb-3">
    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3">
      <CheckCircle size={20} className="text-green-600" />
      <span className="text-green-800 font-semibold text-base">✅ บันทึกกิจกรรมเรียบร้อยแล้ว!</span>
    </div>
  </div>
)}
        {/* ปุ่ม */}
        <div className="no-print max-w-3xl mx-auto px-4 pb-8 flex gap-3">
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-white text-lg font-semibold disabled:opacity-40"
            style={{ background: "#065f46" }}>
            {submitting
              ? <><Loader2 size={20} className="animate-spin" /> กำลังบันทึก...</>
              : <><CheckCircle size={20} /> บันทึกกิจกรรม</>
            }
          </button>
          
        </div>
      </form>
    </>
  );
}