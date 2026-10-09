# Kế Hoạch Thiết Kế & Triển Khai Landing Page: Context Pack

Tài liệu này đặc tả toàn diện kế hoạch xây dựng trang **Landing Page & Web Playground** cho dự án **Context Pack** (`ai-context-pack`). Kế hoạch áp dụng các tiêu chuẩn thiết kế UX/UI chuyên sâu, đảm bảo tính thẩm mỹ hiện đại, hiệu năng tối đa và trải nghiệm người dùng trực quan cho cộng đồng lập trình viên AI.

---

## 1. Định Vị Sản Phẩm & Mục Tiêu

### 1.1. Đối tượng người dùng mục tiêu (Target Persona)
- **AI Agent Engineers & Framework Builders**: Lập trình viên xây dựng hệ thống agent tự động (Cursor, Claude Code, Continue, Copilot, LangChain, LlamaIndex) đang đau đầu vì chi phí token cao và context window bị loãng.
- **Full-stack / Software Engineers**: Lập trình viên muốn tối ưu hóa prompt mã nguồn khi tương tác với các mô hình ngôn ngữ lớn (LLMs).
- **Tech Leads / Engineering Managers**: Cần giải pháp giảm thiểu chi phí API token hàng tháng (-70%+) cho đội ngũ lập trình mà không giảm sút độ chính xác của task.

### 1.2. Mục tiêu cốt lõi của Landing Page
1. **Truyền tải giá trị tức thì (< 5 giây)**: Khách truy cập nắm bắt ngay năng lực cốt lõi: *"Cắt lát và đóng gói mã nguồn thông minh theo trần token, giảm 75% chi phí mà không làm mất ngữ cảnh quan trọng"*.
2. **Trải nghiệm thực tế không rào cản (Zero-Friction Live Playground)**: Cho phép dùng thử ngay lập tức trên trình duyệt mà không cần cài đặt CLI, không cần đăng ký tài khoản, và bảo mật 100% (mã nguồn không gửi lên server).
3. **Thúc đẩy chuyển đổi (Actionable Developer CTAs)**: Hướng người dùng copy lệnh CLI `npm i -g ai-context-pack`, cài đặt SDK hoặc khám phá kho mã nguồn GitHub.
4. **Hiệu năng & Khả năng tiếp cận cao nhất**: Đạt điểm Google Lighthouse 95+ (Performance, Accessibility, Best Practices, SEO).

---

## 2. Triết Lý Thiết Kế & Định Hướng UX/UI (Design Intelligence)

Kế hoạch áp dụng các nguyên tắc từ hệ tri thức thiết kế chuyên sâu dành riêng cho công cụ lập trình viên (Developer Tools & Technical Platforms):

### 2.1. Phong cách thẩm mỹ (Visual Style)
- **Dark Mode Cao Cấp (Midnight Developer Theme)**: Tối ưu cho mắt khi làm việc ban đêm, độ tương phản cao, phong cách đậm chất hacker/kỹ thuật nhưng tinh tế, hiện đại.
- **Bảng màu chủ đạo (Semantic Color Palette)**:
  - **Nền sâu (Deep Canvas)**: `#090D16` (Deep Midnight Blue) và `#0F172A` (Slate Canvas).
  - **Thẻ & Khung giao diện (Cards & Panels)**: `#141C2E` (Surface) và `#1B2438` (Elevated).
  - **Đường viền phân tách (Borders)**: `#1E293B` và `#334155` (Tinh tế, mỏng 1px).
  - **Màu nhận diện thương hiệu (Brand Cyan)**: `#00F2FE` / `#38BDF8` (Màu nén dữ liệu và công nghệ).
  - **Màu phụ trợ (Brand Indigo)**: `#6366F1` / `#818CF8` (Biểu trưng cho khối đóng gói container).
  - **Màu thành công & Tiết kiệm (Success Emerald)**: `#10B981` (Dành cho tỷ lệ giảm token và checkmark).
  - **Màu cảnh báo (Alert Amber)**: `#F59E0B` (Dành cho nhãn `[TRUNCATED]` và chạm trần ngân sách).
  - **Văn bản hiển thị**: `#F8FAFC` (Tiêu đề độ tương phản tối đa) và `#94A3B8` (Mô tả phụ).

