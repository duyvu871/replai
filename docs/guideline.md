# PROJECT TECHNICAL GUIDELINE: REPLAI

> **Version:** 1.0.0
> **Tech Stack:** React 19, Tailwind CSS, Shadcn UI, WXT.
> **Scope:** Browser Extension (Chrome & Firefox).

---

## 1. Overview

### 1.1 Mục tiêu kỹ thuật của hệ thống

* **Vấn đề kỹ thuật chính:**
* Tích hợp **React 19** vào môi trường Content Script của Extension.
* Xử lý CSS Isolation (Shadow DOM) cho **Tailwind CSS** và **Shadcn UI** (vốn mặc định render ra `body`).
* Đảm bảo hiệu năng cao khi thao tác DOM Facebook phức tạp.


* **Kỹ năng trọng tâm:**
* React 19 features (New `use` hook, React Compiler).
* Shadow DOM Portal Handling.
* Browser Messaging Security.


* **Kết quả kỹ thuật mong muốn:**
* Extension load dưới 500ms.
* UI (Shadcn) hiển thị chính xác trong Shadow DOM, không bị CSS Facebook ảnh hưởng.
* Codebase dùng React 19 pattern (bỏ `forwardRef`, dùng `ref` prop trực tiếp).



### 1.2 Loại hệ thống

* ☐ Internal
* ☐ SaaS
* ☑ **Client-side Extension (Local-first)**

### 1.3 Độ phức tạp dự kiến

* **Quy mô codebase:** Vừa (Khoảng 15-20 UI components).
* **Số module chính:** 3 (Background, Content, Popup/Settings).
* **Mức độ tích hợp bên ngoài:** Cao (Facebook DOM & Google Gemini API).

### 1.4 Tiêu chí hoàn thành (Definition of Done)

* **Kỹ thuật:** WXT build thành công cho Chrome (MV3) và Firefox (MV3). Không có lỗi React Hydration hay Style Leak.
* **Chức năng:** Flow "Click -> Dialog (Shadcn) -> Gemini API -> Insert Text" hoạt động trơn tru.
* **Stack:** Sử dụng đúng React 19 (không dùng deprecated patterns) và Tailwind config đúng chuẩn.

---

## 2. Business Logic (Conceptual)

### 2.1 Các domain chính

* **DOM Domain:** Observer & Injector (Quét và chèn nút vào FB).
* **UI Domain:** Shadow DOM Host & React Components.
* **AI Domain:** Gemini SDK Wrapper & Prompt Engineering.

### 2.2 Trách nhiệm của từng domain

* **DOM Domain:** Đảm bảo tìm đúng ô input `contenteditable` của Facebook bất kể FB cập nhật class name.
* **UI Domain:** Render giao diện Dialog/Popover của Shadcn UI vào bên trong Shadow Root (tránh render ra `document.body`).
* **AI Domain:** Xử lý Rate Limit, Token count và Error Handling từ Google.

### 2.3 Quy tắc nghiệp vụ cốt lõi

* **Rule 1 (UI Isolation):** Mọi component UI **BẮT BUỘC** phải nằm trong Shadow DOM.
* **Rule 2 (Event Propagation):** Khi gõ text vào ô FB, phải dispatch đúng Event (`input`, `beforeinput`) để React của FB nhận diện thay đổi.
* **Rule 3 (Privacy):** API Key lưu ở `local` storage, không sync lên cloud.

### 2.4 State / Lifecycle

* **UI State:** `Hidden` -> `Floating Button Visible` -> `Dialog Open` -> `Generating` -> `Result View`.
* **Sync:** Đồng bộ Settings (API Key, Tone) giữa Popup và Background script.

### 2.5 Các rule cần enforce bằng code

* **React 19:** Sử dụng `ref` như prop bình thường (không dùng `forwardRef`).
* **Tailwind:** Không dùng giá trị pixel cứng (`w-[300px]`), dùng rem/token của Shadcn (`w-72`).

