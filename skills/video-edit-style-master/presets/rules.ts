/**
 * TƯ DUY EDITOR -> luật chọn hiệu ứng theo NGỮ NGHĨA lời thoại (references/editor-thinking.md).
 * Đầu vào: câu/cụm lời thoại. Đầu ra: loại hiệu ứng + dữ liệu. Thuần TS (không React) để test được.
 */
export type Cue =
  | { kind: "gold"; lead: string; value: number; unit: string; dec: number }
  | { kind: "price-drop"; from: string; to: number; unit: string; dec: number }
  | { kind: "map"; place: string; dist?: string }
  | { kind: "neon"; main: string; script?: string }
  | { kind: "thin"; value: string; behindPerson: true } // [XM 17 s] dat sau lung nguoi noi
  | { kind: "card"; title: string }
  | { kind: "phone"; phone: string }
  | { kind: "none" };

const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const decOf = (s: string) => (s.includes(",") ? s.split(",")[1].length : 0);
const MONEY = /(\d+(?:[.,]\d+)?)\s*(tỷ|triệu|tr)(?!\p{L})/iu; // \b khong dung voi chu co dau
const unitOf = (u: string) => (u.toLowerCase() === "tr" ? "TRIỆU" : u.toUpperCase());

export const pickCue = (text: string, ctx: { prevPrice?: string } = {}): Cue => {
  const t = text.toLowerCase();
  // 1) SĐT -> viên số điện thoại (CTA) [XM 59–83 s]
  const ph = text.match(/(0\d{2,3}[\s.]?\d{3}[\s.]?\d{3,4})/);
  if (ph) return { kind: "phone", phone: ph[1].replace(/[.]/g, " ") };
  // 2) giảm giá / còn -> trang giá: giá cũ gạch + giá mới đếm [XM 9–14 s]
  const m = text.match(MONEY);
  if (m && /(giảm còn|chỉ còn|hạ giá|còn|về)/.test(t) && ctx.prevPrice) return { kind: "price-drop", from: ctx.prevPrice, to: num(m[1]), unit: unitOf(m[2]), dec: decOf(m[1]) };
  // 3) số tiền -> số vàng đếm chạy [XM 4–7 s, 52–55 s]
  if (m) return { kind: "gold", lead: text.slice(0, m.index).trim().split(/\s+/).slice(-4).join(" "), value: num(m[1]), unit: unitOf(m[2]), dec: decOf(m[1]) };
  // 4) vị trí + khoảng cách/thời gian -> bản đồ [XM 18–22 s]
  if (/(cách|từ chợ|đến|tới).*(km|phút|m\b)/.test(t) || /(chỉ vài phút)/.test(t)) {
    const d = text.match(/(\d+(?:[.,]\d+)?)\s*(km|phút)/i);
    const pl = text.match(/(chợ|trường|bệnh viện|ngã tư|cầu|sân bay|kcn|trung tâm)\s+[A-ZÀ-Ỵ][\p{L}]*(?:\s+[A-ZÀ-Ỵ][\p{L}]*)*/u);
    return { kind: "map", place: pl ? pl[0] : "trung tâm", dist: d ? `${d[1]} ${d[2].toUpperCase()}` : undefined };
  }
  // 5) phần trăm / khoảng cách đơn -> số mảnh to [XM 24 s "3KM", 43 s "70%"]
  const pc = text.match(/(\d+)\s*(%|km)/i);
  if (pc) return { kind: "thin", value: `${pc[1]}${pc[2].toUpperCase()}`, behindPerson: true };
  // 6) vay / hỗ trợ / sở hữu -> thẻ kính [XM 41–59 s]
  if (/(hỗ trợ|ngân hàng|vay|sở hữu|an cư)/.test(t)) return { kind: "card", title: /(hỗ trợ|vay)/.test(t) ? "Hỗ trợ trọn gói" : "Sở hữu" };
  // 7) đặc điểm vật lý: diện tích, phòng, sân, sổ -> chữ neon + chữ ký [XM 29–40 s]
  const feat = text.match(/(ngang \d+ ?m|sâu \d+ ?m|\d+ (phòng ngủ|wc|tầng)|sân trước|sân sau|phòng thờ|sổ hồng riêng|full nội thất|dọn vào ở liền)/i);
  if (feat) return { kind: "neon", main: feat[0].toUpperCase() };
  // 8) còn lại: giữ khung sạch [suy luận: editor để trống khi không có thông tin mới]
  return { kind: "none" };
};