### 2.2. Phân cấp kiểu chữ (Typography System)
- **Phông chữ giao diện (UI & Headlines)**: `Inter` hoặc `IBM Plex Sans` (Hình học mạch lạc, dễ đọc ở mọi độ phân giải).
- **Phông chữ mã nguồn & Chỉ số (Code & Metrics)**: `JetBrains Mono` (Độ rộng cố định, tối ưu hiển thị số liệu token, dải dòng và cú pháp mã lệnh).
- **Quy tắc font-size & line-height**:
  - Hero Headline: 48px - 56px, line-height 1.15, tracking tight.
  - Section Headings: 28px - 32px, font-weight 700.
  - Body Text: 15px - 16px, line-height 1.6, màu `#94A3B8`.
  - Code & Badges: 12px - 14px, tracking normal.

### 2.3. Quy tắc biểu tượng & Tránh phản hoa mỹ (Anti-Patterns to Avoid)
- **Nghiêm cấm dùng Emoji làm biểu tượng giao diện**: Toàn bộ icon sử dụng vector SVG chuẩn hóa từ thư viện `lucide-react` (Code, Cpu, Layers, Terminal, Copy, Check, Sliders, Zap, Shield, Sparkles, ExternalLink).
- **Tương tác vi mô (Micro-interactions)**:
  - Hiệu ứng hover nút bấm chuyển màu mượt mà trong 150ms–200ms.
  - Phản hồi sao chép (Copy Feedback): Chuyển biểu tượng `Copy` sang `Check` kèm thông báo *"Copied!"* trong 2 giây.
  - Vòng hiển thị tiêu điểm (Focus rings) rõ ràng khi duyệt bằng bàn phím (đạt chuẩn WCAG 2.1 AA với tỷ lệ tương phản > 4.5:1).

---

## 3. Cấu Trúc Nội Dung Chi Tiết Các Section

### Section 1: Navigation Bar (Cố định - Sticky Header)
- **Bên trái**: Logo biểu tượng vector của Context Pack (`context-pack-logo.svg`) + Tên sản phẩm in đậm.
- **Ở giữa**: Menu điều hướng cuộn mượt:
  - *Playground*
  - *How It Works*
  - *Benchmarks*
  - *CLI & SDK*
- **Bên phải**:
  - Nút sao chép nhanh lệnh `npm i -g ai-context-pack`.
  - Huy hiệu liên kết GitHub (Hiển thị icon GitHub).
  - Nút CTA chuyển nhanh tới Playground (*"Try Demo"*).

---

### Section 2: Hero Section (Khu vực Ấn tượng Đầu tiên)
- **Huy hiệu thông báo (Announcement Pill)**: *"ai-context-pack v0.1.1 is now live on npm registry"*.
- **Tiêu đề chính (Headline)**:
  - Dòng 1: *Deterministic Context Slicing*
  - Dòng 2 (Gradient Cyan/Indigo): *for Autonomous AI Agents*
- **Đoạn dẫn nhập (Sub-headline)**:
  Trích xuất và đóng gói chính xác các lát cắt mã nguồn quan trọng nhất dựa trên mô tả nhiệm vụ dưới một trần ngân sách token xác định. Cắt giảm 75% chi phí suy luận và ngăn ngừa hiện tượng loãng sự chú ý của LLM.
- **Nhóm nút hành động chính (Primary Actions)**:
  - Nút nổi bật: *"Mở Web Playground"* (Cuộn mượt đến Section 3).
  - Nút thứ cấp: *"Xem mã nguồn trên GitHub"* (Mở tab mới).
