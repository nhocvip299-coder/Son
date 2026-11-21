#!/usr/bin/env node
/**
 * EDITING DECISION ENGINE — phong cach "reference-video-edit-thinking" (hoc tu mau-ref-01).
 * Doc loi thoai (captions.json timestamp tung tu) -> chia cum y -> nhan dien Y DINH noi dung
 * -> chon cach dung (talking head / nen truu tuong / chu dong / infographic / chuyen canh / SFX)
 * -> dat thoi gian theo do lech (lag) do duoc tu video mau -> plan.json + decisions.md (ly do tung quyet dinh).
 *
 * Dung: node scripts/refedit/decide.mjs <work-dir> [--source inputs/x.mp4] [--fixes asr-fixes.json] [--fps 60] [--no-cut]
 *   work-dir can: captions.json (+ analysis.json neu muon cat khoang lang)
 * Ket qua: <work-dir>/plan.json, plan-chay-chu.json (ban chay chu tung chu), decisions.md
 *
 * Nguyen tac (xem .claude/skills/reference-video-edit-thinking/references/editing-rules.md):
 *  R1 Moi thoi diem chi 1 diem nhin (1 khoi chu / 1 dao cu).          R2 Chu = tu khoa, khong phai phu de.
 *  R3 Cau truc (buoc/thu tu/liet ke) -> do hoa co cau truc.            R4 >=3 vi du / the -> roi mat sang nen trung tinh.
 *  R5 Moc chuong -> badge so + zoom ramp + light leak dong chuong.    R6 Dinh noi dung -> do + zoom ramp.
 *  R7 Cam/khuyen cao -> mau canh bao (vang neu ngay truoc la do).     R8 Giai thich ly do -> khong chu (nghi mat).
 *  R9 Tom tat cuoi -> badge 1-2-3 no tia.                             R10 Hook so lieu -> so do + dao cu 3D + flare.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "../pipeline/lib.mjs";

const { pos, opts } = parseArgs(process.argv.slice(2));
const dir = pos[0];
if (!dir) {
  console.error("Dung: node scripts/refedit/decide.mjs <work-dir> [--source inputs/x.mp4] [--fixes f.json]");
  process.exit(2);
}
const rd = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const FPS = Number(opts.fps ?? 60);
const SOURCE = opts.source ?? "inputs/source.mp4";

// ---------- 0. Tu + sua loi ASR ----------
let words = rd("captions.json").map((w) => ({ text: w.text.trim(), startMs: w.startMs, endMs: w.endMs })).filter((w) => w.text);
if (opts.fixes && fs.existsSync(opts.fixes)) {
  const fx = JSON.parse(fs.readFileSync(opts.fixes, "utf8"));
  const multi = Object.entries(fx).filter(([k]) => !k.startsWith("_") && k.includes(" "));
  const single = Object.fromEntries(Object.entries(fx).filter(([k]) => !k.startsWith("_") && !k.includes(" ")));
  words = words.map((w) => {
    const m = /^(.*?)([.,!?…:;]*)$/.exec(w.text);
    return single[m[1]] ? { ...w, text: single[m[1]] + m[2] } : w;
  });
  for (const [k, v] of multi) {
    const ks = k.split(" ");
    const vs = v.split(" ");
    for (let i = 0; i + ks.length <= words.length; i++) {
      const seg = words.slice(i, i + ks.length).map((w) => w.text.replace(/[.,!?…:;]+$/, "").toLowerCase());
      if (seg.join(" ") === k.toLowerCase()) {
        const tail = (/[.,!?…:;]+$/.exec(words[i + ks.length - 1].text) ?? [""])[0];
        ks.forEach((_, j) => (words[i + j] = { ...words[i + j], text: (vs[j] ?? "") + (j === ks.length - 1 ? tail : "") }));
      }
    }
  }
  words = words.filter((w) => w.text);
}
const N = words.length;
const DEBUG = !!opts.debug;
const durMs = fs.existsSync(path.join(dir, "analysis.json")) ? rd("analysis.json").durationMs : words[N - 1].endMs + 600;

// ---------- 1. Cum y (phrase) ----------
const MARKERS = /^(bước|thứ|ví|quan|đừng|vì|bởi|tại|chỉ|không|tuyệt|đầu|cuối|tiếp|góc|khách|một|lý)$/i;
const isCap = (s) => {
  const ch = Array.from(s.trim())[0] ?? "";
  return ch !== ch.toLowerCase();
};
const strip = (s) => s.replace(/[.,!?…:;"“”]+(?=\s|$)/g, "").replace(/^["“”]+/, "").trim();
const lower = (s) => strip(s).toLowerCase();
const phrases = [];
{
  let cur = [];
  const flush = () => cur.length && (phrases.push(cur), (cur = []));
  for (let i = 0; i < N; i++) {
    const w = words[i];
    const nx = words[i + 1];
    cur.push(i);
    const punct = /[.,!?…:;]$/.test(w.text);
    const gap = nx ? nx.startMs - w.endMs : 0;
    // Whisper thuong vien hoa dau cau moi ma khong co dau cham -> cung la ranh gioi
    const capNext = nx && isCap(nx.text) && !/^(TikTok|BĐS|Facebook|Zalo|YouTube|Ocean|Park|Grand|World|Vincom|Mega|Mall|Sơn|Vinhomes)$/.test(strip(nx.text)) && !isCap(w.text) && cur.length >= 1;
    // Whisper hay bo dau cau: tach mem truoc lien tu khi cum da >= 4 tu, tach cung o 12 tu
    const coThe = nx && words[i + 2] && lower(nx.text) === "có" && lower(words[i + 2].text) === "thể";
    const soft = nx && cur.length >= 4 && (coThe || /^(để|nên|nhưng|thì|vì|rồi|còn|mà|làm)$/i.test(strip(nx.text))) && !/^(để|nên|nhưng|thì|vì|làm)$/i.test(strip(w.text));
    if (!nx || punct || gap > 300 || capNext || soft || cur.length >= 16 || (cur.length >= 3 && MARKERS.test(strip(nx.text)) && isCap(nx.text))) flush();
  }
  flush();
}
const P = phrases.map((idx, k) => {
  const ws = idx.map((i) => words[i]);
  return { k, idx, ws, text: ws.map((w) => strip(w.text)).join(" "), raw: ws.map((w) => w.text).join(" "), low: ws.map((w) => lower(w.text)).join(" "), startMs: ws[0].startMs, endMs: ws[ws.length - 1].endMs };
});

if (DEBUG) P.forEach((p) => console.log(p.k, (p.startMs / 1000).toFixed(2), p.text));
// ---------- 2. Nhan dien y dinh ----------
const NUMW = { một: 1, hai: 2, ba: 3, bốn: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10 };
const num = (s) => (/^\d+$/.test(s) ? Number(s) : NUMW[s]);
const STOP = new Set(["cực kỳ", ..."tại sao thế nào gì đây kia hôm nay thôi ạ lẫn là và thì mà của cho với những các một cái này đó nên để có được rất cũng đã đang sẽ thì ạ nhé nha anh chị em mình bạn ra vào ở trong khi phải".split(" ")]);
const content = (ws) => ws.filter((w) => !STOP.has(lower(w.text)));
const cap = (s, n) => s.split(" ").slice(0, n).join(" ");
const wordAt = (p, re) => p.ws.find((w) => re.test(lower(w.text)));

// Gop tu ghep thanh 1 token hien thi (bat dong san -> BDS) de chon cum DO khong cat giua tu ghep
const COMPOUND = [[["cực", "kỳ"], "cực kỳ"], [["thông", "thoáng"], "thông thoáng"], [["ưu", "đãi"], "ưu đãi"], [["mặt", "tiền"], "mặt tiền"], [["mặt", "thoáng"], "mặt thoáng"], [["diện", "tích"], "diện tích"], [["kinh", "doanh"], "kinh doanh"], [["bất", "động", "sản"], "BĐS"], [["tối", "ưu"], "tối ưu"], [["khách", "hàng"], "khách hàng"], [["căn", "hộ"], "căn hộ"], [["dự", "án"], "dự án"], [["pháp", "lý"], "pháp lý"], [["tiện", "ích"], "tiện ích"]];
const tokens = (ws) => {
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    const c = COMPOUND.find(([parts]) => parts.every((x, j) => ws[i + j] && lower(ws[i + j].text) === x));
    if (c) {
      out.push({ text: c[1], startMs: ws[i].startMs, endMs: ws[i + c[0].length - 1].endMs });
      i += c[0].length - 1;
    } else out.push(ws[i]);
  }
  return out;
};
const pickPunch = (ws) => {
  const tk = tokens(ws);
  const cw = tk.filter((w) => !STOP.has(lower(w.text)) && !/^(1|một)$/.test(lower(w.text)));
  const n = Math.min(3, Math.max(2, Math.floor(cw.length / 2)));
  const punchW = cw.slice(-n);
  const setupW = tk.slice(0, tk.indexOf(punchW[0])).slice(-4);
  return { punchW, setupW };
};
const decisions = []; // {kind, p0, p1, why, data}
const used = new Set();
const take = (...ks) => ks.forEach((k) => used.add(k));
const lastK = P.length - 1;

for (let k = 0; k < P.length; k++) {
  if (used.has(k)) continue;
  const p = P[k];
  const l = p.low;
  // R10 hook so lieu trong 4s dau
  const hook = /(\d+[\d,.]*|một|hai|ba|bốn|năm|mười) (năm|tháng|ngày|tuần|phút|giờ|tỷ|triệu|căn|lô|mặt \S+|tầng|phòng)/.exec(l);
  if (hook && p.startMs < 4000 && !decisions.some((d) => d.kind === "hook")) {
    // chon con so DAT GIA TRI NHAT trong 5s dau (so cuoi cung thuong la diem ban: "2 mat duong, 3 MAT THOANG")
    const pool = P.filter((q) => q.startMs < 5000 && q.k >= k);
    const all = pool.flatMap((q) => [...q.low.matchAll(/(\d+[\d,.]*|một|hai|ba|bốn|năm|mười) (năm|tháng|ngày|tuần|phút|giờ|tỷ|triệu|căn|lô|mặt \S+|tầng|phòng)/g)].map((m) => ({ m, q })));
    // bo "1 X" (dem 1 cai khong an tuong) neu con so khac; noi chuoi liet ke lien tiep (<2.5s) roi lay so CUOI chuoi
    const tOf = (x) => (x.q.ws.find((w) => lower(w.text) === x.m[1]) ?? x.q.ws[0]).startMs;
    const cand = all.filter((x) => !/^(1|một)$/.test(x.m[1]));
    const chain = [];
    for (const x of cand.length ? cand : all) if (!chain.length || tOf(x) - tOf(chain[chain.length - 1]) < 2500) chain.push(x);
    if (chain.length) {
      const best = chain[chain.length - 1];
      for (let x = k; x < best.q.k; x++) take(x);
      k = best.q.k;
      hook[0] = best.m[0];
      hook[1] = best.m[1];
      hook[2] = best.m[2];
    }
    const p = P[k];
    const nw = [...p.ws].reverse().find((w) => lower(w.text) === hook[1]);
    const rest = P[k + 1];
    decisions.push({
      kind: "hook", p0: k, p1: rest ? k + 1 : k, data: { numText: `${hook[1]} ${hook[2]}`.toUpperCase(), at: nw.startMs, unit: hook[2], rest },
      why: `Cau mo dau co con so "${hook[0]}" = bang chung cong suc/ket qua -> hook so DO lon + dao cu 3D minh hoa don vi, ket bang flare (mau 0-1.2s).`,
    });
    take(k);
    if (rest) take(k + 1);
    continue;
  }
  // R5 moc chuong
  const st = /^(bước|phần|mẹo|bí quyết|cách) (\d+|một|hai|ba|bốn|năm)\b/.exec(l) ?? (() => {
    const m = /^(?:ưu điểm|điểm cộng|lý do|điểm) thứ (\d+|hai|ba|bốn|năm)\b/.exec(l);
    return m ? [m[0], "điểm", m[1]] : null;
  })();
  if (st) {
    // nhan = phan sau "chinh la/la" neu co (vd "uu diem thu 2 cua can nha nay chinh la so huu dien tich lon")
    const cl = p.ws.findIndex((w, i) => lower(w.text) === "là" && i >= 2);
    const after = cl > 0 ? p.ws.slice(cl + 1) : p.ws.slice(st[0].split(" ").length);
    const lw = (ws) => ws.filter((w) => !/^(là|thì|mà|và|đó|này)$/i.test(strip(w.text)));
    let lab = lw(after).map((w) => strip(w.text)).join(" ");
    let p1 = k;
    if (content(after).length < 2 && P[k + 1]) {
      lab = (lab ? lab + " " : "") + lw(P[k + 1].ws).map((w) => strip(w.text)).join(" ");
      p1 = k + 1;
    }
    // "Quay don gian NHUNG co chu dich" -> y chinh nam sau "nhung": dong tu dau + phan sau "nhung"
    const nh = lab.split(" ").indexOf("nhưng");
    if (nh > 0) lab = [lab.split(" ")[0], ...lab.split(" ").slice(nh + 1)].join(" ");
    lab = cap(lab.replace(/^(là|thì)\s+/i, ""), 4);
    decisions.push({ kind: "step", p0: k, p1, data: { n: num(st[2]), label: lab, at: p.ws[0].startMs, labelWordAt: (P[p1].ws.find((w) => !STOP.has(lower(w.text)) && !/^(bước|\d+|một|hai|ba)$/.test(lower(w.text))) ?? P[p1].ws[0]).startMs },
      why: `"${p.text}" = moc chuong -> badge so ${num(st[2])} + nhan ngan, zoom ramp vao mat, dong chuong bang light leak (mau 8.0/20.6/39.7s).` });
    take(k, p1);
    continue;
  }
  // R3/R4 chuoi thu tu (thu nhat/hai/ba) -> the vang tren nen
  if (/^(thứ nhất|đầu tiên)/.test(l)) {
    const group = [];
    for (let j = k; j < Math.min(P.length, k + 10); j++) {
      if (/^(thứ (nhất|hai|ba|tư|năm)|đầu tiên|tiếp theo|cuối cùng)/.test(P[j].low)) group.push(j);
      else if (group.length && P[j].startMs - P[group[group.length - 1]].endMs > 2500) break;
    }
    if (group.length >= 2) {
      const cards = group.map((j, gi) => {
        const ord = P[j];
        const nxt = group[gi + 1] ?? Math.min(lastK + 1, j + 3);
        const span = P.slice(j, nxt === j ? j + 1 : nxt).flatMap((q) => q.ws);
        const body = content(span.filter((w) => !/^(thứ|nhất|hai|ba|tư|đầu|tiên|tiếp|theo|cuối|cùng)$/.test(lower(w.text))));
        // nhan = cac ve ngan cach bang dau phay ("canh mo, gay to mo" -> "Mo - gay to mo"), bo tu loai "canh/phan"
        const raw = span.map((w) => w.text).join(" ").replace(/^\s*(thứ \S+|đầu tiên|tiếp theo|cuối cùng)[,]?\s*/i, "");
        const label = raw.split(/[,;]/).map((x) => strip(x).replace(/^(cảnh|phần|là)\s+/i, "")).filter(Boolean).slice(0, 2).map((x) => cap(x, 3)).join(" - ");
        return { at: ord.ws[0].startMs, textAt: (body[0] ?? ord.ws[ord.ws.length - 1]).startMs, label };
      });
      const last = group[group.length - 1];
      const p1 = Math.min(lastK, last + 2);
      decisions.push({ kind: "cards", p0: k, p1, data: { cards: cards.slice(0, 3) },
        why: `Chuoi thu tu ${group.length} y -> roi mat sang nen trung tinh, moi y 1 the vang: KHUNG hien o tu dem, CHU go khi noi noi dung (mau 25.7-32.9s).` });
      for (let j = k; j <= p1; j++) take(j);
      continue;
    }
  }
  // R3 checklist quy tac co so luong ("mot kenh, mot chu de", "cung mot khung gio", "7 den 10 ngay") -> 1 the vang 3D tren nen
  {
    const QTY = /(^| )(một|\d+[\d,.]*)(m(?=$| )|%| \S+)/;
    const grp = [];
    for (let j = k; j < Math.min(P.length, k + 8); j++) {
      const q = P[j];
      if (used.has(j) || q.ws.length > 7 || !QTY.test(q.low) || /^(bước|thứ|vì)/.test(q.low)) break;
      if (grp.length && q.startMs - P[grp[grp.length - 1]].endMs > 900) break;
      grp.push(j);
    }
    if (grp.length >= 3) {
      const norm = (q) =>
        content(q.ws)
          .map((w) => strip(w.text))
          .filter((x) => !/^(đăng|làm|cùng|duy|nhất|đến)$/i.test(x))
          .join(" ")
          .replace(/\bmột\b/gi, "1")
          .replace(/(\d+) (\d+) ngày/, "$1-$2 ngày");
      const lines = [];
      for (const j of grp) {
        const tx = norm(P[j]);
        const last = lines[lines.length - 1];
        if (last && last.text.split(" ").length <= 3 && tx.split(" ").length <= 3 && !last.joined) Object.assign(last, { text: `${last.text} - ${tx}`, joined: true });
        else lines.push({ text: tx, at: P[j].ws[0].startMs });
      }
      decisions.push({ kind: "checklist", p0: grp[0], p1: grp[grp.length - 1], data: { lines: lines.slice(0, 3).map((l) => ({ text: l.text.charAt(0).toUpperCase() + l.text.slice(1), at: l.at })) },
        why: `${grp.length} quy tac co so luong lien tiep -> 1 the vang nghieng 3D tren nen, tung dong go khi duoc noi (mau 41.1-46.9s).` });
      take(...grp);
      continue;
    }
  }
  // R4b liet ke ten rieng sau "toi/gom/nhu" trai qua nhieu cum: "ket noi toi A, B, C va D"
  {
    const ti = p.ws.findIndex((w) => /^(tới|gồm|như)$/.test(lower(w.text)));
    const tail = ti >= 0 ? p.ws.slice(ti + 1) : [];
    if (ti >= 1 && tail.length >= 1 && tail.length <= 3 && P[k + 1] && P[k + 1].ws.length <= 5) {
      const its = [{ ws: tail }];
      let j = k + 1;
      for (; j < Math.min(P.length, k + 6) && P[j].ws.length <= 5; j++) {
        const parts = [];
        let curp = [];
        for (const w of P[j].ws) {
          if (lower(w.text) === "và") (curp.length && parts.push(curp), (curp = []));
          else curp.push(w);
        }
        if (curp.length) parts.push(curp);
        parts.forEach((x) => its.push({ ws: x }));
      }
      // muc cuoi bi cat sang cum sau: noi them chuoi tu VIET HOA (ten rieng, toi da 4 tu)
      const nxp = P[j];
      if (nxp) {
        const run = [];
        for (const w of nxp.ws) if (isCap(w.text) && run.length < 4) run.push(w); else break;
        if (run.length >= 2) its[its.length - 1].ws = its[its.length - 1].ws.concat(run);
      }
      const label = (ws) => {
        const fc = ws.findIndex((w) => isCap(w.text));
        const use = fc > 0 && ws.slice(fc).length >= 2 ? ws.slice(fc) : ws; // "cong vien Quang Truong Sao Bien" -> ten rieng
        return cap(use.map((w) => strip(w.text)).join(" "), 4);
      };
      if (its.length >= 3) {
        const titleW = content(p.ws.slice(Math.max(0, ti - 2), ti + 1));
        decisions.push({ kind: "list", p0: k, p1: j - 1, data: { title: cap(titleW.map((w) => strip(w.text)).join(" "), 3).replace(/^./, (c) => c.toUpperCase()), titleAt: p.ws[Math.max(0, ti - 2)].startMs, items: its.slice(0, 4).map((x) => ({ text: label(x.ws), at: x.ws[0].startMs })) },
          why: `Liet ke ${its.length} ten rieng sau "${lower(p.ws[ti].text)}" -> nen trung tinh + tieu de + tung muc hien dung luc noi (mau 14.4-20.6s).` });
        for (let x = k; x < j; x++) take(x);
        continue;
      }
    }
  }
  // R4 vi du / liet ke >= 3 muc ngan
  {
    const isEx = /^ví dụ/.test(l);
    const items = [];
    let title = null;
    let j = k;
    const thi = p.ws.findIndex((w) => lower(w.text) === "thì");
    const short = (q) => q && q.ws.length <= 5;
    if (isEx || (thi > 0 && thi <= 3 && short(P[k + 1]) && short(P[k + 2])) || (p.ws.length <= 4 && short(P[k + 1]) && short(P[k + 2]))) {
      const prevP = P[k - 1];
      const lead = !isEx && thi < 0 && prevP && !used.has(k - 1) && /(tới|gồm|như|bao gồm|đến)$/.test(prevP.low) ? prevP : null;
      const head = isEx ? p.ws.slice(2) : thi > 0 ? p.ws.slice(0, thi) : lead ? lead.ws.slice(-3) : p.ws;
      if (lead) {
        items.push({ text: cap(p.text, 3), at: p.ws[0].startMs });
        take(k - 1);
      }
      if (thi > 0) items.push({ text: cap(content(p.ws.slice(thi + 1)).map((w) => strip(w.text)).join(" "), 3), at: p.ws[thi + 1]?.startMs ?? p.endMs });
      // tieu de = cum dau (sau "vi du"), toi da 3 tu
      title = cap(head.map((w) => strip(w.text)).join(" "), 3);
      const hw = head[0] ?? p.ws[0];
      for (j = k + 1; j < Math.min(P.length, k + 7); j++) {
        const q = P[j];
        if (q.ws.length > 5 || /^(bước|thứ|vì|đừng|quan)/.test(q.low)) break;
        if (items.length && lower(q.ws[0].text) === lower(head[0]?.text ?? "")) break; // nhom moi (vd "Khach dau tu")
        const qw = q.ws.slice(/^(nói về|như là|ví dụ)/.test(q.low) ? 2 : 0);
        const txt = cap(content(qw).map((w) => strip(w.text)).join(" "), 3);
        if (txt.split(" ").length < 2 && /^(học|hoặc|và|với)$/i.test(txt)) continue; // tu dem / loi ASR
        if (txt) items.push({ text: txt.charAt(0).toUpperCase() + txt.slice(1), at: qw[0]?.startMs ?? q.startMs });
      }
      const prevList = decisions[decisions.length - 1];
      const sibling = prevList && prevList.kind === "list" && p.startMs - P[prevList.p1].endMs < 700 && lower(p.ws[0].text) === lower(prevList.data.title.split(" ")[0]);
      if (items.length >= 3 || (sibling && items.length >= 2)) {
        decisions.push({ kind: "list", p0: k, p1: j - 1, data: { title: title.charAt(0).toUpperCase() + title.slice(1), titleAt: hw.startMs, items: items.slice(0, 4) },
          why: `${items.length} muc ngan lien tiep${isEx ? " sau 'vi du'" : ""} -> nen trung tinh + tieu de go chu + muc zig-zag hien dung luc noi (mau 14.4-20.6s).` });
        for (let x = k; x < j; x++) take(x);
        continue;
      }
    }
  }
  // cau hoi -> the kinh
  if (/\?$/.test(p.raw.trim())) {
    const qs = [k];
    if (P[k + 1] && /\?$/.test(P[k + 1].raw.trim())) qs.push(k + 1);
    const ann = P[k - 1] && /(\d+|hai|ba) câu hỏi/.test(P[k - 1].low) ? P[k - 1].ws.find((w) => /^(\d+|hai|ba)$/.test(lower(w.text))) : null;
    decisions.push({ kind: "pills", p0: k, p1: qs[qs.length - 1], data: { lead: ann ? ann.startMs : null, pills: qs.map((j) => ({ text: cap(P[j].text, 5), at: P[j].ws[0].startMs })) },
      why: `Cau hoi${qs.length > 1 ? " doi" : ""} -> the kinh vien trang nghieng, nen footage lam mo de doc (mau 10.8-14.4s).` });
    take(...qs);
    continue;
  }
  // doi lap "khong can X ... chi can Y"
  if (/^không cần/.test(l)) {
    const yP = P.slice(k, k + 3).find((q) => /chỉ cần/.test(q.low));
    if (yP) {
      const yw = yP.ws.slice(yP.ws.findIndex((w) => lower(w.text) === "cần") + 1).filter((w) => !STOP.has(lower(w.text)));
      decisions.push({ kind: "contrast", p0: k, p1: yP.k, data: { neg: cap(p.text, 4), at: p.ws[0].startMs, words: yw.slice(0, 2).map((w, i) => ({ text: strip(w.text), at: w.startMs, x: yw.length > 1 ? (i === 0 ? 0.25 : 0.68) : 0.5 })) },
        why: `Phu dinh -> khang dinh: dong trang "${p.text}" roi tung tu DO dap theo giong (mau 23.3-25.7s).` });
      for (let x = k; x <= yP.k; x++) take(x);
      continue;
    }
  }
  // R6 dinh noi dung
  const em = /(quan trọng nhất|điều quan trọng|cốt lõi|chìa khóa|bí mật|đáng chú ý nhất|đáng nói nhất|ăn tiền nhất|điểm ăn tiền)/.exec(l);
  if (em) {
    const w0 = wordAt(p, new RegExp("^" + em[1].split(" ")[0] + "$"));
    decisions.push({ kind: "emphasis", p0: k, p1: k, data: { text: em[1], at: w0.startMs },
      why: `"${em[1]}" = dinh noi dung -> chu DO mo rong + zoom ramp vao mat (mau 36.3-37.3s).` });
    take(k);
    // "1 ... duy nhat" ngay sau
    const sg = P.slice(k, k + 3).find((q) => /(một|1) (.+?) duy nhất/.test(q.low));
    if (sg) {
      const m = /(một|1) (.+?) duy nhất/.exec(sg.low);
      const w1 = sg.ws.find((w) => /^(một|1)$/.test(lower(w.text)));
      decisions.push({ kind: "numeral", p0: sg.k, p1: sg.k, data: { line1: cap(m[2], 3), line2: "duy nhất", at: w1.startMs },
        why: `"${m[0]}" -> so 1 DO nghieng rat lon + 2 dong (tinh duy nhat = con so).` });
      take(sg.k);
    }
    continue;
  }
  // R7 canh bao / cam
  const wn = /^(đừng|không nên|tuyệt đối không|tránh)\s*(.*)$/.exec(l);
  if (wn) {
    const verb = wn[1] === "tuyệt đối không" ? "không" : wn[1];
    let restW = content(p.ws.slice(wn[1].split(" ").length));
    let p1w = k;
    if (restW.length < 2 && P[k + 1]) {
      restW = restW.concat(content(P[k + 1].ws));
      p1w = k + 1;
    }
    // dong 2: menh lenh tiep theo ngay sau (vd "Keu goi ban be tuong tac") -> them vao canh bao
    const nx2 = P[p1w + 1];
    const sub2 = nx2 && nx2.ws.length <= 6 && nx2.startMs - P[p1w].endMs < 600 && !/^(vì|bước|thứ)/.test(nx2.low) ? nx2 : null;
    const headTxt = `${verb} ${restW.slice(0, 1).map((w) => strip(w.text)).join(" ")}`.trim();
    const subTxt = sub2 ? cap(content(sub2.ws).map((w) => strip(w.text)).join(" "), 4) : restW.slice(1, 5).map((w) => strip(w.text)).join(" ");
    decisions.push({ kind: "warning", p0: k, p1: sub2 ? sub2.k : p1w, data: { head: sub2 ? cap(restW.map((w) => strip(w.text)).join(" "), 3) : headTxt, sub: subTxt, at: p.ws[0].startMs, subAt: sub2 ? sub2.ws[0].startMs : null },
      why: `"${P.slice(k, (sub2 ? sub2.k : p1w) + 1).map((q) => q.text).join(" ")}" = dieu cam/khuyen cao -> chu canh bao (vang neu ngay truoc la khoi do, nguoc lai do) (mau 38.5s, 46.9s).` });
    take(k, p1w);
    if (sub2) take(sub2.k);
    continue;
  }
  // R8 giai thich -> nghi
  if (/^(vì|bởi vì|tại vì|lý do|do đó)/.test(l)) {
    decisions.push({ kind: "breath", p0: k, p1: k, data: { at: p.startMs }, why: `"${cap(p.text, 6)}..." = giai thich ly do -> KHONG chen chu, chi zoom cham (mau 50.7-53.3s).` });
    take(k);
    continue;
  }
  // R9 tom tat cuoi
  const rc = /(\d+|hai|ba|bốn|năm) (bước|điều|cách|bí quyết|mẹo|ý)/.exec(l);
  if (rc && p.startMs > durMs * 0.7) {
    const n = Math.min(5, num(rc[1]) ?? 3);
    const w0 = p.ws.find((w) => lower(w.text) === rc[1]);
    decisions.push({ kind: "recap", p0: k, p1: k, data: { n, at: w0.startMs }, why: `Nhac lai "${rc[0]}" o cuoi -> badge 1..${n} hien lan luot roi no tia (mau 54.3s).` });
    take(k);
    continue;
  }
  // R12 keu goi hanh dong o cuoi -> dong trang "Lien he" + ten DO  [AI: video mau khong co CTA (ket bang outro TikTok)]
  const cta = /(liên hệ|gọi|inbox|nhắn tin|để lại số)/.exec(l);
  if (cta && p.startMs > durMs * 0.75) {
    const ci = p.ws.findIndex((w) => lower(w.text) === "cho");
    const who = ci >= 0 ? p.ws.slice(ci + 1, ci + 3) : content(p.ws).slice(-2);
    decisions.push({ kind: "cta", p0: k, p1: k, data: { setup: cta[1].charAt(0).toUpperCase() + cta[1].slice(1) + " trực tiếp", punch: who.map((w) => strip(w.text)).join(" "), setupAt: p.ws[0].startMs, punchAt: (who[0] ?? p.ws[0]).startMs },
      why: `[AI] Keu goi hanh dong cuoi video -> dong trang "lien he" + ten DO (mau goc khong co CTA, de xuat them).` });
    take(k);
    continue;
  }
  // R11 so lieu (gia, %, dien tich, tang) giua bai -> cum DO lon la con so (mau: "2 NAM" do lon; editor de so lieu thanh diem nhin)
  const stat = /(\d+[\d,.]*\s?(?:tỷ|triệu|%|m2|m²|m(?=$|\s)|mét|tầng|phòng ngủ))/.exec(l.replace(/(\d),(\d)/g, "$1.$2"));
  if (stat && p.startMs > 3000) {
    const sw = p.ws.find((w) => /\d/.test(w.text));
    const val = stat[1].replace(/\s/g, " ").replace(/\./g, ",").toUpperCase();
    const before = content(p.ws.slice(Math.max(0, p.ws.indexOf(sw) - 3), p.ws.indexOf(sw))).map((w) => strip(w.text)).join(" ");
    decisions.push({ kind: "stat", p0: k, p1: k, data: { setup: before, punch: val, setupAt: (p.ws[Math.max(0, p.ws.indexOf(sw) - 3)] ?? sw).startMs, punchAt: sw.startMs },
      why: `So lieu "${stat[1]}" -> con so DO lon (diem nhin chinh), dong trang nho la ngu canh "${before}".` });
    take(k);
    continue;
  }
  // don vi thoi gian giua bai -> dong ho
  if (/\b(\d+|năm|mười) (phút|giờ)\b/.test(l) && !decisions.some((d) => d.kind === "clock")) {
    const w0 = p.ws.find((w) => /^(phút|giờ)$/.test(lower(w.text)));
    decisions.push({ kind: "clock", p0: k, p1: k, data: { at: w0.startMs }, why: `Nhac thoi luong -> dong ho 3D canh mat, tan thanh bui khi chu tiep theo vao (mau 4.2-6.0s).` });
    // khong take: cau van co the mang chu setup/punch
  }
}

