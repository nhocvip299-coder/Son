#!/usr/bin/env python3
"""Check reconstructed IMG_7589 typography. Visual/motion QA remains necessary."""
import re,sys
from pathlib import Path
r=Path(sys.argv[1]).resolve();d=r/'src' if (r/'src/style.ts').exists() else r
s=(d/'style.ts').read_text();c=(d/'GelexiaOverlay.tsx').read_text();errors=[]
n=re.sub(r'\s+','',c).replace('"',"'")
if not re.search(r"yellow:\s*['\"]#ffdd66['\"]",s):errors.append('Use the warm yellow reconstructed from IMG_7589/reference, not the saturated bronze preset')
if 'fontWeight:800' not in n or "weight:'800'" not in n:errors.append('Load/use the reference reconstruction weight 800')
if 'WebkitTextStroke:S.edge' not in n or "paintOrder:'strokefill'" not in n:errors.append('Preserve thin dark edge without shrinking face glyphs')
edge=re.search(r"edge:\s*'([\d.]+)px",s)
if not edge or not .5<=float(edge[1])<=1.2:errors.append('Keep the outline thin')
for name in ['shadow','goldShadow']:
 m=re.search(name+r":\s*'([^']+)'",s)
 if not m or len(re.findall(r'px\s+0\s+#',m[1]))<2:errors.append(name+': missing short crisp depth')
 if m and any(float(v)>3.5 for v in re.findall(r'([\d.]+)px',m[1])):errors.append(name+': extrusion too deep for the supplied image')
if c.count('S.goldShadow')<4:errors.append('Apply reference gold edge consistently across roles')
if errors:print('\n'.join('ERROR: '+e for e in errors));raise SystemExit(1)
print('IMG_7589 style contract valid. Inspect font marks, short edge and motion against source.')
