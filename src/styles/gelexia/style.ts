export const STYLE = {
  logicalWidth:1080, logicalHeight:1920,
  white:'#ffffff', yellow:'#ffdd66', pin:'#ff4254',
  panel:'rgba(48,51,48,.44)', ctaPanel:'rgba(48,51,48,.63)',
  edge:'0.85px rgba(24,25,20,.9)',
  shadow:'0 1px 0 #45443a, 0 2px 0 #292921, 0 3px 2px rgba(0,0,0,.72)',
  goldShadow:'0 1px 0 #59513a, 0 2px 0 #2d2b21, 0 3px 2px rgba(0,0,0,.72)',
  caption:{left:150,right:150,bottom:574,size:56,lineHeight:1.12,padY:14,padX:20,radius:12},
  callout:{left:150,right:150,top:455,introSize:70,routeSize:60,foodSize:70,bodySize:28,radius:20},
  header:{left:150,right:150,top:275,pinWidth:40,pinHeight:52,titleSize:37,addressSize:23},
  cta:{left:150,right:150,top:475},
  // Căn giữa đối xứng theo vùng an toàn chung TikTok+Reels (src/lib/safeZone.ts: trên 220, dưới 520, hai bên 150) — yêu cầu của Sơn, thay lề lệch trái 90/230 của mẫu gốc.
  safe:{top:220,bottom:520,side:150},
  logoSize:96,
  motion:{headerSeconds:.4,captionSeconds:.16,exitSeconds:.14,popFromScale:.86,spring:{damping:16,stiffness:180,mass:.7}}
} as const;