- **Hộp lệnh cài đặt một chạm (Interactive Install Box)**:
  - Tab chuyển đổi: `npm` | `npx` | `pnpm` | `yarn`.
  - Nút copy lệnh kèm âm hưởng terminal.
- **Hàng huy hiệu chất lượng (Trust & Architecture Badges)**:
  - `Node >= 18.0.0`
  - `TypeScript 5.6`
  - `Pure JS (Zero WASM)`
  - `42 Tests Passed (100% Green)`
  - `MIT License`

---

### Section 3: Interactive Live Web Playground (Trọng Tâm Trải Nghiệm)

Giao diện được thiết kế dạng 2 cột chia đôi (Dual-Pane Split Screen), chạy 100% trên trình duyệt thông qua Web Worker:

#### Cột trái — Bảng điều khiển đầu vào (Inputs & Configuration):
1. **Ô chọn kịch bản mẫu (Presets Selector)**:
   - *Preset 1: Auth & Session Bug* (UserService, SessionManager, AuthMiddleware).
   - *Preset 2: Tokenizer Refactor* (Tokenizer, Models, BPECache).
   - *Preset 3: CLI Config Error* (CLI Handler, OptionParser, Errors).
2. **Mô tả nhiệm vụ (Task Input Field)**:
   - Cho phép nhập prompt hướng dẫn (ví dụ: *"Fix token count logic and encoding validation"*).
3. **Quản lý danh sách tệp (Source Files Tabs)**:
   - Các tab đại diện cho từng file mã nguồn.
   - Hỗ trợ thêm tệp mới, xóa tệp, hoặc dán trực tiếp mã nguồn của người dùng.
   - Hiển thị số token tính toán tức thì của từng tệp.
4. **Thanh trượt ngân sách token (Token Budget Slider)**:
   - Dải trượt trực quan từ 200 đến 4,000 tokens (bước nhảy 50 tokens).
   - Hiển thị trực tiếp con số budget đang chọn.
5. **Chọn bảng mã Tokenizer (Encoding Dropdown)**:
   - `cl100k_base` (GPT-4 / GPT-3.5)
   - `o200k_base` (GPT-4o / o1)
   - `p50k_base` (Codex)

#### Cột phải — Kết quả đóng gói thời gian thực (Real-time Packed Artifact):
1. **Thanh đo ngân sách (Token Budget Meter)**:
   - Thanh tiến trình trực quan hiển thị tỷ lệ lấp đầy (ví dụ: `953 / 1000 tokens — 95.3%`).
   - Màu sắc chuyển dịch thông minh: Xanh lam (< 80%) $\to$ Tím nhạt (80-95%) $\to$ Hổ phách/Vàng (> 95% hoặc bị cắt tỉa).
   - Nhãn `[TRUNCATED]` xuất hiện nổi bật khi có lát cắt bị giới hạn do vượt ngân sách.
2. **Chế độ xem kết quả (Result View Tabs)**:
   - **Tab 1: Lát cắt trực quan (Visual Slices Table)**:
     - Danh sách từng lát cắt được duyệt kèm biểu tượng check xanh `✓`.
     - Tên file, dải dòng hiển thị (`lines 1–32`), số lượng token và điểm liên quan (`score: 0.70`).
     - Khung xem nội dung code với tính năng cuộn mượt và làm nổi bật cú pháp.
   - **Tab 2: JSON Envelope Chuẩn**:
     - Hiển thị định dạng JSON tiêu chuẩn máy đọc được của Context Pack (`data`, `slices`, `metadata`, `duration_ms`).
3. **Hành động xuất dữ liệu (Quick Action Toolbar)**:
   - Nút *"Copy cx CLI Command"*: Tự động sinh câu lệnh CLI hoàn chỉnh tương ứng với các tham số đang nhập trên Playground.
   - Nút *"Copy JSON Envelope"*: Sao chép nhanh toàn bộ payload cho agent.

---

### Section 4: Visual Execution Pipeline (Cơ Chế Hoạt Động)

