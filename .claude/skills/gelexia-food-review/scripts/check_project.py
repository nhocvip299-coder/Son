#!/usr/bin/env python3
"""Check real timeline data before visual/motion QA. Does not certify style match."""
import argparse,json,math
from pathlib import Path
def check(p):
 errors=[]
 def need(ok,msg):
  if not ok:errors.append(msg)
 def number(v):return isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v)
 need(p.get('mode') in ('demo','production'),'Set mode explicitly: demo or production')
 dur=p.get('durationSeconds');need(number(dur) and dur>0,'Positive durationSeconds required')
 if not number(dur) or dur<=0:return errors
 limit=dur*1000
 need(number(p.get('fps')) and 0<p['fps']<=120,'Invalid fps; use the confirmed source/output frame rate')
 w,h=p.get('width'),p.get('height');need(number(w) and number(h) and w>0 and h>0 and abs(w/h-9/16)<.001,'Require 9:16 stage')
 brand=p.get('brand',{})
 if p.get('mode')=='production' or brand.get('showAddress',True):need(bool(brand.get('name')),'Missing place name')
 if brand.get('showAddress',True):need(bool(brand.get('address')),'Missing pinned address')
 previous_end=-1
 for i,page in enumerate(p.get('pages',[])):
  a,b=page.get('startMs'),page.get('endMs');ok=number(a) and number(b) and 0<=a<b<=limit
  need(ok,f'Page {i}: invalid time')
  if not ok:continue
  need(a>=previous_end,f'Page {i}: overlap with previous page');previous_end=b
  lines=page.get('lines',[]);need(1<=len(lines)<=2,f'Page {i}: require 1–2 fixed lines')
  last=a
  for line in lines:
   need(bool(line),f'Page {i}: empty line')
   for j,word in enumerate(line):
    x,y=word.get('startMs'),word.get('endMs');need(isinstance(word.get('text'),str) and bool(word['text'].strip()),f'Page {i}: blank word')
    ok=number(x) and number(y) and a<=x<y<=b
    need(ok,f'Page {i}: word outside page')
    if ok:need(x>=last,f'Page {i}: nonmonotonic/overlapping words');last=y
    need('timestampMs' in word and 'confidence' in word,f'Page {i}: incomplete Caption data')
    mid=word.get('timestampMs');conf=word.get('confidence')
    need(mid is None or (number(mid) and ok and x<=mid<=y),f'Page {i}: invalid word timestamp')
    need(conf is None or (number(conf) and 0<=conf<=1),f'Page {i}: invalid confidence')
    if j>0:need(word.get('text','').startswith(' '),f'Page {i}: preserve space before following word')
 last_callout=-1
 for i,c in enumerate(p.get('callouts',[])):
  a,b=c.get('startMs'),c.get('endMs');need(number(a) and number(b) and 0<=a<b<=limit,f'Callout {i}: invalid time')
  if number(a) and number(b):need(a>=last_callout,f'Callout {i}: overlapping blocks in the same region');last_callout=b
  need(c.get('kind') in ('intro','route','food','cta'),f'Callout {i}: unknown role')
  need(bool(c.get('title')),f'Callout {i}: title missing')
  if c.get('kind')=='food':need(not c.get('subtitle'),f'Callout {i}: food emphasis should be short, not explanatory card')
  if c.get('kind')=='cta':need(bool(c.get('addressMain')) and bool(c.get('addressRest')),f'Callout {i}: incomplete address card')
  need(not any(k in c for k in ('fontSize','scaleX','fontWeight')),f'Callout {i}: do not override fixed style tokens')
 if p.get('mode')!='demo':
  need(any(c.get('kind')=='cta' for c in p.get('callouts',[])),'Missing location closing card')
  text=json.dumps(p,ensure_ascii=False).lower();need(not any(x in text for x in ('quán mẫu','số nhà mới','địa chỉ mới do người dùng')),'Replace demo placeholders')
 return errors
def main():
 a=argparse.ArgumentParser();a.add_argument('project',type=Path);v=a.parse_args()
 errors=check(json.loads(v.project.read_text()))
 if errors:
  print('\n'.join('ERROR: '+e for e in errors));raise SystemExit(1)
 print('Timeline data valid. Still required: font/overflow, motion and final-file visual QA.')
if __name__=='__main__':main()
