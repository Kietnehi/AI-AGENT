# 🤖 AI Agent - Trợ Lý Thông Minh Đa Năng

AI Agent mạnh mẽ với khả năng tìm kiếm web, tính toán toán học, và phân tích dữ liệu, sử dụng Gemini API làm LLM chính.

## ✨ Tính Năng

### 1. 🔍 Tìm Kiếm Web
- **DuckDuckGo**: Tìm kiếm miễn phí, bảo mật
- **SerpAPI**: Tìm kiếm Google với API key
- Người dùng có thể chọn công cụ tìm kiếm phù hợp

### 2. 🧮 Tính Toán Toán Học
- Sử dụng **Wolfram Alpha API**
- Giải toán phức tạp, tích phân, đạo hàm
- Tính toán khoa học, thống kê
- Giải phương trình

### 3. 📊 Phân Tích Dữ Liệu
- Đọc và phân tích file CSV
- Thống kê mô tả chi tiết
- Tạo nhiều loại biểu đồ:
  - Bar chart (biểu đồ cột)
  - Line chart (biểu đồ đường)
  - Scatter plot (biểu đồ phân tán)
  - Histogram (biểu đồ tần suất)
  - Pie chart (biểu đồ tròn)
  - Box plot
  - Heatmap (bản đồ nhiệt)

### 4. 🧠 Gemini LLM
- Sử dụng Google Gemini API
- Trả lời câu hỏi thông minh
- Hiểu ngữ cảnh hội thoại
- Tương tác tự nhiên bằng tiếng Việt

## 📦 Cài Đặt

### 1. Clone hoặc tải project

```bash
cd "AI Agent"
```

### 2. Tạo môi trường ảo (khuyến nghị)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình API Keys

Sao chép file `.env.example` thành `.env`:

```bash
copy .env.example .env
```

Chỉnh sửa file `.env` và điền các API keys:

```env
# Bắt buộc
GEMINI_API_KEY=your_gemini_api_key_here

# Tùy chọn (cho tính toán Wolfram)
WOLFRAM_APP_ID=your_wolfram_app_id_here

# Tùy chọn (nếu dùng SerpAPI)
SERPAPI_KEY=your_serpapi_key_here

# Chọn công cụ tìm kiếm mặc định
SEARCH_ENGINE=duckduckgo
```

### 📝 Lấy API Keys

1. **Gemini API** (Bắt buộc):
   - Truy cập: https://makersuite.google.com/app/apikey
   - Đăng nhập với Google account
   - Tạo API key miễn phí

2. **Wolfram Alpha** (Tùy chọn):
   - Truy cập: https://products.wolframalpha.com/api/
   - Đăng ký tài khoản
   - Lấy App ID (có gói miễn phí)

3. **SerpAPI** (Tùy chọn):
   - Truy cập: https://serpapi.com/
   - Đăng ký tài khoản
   - Lấy API key (có 100 searches/tháng miễn phí)

## 🚀 Hướng Dẫn Chạy Chi Tiết

### 🎯 Cách 1: Chạy Thủ Công (Khuyến nghị)

#### **Bước 1: Cài đặt Python Dependencies**

```bash
# Đảm bảo bạn đang ở thư mục gốc của project
cd "AI Agent"

# Cài đặt tất cả các thư viện cần thiết
pip install -r requirements.txt
```

**Kiểm tra cài đặt thành công:**
```bash
pip list | grep google-genai
pip list | grep fastapi
```

#### **Bước 2: Tạo và Cấu hình File .env**

```bash
# Sao chép file mẫu
copy .env.example .env     # Windows
# hoặc
cp .env.example .env       # Linux/Mac
```

**Chỉnh sửa file `.env`** bằng text editor yêu thích:

```env
# Bắt buộc - Gemini AI (Lấy tại: https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=AIzaSyD...your_actual_key_here

# Tùy chọn - Wolfram Alpha (Lấy tại: https://products.wolframalpha.com/api/)
WOLFRAM_APP_ID=XXXXX-XXXXXXXXXX

# Tùy chọn - SerpAPI (Lấy tại: https://serpapi.com/)
SERPAPI_KEY=your_serpapi_key_here

# Công cụ tìm kiếm mặc định
SEARCH_ENGINE=duckduckgo
```