Trình bày quy trình 4 giai đoạn xử lý hoàn toàn trong bộ nhớ bằng sơ đồ đồ họa động kết hợp thẻ thông tin:

1. **Giai đoạn 1 — Input Resolver**:
   - Quét và nạp tệp theo đường dẫn hoặc mẫu glob (ví dụ: `src/**/*.ts`).
   - Phân tích tệp thành các cửa sổ dải dòng (AST slice windows) có kích thước tối ưu.
2. **Giai đoạn 2 — Relevance Ranker (BM25 + TF-IDF)**:
   - Phân tích từ khóa trong yêu cầu nhiệm vụ.
   - Tính điểm tương quan ngữ nghĩa cho từng đoạn mã, ưu tiên các hàm định nghĩa, exported types và tệp trọng tâm.
3. **Giai đoạn 3 — Pure JS Tokenizer Engine**:
   - Định lượng chính xác số lượng token của từng lát cắt dựa trên thư viện `js-tiktoken`.
   - Vận hành thuần JavaScript, loại bỏ rủi ro tương thích của các file nhị phân WASM hoặc Node-GYP C++.
4. **Giai đoạn 4 — Greedy Knapsack Budget Packer**:
   - Thuật toán xếp ba-lô tham lam lựa chọn các lát cắt có điểm cao nhất sao cho tổng token $\le$ budget.
   - Cơ chế giải quyết hòa điểm (tie-breaking) tất định, đảm bảo cùng đầu vào sẽ luôn cho cùng kết quả.
- **Tích hợp sơ đồ Archify**: Nhúng phiên bản ảnh vector SVG/PNG của sơ đồ kiến trúc hệ thống kèm nút xem toàn màn hình.

---

### Section 5: Báo Cáo Đo Kiểm (Benchmarks) & Bộ Tính Tiết Kiệm ROI

1. **Bảng số liệu thực nghiệm (Empirical Benchmark Table)**:
   - Bảng tổng kết 5 tác vụ tiêu chuẩn trên codebase `token_diff` (Baseline 4,630 tokens $\to$ Giảm xuống trung bình 1,148 tokens, tiết kiệm **-75.2%**).
   - Thời gian thực thi trung bình: **21.4ms** (cực nhanh, hoàn toàn cục bộ).
2. **Bộ tính toán ROI tương tác (Interactive Savings Calculator)**:
   - Thanh kéo 1: *Số lượng tác vụ agent thực hiện mỗi ngày* (10 $\to$ 1,000 tasks/ngày).
   - Thanh kéo 2: *Kích thước trung bình codebase mục tiêu* (2,000 $\to$ 50,000 tokens).
   - Lựa chọn mô hình: GPT-4o, Claude 3.5 Sonnet, OpenAI o1.
   - **Kết quả tính toán hiển thị trực tiếp**:
     - Số lượng token tiết kiệm được mỗi tháng.
     - Số tiền USD doanh nghiệp tiết kiệm được hàng tháng / hàng năm.
     - Tỷ lệ giảm tải độ trễ phản hồi của LLM.

---

### Section 6: CLI & TypeScript SDK Showcase

1. **Cửa sổ Terminal giả lập tương tác (Interactive Terminal Mockup)**:
   - Thiết kế theo bảng màu Catppuccin Macchiato tương đồng với ảnh GIF demo chính thức.
   - Tab chuyển đổi giữa các tình huống sử dụng:
     - *Lệnh cơ bản (`cx -t ... -f ... -b 1000`)*.
     - *Duyệt nhiều tệp qua mẫu Glob (`cx -t ... -f "src/**/*.ts"`)*.
     - *Xuất dữ liệu cho Agent (`cx ... --json`)*.
2. **Khung mã nguồn SDK TypeScript**:
   - Ví dụ ngắn gọn, chuẩn TypeScript về cách gọi hàm `pack(options)`.
   - Nút sao chép mã nguồn tích hợp.