// R2 Lap khoang trong bang setup+punch (dong trang nho + cum DO), toi thieu 3.2s khong co do hoa
decisions.sort((a, b) => P[a.p0].startMs - P[b.p0].startMs);
const busy = (t0, t1) => decisions.some((d) => !["breath", "clock"].includes(d.kind) && P[d.p0].startMs - 600 < t1 && P[d.p1].endMs + 400 > t0);
for (let k = 0; k < P.length; k++) {
  if (used.has(k)) continue;
  const p = P[k];
  const cw = content(p.ws);
  if (cw.length < 3 || p.endMs - p.startMs < 900) continue;
  if (busy(p.startMs - 2000, p.startMs + 1200)) continue;
  const { punchW, setupW } = pickPunch(p.ws);
  decisions.push({ kind: "setupPunch", p0: k, p1: k, data: { setup: setupW.map((w) => strip(w.text)).join(" "), punch: punchW.map((w) => strip(w.text)).join(" "), setupAt: (setupW[0] ?? punchW[0]).startMs, punchAt: punchW[0].startMs },
    why: `Khoang ${((p.startMs - Math.max(0, ...decisions.filter((d) => P[d.p1].endMs < p.startMs).map((d) => P[d.p1].endMs))) / 1000).toFixed(1)}s chua co diem nhin -> 1 dong trang ngu canh + cum DO la tu khoa cuoi cau (mau 1.4-3.6s, 5.7-9.4s).` });
  take(k);
}
decisions.sort((a, b) => P[a.p0].startMs - P[b.p0].startMs);

