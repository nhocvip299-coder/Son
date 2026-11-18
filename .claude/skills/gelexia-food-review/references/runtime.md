# Runtime ghi nhận

- Project template pin Remotion 4.0.535 và React 19.1.0 để tái lập. Không tự nâng version khi chỉ được giao giữ phong cách.
- Chạy npm install trong project đã bootstrap; không commit node_modules hoặc cache browser vào skill.
- Dùng `npx remotion browser ensure` khi chưa có Chromium. Không bắt người dùng đăng nhập hay cài ứng dụng khác cho việc render local.
- Chỉ khi gặp lỗi thực tế `uv_interface_addresses returned Unknown system error`: thử lại CLI với `NODE_OPTIONS=--require=/absolute/skill/scripts/remotion-loopback.cjs`. Helper giữ native API khi hoạt động, chỉ trả loopback nếu đúng lỗi enumeration đó; không đổi kết nối tài khoản hay quyền truy cập mạng.
- Xem clip chuyển động từ renderer thực. Không chuyển sang chữ ASS đứng yên chỉ vì CLI gặp lỗi môi trường.

- Nếu Chrome Headless Shell không tải được do proxy timeout, có thể dùng bản Chromium đóng gói trong npm đã kiểm tra: `npm install --no-save @sparticuz/chromium@153.0.0`, rồi truyền `--browser-executable=ABSOLUTE_PATH`. Không đổi phiên bản Remotion.
- Với gói này, `require("@sparticuz/chromium").default` là class. Nếu `executablePath()` gặp lỗi `chown` khi giải nén fonts trong môi trường không hỗ trợ chown, dùng public `inflate()` cho riêng `node_modules/@sparticuz/chromium/bin/chromium.br` và lấy đường dẫn trả về; font của video vẫn tải từ public/fonts. Chỉ xóa bản binary giải nén 0 byte do lần thất bại trước, không xóa tài sản khác. Đã kiểm tra Chromium 153.0.8010.0 trong môi trường này.