### 2.6 Những nghiệp vụ KHÔNG xử lý

* Không lưu lịch sử chat.
* Không xử lý login FB (sử dụng session hiện tại của browser).

---

## 3. Scope & Boundaries

### 3.1 In-scope features

* Nút "AI Reply" gắn vào ô Comment và Post.
* Popup cài đặt API Key.
* Chức năng: Viết lại, Tóm tắt, Dịch, Gợi ý Reply.

### 3.2 Out-of-scope features

* Tự động like/tương tác dạo.
* Hỗ trợ Messenger (Scope giai đoạn 2).

### 3.3 Giả định đang sử dụng

* Trình duyệt hỗ trợ Manifest V3.
* User có API Key Gemini hợp lệ.

### 3.4 Hạn chế kỹ thuật chấp nhận được

* Một số Popover của Shadcn có thể cần custom lại `container` prop để hoạt động trong Shadow DOM.

---

## 4. Architecture Style

### 4.1 Kiểu kiến trúc

* ☑ **Modular Extension** (Background service + Content UI tách biệt).
* **Lý do:** Tuân thủ security model của trình duyệt (Content script không được gọi API trực tiếp nếu dính CORS).

### 4.2 Sync vs Async

* **Async:** Toàn bộ giao tiếp `browser.runtime.sendMessage`.
* **Async:** Gemini API calls.

### 4.3 Boundary giữa các module

* **Content Script:** Chỉ chứa Logic UI và DOM. Không chứa Logic gọi AI.
* **Background:** Chứa Logic gọi AI. Không chứa code DOM access.

### 4.4 Giao tiếp nội bộ

* ☑ **Event-driven (Message Passing)**
* Content gửi message `GENERATE_REQUEST` -> Background trả `GENERATE_SUCCESS` / `GENERATE_ERROR`.

### 4.5 Cross-cutting concerns

* **Config:** `wxt.config.ts` quản lý manifest.
* **Styling:** `tailwind.config.js` chung cho cả Popup và Content Script.

---

## 5. Module / Component Structure

### 5.1 Danh sách module chính

* `entrypoints/background.ts`: Service Worker.
* `entrypoints/content.tsx`: React Root (Shadow DOM).
* `components/ui`: Shadcn UI components.
* `lib/gemini.ts`: AI handling logic.

### 5.2 Trách nhiệm từng module

* **Content:** Mount React App, Inject CSS Tailwind, Handle Shadow Portal.
* **Background:** Listen Message, Call Gemini, Return data.

### 5.3 Quy tắc phụ thuộc giữa module

* `entrypoints` import `components`.
* `components` không import ngược lại `entrypoints`.

### 5.4 Common / Shared code

* **Types:** `src/types/*.ts` (Message payloads).
* **Utils:** `src/lib/utils.ts` (Shadcn cn helper).

---

## 6. Tech Stack Decisions

### 6.1 Ngôn ngữ chính

* **Ngôn ngữ:** TypeScript
* **Version:** 5.x

### 6.2 Framework & Library

* **Core:** WXT (Web Extension Tools) - Latest.
* **UI Lib:** **React 19** (Release Candidate/Stable).
* **Styling:** **Tailwind CSS v3.4+** (Standard) hoặc v4 (nếu WXT support tốt tại thời điểm init).
* **Components:** **Shadcn UI** (Latest).
* **Icons:** Lucide React.

### 6.3 Database

* **Storage:** `browser.storage.local` (Abstraction qua `wxt/storage` recommended).

### 6.4 Infra / Hosting

* Client-side only.

### 6.5 Thư viện bắt buộc

* `clsx`, `tailwind-merge` (Core của Shadcn).
* `@google/generative-ai`.

### 6.6 Thư viện cấm dùng

* `styled-components` / `emotion`: Conflict với Tailwind và khó setup Shadow DOM injection.

---

## 7. Data & Persistence

### 7.1 Entity chính

* `UserConfig`: `{ apiKey: string, promptLanguage: string }`

