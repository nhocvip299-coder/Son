#!/usr/bin/env node
// Buoc 3–6 — Lap ke hoach dung: chon doan giu lai theo nhip loi noi, tao tieu de nhan manh,
// gan hieu ung typography theo style, dat SFX tai diem cat. Xuat plan.json cho composition AutoEdit.
import fs from "node:fs";
import path from "node:path";
import { ROOT, isMain, log, parseArgs, readJson, writeJson } from "./lib.mjs";

export const loadStyle = (id) => {
  const p = path.join(ROOT, "styles", id, "style.json");
  if (!fs.existsSync(p)) {
    const ids = fs.readdirSync(path.join(ROOT, "styles")).filter((d) => fs.existsSync(path.join(ROOT, "styles", d, "style.json")));
    throw new Error(`Khong co style "${id}". Cac style hien co: ${ids.join(", ")}`);
  }
  return readJson(p);
};

/** Gom tu thanh cac doan noi lien tuc; khoang lang > cutSilenceMs se bi cat bo. */
const speechSegments = (captions, durationMs, { cutSilenceMs, padMs }) => {
  if (!captions.length) return [{ srcStartMs: 0, srcEndMs: durationMs }];
  const segs = [];
  let s = { start: captions[0].startMs, end: captions[0].endMs };
  for (const c of captions.slice(1)) {
    if (c.startMs - s.end > cutSilenceMs) {
      segs.push(s);
      s = { start: c.startMs, end: c.endMs };
    } else s.end = Math.max(s.end, c.endMs);
  }
  segs.push(s);
  return segs.map((g, i) => {
    const prevEnd = i > 0 ? segs[i - 1].end : 0;
    const nextStart = i < segs.length - 1 ? segs[i + 1].start : durationMs;
    return {
      srcStartMs: Math.max(0, prevEnd, g.start - padMs),
      srcEndMs: Math.min(durationMs, Math.min(nextStart, g.end + padMs)),
    };
  });
};