#### **Bước 3: Chạy CLI Agent (Phiên bản Command Line)**

```bash
# Chạy agent tương tác trong terminal
python agent.py
```

**Bạn sẽ thấy:**
```
🤖 AI Agent đã được khởi tạo!
📡 Công cụ tìm kiếm: DuckDuckGo
🧮 Wolfram Alpha: ✓

============================================================
🤖 AI AGENT - Interactive Mode
============================================================

Lệnh đặc biệt:
  /search <engine> - Đổi công cụ tìm kiếm (duckduckgo/serpapi)
  /clear - Xóa lịch sử hội thoại
  /exit hoặc /quit - Thoát
...
👤 Bạn: _
```

**Ví dụ sử dụng:**
```
👤 Bạn: Tìm kiếm thông tin về AI
👤 Bạn: Tính tích phân của x^2 từ 0 đến 10
👤 Bạn: Phân tích file data.csv
```

---

### 🌐 Cách 2: Chạy Web Application (React + FastAPI)

#### **Bước 1: Chạy Backend (FastAPI)**

Mở **Terminal 1**:

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies (chỉ cần làm 1 lần)
pip install -r requirements.txt

# Chạy backend server
python main.py
```

**✅ Backend sẽ chạy tại:** `http://localhost:8000`

**Kiểm tra backend hoạt động:**
- Truy cập: http://localhost:8000
- Hoặc: http://localhost:8000/health

Bạn sẽ thấy:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started server process
```

#### **Bước 2: Chạy Frontend (React)**

Mở **Terminal 2** (giữ terminal backend đang chạy):

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt Node.js dependencies (chỉ cần làm 1 lần)
npm install

# Chạy React development server
npm start
```

**✅ Frontend sẽ tự động mở tại:** `http://localhost:3000`

Browser sẽ tự động mở ứng dụng web!

#### **Bước 3: Sử Dụng Web Application**

Giao diện web có 3 tabs chính:

1. **🔍 Tìm Kiếm Web**
   - Chọn DuckDuckGo hoặc SerpAPI
   - Nhập câu hỏi và nhận câu trả lời từ AI

2. **🧮 Tính Toán**
   - Nhập phép tính toán học
   - Wolfram Alpha xử lý và AI giải thích

3. **📊 Phân Tích Dữ Liệu**
   - Kéo thả file CSV
   - Xem thống kê và tạo biểu đồ

---

### 🚀 Cách 3: Chạy Tự Động (Sử dụng Script)

Nếu muốn chạy cả backend và frontend cùng lúc:

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

Script sẽ tự động:
- ✅ Kiểm tra và copy file .env
- ✅ Cài đặt dependencies
- ✅ Chạy backend (port 8000)
- ✅ Chạy frontend (port 3000)

---

## 🛑 Dừng Ứng Dụng

### Dừng CLI Agent:
```
Nhấn Ctrl + C trong terminal
hoặc gõ: /exit
```

### Dừng Web Application:
- **Backend:** Nhấn `Ctrl + C` trong terminal backend
- **Frontend:** Nhấn `Ctrl + C` trong terminal frontend

---

## 🔍 Kiểm Tra và Xử Lý Lỗi

### Kiểm tra Backend đang chạy:
```bash
# Truy cập trong browser
http://localhost:8000/health

# Hoặc dùng curl
curl http://localhost:8000/health
```

### Kiểm tra Frontend đang chạy:
```bash
http://localhost:3000
```

### Lỗi: "Port 8000 already in use"
```bash
# Windows - Tìm và kill process
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Lỗi: "GEMINI_API_KEY is required"
```bash
# Kiểm tra file .env tồn tại
ls .env          # Linux/Mac
dir .env         # Windows

