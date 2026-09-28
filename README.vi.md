# Context Pack (`ai-context-pack`) — Tiếng Việt

**T02 — Hệ sinh thái công cụ AI Developer | Cấp độ 1★**

> Tạo ra một gói ngữ cảnh có giới hạn, có thể tái sử dụng, chứa các thông tin phù hợp nhất cho một nhiệm vụ cụ thể của AI coding agent.

---

## Công cụ này làm gì?

`context-pack` nhận vào mô tả nhiệm vụ và một tập hợp file nguồn, sau đó tạo ra một **ContextPack** — một artifact ngữ cảnh có giới hạn token, theo ngân sách định trước, có thể đọc được bởi máy, chứa chỉ những phần ngữ cảnh phù hợp nhất mà AI coding agent cần để hoàn thành nhiệm vụ.

Thay vì đổ toàn bộ file vào context window, Context Pack:
- Tuân thủ **ngân sách token** (budget) rõ ràng (mặc định: 4000 tokens)
- Chọn lọc và xếp hạng **các file/đoạn code phù hợp nhất** với nhiệm vụ
- Xuất ra **artifact ổn định, có thể versioning** để tái sử dụng qua nhiều lần gọi agent
- Kết hợp với **Token Diff (T01)** để đo lường hiệu quả tiết kiệm token

---

## Trạng thái

`0.1.0` — Đang phát triển (1★)

---

## Cài đặt

```bash
npm install -g ai-context-pack
```

## Sử dụng

```bash
# Pack context từ các file cho một nhiệm vụ
context-pack pack --task "Sửa lỗi xác thực" --files src/ --budget 4000

# Pack và xuất JSON cho agent sử dụng
context-pack pack --task "Tái cấu trúc UserService" --files src/services/ --budget 8000 --json

# Xem phiên bản
context-pack --version

# Xem hướng dẫn
context-pack --help
```

---

## Giấy phép

MIT
