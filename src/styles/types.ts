import type { Theme } from "../lib/theme";
import type { EffectName } from "../typography";

/**
 * Style Pack = mot "skill phong cach" co the nap/tai su dung.
 * status:
 *  - "placeholder": khung mac dinh, CHUA hoc tu video mau -> KHONG phai phong cach that.
 *  - "calibrating": da co video mau trong styles/<id>/references, dang do dac.
 *  - "calibrated": da doi chieu voi video mau va duoc nguoi dung xac nhan.
 */
export type StylePack = {
  id: string;
  name: string;
  status: "placeholder" | "calibrating" | "calibrated";
  description: string;
  theme: Theme;
  captions: { enabled: boolean; uppercase: boolean; combineMs: number };
  titles: {
    effects: EffectName[]; // xoay vong cac hieu ung cho tieu de nhan manh
    hookEffect: EffectName; // hieu ung cho cau mo dau
    maxPerMinute: number;
    minGapMs: number;
    keywords: string[]; // tu khoa uu tien nhan manh (theo nganh)
  };
  pacing: {
    cutSilenceMs: number; // khoang lang dai hon muc nay se bi cat
    padMs: number; // giu lai truoc/sau loi noi
    jumpZoom: number; // muc zoom luan phien sau moi cat (an jump cut)
  };
  sfx: { cutWhoosh: boolean; volume: number; musicBed?: string; musicVolume: number };
  grade: { contrast: number; saturate: number; brightness: number; vignette: number };
};
