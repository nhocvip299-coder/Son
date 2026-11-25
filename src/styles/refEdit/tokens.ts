/**
 * Thong so do tu video mau reference/mau-ref-01.mp4 (576x1024 -> quy doi 1080x1920, he so 1.875).
 * [GOC] = do/quan sat tren video mau. [AI] = gia tri AI chon khi khong do duoc chinh xac.
 */
export const RT = {
  W: 1080,
  H: 1920,
  color: {
    white: "#F6F4F6", // [GOC] do pixel chu trang
    red: "#F62A15", // [GOC] chu do (LAM VIDEO BDS, 2 NAM, KEU GOI)
    redCore: "#FFD9D0", // [GOC] loi sang hong-trang giua chu do (gradient trong)
    badge: "#D13049", // [GOC] hinh tron so buoc
    badgeHi: "#F0606F", // [AI] diem sang tren badge
    yellow: "#FACF1E", // [GOC] chu vang (DUNG NOI)
    cardBorder: "#FAE539", // [GOC] vien the vang
    cardFill: "rgba(226,214,66,0.6)", // [GOC] the vang ban trong suot (do #928F5C tren nen #3A4A60)
    bgLight: "#6F839C", // [GOC] nen truu tuong - vung sang (p95)
    bgMid: "#30425A", // [GOC] p50
    bgDark: "#1F2834", // [GOC] p05
  },
  font: {
    body: "'Kasepi VN', 'Be Vietnam Pro'", // [NGUOI DUNG] chu trang THUONG = 1FTV VIP Kasepi Sans; khoi toan IN HOA tu doi sang Phudu (xem Typed)
    punch: "'Phudu'", // [SUA theo nguoi dung] Phudu 900: day du dau tieng Viet (Anton loi dau chong: TRẦM LẮNG -> TRÂM LĂNG)
    heavy: "'Phudu'", // chu vang/do dam rong cung Phudu cho dong bo
  },
  /** Tam doc cac lop chu (ti le H) [GOC] */
  y: {
    // [SUA theo nguoi dung] vung an toan TikTok/Reels: tren 220px, duoi tu 1400px (0.729H), cot nut phai x>940 tu ~0.45H
    // -> chu tren mat: 0.54-0.64H; canh tram: khung nguoi noi goc TREN-PHAI, do hoa 0.36-0.72H (goc mau: setup 0.615, punch 0.665, label 0.705)
    // [SUA lan 2] nguoi dung: chu bay vao mat -> ha ve gan vi tri video mau (duoi cam)
    setup: 0.622,
    punch: 0.678,
    badge: 0.612,
    badgeLabel: 0.692,
    listTitle: 0.38,
    cardCenters: [0.4, 0.515, 0.63], // het tai 0.68H: chua dai 0.68-0.73H cho phu de
    pill1: 0.665,
    pill2: 0.745, // [SUA] tach khoi pill1 (0.665) - khong chong nhau
    tilt: 0.5,
    under: 0.63, // chu do duoi the 3D
    subtitle: 0.765, // phu de chay chu (1469px) - van tren vung caption TikTok/Reels
  },
  /** Thoi luong (giay) [GOC] do bang duong cong pixel 30fps */
  time: {
    typeCps: 45, // go ky tu ~45 ky tu/giay
    blurIn: 0.23, // nhoe -> net (badge label, muc danh sach)
    wipe: 0.23, // QUAN TRONG NHAT mo rong
    cardGrowX: 0.65, // the vang no 2 chieu (do lai: 0.65s gan tuyen tinh)
    cardGrowY: 0.25, // roi no doc
    zoomRamp: 0.7, // push-in mat 20%
    leak: 0.35, // light leak truoc diem cat
    badgeStagger: 0.14, // 1-2-3 cach nhau
  },
  size: {
    // [GOC] quy doi tu be rong khoi chu do duoc (576 -> 1080)
    setup: 74, // "Tim ra quy trinh" rong ~0.6W
    punch: 128, // "LAM VIDEO BDS" rong ~0.76W
    label: 100, // "CHON NOI DUNG" rong ~0.74W (sua sau so sanh: 86 -> 100)
    badge: 160, // duong kinh hinh tron so buoc ~0.14W
    listTitle: 104, // sua sau so sanh: 90 -> 104
    // "Khach mua o" ~0.57W
    list: 80, // muc danh sach (sua: 70 -> 80)
    card: 62, // chu trong the vang (sua: 56 -> 62)
    cardW: 762, // the vang ~0.706W
    cardH: 200, // ~0.127H
    pill: 52,
    warn: 128, // "DUNG NOI" ~0.6W (sua: 108 -> 128)
    warnSub: 80, // "Qua nhieu thong tin" ~0.79W
  },
} as const;

/** Bong + phat sang chu trang [GOC: bong toi mem phia duoi + quang trang nhe] */
export const whiteGlow = "0 3px 5px rgba(0,0,0,0.6), 0 0 1px rgba(0,0,0,0.8), 0 0 14px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.22)"; // [SUA] vien net + phat sang trang

/** [NGUOI DUNG] Mau chu NHAN (thay chu do video mau). "moc" = hop menh Moc cua nguoi dung: xanh luc ngoc (ban menh Moc),
 *  vien xanh than dam (Thuy sinh Moc). Doi ACCENT_MODE = "do" de quay ve mau do goc. */
const ACCENTS = {
  do: { grad: ["#FF7A63", "#FF3A22", "#F62A15", "#C91405"], edge: "#2A0000", glow: "255,60,35", glow2: "246,42,21", burst: "255,120,90" },
  vang: { grad: ["#FFF6B0", "#FFE433", "#FFD700", "#E8B400"], edge: "#000000", glow: "255,215,0", glow2: "255,190,0", burst: "255,236,140" }, // [NGUOI DUNG] vang nghe #FFD700 + den #000000
  moc: { grad: ["#D4FFB0", "#6CF08A", "#22C55E", "#0E8A43"], edge: "#03261A", glow: "60,230,120", glow2: "20,190,90", burst: "150,255,170" },
} as const;
export const ACCENT_MODE: keyof typeof ACCENTS = "vang";
export const ACCENT = ACCENTS[ACCENT_MODE];