### 7.2 Quan hệ giữa entity

* Single object lưu trong Storage.

### 7.3 Transaction boundary

* Set settings -> `await storage.setItem()`.

### 7.4 Data consistency level

* ☐ Eventual consistency (Storage sync giữa các tab có thể delay vài ms).

---

## 8. API & Communication

### 8.1 Kiểu API

* External: **Gemini REST API** (via SDK).

### 8.2 Convention endpoint

* Internal Message Actions: `CMD_GENERATE`, `CMD_SUMMARIZE`, `CMD_TRANSLATE`.

### 8.3 Error format chuẩn

* `{ success: false, error: "API_KEY_INVALID", message: "..." }`

### 8.4 Shadcn & React 19 Specifics (Critical)

* **Ref Handling:** Các component Shadcn trong `components/ui` nếu dùng `forwardRef`, có thể refactor sang React 19 pattern (dùng `ref` prop trực tiếp) hoặc giữ nguyên để tương thích ngược (React 19 vẫn support `forwardRef`).
* **Portals:**
* Mặc định Shadcn `Dialog`, `Select`, `Tooltip` render vào `document.body`.
* **BẮT BUỘC:** Sửa file component Shadcn hoặc dùng prop `container` để trỏ vào `shadowRoot` div.
* *Ví dụ:* Tạo một `ShadowDomContext` để provide cái root element cho các component này.



### 8.5 Timeout / Retry policy

* Timeout API: 15s.
* Không retry tự động để tiết kiệm quota của user.

---

### Gợi ý workflow tiếp theo cho bạn:

1. **Init Project:** Chạy `npx wxt@latest init replai --template react`.
2. **Upgrade React:** Vào `package.json`, chỉnh `react` và `react-dom` lên `^19.0.0`. Chạy `npm install`.
3. **Setup Tailwind:** Cài Tailwind và cấu hình `content` path trỏ vào folder `entrypoints` và `components`.
4. **Setup Shadcn:** Chạy `npx shadcn@latest init`. Lưu ý khi nó hỏi `global.css`, trỏ vào file CSS mà Content Script sẽ load.
5. **Implement Shadow Provider:** Viết ngay Context để xử lý vụ Portal của Shadcn (đây là việc khó nhất).Đây là bản **Technical Guideline** chính thức cho dự án **Replai**, được cập nhật để sử dụng các công nghệ mới nhất bạn yêu cầu (**React 19, Tailwind CSS 3.4+, Shadcn UI**).

Tài liệu này dùng template bạn cung cấp để định hình kiến trúc hệ thống.

---

# PROJECT TECHNICAL GUIDELINE: REPLAI

> **Version:** 1.0.0
> **Tech Stack:** React 19, Tailwind CSS, Shadcn UI, WXT.
> **Scope:** Browser Extension (Chrome & Firefox).

---

## 1. Overview

### 1.1 Mục tiêu kỹ thuật của hệ thống

* **Vấn đề kỹ thuật chính:**
* Tích hợp **React 19** vào môi trường Content Script của Extension.
* Xử lý CSS Isolation (Shadow DOM) cho **Tailwind CSS** và **Shadcn UI** (vốn mặc định render ra `body`).
* Đảm bảo hiệu năng cao khi thao tác DOM Facebook phức tạp.


* **Kỹ năng trọng tâm:**
* React 19 features (New `use` hook, React Compiler).
* Shadow DOM Portal Handling.
* Browser Messaging Security.


* **Kết quả kỹ thuật mong muốn:**
* Extension load dưới 500ms.
* UI (Shadcn) hiển thị chính xác trong Shadow DOM, không bị CSS Facebook ảnh hưởng.
* Codebase dùng React 19 pattern (bỏ `forwardRef`, dùng `ref` prop trực tiếp).



### 1.2 Loại hệ thống

* ☐ Internal
* ☐ SaaS
* ☑ **Client-side Extension (Local-first)**

### 1.3 Độ phức tạp dự kiến