// ---------- 3. Cat khoang lang + chia shot ----------
const an = fs.existsSync(path.join(dir, "analysis.json")) ? rd("analysis.json") : { silences: [] };
let keep = [{ s: 0, e: durMs }];
if (!opts["no-cut"]) {
  keep = [];
  let cur = 0;
  for (const x of an.silences ?? []) {
    if (x.endMs - x.startMs < 450 || x.endMs >= durMs - 100) continue;
    const s = x.startMs + 120;
    const e = x.endMs - 120;
    if (s > cur) keep.push({ s: cur, e: s });
    cur = e;
  }
  if (cur < durMs) keep.push({ s: cur, e: durMs });
}
const toOut = (src) => {
  let acc = 0;
  for (const r of keep) {
    if (src < r.s) return acc;
    if (src <= r.e) return acc + src - r.s;
    acc += r.e - r.s;
  }
  return acc;
};

// vung nen (bg) theo quyet dinh R4
const BGK = new Set(["list", "cards", "checklist"]);
const bgRanges = decisions.filter((d) => BGK.has(d.kind)).map((d) => ({ s: P[d.p0].startMs - 250, e: P[d.p1].endMs + 150 }));
// diem cat: ranh gioi quyet dinh lon + shot > 4.5s (median mau 3.7s)
const cutSet = new Set();
for (const d of decisions) {
  if (["step", "emphasis", "breath", "recap", "pills"].includes(d.kind)) cutSet.add(P[d.p0].startMs - 120);
  if (d.kind === "step" || d.kind === "emphasis") cutSet.add(P[d.p1].endMs + 60);
}
for (const r of bgRanges) cutSet.add(r.s), cutSet.add(r.e);
let cuts = [...cutSet].filter((c) => c > 300 && c < durMs - 300).sort((a, b) => a - b);
// them cat tai ranh gioi cau neu shot dai
{
  const all = [0, ...cuts, durMs];
  const add = [];
  for (let i = 0; i < all.length - 1; i++) {
    let a = all[i];
    while (all[i + 1] - a > 4800) {
      const cand = P.map((p) => p.startMs - 80).filter((t) => t > a + 2600 && t < all[i + 1] - 1500);
      if (!cand.length) break;
      a = cand[0];
      add.push(a);
    }
  }
  cuts = [...cuts, ...add].sort((a, b) => a - b);
}
const bounds = [...new Set([...cuts, ...keep.flatMap((r) => [r.s, r.e])])].sort((a, b) => a - b);
const segments = [];
let shotIdx = 0;
for (let i = 0; i < bounds.length - 1; i++) {
  const s = bounds[i];
  const e = bounds[i + 1];
  if (e - s < 80 || !keep.some((r) => s >= r.s - 1 && e <= r.e + 1)) continue;
  const isCut = cuts.includes(s) || i === 0;
  if (isCut) shotIdx++;
  const bg = bgRanges.some((r) => s >= r.s - 1 && e <= r.e + 1);
  const d = decisions.find((x) => Math.abs(P[x.p0].startMs - 120 - s) < 5 && ["step", "emphasis", "breath"].includes(x.kind));
  const prev = segments[segments.length - 1];
  const base = shotIdx % 2 === 0 ? 1.12 : 1.0; // luan phien rong <-> trung (mau: mat 0.235 <-> 0.29)
  const seg = { srcStartMs: Math.round(s), srcEndMs: Math.round(e), kind: bg ? "bg" : "th" };
  if (!bg) {
    if (d) Object.assign(seg, { zoomFrom: 1.0, zoomTo: d.kind === "breath" ? 1.12 : 1.2, zoomRampMs: d.kind === "breath" ? 1400 : 700, why: `zoom ramp (${d.kind})` });
    else if (!isCut && prev && prev.kind === "th") Object.assign(seg, { zoomFrom: prev.zoomTo ?? prev.zoomFrom ?? 1, zoomTo: prev.zoomTo ?? prev.zoomFrom ?? 1 }); // jump-cut giu co
    else Object.assign(seg, { zoomFrom: base, zoomTo: base });
  } else if (!prev || prev.kind !== "bg") seg.blurIn = true;
  segments.push(seg);
}

