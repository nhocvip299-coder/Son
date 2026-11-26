import subprocess,sys,glob,json,numpy as np
from scipy.signal import stft
SR=22050
def load(p):
    r=subprocess.run(["ffmpeg","-v","error","-i",p,"-vn","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(r,np.float32)
def spec(x):
    f,t,Z=stft(x,SR,nperseg=1024,noverlap=768); return f,t,np.abs(Z)
def fp(S,f):
    # 24 log bands mean over time + temporal envelope
    edges=np.geomspace(100,10000,25); b=[]
    for i in range(24):
        m=(f>=edges[i])&(f<edges[i+1]); b.append(np.log1p(S[m].mean()*100))
    v=np.array(b); return (v-v.mean())/(v.std()+1e-9)
vids=sorted(glob.glob(sys.argv[1]+"/*.mp4")); lib=sorted(glob.glob("public/sfx/*.wav"))
L={}
for p in lib:
    x=load(p)[:SR]; f,t,S=spec(x); L[p.split('/')[-1]]=fp(S,f)
out={}
for v in vids:
    x=load(v); f,t,S=spec(x)
    hf=S[f>5000].sum(0); lf=S[(f>200)&(f<3000)].sum(0)
    flux=np.maximum(0,np.diff(np.log1p(S),axis=1)).sum(0)
    ratio=hf/(lf+1e-6)
    thr=np.percentile(flux,99.3)
    ev=[]; last=-1
    for i in np.where(flux>thr)[0]:
        if t[i]-last<0.4: continue
        last=t[i]
        seg=S[:,i:i+40]; fpv=fp(seg,f)
        best=sorted(((float(np.corrcoef(fpv,lv)[0,1]),k) for k,lv in L.items()),reverse=True)[:2]
        ev.append(dict(t=round(float(t[i]),2),hf=round(float(ratio[i:i+10].mean()),3),flux=round(float(flux[i]),1),near=best))
    out[v.split('/')[-1]]=ev
    hfr=[e for e in ev if e['hf']>0.15]
    print(v.split('/')[-1],len(ev),'events, high-HF',len(hfr), 'per_min',round(len(hfr)/(len(x)/SR/60),1))
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=0)