* **Quy mô codebase:** Vừa (Khoảng 15-20 UI components).
* **Số module chính:** 3 (Background, Content, Popup/Settings).
* **Mức độ tích hợp bên ngoài:** Cao (Facebook DOM & Google Gemini API).

### 1.4 Tiêu chí hoàn thành (Definition of Done)

* **Kỹ thuật:** WXT build thành công cho Chrome (MV3) và Firefox (MV3). Không có lỗi React Hydration hay Style Leak.
* **Chức năng:** Flow "Click -> Dialog (Shadcn) -> Gemini API -> Insert Text" hoạt động trơn tru.
* **Stack:** Sử dụng đúng React 19 (không dùng deprecated patterns) và Tailwind config đúng chuẩn.

---

## 2. Business Logic (Conceptual)

### 2.1 Các domain chính

* **DOM Domain:** Observer & Injector (Quét và chèn nút vào FB).
* **UI Domain:** Shadow DOM Host & React Components.
* **AI Domain:** Gemini SDK Wrapper & Prompt Engineering.

### 2.2 Trách nhiệm của từng domain

* **DOM Domain:** Đảm bảo tìm đúng ô input `contenteditable` của Facebook bất kể FB cập nhật class name.
* **UI Domain:** Render giao diện Dialog/Popover của Shadcn UI vào bên trong Shadow Root (tránh render ra `document.body`).
* **AI Domain:** Xử lý Rate Limit, Token count và Error Handling từ Google.

### 2.3 Quy tắc nghiệp vụ cốt lõi

* **Rule 1 (UI Isolation):** Mọi component UI **BẮT BUỘC** phải nằm trong Shadow DOM.
* **Rule 2 (Event Propagation):** Khi gõ text vào ô FB, phải dispatch đúng Event (`input`, `beforeinput`) để React của FB nhận diện thay đổi.
* **Rule 3 (Privacy):** API Key lưu ở `local` storage, không sync lên cloud.

### 2.4 State / Lifecycle

* **UI State:** `Hidden` -> `Floating Button Visible` -> `Dialog Open` -> `Generating` -> `Result View`.
* **Sync:** Đồng bộ Settings (API Key, Tone) giữa Popup và Background script.

### 2.5 Các rule cần enforce bằng code

* **React 19:** Sử dụng `ref` như prop bình thường (không dùng `forwardRef`).
* **Tailwind:** Không dùng giá trị pixel cứng (`w-[300px]`), dùng rem/token của Shadcn (`w-72`).

### 2.6 Những nghiệp vụ KHÔNG xử lý

* Không lưu lịch sử chat.
* Không xử lý login FB (sử dụng session hiện tại của browser).

---

## 3. Scope & Boundaries

### 3.1 In-scope features

* Nút "AI Reply" gắn vào ô Comment và Post.
* Popup cài đặt API Key.
* Chức năng: Viết lại, Tóm tắt, Dịch, Gợi ý Reply.

### 3.2 Out-of-scope features

* Tự động like/tương tác dạo.
* Hỗ trợ Messenger (Scope giai đoạn 2).

### 3.3 Giả định đang sử dụng

* Trình duyệt hỗ trợ Manifest V3.
* User có API Key Gemini hợp lệ.

### 3.4 Hạn chế kỹ thuật chấp nhận được

* Một số Popover của Shadcn có thể cần custom lại `container` prop để hoạt động trong Shadow DOM.

---

## 4. Architecture Style

### 4.1 Kiểu kiến trúc

* ☑ **Modular Extension** (Background service + Content UI tách biệt).
* **Lý do:** Tuân thủ security model của trình duyệt (Content script không được gọi API trực tiếp nếu dính CORS).

### 4.2 Sync vs Async

* **Async:** Toàn bộ giao tiếp `browser.runtime.sendMessage`.
* **Async:** Gemini API calls.

### 4.3 Boundary giữa các module

* **Content Script:** Chỉ chứa Logic UI và DOM. Không chứa Logic gọi AI.
* **Background:** Chứa Logic gọi AI. Không chứa code DOM access.

