import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useVideoConfig } from "remotion";

/**
 * LỚP NGƯỜI ĐẶT TRƯỚC CHỮ (chữ nằm SAU LƯNG người nói). [XM 17,0–18,1 s: "3KM" — đầu người che chân chữ "K"]
 * `matte` = person.webm (VP9 có alpha) tạo bằng `scripts/style/person_matte.py <video> <out> --fps <fps> [--start s --dur d]`.
 * `from` = giây trong nguồn ứng với frame đầu của Sequence chứa component này. Cùng bộ lọc màu với nền để không lệch tông.
 * Luật: chỉ dùng khi chữ thật sự chạm đầu/vai; KHÔNG để chữ che mặt; matte phải đặc (bản person_matte mới).
 * BẮT BUỘC: tạo matte từ CHÍNH file nguồn đang dựng (cùng điểm ảnh, cùng nhịp), cắt đúng đoạn cần (--start/--dur, `from` = a − start);
 * đặt grade (TealOrange) BỌC NGOÀI cả nền + chữ + người để 2 lớp người trùng màu. Người ở xa: person_matte tự cắt-phóng vùng người để giữ đủ đầu/tóc.
 */
export const PersonFront: React.FC<{ matte: string; from?: number; filter?: string }> = ({ matte, from = 0, filter }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ filter }}>
      <Sequence from={-Math.round(from * fps)} layout="none">
        <AbsoluteFill><OffthreadVideo src={staticFile(matte)} transparent muted style={{ width: "100%", height: "100%" }} /></AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