// ---------- 4. Item (thoi gian ra) + SFX ----------
const items = [];
const sfx = [];
const O = (src) => toOut(src);
const s2 = (src0, src1) => (O(src1) - O(src0)) / 1000; // giay tuong doi trong item
const nextCutOut = (srcT) => {
  const c = cuts.find((x) => x > srcT + 200);
  return O(c ?? durMs);
};
const SFXV = 0.75; // [CAI TIEN] to hon mau goc de nghe ro tren giong (yeu cau co dinh cua nguoi dung)
let lastColor = null;
for (const d of decisions) {
  const p0 = P[d.p0];
  const p1 = P[d.p1];
  const D = d.data;
  const why = d.why;
  const n0 = items.length;
  switch (d.kind) {
    case "hook": {
      const st = D.at - 180; // mau: hien truoc khi noi ~0.19s
      const end = Math.min(st + 1050, p1.startMs);
      // dao cu 3D chi khi don vi la THOI GIAN (dong ho cat / dong ho) — so tien/dien tich: chi chu do
      if (/^(năm|tháng|ngày|tuần)$/.test(D.unit)) items.push({ type: "hourglass", startMs: O(st), endMs: O(end), y: 0.6, x: 0.5, why });
      else if (/^(phút|giờ)$/.test(D.unit)) items.push({ type: "clock", startMs: O(st), endMs: O(end), why });
      items.push({ type: "setupPunch", punch: D.numText, punchAt: 0, punchMode: "rise", y: 0.6, startMs: O(st), endMs: O(end + 120), why });
      items.push({ type: "flare", startMs: O(end - 150), endMs: O(end + 180), y: 0.64, why: "ket hook bang flare (mau 0.95-1.2s)" });
      sfx.push({ atMs: O(st), sfx: "whoosh", volume: SFXV }, { atMs: O(D.at), sfx: "impact", volume: 0.5 }, { atMs: O(end - 120), sfx: "glitch", volume: SFXV });
      if (D.rest) {
        const r = D.rest;
        const { punchW, setupW } = pickPunch(r.ws);
        const rs = Math.max(end + 160, r.startMs + 120); // mau: dong trang hien sau khi flare ket thuc (1.42s)
        items.push({ dk: "setupPunch", type: "setupPunch", setup: setupW.map((w) => strip(w.text)).join(" "), punch: punchW.map((w) => strip(w.text)).join(" "), setupAt: 0, punchAt: Math.max(0.35, s2(rs, punchW[0].startMs)), startMs: O(rs), endMs: Math.min(nextCutOut(r.startMs), O(r.endMs + 1200)), why: "hook phan 2: dong trang + cum do (mau 1.4-3.6s)" });
        sfx.push({ atMs: O(punchW[0].startMs), sfx: "bubble", volume: SFXV });
      }
      lastColor = "red";
      break;
    }
    case "step": {
      const st = D.at; // badge hien khi noi "Buoc"
      const end = nextCutOut(P[d.p1].endMs - 100);
      items.push({ type: "stepBadge", n: D.n, label: D.label, labelAt: Math.max(0, s2(st, D.labelWordAt) - 0.45), startMs: O(st), endMs: end, exit: "cut", why });
      items.push({ type: "leak", tone: D.n % 2 ? "red" : "orange", startMs: end - 400, endMs: end, why: "dong chuong bang light leak truoc diem cat (mau 9.4/23.0s)" });
      sfx.push({ atMs: O(st) + 50, sfx: "bubble", volume: SFXV }, { atMs: end - 350, sfx: "swish", volume: 0.6 });
      lastColor = "white";
      break;
    }
    case "cards": {
      const st = D.cards[0].at;
      const end = O(P[d.p1].endMs + 150);
      items.push({ type: "cards", startMs: O(st), endMs: end, cards: D.cards.map((c) => ({ at: s2(st, c.at), lines: [{ text: c.label, at: Math.max(s2(st, c.at) + 0.55, s2(st, c.textAt)) }] })), why });
      D.cards.forEach((c) => sfx.push({ atMs: O(c.at), sfx: "bubble", volume: SFXV }, { atMs: O(Math.max(c.at + 550, c.textAt)), sfx: "click", volume: 0.6 }));
      lastColor = "yellow";
      break;
    }
    case "checklist": {
      const st = D.lines[0].at - 100;
      items.push({ type: "cards", tilt3d: true, startMs: O(st), endMs: O(P[d.p1].endMs + 150), cards: [{ at: 0, lines: D.lines.map((l) => ({ text: l.text, at: s2(st, l.at) + 0.15 })) }], why });
      D.lines.forEach((l) => sfx.push({ atMs: O(l.at) + 150, sfx: "click", volume: 0.65 }));
      sfx.push({ atMs: O(st), sfx: "bubble", volume: SFXV });
      lastColor = "yellow";
      break;
    }
    case "list": {
      const st = D.titleAt;
      items.push({ type: "list", title: D.title, titleAt: 0, layout: D.items.length > 3 ? "zigzag" : "stack", startMs: O(st), endMs: O(P[d.p1].endMs + 150), items: D.items.map((it) => ({ text: it.text, at: s2(st, it.at) + 0.1 })), why });
      sfx.push({ atMs: O(st), sfx: "swish", volume: 0.6 });
      D.items.forEach((it) => sfx.push({ atMs: O(it.at) + 100, sfx: "bubble", volume: SFXV }));
      lastColor = "white";
      break;
    }
    case "pills": {
      const st = (D.lead ?? D.pills[0].at) - 150; // mau: nen mo + the dau hien ngay khi bao "2 cau hoi"
      items.push({ type: "pills", startMs: O(st), endMs: nextCutOut(p1.endMs), pills: D.pills.map((q) => ({ text: q.text, at: s2(st, q.at) })), why });
      const sg = segments.find((s) => s.srcStartMs <= st && s.srcEndMs > st && s.kind === "th");
      if (sg) sg.frostAtMs = Math.max(0, st - sg.srcStartMs - 100);
      D.pills.forEach((q) => sfx.push({ atMs: O(q.at), sfx: "pop", volume: SFXV }));
      break;
    }
    case "contrast": {
      const st = D.at + 150;
      items.push({ type: "contrast", neg: D.neg, at: 0, words: D.words.map((w) => ({ ...w, at: s2(st, w.at) - 0.05 })), startMs: O(st), endMs: Math.min(nextCutOut(p1.endMs), O(p1.endMs + 700)), exit: "blur", why });
      sfx.push({ atMs: O(st), sfx: "bubble", volume: SFXV });
      D.words.forEach((w) => sfx.push({ atMs: O(w.at) - 50, sfx: "pop", volume: SFXV }));
      lastColor = "red";
      break;
    }
    case "emphasis": {
      const st = D.at + 250; // mau: lag +0.31s
      const nd = decisions.find((x) => x.kind === "numeral" && x.p0 >= d.p0);
      const end = nd ? O(nd.data.at + 200) : Math.min(nextCutOut(p1.endMs), O(p1.endMs + 900));
      items.push({ type: "emphasis", text: D.text, at: 0, startMs: O(st), endMs: end, why });
      sfx.push({ atMs: O(D.at), sfx: "whoosh", volume: 0.55 }, { atMs: O(st), sfx: "bubble", volume: SFXV });
      lastColor = "red";
      break;
    }
    case "numeral": {
      const st = D.at + 250;
      const nx = decisions.find((x) => x.kind === "warning" && x.p0 > d.p0 && P[x.p0].startMs - P[d.p1].endMs < 1500);
      const end = nx ? O(nx.data.at + 1300) : Math.min(nextCutOut(p1.endMs), O(p1.endMs + 900));
      items.push({ type: "bigNumeral", num: "1", line1: D.line1, line2: D.line2, at: 0, dimAt: nx ? s2(st, nx.data.at + 300) : undefined, startMs: O(st), endMs: end, exit: nx ? "cut" : "blur", why });
      sfx.push({ atMs: O(st), sfx: "bubble", volume: SFXV });
      lastColor = "red";
      break;
    }
    case "warning": {
      const st = D.at + 300;
      const color = lastColor === "red" ? "yellow" : "red";
      items.push({ type: "warning", head: D.head, sub: D.sub, at: 0, subAt: D.subAt ? Math.max(0.12, s2(st, D.subAt)) : 0.12, color, startMs: O(st), endMs: Math.min(nextCutOut(p1.endMs), O(p1.endMs + 1000)), why: why + ` -> chon ${color === "yellow" ? "VANG (khoi truoc la do)" : "DO"}` });
      sfx.push({ atMs: O(st), sfx: "pop", volume: SFXV });
      lastColor = color;
      break;
    }
    case "recap": {
      const st = D.at + 150;
      items.push({ type: "recap", nums: Array.from({ length: D.n }, (_, i) => i + 1), at: 0, burstAt: 1.1, startMs: O(st), endMs: O(st + 1600), why });
      for (let i = 0; i < D.n; i++) sfx.push({ atMs: O(st) + i * 140, sfx: "pop", volume: SFXV });
      sfx.push({ atMs: O(st) + 1100, sfx: "shine", volume: SFXV });
      break;
    }
    case "clock": {
      const st = D.at - 40;
      const nx = items.find((it) => it.startMs > O(st) + 600);
      const end = Math.min(O(st + 1800), nx ? nx.startMs + 200 : O(st + 1800));
      items.push({ type: "clock", x: 0.76, y: 0.36, startMs: O(st), endMs: end, why });
      sfx.push({ atMs: O(st), sfx: "tick", volume: SFXV }, { atMs: end - 450, sfx: "sparkle", volume: 0.6 });
      break;
    }
    case "stat":
    case "cta":
    case "setupPunch": {
      const st = D.setupAt + 150;
      items.push({ type: "setupPunch", setup: D.setup || undefined, punch: D.punch, setupAt: 0, punchAt: Math.max(0.3, s2(st, D.punchAt) + 0.05), setupMode: "blur", punchMode: D.punch.length > 14 ? "type" : "rise", startMs: O(st), endMs: Math.min(nextCutOut(p1.endMs), O(p1.endMs + 1400)), why });
      sfx.push({ atMs: O(D.punchAt) + 50, sfx: "bubble", volume: SFXV });
      lastColor = "red";
      break;
    }
  }
  for (let i = n0; i < items.length; i++) items[i].dk = items[i].dk ?? d.kind;
}
// (gan nhan quyet dinh cho item — dung de danh gia engine)
// bg vao -> whoosh
let accOut = 0;
for (const s of segments) {
  if (s.kind === "bg" && s.blurIn) sfx.push({ atMs: accOut, sfx: "whoosh", volume: 0.6, why: "vao nen" });
  accOut += s.srcEndMs - s.srcStartMs;
}
// chong chong cheo: item bat dau sau khi item truoc ket thuc (tru dao cu/flare/leak)
items.sort((a, b) => a.startMs - b.startMs);
const LAYER = new Set(["clock", "hourglass", "flare", "leak"]);
const main = items.filter((i) => !LAYER.has(i.type));
for (let i = 1; i < main.length; i++) if (main[i - 1].endMs > main[i].startMs && !(main[i - 1].type === "bigNumeral" && main[i].type === "warning")) main[i - 1].endMs = main[i].startMs;
for (const it of items) it.endMs = Math.max(it.startMs + 200, it.endMs);

