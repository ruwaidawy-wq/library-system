"use client";
import { useState } from "react";
import { QrCode, User, CheckCircle, Loader2, AlertCircle, Search, Plus, X } from "lucide-react";
import { learningApi } from "@/lib/gas";
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

const RECEIVED_OPTIONS = [
  "หนังสือ", "เอกสาร", "ความรู้", "สื่อการเรียน", "อุปกรณ์การเรียน", "อื่นๆ"
];

export default function CheckInPage({ params }: { params: { roomId: string } }) {
  const roomDisplay = decodeURIComponent(params.roomId).replace(/-/g, " ");

  const [teacherQuery, setTeacherQuery] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [studentQuery, setStudentQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [received, setReceived] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const filteredTeachers = TEACHER_LIST.filter(t =>
    (t.name + t.position).includes(teacherQuery)
  );

  const roomStudents = STUDENTS.filter(s => s.room === roomDisplay).map(s => s.name);
  const filteredStudents = roomStudents.filter(s =>
    s.includes(studentQuery) && !selectedStudents.includes(s)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeacher) {
      setError("กรุณาเลือกชื่อครู");
      return;
    }
    if (selectedStudents.length === 0) {
      setError("กรุณาเลือกชื่อนักเรียนอย่างน้อย 1 คน");
      return;
    }
    setSubmitting(true);
    setError("");

    // บันทึกทีละคน
    let allSuccess = true;
    for (const studentName of selectedStudents) {
      const res = await learningApi.checkIn({
        roomNumber: roomDisplay,
        teacherName: selectedTeacher,
        studentName,
        received,
      });
      if (!res.success) { allSuccess = false; }
    }

    setSubmitting(false);
    if (allSuccess) {
      setSuccess(true);
    } else {
      setError("เกิดข้อผิดพลาดบางส่วน กรุณาลองใหม่");
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">เช็คอินสำเร็จ!</h2>
          <p className="text-slate-600 mb-1">ห้อง <strong>{roomDisplay}</strong></p>
          <p className="text-slate-500 text-sm mb-1">ครู: {selectedTeacher}</p>
          <p className="text-slate-500 text-sm">นักเรียน {selectedStudents.length} คน</p>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedTeacher("");
              setTeacherQuery("");
              setSelectedStudents([]);
              setStudentQuery("");
              setReceived("");
            }}
            className="mt-6 w-full py-3 rounded-xl text-white font-semibold"
            style={{ background: "#065f46" }}
          >
            เช็คอินอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        {/* Room Badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "#ecfdf5" }}>
            <QrCode size={32} style={{ color: "#065f46" }} />
          </div>
          <p className="text-slate-500 text-sm">แหล่งเรียนรู้</p>
          <h1 className="text-2xl font-bold" style={{ color: "#065f46" }}>{roomDisplay}</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Teacher */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              ชื่อครูผู้ดูแล <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400"
                placeholder="ค้นหาชื่อครู..."
                value={teacherQuery}
                onChange={e => { setTeacherQuery(e.target.value); setShowTeacherDropdown(true); setSelectedTeacher(""); }}
                onFocus={() => setShowTeacherDropdown(true)}
                onBlur={() => setTimeout(() => setShowTeacherDropdown(false), 200)}
              />
              {selectedTeacher && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
            {showTeacherDropdown && filteredTeachers.length > 0 && (
              <div className="border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1 bg-white">
                {filteredTeachers.map(t => (
                  <button key={t.name} type="button"
                    onMouseDown={() => { setSelectedTeacher(t.name); setTeacherQuery(`${t.name} (${t.position})`); setShowTeacherDropdown(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 text-xs transition-colors">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-slate-400 ml-1">({t.position})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Students */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              รายชื่อนักเรียน <span className="text-red-500">*</span>
            </label>
            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedStudents.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{ background: "#ecfdf5", color: "#065f46" }}>
                    {s}
                    <button type="button" onClick={() => setSelectedStudents(prev => prev.filter(x => x !== s))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-green-400"
                placeholder="ค้นหาชื่อนักเรียน..."
                value={studentQuery}
                onChange={e => { setStudentQuery(e.target.value); setShowStudentDropdown(true); }}
                onFocus={() => setShowStudentDropdown(true)}
                onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
              />
            </div>
            {showStudentDropdown && filteredStudents.length > 0 && (
              <div className="border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1 bg-white">
                {filteredStudents.map(s => (
                  <button key={s} type="button"
                    onMouseDown={() => { setSelectedStudents(prev => [...prev, s]); setStudentQuery(""); }}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 text-xs transition-colors flex items-center gap-2">
                    <Plus size={12} className="text-green-500" /> {s}
                  </button>
                ))}
              </div>
            )}
            {roomStudents.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">ไม่พบนักเรียนในห้องนี้</p>
            )}
          </div>

          {/* Received */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              สิ่งที่ได้รับ
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {RECEIVED_OPTIONS.map(opt => (
                <button key={opt} type="button"
                  onClick={() => setReceived(received === opt ? "" : opt)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
                  style={received === opt
                    ? { borderColor: "#065f46", background: "#065f46", color: "white" }
                    : { borderColor: "#e2e8f0", color: "#475569" }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-40"
            style={{ background: "#065f46" }}>
            {submitting
              ? <><Loader2 size={18} className="animate-spin" /> กำลังเช็คอิน...</>
              : <><CheckCircle size={18} /> เช็คอิน</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}