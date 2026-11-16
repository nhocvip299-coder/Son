/**
 * Thu vien 40 Text Preset BDS (du lieu), dung lai tu 2 video mau "40 Text Presets" (4 trang x 10).
 * Thu tu = thu tu trong video mau (trang A..D, cot trai roi phai). Ten thuong hieu trong mau da doi sang noi dung BDS.
 * Font/mau/chuyen dong: xem references/catalog.md cua skill text-presets-bds.
 */
import type { Fill, Layer, PresetDef } from "./engine";

const G = (a: string, b: string): Fill => ({ grad: [a, b] });
const S = (c: string): Fill => ({ solid: c });
const W = S("#FFFFFF");
const L = (text: string, font: Layer["font"], size: number, fill: Fill, anim: Layer["anim"], o: Partial<Layer> = {}): Layer => ({ text, font, size, fill, anim, ...o });

const PINK = G("#FFB3E6", "#FF4FC1");
const GREEN = G("#E6FF6A", "#62E03A");

export const PRESETS40: PresetDef[] = [
  // ---------- Trang A ----------
  { id: "a01-noi-bat", name: "Tiện ích Nổi Bật", use: "Giới thiệu tiện ích", verified: "XM", align: "center", layers: [L("Tiện ích", "serif", 0.42, W, "track", { align: "center" }), L("Nổi Bật", "rounded", 1, G("#E9FFB0", "#4BE38C"), "pop", { weight: 900, dy: -0.1, delay: 4, align: "center" })] },
  { id: "a02-ky-nang", name: "Kỹ năng · Đầu Tư Đúng", use: "Mở đầu chủ đề kiến thức", verified: "XM", layers: [L("Kỹ năng", "script", 0.45, W, "write", { dx: 0.1 }), L("Đầu Tư Đúng", "condensed", 0.95, G("#7FE9FF", "#2E7BFF"), "pop", { dx: 0.25, dy: -0.18, delay: 5 }), L("thứ bạn cần có", "body", 0.28, W, "fadeUp", { weight: 600, align: "end", delay: 14 })] },
  { id: "a03-comment-so-hong", name: 'Comment "Sổ hồng"', use: "Kêu gọi bình luận từ khóa", verified: "XM", layers: [L("Comment", "serif", 0.5, W, "track"), L("“Sổ hồng”", "rounded", 0.75, G("#9FFBFF", "#1EC8FF"), "pop", { weight: 900, dx: 0.4, dy: -0.06, delay: 6 })] },
  { id: "a04-phu-hop", name: "Phù Hợp · với mọi khách hàng", use: "Đối tượng khách", verified: "XM", layers: [L("Phù Hợp", "serif", 1, PINK, "pop"), L("với mọi khách hàng", "script", 0.5, W, "write", { align: "end", dy: -0.15, delay: 10 })] },
  { id: "a05-dang-goi", name: "Đang gọi (cuộc gọi đến)", use: "Hook bất ngờ / CTA gọi điện", verified: "XM", align: "center", layers: [L("EM SƠN BĐS", "condensed", 0.8, W, "glitch", { align: "center", glowStrength: 1.4 }), L("đang gọi cho bạn......", "body", 0.22, W, "type", { align: "center", delay: 8, weight: 600 })], decos: [{ kind: "phone", x: 1.25, y: 1.35, d: 0.5, delay: 18 }] },
  { id: "a06-bao-gia", name: 'Comment "Báo Giá"', use: "Kêu gọi nhắn báo giá", verified: "XM", align: "center", layers: [L("Comment", "script", 0.55, W, "write", { align: "center" }), L("“Báo Giá”", "condensed", 1, G("#FFF46B", "#F5B400"), "pop", { dy: -0.12, delay: 6, align: "center" })] },
  { id: "a07-can-goc", name: "CĂN GÓC · HẠNG A · Sang trọng", use: "Phân hạng sản phẩm", verified: "XM", layers: [L("CĂN GÓC", "condensed", 0.7, W, "pop", { dx: 0.15 }), L("HẠNG A", "condensed", 0.7, W, "pop", { join: true, delay: 6, box: { bg: "#2E8BFF", radius: 0.06, padX: 0.12, glow: "#2E8BFF" } }), L("Sang trọng", "script", 0.5, S("#7FB8FF"), "write", { dx: 0.15, delay: 12 })], decos: [{ kind: "bar", x: -0.05, y: 0.05, h: 1.45, color: "#2E8BFF", delay: 0 }] },
  { id: "a08-so-hong-rieng", name: "Sổ Hồng Riêng", use: "Pháp lý", verified: "UD", layers: [L("Sổ Hồng Riêng", "rounded", 0.85, G("#F4FF6B", "#3FE07A"), "pop", { weight: 900 }), L("pháp lý  •  minh bạch  •  rõ ràng", "body", 0.2, W, "fadeUp", { align: "end", delay: 14, weight: 600 })] },
  { id: "a09-tham-quan", name: "Tham quan Căn Hộ", use: "Mở đầu tour nhà", verified: "XM", layers: [L("Tham quan", "script", 0.6, W, "write", { dx: 0.2 }), L("Căn Hộ", "condensed", 1.1, G("#FFF56B", "#FF9F1A"), "pop", { dy: -0.22, delay: 8 })] },
  { id: "a10-so-huu", name: "Sở hữu Không Gian Sống", use: "Lời mời sở hữu", verified: "XM", align: "center", layers: [L("Sở hữu", "script", 0.55, W, "write", { align: "center" }), L("Không Gian Sống", "body", 0.62, G("#FF8BF0", "#C13CFF"), "pop", { weight: 800, dy: -0.06, delay: 6, align: "center" }), L("đẳng  cấp  cho", "script", 0.4, W, "write", { delay: 14, align: "center" }), L("Bạn", "body", 0.32, W, "pop", { join: true, delay: 20, weight: 800, box: { bg: "#E0182D", radius: 1, padX: 0.25, glow: "#FF3B3B" } })] },

  // ---------- Trang B ----------
  { id: "b01-co-hoi", name: "Hãy nắm bắt Cơ hội", use: "Hook kêu gọi", verified: "XM", layers: [L("Hãy nắm bắt", "script", 0.35, W, "write"), L("Cơ hội", "serif", 1, G("#FFFDE0", "#F5E663"), "track", { dx: 0.15, dy: -0.08, delay: 4 }), L("Ngay bây giờ", "serif", 0.3, W, "write", { italic: true, weight: 500, align: "end", dy: -0.08, delay: 14 })] },
  { id: "b02-tri-gia", name: "trị giá 100 Triệu đồng", use: "Giá / quà tặng", verified: "XM", layers: [L("trị giá", "serif", 0.32, W, "write", { italic: true, weight: 500, dx: 0.3 }), L("100 Triệu", "rounded", 1, G("#F6FF7A", "#B8F23A"), "pop", { weight: 900, dy: -0.05, delay: 3 }), L("đồng", "serif", 0.4, W, "write", { italic: true, weight: 500, align: "end", dy: -0.22, delay: 16 })], decos: [{ kind: "swoosh", x: 0.05, y: 1.12, w: 2.9, color: "#B8F23A", delay: 12 }] },
  { id: "b03-vi-tri", name: "Vị Trí · trung tâm đắc địa", use: "Vị trí", verified: "XM", align: "center", layers: [L("Vị Trí", "condensed", 1, W, "pop", { italic: true, glow: "#C9A23A", align: "center", delay: 4, box: { bg: "linear-gradient(180deg,#FFF3B8,#F3D77A)", radius: 0.12, padX: 0.3, glow: "#F3D77A88" } }), L("trung tâm đắc địa", "serif", 0.3, W, "track", { align: "center", delay: 10 })] },
  { id: "b04-tien-ich", name: "5 Tiện ích nội khu · Đẳng Cấp", use: "Đếm số tiện ích", verified: "XM", layers: [L("5", "serif", 1.3, G("#FFFBA8", "#F5E663"), "scale", { italic: true }), L("Tiện ích", "serif", 0.42, W, "write", { join: true, delay: 6 }), L("nội khu", "serif", 0.36, W, "write", { align: "end", dy: -0.5, delay: 10 }), L("Đẳng Cấp", "rounded", 0.7, S("#FFF46B"), "pop", { weight: 900, delay: 14, box: { bg: "#0A0A0A", border: "3px solid #D9D9D9", radius: 0.15, padX: 0.3 } })] },
  { id: "b05-khong-gian-xanh", name: "Không Gian xanh", use: "Cảnh quan, công viên", verified: "XM", layers: [L("Không", "condensed", 1, GREEN, "pop", { italic: true }), L("Gian", "condensed", 1, GREEN, "pop", { italic: true, join: true, delay: 6, dy: 0.3 }), L("xanh", "serif", 0.5, W, "write", { italic: true, weight: 500, dx: 0.35, dy: -0.02, delay: 14 })], decos: [{ kind: "ellipse", x: 0.05, y: 1.08, w: 1.5, h: 0.72, color: "#7CFF4A", delay: 10 }] },
  { id: "b06-dung-mua", name: "Đừng mua Nhà Phố nếu bạn chưa biết gì", use: "Hook cảnh báo", verified: "XM", align: "center", layers: [L("Đừng mua", "script", 0.45, W, "write", { align: "center" }), L("Nhà Phố", "rounded", 0.9, G("#8FF7FF", "#2E9BFF"), "pop", { weight: 900, dy: -0.1, delay: 5, align: "center" }), L("nếu bạn", "body", 0.28, W, "fadeUp", { weight: 500, delay: 12 }), L("chưa biết gì", "script", 0.4, W, "write", { join: true, delay: 14 })] },
  { id: "b07-de-dang", name: "dễ dàng Sở Hữu", use: "Chính sách thanh toán", verified: "XM", align: "center", layers: [L("dễ dàng", "rounded", 0.6, { outline: "#FFFFFF" }, "fadeUp", { weight: 900, align: "center" }), L("Sở Hữu", "rounded", 0.9, G("#BFFFD1", "#3BE07A"), "pop", { weight: 900, dy: -0.16, delay: 5, align: "center" })] },
  { id: "b08-1-can-ho", name: "1 Căn Hộ Đáng sống", use: "Sản phẩm nổi bật", verified: "XM", layers: [L("1", "rounded", 2, PINK, "scale", { italic: true, weight: 900 }), L("Căn Hộ", "condensed", 0.9, PINK, "pop", { dx: 1.2, dy: -1.95, delay: 5 }), L("Đáng sống", "script", 0.55, W, "write", { dx: 1.3, dy: -0.25, delay: 12 })], decos: [{ kind: "swoosh", x: 0, y: 1.75, w: 2.6, color: "#D63CF0", delay: 16 }] },
  { id: "b09-an-toan", name: "Trải nghiệm An Toàn", use: "An ninh, an toàn", verified: "XM", layers: [L("Trải nghiệm", "serif", 0.45, W, "track"), L("An Toàn", "condensed", 1, G("#B6FFF7", "#2EE6D6"), "pop", { dx: 0.4, dy: -0.08, delay: 6 })] },
  { id: "b10-tai-sao", name: "Tại sao? Nên mua ngay bây giờ", use: "Câu hỏi gợi tò mò", verified: "XM", layers: [L("Tại sao?", "body", 0.4, W, "track", { weight: 500 }), L("Nên mua", "serif", 0.7, W, "fadeUp", { delay: 4, box: { bg: "#F25C6E", radius: 0.05, padX: 0.12 } }), L("ngay", "script", 0.5, W, "write", { join: true, delay: 14 }), L("bây giờ", "script", 0.4, W, "write", { align: "end", dy: -0.08, delay: 18 })] },

  // ---------- Trang C ----------
  { id: "c01-bat-dong-san", name: "Bất động sản Đáng sống", use: "Tiêu đề kênh / chủ đề", verified: "XM", layers: [L("Bất động sản", "condensed", 1, G("#FFD84A", "#FF6A1A"), "track"), L("Đáng sống", "serif", 0.5, W, "write", { italic: true, weight: 500, dx: 0.6, dy: -0.1, delay: 12 })] },
  { id: "c02-hot-trend", name: "HOT TREND (chip)", use: "Tag nổi bật", verified: "XM", layers: [L("HOT TREND", "condensed", 0.7, W, "glitch", { glow: "#2BE3FF", delay: 3, box: { bg: "linear-gradient(180deg,#2BE3FF,#12B8E0)", border: "3px solid #E9FDFF", radius: 0.06, padX: 0.35, glow: "#2BE3FF" } })] },
  { id: "c03-tien-ich-4-mua", name: "Tiện Ích 4 mùa", use: "Tiện ích quanh năm", verified: "XM", layers: [L("Tiện Ích", "condensed", 1, W, "track", { glowStrength: 1.3 }), L("4 mùa", "script", 0.75, G("#FFF56B", "#F5C400"), "write", { dx: 0.35, dy: -0.28, delay: 8 })] },
  { id: "c04-can-ho-cao-cap", name: "CĂN HỘ CAO CẤP", use: "Phân khúc", verified: "XM", layers: [L("CĂN HỘ CAO CẤP", "condensed", 0.8, G("#B6FFF7", "#2EC8E6"), "pop"), L("Nâng tầm cuộc sống", "serif", 0.32, W, "track", { italic: true, weight: 500, align: "end", dy: -0.06, delay: 14 })] },
  { id: "c05-biet-thu-ven-ho", name: "BIỆT THỰ Ven hồ", use: "Loại hình sản phẩm", verified: "XM", layers: [L("BIỆT THỰ", "condensed", 1, W, "pop", { glowStrength: 1.3 }), L("Ven hồ", "script", 0.6, S("#7CFF4A"), "write", { align: "end", dy: -0.18, delay: 10 })], decos: [{ kind: "swoosh", x: 1.2, y: 1.45, w: 1.6, color: "#FFFFFF", delay: 16 }] },
  { id: "c06-uu-dai", name: "Ưu Đãi", use: "Khuyến mãi", verified: "XM", layers: [L("Ưu Đãi", "rounded", 1, G("#FFFF8A", "#FFE01A"), "track", { weight: 900 })] },
  { id: "c07-danh-thuc", name: "Tinh hoa Đánh Thức mọi giác quan", use: "Trải nghiệm sống", verified: "XM", layers: [L("Tinh hoa", "script", 0.45, W, "write"), L("Đánh Thức", "rounded", 0.9, G("#FFE07A", "#FF7A1A"), "pop", { weight: 900, dy: -0.12, delay: 5 }), L("mọi giác quan", "script", 0.4, W, "write", { align: "end", dy: -0.08, delay: 14 })] },
  { id: "c08-can-than", name: "Cẩn Thận (gạch đỏ)", use: "Cảnh báo, giá cũ", verified: "XM", layers: [L("Cẩn Thận", "condensed", 1, W, "pop", { recolor: { at: 26, fill: S("#FF6B7F") }, glow: "#FF2D55" })], decos: [{ kind: "strike", x: -0.05, y: 0.55, w: 3.7, color: "#FF2D55", delay: 22 }] },
  { id: "c09-tiet-kiem", name: "Tiết kiệm 50 TRIỆU", use: "Chiết khấu", verified: "XM", layers: [L("Tiết kiệm", "script", 0.45, W, "write", { dx: 0.4 }), L("50 TRIỆU", "condensed", 1, S("#7FFBFF"), "glitch", { glow: "#18D8FF", dy: -0.1, delay: 4 })] },
  { id: "c10-tang-cao", name: "Tăng cao", use: "Giá trị tăng", verified: "XM", layers: [L("Tăng", "rounded", 1, PINK, "pop", { weight: 900 }), L("cao", "rounded", 0.95, G("#FFD1F0", "#FF7AD1"), "pop", { weight: 900, join: true, delay: 6 })] },

  // ---------- Trang D ----------
  { id: "d01-hot-deal", name: "Hot Deal", use: "Tiêu đề lớn", verified: "XM", layers: [L("Hot Deal", "rounded", 1.15, G("#E0FFFF", "#3EF0E0"), "scale", { weight: 900 })] },
  { id: "d02-dang-ky", name: "Đăng Ký Ngay hôm nay", use: "CTA", verified: "XM", layers: [L("Đăng Ký", "rounded", 1, G("#E9FF6A", "#4BE33A"), "pop", { weight: 900 }), L("Ngay hôm nay", "script", 0.5, W, "write", { align: "end", dy: -0.2, delay: 10 })] },
  { id: "d03-gia-tot", name: "Giá Tốt Nhất", use: "Chốt giá", verified: "XM", layers: [L("Giá Tốt Nhất", "serif", 0.9, W, "track", { glowStrength: 1.4 })] },
  { id: "d04-doi-mau", name: "Ưu đãi tháng này (đổi màu)", use: "Khuyến mãi theo thời gian", verified: "XM", layers: [L("Ưu đãi tháng này", "rounded", 0.6, S("#FFE95A"), "cycle", { weight: 900 })] },
  { id: "d05-bi-quyet", name: "¿Bí quyết?", use: "Hook kiến thức", verified: "XM", layers: [L("¿Bí quyết?", "rounded", 0.9, G("#F0A8FF", "#9B5CFF"), "pop", { weight: 900 })] },
  { id: "d06-tim-dung", name: "Tìm đúng CĂN HỘ phù hợp", use: "Tư vấn chọn nhà", verified: "XM", layers: [L("Tìm đúng", "serif", 0.45, W, "track", { dx: 0.1 }), L("CĂN HỘ", "condensed", 1.1, G("#C9B6FF", "#6A5CFF"), "pop", { dy: -0.08, delay: 5 }), L("phù hợp", "serif", 0.45, W, "write", { align: "end", dy: -0.1, delay: 14 })] },
  { id: "d07-dau-tu-sinh-loi", name: "Cơ hội Đầu Tư Sinh lời", use: "Đầu tư", verified: "XM", layers: [L("Cơ hội", "script", 0.55, W, "write"), L("Đầu Tư", "condensed", 1.1, G("#FF8A7A", "#E01A2D"), "glitch", { dx: 0.2, dy: -0.15, delay: 5 }), L("Sinh lời", "script", 0.5, W, "write", { align: "end", dy: -0.25, delay: 14 })] },
  { id: "d08-ben-vung", name: "phát triển Bền Vững", use: "Tiềm năng khu vực", verified: "XM", align: "center", layers: [L("phát triển", "body", 0.45, W, "track", { weight: 500, align: "center" }), L("Bền Vững", "rounded", 0.9, G("#B6FFFF", "#2EC8FF"), "pop", { weight: 900, dy: -0.04, delay: 6, align: "center" })] },
  { id: "d09-hien-dai", name: "Phong cách sống Hiện Đại", use: "Phong cách sống", verified: "XM", layers: [L("Phong cách sống", "serif", 0.35, W, "track"), L("Hiện Đại", "rounded", 1, G("#FFE55A", "#FF8A1A"), "pop", { weight: 900, dy: -0.04, delay: 5 }), L("Do bạn chọn", "serif", 0.38, W, "write", { align: "end", dy: -0.08, delay: 14 })] },
  { id: "d10-dau-tu", name: "Đầu tư Sinh lời", use: "Kết luận đầu tư", verified: "XM", layers: [L("Đầu tư", "rounded", 1, W, "scale", { weight: 900, glowStrength: 1.3 }), L("Sinh lời", "rounded", 0.5, PINK, "pop", { weight: 900, align: "end", dy: -0.15, delay: 8 })] },
];

export const presetById = (id: string) => {
  const p = PRESETS40.find((x) => x.id === id);
  if (!p) throw new Error(`Khong co preset "${id}"`);
  return p;
};