---

### Section 7: Footer (Chân Trang)
- Thông tin bản quyền, Giấy phép mã nguồn mở MIT.
- Nhóm liên kết tài nguyên:
  - *Tài liệu*: Đặc tả kỹ thuật (SPEC.md), Báo cáo Benchmark, Hướng dẫn CLI.
  - *Cộng đồng & Phân phối*: GitHub Repository, npm Package (`ai-context-pack`).
  - *Thông tin tác giả*: Khoa180806.

---

## 4. Kiến Trúc Kỹ Thuật Mã Nguồn Frontend (`web/`)

Landing page được tổ chức trong thư mục `web/` thuộc repository `context-pack`:

```text
web/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   ├── architecture.png
│   └── screenshots/
│       └── cli-demo.gif
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root Layout, Dark Theme Class, Metadata
│   │   ├── page.tsx                # Trang chủ tập hợp các Section
│   │   ├── globals.css             # Tailwind CSS tokens & styling
│   │   ├── robots.ts               # Tối ưu SEO crawler
│   │   └── sitemap.ts              # Sitemap tự động
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Thanh điều hướng trên cùng
│   │   │   └── Footer.tsx          # Chân trang thông tin
│   │   ├── playground/
│   │   │   ├── PlaygroundSection.tsx # Khung chứa toàn bộ Playground
│   │   │   ├── InputPane.tsx       # Bảng điều khiển nhập liệu bên trái
│   │   │   ├── ResultPane.tsx      # Bảng kết quả đóng gói bên phải
│   │   │   ├── TokenMeter.tsx      # Thanh đo ngân sách token trực quan
│   │   │   ├── SlicesViewer.tsx    # Danh sách lát cắt kèm highlight
│   │   │   └── JsonViewer.tsx      # Hiển thị JSON envelope có format
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx     # Hero banner và các nút kêu gọi
│   │   │   ├── PipelineSection.tsx # Sơ đồ luồng 4 giai đoạn
│   │   │   ├── BenchmarkSection.tsx# Bảng số liệu & Bộ tính toán ROI
│   │   │   └── CodeDemoSection.tsx # Cửa sổ Terminal & TypeScript SDK
│   │   └── ui/                     # UI Primitives phong cách Shadcn
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── slider.tsx
│   │       └── input.tsx
│   ├── hooks/
│   │   └── useContextPacker.ts     # Custom hook quản lý trạng thái đóng gói
│   ├── lib/
│   │   ├── presets.ts              # Dữ liệu kịch bản mẫu có sẵn
│   │   ├── utils.ts                # Hàm tiện ích gộp class (cn)
│   │   └── engine/
│   │       ├── clientTokenizer.ts  # BPE token counting chạy trong trình duyệt
│   │       ├── clientRanker.ts     # BM25 relevance scoring
│   │       ├── clientPacker.ts     # Knapsack packing logic
│   │       └── worker.ts           # Web Worker chạy nền tránh block UI
│   └── types/
│       └── playground.ts           # Định nghĩa kiểu dữ liệu cho giao diện
├── package.json
├── tsconfig.json
├── next.config.ts
└── vercel.json
```

---

## 5. Kế Hoạch Triển Khai Chia Nhỏ (Task Breakdown & Checklist)

Quá trình triển khai sẽ được chia thành 5 giai đoạn độc lập, commit theo chuẩn Conventional Commits sau mỗi bước hoàn thành:

- [ ] **Giai đoạn 1: Khởi tạo cấu trúc & Cấu hình nền tảng UI**
  - [ ] Khởi tạo thư mục `web/` với Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide React.
  - [ ] Cấu hình Design Tokens Dark Mode OLED: màu nền `#090D16`, viền `#1E293B`, màu thương hiệu Cyan/Indigo.
  - [ ] Xây dựng các UI Primitives: Button, Card, Badge, Slider, Tabs, CodeBlock.
  - [ ] Kiểm tra build cơ sở `npm run build` không lỗi.

