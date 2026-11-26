# Do vi tri/kich thuoc/mau phu de + nhip doi chunk: tim pixel vang bao hoa (mat chu vang) va trang co vien den
import subprocess,sys,numpy as np,json
W,H=288,512
def frames(p,fps=10):
    r=subprocess.run(["ffmpeg","-v","error","-i",p,"-vf",f"fps={fps},scale={W}:{H}","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout
    return np.frombuffer(r,np.uint8).reshape(-1,H,W,3).astype(np.int16)
res={}
for p in sys.argv[1:]:
    f=frames(p); R,G,B=f[...,0],f[...,1],f[...,2]
    yel=(R>200)&(G>190)&(B<90)
    # vien den ngay canh: dilate check bo qua; dem theo hang
    rows=yel.sum(2)  # n x H
    has=rows.max(1)>6
    ys=[];hs=[];cols=[]
    for i in np.where(has)[0]:
        r=np.where(rows[i]>3)[0]
        if len(r)==0: continue
        ys.append(r.mean()/H); hs.append((r.max()-r.min()+1)/H)
        m=yel[i]; cols.append(f[i][m].mean(0))
    ys=np.array(ys); hs=np.array(hs)
    c=np.array(cols).mean(0) if cols else [0,0,0]
    res[p.split('/')[-1]]=dict(frac_frames_with_yellow=round(float(has.mean()),2),y_center_median=round(float(np.median(ys)),3),y_p10=round(float(np.percentile(ys,10)),3),y_p90=round(float(np.percentile(ys,90)),3),glyph_h_median=round(float(np.median(hs)),4),yellow_rgb='#%02x%02x%02x'%tuple(int(v) for v in c))
print(json.dumps(res,indent=1))