const plan = {
  source: SOURCE,
  fps: FPS,
  segments,
  items,
  sfx: sfx.sort((a, b) => a.atMs - b.atMs),
  music: fs.existsSync("public/music/bed-ambient.wav") ? { src: "music/bed-ambient.wav", volume: 0.05 } : undefined,
};
fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify(plan, null, 1));
const wbw = words.map((w) => ({ text: strip(w.text), startMs: O(w.startMs), endMs: O(w.endMs) })).filter((w) => w.text);
fs.writeFileSync(path.join(dir, "plan-chay-chu.json"), JSON.stringify({ ...plan, words: wbw, wordsY: 1590 }, null, 1));

const fmt = (ms) => (ms / 1000).toFixed(2) + "s";
const md = [
  `# Quyet dinh dung (Editing Decision Engine)`,
  ``,
  `- Tong ${N} tu, ${P.length} cum y, ${decisions.length} quyet dinh, ${segments.length} doan (${segments.filter((s) => s.kind === "bg").length} doan nen), ${sfx.length} SFX`,
  `- Cat khoang lang: ${keep.length - 1} lan; thoi luong ra ${fmt(segments.reduce((a, s) => a + s.srcEndMs - s.srcStartMs, 0))}`,
  ``,
  `| Goc (src) | Loai | Noi dung | Vi sao (tu duy editor) |`,
  `|---|---|---|---|`,
  ...decisions.map((d) => `| ${fmt(P[d.p0].startMs)} | ${d.kind} | ${(d.data.label ?? d.data.title ?? d.data.text ?? d.data.head ?? d.data.punch ?? d.data.numText ?? d.data.neg ?? (d.data.cards ? d.data.cards.map((c) => c.label).join(" / ") : "") ?? "").toString().replace(/\|/g, "/")} | ${d.why.replace(/\|/g, "/")} |`),
  ``,
  `## Cum y KHONG chen chu (giu mat nguoi noi)`,
  ...P.filter((p) => !used.has(p.k)).map((p) => `- ${fmt(p.startMs)} "${p.text}"`),
  ``,
  `## Shot`,
  ...segments.map((s, i) => `- ${i + 1}. ${fmt(s.srcStartMs)}-${fmt(s.srcEndMs)} ${s.kind}${s.zoomTo ? ` zoom ${s.zoomFrom}->${s.zoomTo}` : ""}${s.blurIn ? " (blur-dissolve vao)" : ""}${s.frostAtMs !== undefined ? " (lam mo nen cho the kinh)" : ""}`),
];
fs.writeFileSync(path.join(dir, "decisions.md"), md.join("\n") + "\n");
console.log(md.slice(0, 4).join("\n"));
