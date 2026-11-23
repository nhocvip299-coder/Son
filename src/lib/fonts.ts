import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
// Font tu host (goi @fontsource tren npm, giay phep SIL OFL) -> render offline, du dau tieng Viet.
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource/be-vietnam-pro/900.css";
import "@fontsource/anton/400.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/chakra-petch/700.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/800.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/500-italic.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "@fontsource/dancing-script/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/500-italic.css";
import "@fontsource/oswald/700.css";
import "@fontsource/nunito/900.css";
import "@fontsource/nunito/900-italic.css";
import "@fontsource/nunito/800.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/noto-serif/400.css";
import "@fontsource/noto-serif/500.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/public-sans/300-italic.css";
import "@fontsource/montserrat/800-italic.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import "@fontsource/phudu/800.css";
import "@fontsource/phudu/900.css";

export const FONTS = {
  body: "'Be Vietnam Pro'",
  impact: "'Anton'",
  tech: "'Chakra Petch'",
  clean: "'Lexend'",
  geo: "'Montserrat'",
  script: "'Dancing Script'",
  serif: "'Playfair Display'",
  condensed: "'Oswald'",
  rounded: "'Nunito'",
  elegant: "'Great Vibes'",
  times: "'Noto Serif'",
  grotesk: "'Public Sans'",
  poppins: "'Poppins'",
  phudu: "'Phudu'",
} as const;

export type FontKey = keyof typeof FONTS;

const SPECS: Array<[number, string, string?]> = [
  [700, "Be Vietnam Pro"],
  [800, "Be Vietnam Pro"],
  [900, "Be Vietnam Pro"],
  [400, "Anton"],
  [600, "Chakra Petch"],
  [700, "Chakra Petch"],
  [600, "Lexend"],
  [800, "Lexend"],
  [500, "Be Vietnam Pro"],
  [800, "Montserrat"],
  [900, "Montserrat"],
  [600, "Dancing Script"],
  [700, "Playfair Display"],
  [700, "Oswald"],
  [900, "Nunito"],
  [500, "Playfair Display", "italic"],
  [900, "Nunito", "italic"],
  [800, "Nunito"],
  [400, "Great Vibes"],
  [400, "Noto Serif"],
  [500, "Noto Serif"],
  [500, "Playfair Display"],
  [300, "Public Sans", "italic"],
  [700, "Poppins"],
  [800, "Poppins"],
  [900, "Poppins"],
  [800, "Phudu"],
  [900, "Phudu"],
];
// Chuoi mau phu ca 3 subset (latin, latin-ext, vietnamese) de trinh duyet tai du file
const SAMPLE = "AaBb09 ĂăÂâĐđÊêÔôƠơƯư ẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặ ỆệỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ ŁłŚś₫";

if (typeof document !== "undefined") {
  const handle = delayRender("Tai font cuc bo");
  Promise.all(SPECS.map(([w, fam, st]) => document.fonts.load(`${st ?? "normal"} ${w} 64px "${fam}"`, SAMPLE)))
    .then((res) => {
      const missing = SPECS.filter((_s, i) => res[i].length === 0);
      if (missing.length) throw new Error(`Font khong tai duoc: ${JSON.stringify(missing)}`);
      continueRender(handle);
    })
    .catch((e) => cancelRender(e));
}

// Font chu trang cho phong cach reference-video-edit-thinking: 1FTV Nexa Heavy (bo "100 Font chu Viet hoa" cua nguoi dung,
// du 134 ky tu tieng Viet, khong loi dau chong). File trong public/fonts (khong dua len Git) -> thieu file thi bao loi ro rang.
export const NEXA = "'Nexa Heavy VN'";
if (typeof document !== "undefined") {
  const url = staticFile("fonts/1FTV-Nexa-Heavy.otf");
  const st = document.createElement("style");
  st.textContent = `@font-face{font-family:'Nexa Heavy VN';src:url('${url}') format('opentype');font-weight:100 900;font-display:block;}`;
  document.head.appendChild(st);
  const h = delayRender("Tai font Nexa Heavy VN");
  fetch(url, { method: "HEAD" })
    .then((r) => (r.ok ? document.fonts.load(`900 64px 'Nexa Heavy VN'`, SAMPLE).then(() => true) : false))
    .then((ok) => {
      if (!ok) console.warn("Thieu public/fonts/1FTV-Nexa-Heavy.otf - chu trang RefEdit se dung font du phong");
      continueRender(h);
    })
    .catch((e) => cancelRender(e));
}

// [NGUOI DUNG] chu TRANG THUONG: 1FTV VIP Kasepi Sans (bo 100 font Viet hoa). File trong public/fonts (khong len Git).
export const KASEPI = "'Kasepi VN'";
if (typeof document !== "undefined") {
  const url = staticFile("fonts/1FTV-VIP-Kasepi-Sans.otf");
  const st = document.createElement("style");
  // unicode-range bo chu so 0-9: Kasepi ve so 1 giong chu I -> chu so roi ve font ke tiep (Be Vietnam Pro)
  st.textContent = `@font-face{font-family:'Kasepi VN';src:url('${url}') format('opentype');font-weight:100 900;font-display:block;unicode-range:U+0000-002F,U+003A-10FFFF;}`;
  document.head.appendChild(st);
  const h = delayRender("Tai font Kasepi VN");
  fetch(url, { method: "HEAD" })
    .then((r) => (r.ok ? document.fonts.load(`400 64px 'Kasepi VN'`, SAMPLE).then(() => true) : false))
    .then((ok) => {
      if (!ok) console.warn("Thieu public/fonts/1FTV-VIP-Kasepi-Sans.otf");
      continueRender(h);
    })
    .catch((e) => cancelRender(e));
}