# Kiểm tra nội dung
cat .env         # Linux/Mac
type .env        # Windows
```

### Lỗi: "Module not found"
```bash
# Cài lại dependencies
pip install -r requirements.txt          # Backend
cd frontend && npm install               # Frontend
```

---

## 🚀 Sử Dụng

### Chạy Agent ở chế độ tương tác (CLI)

```bash
python agent.py
```

### Ví dụ sử dụng

#### 1. Tìm kiếm thông tin

```
👤 Bạn: Tìm kiếm thông tin về trí tuệ nhân tạo
🤖 Agent: [Sẽ tìm kiếm và trả về kết quả từ DuckDuckGo/SerpAPI]
```

#### 2. Tính toán toán học

```
👤 Bạn: Tính tích phân của x^2 từ 0 đến 10
🤖 Agent: [Sẽ dùng Wolfram Alpha để tính toán]
```

```
👤 Bạn: Giải phương trình x^2 + 5x + 6 = 0
🤖 Agent: [Kết quả từ Wolfram Alpha]
```

#### 3. Phân tích dữ liệu CSV

```
👤 Bạn: Phân tích file sales_data.csv của tôi
🤖 Agent: [Load file và hiển thị thống kê]
```

```
👤 Bạn: Tạo biểu đồ cột cho doanh số theo tháng
🤖 Agent: [Tạo bar chart và lưu vào thư mục charts/]
```

### Lệnh đặc biệt

- `/search duckduckgo` - Chuyển sang DuckDuckGo
- `/search serpapi` - Chuyển sang SerpAPI
- `/clear` - Xóa lịch sử hội thoại
- `/exit` hoặc `/quit` - Thoát chương trình

## 📁 Cấu Trúc Project

```
AI Agent/
│
├── agent.py                 # File chính để chạy agent
├── config.py               # Cấu hình và quản lý API keys
├── requirements.txt        # Các thư viện cần thiết
├── .env.example           # Mẫu file cấu hình
├── .env                   # File cấu hình thực (không commit)
│
├── tools/                 # Thư mục chứa các công cụ
│   ├── __init__.py
│   ├── web_search.py     # Công cụ tìm kiếm web
│   ├── wolfram_tool.py   # Công cụ tính toán Wolfram
│   └── data_analysis.py  # Công cụ phân tích dữ liệu
│
└── charts/               # Thư mục lưu biểu đồ (tự động tạo)
```

## 🎯 Các Lệnh Nội Bộ Agent

Agent tự động nhận diện và thực thi các lệnh sau:

### Tìm kiếm
```
[SEARCH: <truy vấn tìm kiếm>]
```

### Tính toán
```
[WOLFRAM: <phép tính>]
```

### Phân tích CSV
```
[LOAD_CSV: <đường dẫn file>]
[CSV_INFO]
[CSV_ANALYZE: <tên cột>]
[CREATE_CHART: type=bar, x=month, y=sales, title=Doanh số theo tháng]
```

## 💡 Tips

1. **Tìm kiếm chính xác hơn**: Hãy cụ thể trong câu hỏi
   - ❌ "Tìm kiếm Python"
   - ✅ "Tìm kiếm tutorial Python cho người mới bắt đầu"

2. **Tính toán phức tạp**: Wolfram Alpha rất mạnh
   - Tích phân, đạo hàm
   - Giải phương trình
   - Thống kê
   - Vẽ đồ thị toán học

3. **Phân tích dữ liệu**: Chuẩn bị file CSV tốt
   - Đặt tên cột rõ ràng
   - Dữ liệu sạch, không có lỗi
   - Format chuẩn

## 🔧 Cấu Hình Nâng Cao

### Thay đổi trong `config.py`

```python
# Giới hạn kích thước file CSV (MB)
MAX_CSV_SIZE_MB = 100

# Thư mục lưu biểu đồ
CHART_OUTPUT_DIR = "charts"

# Công cụ tìm kiếm mặc định
SEARCH_ENGINE = "duckduckgo"  # hoặc "serpapi"
```

## 🐛 Xử Lý Lỗi

### Lỗi thường gặp:

1. **"GEMINI_API_KEY is required"**
   - Kiểm tra file `.env` có tồn tại không
   - Đảm bảo API key đã được nhập đúng

2. **"Wolfram Alpha không khả dụng"**
   - Kiểm tra WOLFRAM_APP_ID trong `.env`
   - Tính năng tính toán sẽ bị tắt nếu không có

3. **"File CSV quá lớn"**
   - Giới hạn mặc định là 100MB
   - Tăng `MAX_CSV_SIZE_MB` trong config nếu cần

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

## 🤝 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo Pull Request hoặc Issues.

## 📞 Liên Hệ

Nếu có vấn đề hoặc câu hỏi, hãy tạo Issue trên GitHub.

---

**Chúc bạn sử dụng AI Agent hiệu quả! 🚀**
