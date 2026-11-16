import { cancelRender, continueRender, delayRender } from "remotion";
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
