// Chay: node --experimental-strip-types --test skills/video-edit-style-master/tests/rules.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { pickCue } from "../presets/rules.ts";

test("gia tien -> so vang dem chay", () => {
  const c = pickCue("khu này giá rẻ hơn trước tới 300 triệu");
  assert.equal(c.kind, "gold");
  if (c.kind === "gold") { assert.equal(c.value, 300); assert.equal(c.unit, "TRIỆU"); }
});
test("ha gia co gia cu -> trang ha gia", () => {
  const c = pickCue("chủ đại hạ giá chỉ còn 2,55 tỷ", { prevPrice: "2,85 TỶ" });
  assert.equal(c.kind, "price-drop");
  if (c.kind === "price-drop") { assert.equal(c.to, 2.55); assert.equal(c.dec, 2); }
});
test("vi tri + khoang cach -> ban do", () => {
  const c = pickCue("tới chợ Bình Chánh chỉ cách 3 km");
  assert.equal(c.kind, "map");
  if (c.kind === "map") assert.equal(c.dist, "3 KM");
});
test("phan tram -> so manh", () => assert.equal(pickCue("hỗ trợ tới 70%").kind, "thin"));
test("ho tro vay -> the kinh", () => assert.equal(pickCue("ngân hàng hỗ trợ vay trọn gói").kind, "card"));
test("dac diem -> neon", () => {
  const c = pickCue("có 3 phòng ngủ rộng rãi");
  assert.equal(c.kind, "neon");
});
test("so dien thoai -> vien SDT", () => {
  const c = pickCue("gọi em qua số 0966 312 333");
  assert.equal(c.kind, "phone");
});
test("cau dem -> khong hieu ung", () => assert.equal(pickCue("anh chị ơi nha cả nhà").kind, "none"));
