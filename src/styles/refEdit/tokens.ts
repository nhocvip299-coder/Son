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
    body: "'Poppins'", // [GOC~] chu trang/ thuong: Poppins 700-800 (nhan dang bang mat: a 2 tang, g 1 tang, hinh hoc)
    punch: "'Anton'", // [AI~] chu do dam hep (LAM VIDEO BDS) - goc la sans dam hep, Anton gan nhat trong bo font
    heavy: "'Montserrat'", // [AI~] chu vang rong dam (DUNG NOI) ~ Montserrat 900
  },
  /** Tam doc cac lop chu (ti le H) [GOC] */
  y: {
    setup: 0.615, // dong trang nho phia tren
    punch: 0.665, // dong do lon
    badge: 0.625,
    badgeLabel: 0.705,
    listTitle: 0.18,
    cardCenters: [0.252, 0.474, 0.69], // sua sau so sanh
    pill1: 0.69,
    pill2: 0.8,
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
    punch: 140, // "LAM VIDEO BDS" rong ~0.76W
    label: 100, // "CHON NOI DUNG" rong ~0.74W (sua sau so sanh: 86 -> 100)
    badge: 160, // duong kinh hinh tron so buoc ~0.14W
    listTitle: 104, // sua sau so sanh: 90 -> 104
    // "Khach mua o" ~0.57W
    list: 80, // muc danh sach (sua: 70 -> 80)
    card: 62, // chu trong the vang (sua: 56 -> 62)
    cardW: 762, // the vang ~0.706W
    cardH: 244, // ~0.127H
    pill: 52,
    warn: 128, // "DUNG NOI" ~0.6W (sua: 108 -> 128)
    warnSub: 80, // "Qua nhieu thong tin" ~0.79W
  },
} as const;

/** Bong + phat sang chu trang [GOC: bong toi mem phia duoi + quang trang nhe] */
export const whiteGlow = "0 4px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6), 0 0 22px rgba(255,255,255,0.35)";
