#!/usr/bin/env node
/**
 * Ap PHONG CACH DA DUYET (nguoi dung chot o du an vid2) len 1 plan RefEdit bat ky (ban nhap engine hoac plan viet tay):
 *  - chu hien kieu GO (con tro), KHONG tieng go phim (nguoi dung chon A)
 *  - SFX lay tu bo pack (public/sfx/pack), gan tu dong theo loai hieu ung (XUAT HIEN / UI / CHUYEN CANH)
 *  - giong giu nguyen 100%; muc tung SFX dat sau bang sfx-level.py (thap hon giong 8 dB)
 *  - canh tram (bg) thu nguoi noi vao khung goc (mac dinh cua RefEdit)
 * Dung: node scripts/refedit/finalize-plan.mjs <plan-vao.json> <plan-ra.json> [--words captions-words.json] [--no-music]
 *   --words: tao them ban chay chu (plan-ra -> *-chay-chu.json) tu danh sach tu {text,startMs,endMs}
 */
import fs from "node:fs";
import { parseArgs } from "../pipeline/lib.mjs";

export const REVEAL = { mode: "type", cps: 22, keyVolume: 0 };

/** Bang SFX theo loai hieu ung (da duyet). Ten = file trong public/sfx/pack/. */
export const SFX_MAP = {
  setupLine: "ui-digital", // dong chu trang
  punch: "correct-jewel", // chu do nhan
  badge: "ui-notification", // badge chuong
  card: "pop-bells-sang", // the vang / tieu de VS
  barNormal: "ui-digital",
  barHot: "correct-jewel",
  priceStrike: "ui-error",
  priceNew: "es-success",
  warnYellow: "ui-error",
  warnRed: "sparkle-bonus",
  question: "ui-notification",
  rowGood: "pop-bells-sang",
  rowBad: "ui-error",
  flash: "camera-flash", // flare / light leak
  pipIn: "ui-whoosh", // nguoi noi thu vao khung goc
};

const typeDur = (txt, cps = REVEAL.cps) => (Array.from(txt).length + (txt.split(" ").length - 1) * 0.6) / cps;

export const autoSfx = (plan) => {
  const out = [];
  const P = (t, key, v = 1) => out.push({ atMs: Math.round(t * 1000), sfx: `pack/${SFX_MAP[key]}`, volume: v, why: key });
  for (const it of plan.items) {
    const st = it.startMs / 1000;
    switch (it.type) {
      case "setupPunch": {
        if (it.setup) P(st, "setupLine", 0.8);
        const pa = it.setup ? Math.max(it.punchAt ?? 0, typeDur(it.setup) + 0.12) : it.punchAt ?? 0;
        P(st + pa, "punch");
        break;
      }
      case "stepBadge": P(st, "badge"); break;
      case "emphasis": P(st, "punch"); break;
      case "bigNumeral": P(st, "punch"); break;
      case "contrast": P(st, "setupLine", 0.8); (it.words ?? []).forEach((w) => P(st + w.at, "punch")); break;
      case "list": P(st, "setupLine", 0.8); (it.items ?? []).forEach((x) => P(st + x.at, "card", 0.85)); break;
      case "cards": it.cards.forEach((c) => P(st + c.at, "card", 0.9)); break;
      case "bars": it.bars.forEach((b) => P(st + b.at, b.hot ? "barHot" : "barNormal")); break;
      case "priceDrop": P(st, "setupLine", 0.8); P(st + (it.dropAt ?? 0.6) - 0.35, "priceStrike"); P(st + (it.dropAt ?? 0.6) + 0.3, "priceNew"); break;
      case "warning": P(st, it.color === "yellow" ? "warnYellow" : "warnRed"); break;
      case "pills": (it.pills ?? []).forEach((q) => P(st + q.at, "question")); break;
      case "recap": (it.nums ?? []).forEach((_, i) => P(st + (it.at ?? 0) + i * 0.14, "card", 0.85)); break;
      case "versus":
        P(st + it.left.at, "card"); P(st + it.right.at, "card");
        [...it.left.rows, ...it.right.rows].forEach((r) => P(st + r.at, r.good ? "rowGood" : "rowBad", 0.85));
        break;
      case "flare": case "leak": P(st, "flash", 0.9); break;
    }
  }
  let acc = 0;
  for (const sg of plan.segments) {
    if (sg.kind === "bg" && sg.blurIn) P(acc / 1000, "pipIn", 0.9);
    acc += sg.srcEndMs - sg.srcStartMs;
  }
  return out.sort((a, b) => a.atMs - b.atMs);
};

export const finalize = (plan, { music = true } = {}) => ({
  ...plan,
  reveal: REVEAL,
  voiceVolume: 1,
  sfx: autoSfx(plan),
  music: music ? { src: "music/bed-ambient.wav", volume: 0.03 } : undefined,
});

if (process.argv[1] && process.argv[1].endsWith("finalize-plan.mjs")) {
  const { pos, opts } = parseArgs(process.argv.slice(2));
  const [inP, outP] = pos;
  const plan = finalize(JSON.parse(fs.readFileSync(inP, "utf8")), { music: !opts["no-music"] });
  fs.writeFileSync(outP, JSON.stringify(plan, null, 1));
  if (opts.words) {
    const words = JSON.parse(fs.readFileSync(opts.words, "utf8"));
    fs.writeFileSync(outP.replace(/\.json$/, "-chay-chu.json"), JSON.stringify({ ...plan, words: words.words ?? words, wordsY: 1590, wordsTypewriter: true }, null, 1));
  }
  const missing = [...new Set(plan.sfx.map((c) => c.sfx))].filter((n) => !fs.existsSync(`public/sfx/${n}.wav`));
  console.log(`${outP}: ${plan.items.length} item, ${plan.sfx.length} SFX${missing.length ? ` | THIEU FILE: ${missing.join(", ")} -> chay scripts/refedit/install-assets.sh <goi-tai-nguyen.zip>` : ""}`);
}