- [ ] **Giai đoạn 2: Tái hiện Lõi Thuật Toán trên Trình Duyệt & Web Worker**
  - [ ] Chuyển đổi logic `js-tiktoken`, BM25 relevance ranker và Knapsack packer sang chạy an toàn trong môi trường Web.
  - [ ] Thiết lập Web Worker để việc tính toán token và phân loại lát cắt diễn ra song song, không làm đơ giao diện khi kéo slider.
  - [ ] Xây dựng bộ 3 Presets mẫu chân thực (Authentication Service, Tokenizer Engine, CLI Handler).
  - [ ] Viết unit tests kiểm thử độ chính xác của kết quả đóng gói trên Web Worker.

- [ ] **Giai đoạn 3: Phát triển Section Trọng Tâm — Web Playground**
  - [ ] Xây dựng `InputPane`: Ô nhập prompt nhiệm vụ, thanh trượt ngân sách token, bộ chọn file tabs.
  - [ ] Xây dựng `ResultPane`: Đồng hồ đo ngân sách `TokenMeter` tự động đổi màu theo % sử dụng.
  - [ ] Xây dựng `SlicesViewer`: Bảng liệt kê lát cắt, dải dòng, điểm số và nội dung mã nguồn.
  - [ ] Xây dựng `JsonViewer`: Chế độ hiển thị JSON envelope có format màu và nút copy một chạm.
  - [ ] Xây dựng nút tự động sinh lệnh CLI `cx` từ cấu hình đang chọn trên giao diện.

- [ ] **Giai đoạn 4: Hoàn thiện các Section Giới Thiệu & Thẩm Mỹ**
  - [ ] Triển khai `Navbar` & `HeroSection` với hiệu ứng gradient, nút CTA và hộp cài đặt nhanh.
  - [ ] Triển khai `PipelineSection` trực quan hóa 4 giai đoạn xử lý kèm ảnh kiến trúc Archify.
  - [ ] Triển khai `BenchmarkSection` kèm bộ tính toán ROI Interactive Savings Calculator.
  - [ ] Triển khai `CodeDemoSection` với cửa sổ Terminal mô phỏng chân thực và code mẫu SDK.
  - [ ] Triển khai `Footer` đầy đủ liên kết và giấy phép MIT.

- [ ] **Giai đoạn 5: Tối ưu Responsive, SEO, Đóng Gói & Triển Khai Vercel**
  - [ ] Tối ưu hóa hiển thị responsive hoàn hảo trên Desktop (1440px), Laptop (1024px), Tablet (768px) và Mobile (375px).
  - [ ] Cấu hình OpenGraph metadata, Favicon, Robots.txt, Sitemap.
  - [ ] Cập nhật liên kết Playground vào `README.md` và `README.vi.md`.
  - [ ] Chạy kiểm thử tự động, build production và hướng dẫn triển khai lên Vercel.

---

## 6. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

1. **Về tính năng**: Web Playground hoạt động mượt mà, phản hồi tức thì (< 30ms) khi kéo thanh trượt token; xuất đúng dải dòng, điểm BM25 và định dạng JSON envelope tương đồng 100% với CLI.
2. **Về bảo mật**: 100% mã nguồn người dùng nhập vào được xử lý tại chỗ trong trình duyệt, không có bất kỳ request API nào gửi mã nguồn ra máy chủ bên ngoài.
3. **Về trải nghiệm UX/UI**: Giao diện chuẩn dark mode kỹ thuật cao cấp, không dùng emoji làm biểu tượng; font chữ monospace hiển thị số liệu thẳng hàng; thao tác copy có phản hồi trực quan.
4. **Về kỹ thuật & Build**: Mã nguồn biên dịch sạch sẽ (`tsc --noEmit` và `next build` 0 lỗi); toàn bộ unit tests vượt qua; sẵn sàng triển khai lên Vercel chỉ với 1 cú click.
