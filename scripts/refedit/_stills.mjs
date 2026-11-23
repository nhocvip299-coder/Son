import path from "node:path"; import fs from "node:fs"; import { spawnSync } from "node:child_process";
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
const ROOT="/home/user/Son"; const BROWSER="/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const [planP,out,...ts]=process.argv.slice(2); const plan=JSON.parse(fs.readFileSync(planP,"utf8"));
const serveUrl=await bundle({entryPoint:path.join(ROOT,"src/index.ts"),publicDir:path.join(ROOT,"public")});
process.on("exit", () => { try { fs.rmSync(serveUrl, { recursive: true, force: true }); } catch {} }); // xoa ban dong goi tam (moi lan chep ca public/)
const common={browserExecutable:BROWSER,chromiumOptions:{gl:"swangle"},logLevel:"error"};
const composition=await selectComposition({serveUrl,id:"RefEdit",inputProps:{plan},...common});
const files=[];
for(const t of ts.map(Number)){const f=`/tmp/claude-0/st_${t}.jpg`;await renderStill({serveUrl,composition,inputProps:{plan},frame:Math.round(t*60),output:f,scale:0.25,imageFormat:"jpeg",jpegQuality:80,...common});
 spawnSync("ffmpeg",["-v","error","-y","-i",f,"-vf",`drawtext=text='${t}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6`,f+".l.jpg"]);files.push(f+".l.jpg");}
const cols=8; const inputs=files.flatMap(f=>["-i",f]); const layout=files.map((_,i)=>`${(i%cols)*270}_${Math.floor(i/cols)*480}`).join("|");
spawnSync("ffmpeg",["-v","error","-y",...inputs,"-filter_complex",`${files.map((_,i)=>`[${i}]`).join("")}xstack=inputs=${files.length}:layout=${layout}:fill=black`,out]);console.log("ok");