const sentences = (caps) => {
  const out = [];
  let cur = [];
  for (const c of caps) {
    cur.push(c);
    if (/[.!?…]$/.test(c.text.trim())) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const words = (caps) => caps.map((c) => c.text.trim()).join(" ");

export const buildPlan = ({ analysis, captions, styleId, sourcePublicPath, fps, music }) => {
  const style = loadStyle(styleId);
  const { cutSilenceMs, padMs, jumpZoom } = style.pacing;

  // --- Cat canh theo nhip loi noi ---
  const raw = speechSegments(captions, analysis.durationMs, { cutSilenceMs, padMs }).filter(
    (s) => s.srcEndMs - s.srcStartMs >= 300,
  );
  let out = 0;
  const segments = raw.map((s, i) => {
    const r = { ...s, zoom: i % 2 === 1 ? jumpZoom : 1, outStartMs: out };
    out += s.srcEndMs - s.srcStartMs;
    return r;
  });
  const totalMs = out;
  const removed = analysis.durationMs - totalMs;
  log("ke-hoach", `${segments.length} doan giu lai, cat bo ${(removed / 1000).toFixed(1)}s khoang lang`);

  // --- Anh xa phu de sang timeline dau ra ---
  const mapMs = (ms) => {
    const seg = segments.find((s) => ms >= s.srcStartMs && ms <= s.srcEndMs);
    return seg ? seg.outStartMs + (ms - seg.srcStartMs) : null;
  };
  const outCaps = captions
    .map((c) => {
      const s = mapMs(c.startMs);
      const e = mapMs(c.endMs);
      if (s === null) return null;
      return { ...c, startMs: s, endMs: e ?? s + (c.endMs - c.startMs), timestampMs: s };
    })
    .filter(Boolean);

  // --- Tieu de nhan manh ---
  const titles = [];
  const sents = sentences(outCaps);
  const busy = (a, b) => titles.some((t) => a < t.startMs + t.durationMs + style.titles.minGapMs && b > t.startMs - style.titles.minGapMs);
  if (sents.length) {
    const hook = sents[0].slice(0, 6);
    const text = words(hook).replace(/[.,!?…]+$/, "");
    const mid = Math.ceil(hook.length / 2);
    const hookText =
      style.titles.hookEffect === "zoomPunch" || style.titles.hookEffect === "neonGlitch" || style.titles.hookEffect === "slideMask"
        ? hook.length > 3
          ? `${words(hook.slice(0, mid))} | ${words(hook.slice(mid))}`.replace(/[.,!?…]+/g, "")
          : text
        : text;
    titles.push({ text: hookText, effect: style.titles.hookEffect, startMs: Math.max(0, hook[0].startMs - 100), durationMs: Math.min(3000, Math.max(1600, hook.at(-1).endMs - hook[0].startMs + 700)), covers: [hook[0].startMs, hook.at(-1).endMs] });
  }
  const kw = style.titles.keywords.map((k) => k.toLowerCase());
  const maxTitles = Math.max(1, Math.floor((totalMs / 60000) * style.titles.maxPerMinute));
  let fx = 0;
  for (let i = 0; i < outCaps.length && titles.length < maxTitles; i++) {
    const w = outCaps[i].text.trim().toLowerCase().replace(/[.,!?…:;"]/g, "");
    const isNum = /\d/.test(w);
    const isKw = kw.some((k) => w === k || (k.includes(" ") && words(outCaps.slice(i, i + 3)).toLowerCase().includes(k)));
    const isExcl = /!$/.test(outCaps[i].text.trim());
    if (!(isNum || isKw || isExcl)) continue;
    const from = Math.max(0, i - 1);
    const phrase = outCaps.slice(from, Math.min(outCaps.length, i + 3));
    const startMs = Math.max(0, outCaps[from].startMs - 80);
    const phraseEnd = phrase.at(-1).endMs;
    const durationMs = Math.min(2600, Math.max(1500, phraseEnd - startMs + 600));
    if (startMs + durationMs > totalMs || busy(startMs, startMs + durationMs)) continue;
    const text = phrase
      .map((c, k) => (from + k === i ? `*${c.text.trim().replace(/[.,!?…]+$/, "")}*` : c.text.trim().replace(/[.,!?…]+$/, "")))
      .join(" ");
    const effect = style.titles.effects[fx++ % style.titles.effects.length];
    titles.push({ text, effect, startMs, durationMs, covers: [phrase[0].startMs, phraseEnd] });
  }
  log("ke-hoach", `${titles.length} tieu de nhan manh: ${titles.map((t) => `"${t.text}"(${t.effect})`).join(", ")}`);

  // Tieu de da hien chinh cac tu do -> bo phu de trung lap trong khoang do (tranh lap chu)
  const shownCaps = outCaps.filter((c) => !titles.some((t) => c.startMs >= t.covers[0] && c.startMs <= t.covers[1]));

  // --- SFX tai diem cat ---
  const sfx = [];
  if (style.sfx.cutWhoosh) {
    for (const s of segments.slice(1)) sfx.push({ sfx: "whoosh", atMs: Math.max(0, s.outStartMs - 160), volume: 0.28 });
  }

  return {
    source: sourcePublicPath,
    sourceHasAudio: analysis.hasAudio,
    fps,
    width: 1080,
    height: 1920,
    style: styleId,
    segments: segments.map(({ srcStartMs, srcEndMs, zoom }) => ({ srcStartMs, srcEndMs, zoom })),
    captions: shownCaps,
    titles: titles.map(({ covers, ...t }) => t),
    sfx,
    ...(music ? { music } : {}),
    _meta: { styleStatus: style.status, removedMs: removed, outputMs: totalMs },
  };
};

if (isMain(import.meta.url)) {
  const { pos, opts } = parseArgs(process.argv.slice(2));
  const dir = pos[0];
  const plan = buildPlan({
    analysis: readJson(path.join(dir, "analysis.json")),
    captions: readJson(path.join(dir, "captions.json")),
    styleId: opts.style ?? "hong-dang",
    sourcePublicPath: opts.source,
    fps: Number(opts.fps ?? 30),
  });
  writeJson(path.join(dir, "plan.json"), plan);
}
