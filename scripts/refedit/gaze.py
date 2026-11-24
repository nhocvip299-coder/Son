# Do huong nhin (lieć mat doc kich ban) bang MediaPipe FaceLandmarker blendshapes.
# python -I gaze.py <video> <model.task> <out.json> [fps=5]
import sys, json, cv2, numpy as np
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
vid, model, out = sys.argv[1:4]; FPS = float(sys.argv[4]) if len(sys.argv) > 4 else 5
lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=model), output_face_blendshapes=True,
    running_mode=vision.RunningMode.VIDEO, num_faces=1))
cap = cv2.VideoCapture(vid); src = cap.get(cv2.CAP_PROP_FPS); step = max(1, round(src / FPS))
keys = ["eyeLookDownLeft","eyeLookDownRight","eyeLookUpLeft","eyeLookUpRight","eyeLookInLeft","eyeLookInRight","eyeLookOutLeft","eyeLookOutRight","eyeBlinkLeft","eyeBlinkRight"]
rows = []; i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    if i % step == 0:
        t = i / src
        f = cv2.resize(f, (540, 960))
        r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(f, cv2.COLOR_BGR2RGB)), int(t * 1000))
        if r.face_blendshapes:
            b = {c.category_name: c.score for c in r.face_blendshapes[0]}
            L = r.face_landmarks[0]
            # iris ngang so voi khoe mat (0.5 = giua)
            def ratio(c0, c1, ir): return (L[ir].x - L[c0].x) / (L[c1].x - L[c0].x + 1e-6)
            rows.append({"t": round(t, 2), **{k: round(float(b[k]), 3) for k in keys},
                         "irisL": round(ratio(33, 133, 468), 3), "irisR": round(ratio(362, 263, 473), 3),
                         "nose": [round(L[1].x, 3), round(L[1].y, 3)]})
        else: rows.append({"t": round(t, 2), "noface": True})
    i += 1
json.dump(rows, open(out, "w"))
print(len(rows), "mau")