### 4.4 Giao tiếp nội bộ

* ☑ **Event-driven (Message Passing)**
* Content gửi message `GENERATE_REQUEST` -> Background trả `GENERATE_SUCCESS` / `GENERATE_ERROR`.

### 4.5 Cross-cutting concerns

* **Config:** `wxt.config.ts` quản lý manifest.
* **Styling:** `tailwind.config.js` chung cho cả Popup và Content Script.

---

## 5. Module / Component Structure

### 5.1 Danh sách module chính

* `entrypoints/background.ts`: Service Worker.
* `entrypoints/content.tsx`: React Root (Shadow DOM).
* `components/ui`: Shadcn UI components.
* `lib/gemini.ts`: AI handling logic.

### 5.2 Trách nhiệm từng module

* **Content:** Mount React App, Inject CSS Tailwind, Handle Shadow Portal.
* **Background:** Listen Message, Call Gemini, Return data.

### 5.3 Quy tắc phụ thuộc giữa module

* `entrypoints` import `components`.
* `components` không import ngược lại `entrypoints`.

### 5.4 Common / Shared code

* **Types:** `src/types/*.ts` (Message payloads).
* **Utils:** `src/lib/utils.ts` (Shadcn cn helper).

---

## 6. Tech Stack Decisions

### 6.1 Ngôn ngữ chính

* **Ngôn ngữ:** TypeScript
* **Version:** 5.x

### 6.2 Framework & Library

* **Core:** WXT (Web Extension Tools) - Latest.
* **UI Lib:** **React 19** (Release Candidate/Stable).
* **Styling:** **Tailwind CSS v3.4+** (Standard) hoặc v4 (nếu WXT support tốt tại thời điểm init).
* **Components:** **Shadcn UI** (Latest).
* **Icons:** Lucide React.

### 6.3 Database

* **Storage:** `browser.storage.local` (Abstraction qua `wxt/storage` recommended).

### 6.4 Infra / Hosting

* Client-side only.

### 6.5 Thư viện bắt buộc

* `clsx`, `tailwind-merge` (Core của Shadcn).
* `@google/generative-ai`.

### 6.6 Thư viện cấm dùng

* `styled-components` / `emotion`: Conflict với Tailwind và khó setup Shadow DOM injection.

---

## 7. Data & Persistence

### 7.1 Entity chính

* `UserConfig`: `{ apiKey: string, promptLanguage: string }`

### 7.2 Quan hệ giữa entity

* Single object lưu trong Storage.

### 7.3 Transaction boundary

* Set settings -> `await storage.setItem()`.

### 7.4 Data consistency level

* ☐ Eventual consistency (Storage sync giữa các tab có thể delay vài ms).

---

## 8. API & Communication

### 8.1 Kiểu API

* External: **Gemini REST API** (via SDK).

### 8.2 Convention endpoint

* Internal Message Actions: `CMD_GENERATE`, `CMD_SUMMARIZE`, `CMD_TRANSLATE`.

### 8.3 Error format chuẩn

* `{ success: false, error: "API_KEY_INVALID", message: "..." }`

### 8.4 Shadcn & React 19 Specifics (Critical)

* **Ref Handling:** Các component Shadcn trong `components/ui` nếu dùng `forwardRef`, có thể refactor sang React 19 pattern (dùng `ref` prop trực tiếp) hoặc giữ nguyên để tương thích ngược (React 19 vẫn support `forwardRef`).
* **Portals:**
* Mặc định Shadcn `Dialog`, `Select`, `Tooltip` render vào `document.body`.
* **BẮT BUỘC:** Sửa file component Shadcn hoặc dùng prop `container` để trỏ vào `shadowRoot` div.
* *Ví dụ:* Tạo một `ShadowDomContext` để provide cái root element cho các component này.



### 8.5 Timeout / Retry policy

* Timeout API: 15s.
* Không retry tự động để tiết kiệm quota của user.
