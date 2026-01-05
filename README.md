<div align="center">

![AI Agent](./image/readme/aiagent.jpg)

</div>

<p align="center">
  <img src="./image/readme/gemini.jpg" width="200" alt="Gemini"/>
  <img src="./image/readme/react.jpg" width="200" alt="React"/>
  <img src="./image/readme/duckduckgo.png" width="200" alt="DuckDuckGo"/>
  <img src="./image/readme/langchain.jpg" width="200" alt="LangChain"/>
</p>

---

# 🤖 AI Agent - Trợ Lý Thông Minh Đa Năng

## 📌 Giới Thiệu

> **⚠️ Lưu ý:** Repo này được tạo ra để **test và xài thử các API** đồng thời **thử vibe coding một con AI Agent đơn giản**.
> 
> Trong tương lai sẽ sử dụng thêm nhiều API để test và build trong lúc thời gian rảnh rỗi, nên đừng quá khắt khe nhé! 😊
> 
> **⭐ Nếu thấy hay thì hãy ủng hộ bằng cách cho repo một Star nhé!**

AI Agent mạnh mẽ với khả năng tìm kiếm web, tính toán toán học, và phân tích dữ liệu, sử dụng Gemini API làm LLM chính.

<div align="center">

![Demo](./output.gif)

</div>

## ✨ Tính Năng

### 🌟 Smart Chat AI (Real-time)
- **Chat thông minh** với AI tự động quyết định khi nào cần tìm kiếm
- **Phân tích câu hỏi** và tự động search thông tin real-time nếu cần
- **Tổng hợp & tư vấn** dựa trên kết quả tìm kiếm
- **Trò chuyện tự nhiên** bằng tiếng Việt

<div align="center">

![Smart Chat AI](./image/smartchat.png)
*Giao diện Smart Chat AI với khả năng tự động tìm kiếm real-time*

</div>

### 1. 🔍 Tìm Kiếm Web
- **DuckDuckGo**: Tìm kiếm miễn phí, bảo mật
- **SerpAPI**: Tìm kiếm Google với API key
- Người dùng có thể chọn công cụ tìm kiếm phù hợp

<p align="center">
  <img src="./image/duckduckgo.png" width="45%" alt="DuckDuckGo Search"/>
  <img src="./image/serpapi.png" width="45%" alt="SerpAPI Search"/>
</p>

### 2. 🧮 Tính Toán Toán Học
- Sử dụng **Wolfram Alpha API**
- Giải toán phức tạp, tích phân, đạo hàm
- Tính toán khoa học, thống kê
- Giải phương trình
- **Vẽ đồ thị hàm số** trực tiếp từ Wolfram Alpha

<div align="center">

![Plot Function](./image/plotdothi.png)
*Đồ thị hàm số được tạo bằng Wolfram Alpha API*

</div>

**Tính năng vẽ đồ thị nâng cao:** AI Agent tích hợp trực tiếp với Wolfram Alpha API để tạo ra các đồ thị toán học chính xác và đẹp mắt. Chỉ cần nhập lệnh như "plot y = x^2" hoặc "graph sin(x) from -π to π", hệ thống sẽ tự động gửi yêu cầu đến Wolfram Alpha, nhận về hình ảnh đồ thị chất lượng cao và hiển thị ngay lập tức trong giao diện. Wolfram Alpha xử lý các phép vẽ phức tạp bao gồm hàm số nhiều biến, đồ thị 3D, biểu đồ phân cực, và các hàm đặc biệt, giúp người dùng trực quan hóa toán học một cách dễ dàng và chuyên nghiệp.

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

<div align="center">

![Data Analysis](./image/aiagent.png)
*Giao diện phân tích dữ liệu*

![Bar Chart](./image/cot.png)
*Tự động tạo biểu đồ cột*

</div>

### 4. 🧠 Gemini LLM
- Sử dụng Google Gemini API
- Trả lời câu hỏi thông minh
- Hiểu ngữ cảnh hội thoại
- Tương tác tự nhiên bằng tiếng Việt

### 5. 🔊 Audio Player (Text-to-Speech)

- Giới thiệu: AI Agent hiện hỗ trợ chuyển văn bản thành giọng nói (Text-to-Speech) và phát trực tiếp trên giao diện web. Tính năng này giúp bạn nghe nội dung trả lời, các ghi chú, hoặc kết quả phân tích dữ liệu mà không cần đọc tay.

- Tính năng chính:
  - Play / Pause: bật/tạm dừng audio.
  - Seek (tua): click vào thanh tiến trình để tua tới vị trí mong muốn.
  - Time display: hiển thị thời gian hiện tại và tổng thời lượng (ví dụ: 0:10 / 2:27).
  - Restart: nút phát lại từ đầu.
  - Giao diện thân thiện, có chỉ dẫn khi hover để người dùng biết có thể tua.

- Vị trí code:
  - Frontend component: [frontend/src/components/AudioButton.js](frontend/src/components/AudioButton.js)
  - Backend endpoint (text-to-speech): [backend/main.py](backend/main.py#L465)

- Cách sử dụng nhanh:
  1. Tại bất kỳ chỗ nào hiển thị nút "Nghe" hoặc biểu tượng âm lượng, click để tải và phát audio.
  2. Dùng thanh progress để tua đến vị trí mong muốn (click) hoặc dùng nút Tạm dừng/Tiếp tục.
  3. Nhấn nút ↻ để phát lại từ đầu.

- Ghi chú kỹ thuật:
  - Frontend sẽ gọi API `/text-to-speech` để nhận về file audio (MPEG) rồi tạo URL tạm thời (`URL.createObjectURL`) và phát bằng thẻ `Audio` của trình duyệt.
  - Nếu muốn thay voices hoặc tham số TTS, chỉnh ở `backend/main.py` nơi gọi `gTTS` (hoặc thay thế bằng dịch vụ TTS khác).

  ### 6. 🧩 Local Open-source LLM — QWEN 1.5B

  - Giới thiệu: Ngoài việc dùng Gemini và các dịch vụ đám mây, AI Agent còn hỗ trợ chạy mô hình open-source cỡ nhỏ/nhỏ-vừa tại local. Hiện repo có hướng dẫn tích hợp với `QWEN 1.5B` (một mô hình ngôn ngữ nhẹ, phù hợp để chạy thử trên máy cá nhân có GPU hoặc CPU mạnh).

  - Tính năng khi dùng QWEN 1.5B:
    - Chạy local LLM để trả lời câu hỏi offline (không cần API key bên thứ ba).
    - Hỗ trợ trả lời ngôn ngữ tiếng Việt cơ bản và xử lý prompt tùy chỉnh.
    - Phù hợp để thử nghiệm Local LLM, fine-tune nhỏ hoặc làm prototyping.

  ### 7. 📝 Text Summarization

  - Giới thiệu: AI Agent hỗ trợ tóm tắt văn bản tiếng Anh sử dụng mô hình `facebook/bart-large-cnn`. Tính năng này giúp bạn nhanh chóng nắm bắt nội dung chính từ các đoạn văn bản dài.

  - Tính năng chính:
    - Tóm tắt văn bản tiếng Anh tự động
    - Hiển thị tỷ lệ nén (compression ratio)
    - Hiển thị độ dài văn bản gốc và văn bản tóm tắt
    - Hỗ trợ Text-to-Speech cho kết quả tóm tắt
    - Tự động xử lý văn bản dài (truncate nếu vượt quá giới hạn)

  - Minh họa (ảnh):

    ![Summarization Demo](./image/summarization.png)

  - Vị trí code:
    - Backend tool: [backend/tools/summarization_tool.py](backend/tools/summarization_tool.py)
    - Backend endpoint: [backend/main.py](backend/main.py) - `/summarization`
    - Frontend component: [frontend/src/components/SummarizationFeature.js](frontend/src/components/SummarizationFeature.js)

  - Cách sử dụng:
    1. Nhập văn bản tiếng Anh (tối thiểu 50 ký tự)
    2. Nhấn nút "Summarize" để tạo tóm tắt
    3. Xem kết quả với thống kê chi tiết
    4. Sử dụng nút "Nghe" để nghe tóm tắt

  - Minh họa (ảnh):

    ![Local LLM Demo](image/localllm.png)

  - Cách dùng nhanh:
    1. Chuẩn bị môi trường (Python >=3.8, virtualenv). Cài thêm thư viện mô hình local (ví dụ: `transformers`, `accelerate`, hoặc runtime tương ứng với backend bạn muốn dùng).
    2. Tải trọng lượng QWEN 1.5B hoặc dùng một bản mirror tương thích (theo hướng dẫn của nhà phát triển QWEN).
    3. Chạy service local (ví dụ một script nhỏ hoặc FastAPI endpoint) để load model và trả lời prompt.

    Ví dụ minh họa (tối giản):

    ```python
    # pseudo-example: load với transformers (thực tế có thể cần xử lý cấu hình chi tiết)
    from transformers import AutoModelForCausalLM, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained('qwen/qwen-1.5b')
    model = AutoModelForCausalLM.from_pretrained('qwen/qwen-1.5b')

    def ask_local(prompt):
        inputs = tokenizer(prompt, return_tensors='pt')
        outputs = model.generate(**inputs, max_length=512)
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
    ```

  - Lưu ý kỹ thuật & hiệu năng:
    - `QWEN 1.5B` cần nhiều RAM/VRAM để load; nếu không có GPU mạnh, có thể dùng chế độ CPU nhưng chậm.
    - Để có hiệu năng tốt, cân nhắc dùng `bitsandbytes` + `8-bit`/`4-bit` quantization hoặc triển khai trên máy có GPU.
    - Khi chạy local, nhớ kiểm soát resource và hạn chế kích thước batch/prompt để tránh OOM.

   - Vị trí code gợi ý để tích hợp: thêm endpoint FastAPI trong `backend/` để gọi model local, và tạo frontend feature tương ứng ở `frontend/src/components/LocalLLMFeature.js`.

### 7. 👁️ Visual Question Answering (VQA)

- Giới thiệu: AI Agent hỗ trợ tính năng Visual Question Answering - khả năng trả lời câu hỏi dựa trên nội dung hình ảnh. Sử dụng mô hình BLIP (Bootstrapping Language-Image Pre-training) từ Salesforce, hệ thống có thể hiểu và phân tích nội dung ảnh để đưa ra câu trả lời chính xác cho các câu hỏi của người dùng.

- Tính năng chính:
  - Trả lời câu hỏi về nội dung hình ảnh (số lượng đối tượng, màu sắc, vị trí, hoạt động...)
  - Nhận diện và mô tả các yếu tố trong ảnh
  - Hỗ trợ nhiều loại câu hỏi: "What", "How many", "Where", "What color"...
  - Xử lý cả ảnh local và ảnh từ URL

<div align="center">

![Visual Question Answering](./image/vqa.png)
*Giao diện Visual Question Answering với khả năng phân tích và trả lời câu hỏi về hình ảnh*

</div>

- Mô hình sử dụng:
  - **BLIP-VQA-Base**: Mô hình vision-language được huấn luyện trên nhiều dataset lớn
  - **Processor**: BlipProcessor để xử lý cả ảnh và text input
  - **Model**: BlipForQuestionAnswering cho task VQA

- Ví dụ sử dụng:

```python
from PIL import Image
from transformers import BlipProcessor, BlipForQuestionAnswering

# Load model và processor
processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
model = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base")

# Load ảnh
image = Image.open("example.jpg").convert('RGB')

# Đặt câu hỏi
question = "How many people are in the image?"
inputs = processor(image, question, return_tensors="pt")

# Trả lời
output = model.generate(**inputs)
answer = processor.decode(output[0], skip_special_tokens=True)
print(f"Answer: {answer}")
```

- Use cases thực tế:
  - Phân tích ảnh sản phẩm trong e-commerce
  - Hỗ trợ người khiếm thị hiểu nội dung hình ảnh
  - Kiểm tra chất lượng và đếm số lượng sản phẩm
  - Phân tích hình ảnh y tế, giáo dục
  - Tự động gắn thẻ và phân loại ảnh

- Vị trí code:
  - Backend endpoint: [backend/tools/vision_tools.py](backend/tools/vision_tools.py)
  - Frontend component: [frontend/src/components/VisionFeature.js](frontend/src/components/VisionFeature.js)

- Lưu ý kỹ thuật:
  - Yêu cầu GPU để xử lý nhanh (có thể chạy trên CPU nhưng chậm hơn)
  - Cần cài đặt thư viện: `transformers`, `Pillow`, `torch`
  - Model size: ~990MB, cần download lần đầu sử dụng
  - Hỗ trợ batch processing để xử lý nhiều ảnh cùng lúc

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
GEMINI_API_KEY=your_actual_key_here

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

## 🔗 GitHub của tác giả

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=header"/>

<p align="center">
  <a href="https://github.com/Kietnehi">
    <img src="https://github.com/Kietnehi.png" width="140" height="140" style="border-radius: 50%; border: 4px solid #A371F7;" alt="Avatar Trương Phú Kiệt"/>
  </a>
</p>

<h3>🚀 Trương Phú Kiệt</h3>

<a href="https://github.com/Kietnehi">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=236AD3&background=00000000&center=true&vCenter=true&width=435&lines=Student+@+Sai+Gon+University;Fullstack+Dev+%26+AI+Researcher;Building+RAG+%26+Docker+Systems" alt="Typing SVG" />
</a>

<br/><br/>

<p align="center">
  <img src="https://img.shields.io/badge/SGU-Sai_Gon_University-0056D2?style=flat-square&logo=google-scholar&logoColor=white" alt="SGU"/>
  <img src="https://img.shields.io/badge/Base-Ho_Chi_Minh_City-FF4B4B?style=flat-square&logo=google-maps&logoColor=white" alt="HCMC"/>
</p>

<h3>🛠 Tech Stack</h3>
<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=docker,python,react,nodejs,mongodb,git,fastapi,pytorch&theme=light" alt="My Skills"/>
  </a>
</p>

<br/>

<h3>🌟 AI Agent Using Multimodal Open-Source Models & APIs </h3>
<p align="center">
  <a href="https://github.com/Kietnehi/RAG">
    <img src="https://img.shields.io/github/stars/Kietnehi/RAG?style=for-the-badge&color=yellow" alt="Stars"/>
    <img src="https://img.shields.io/github/forks/Kietnehi/RAG?style=for-the-badge&color=orange" alt="Forks"/>
    <img src="https://img.shields.io/github/issues/Kietnehi/RAG?style=for-the-badge&color=red" alt="Issues"/>
  </a>
</p>
<!-- Quote động -->
<p align="center">
  <img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=dark" alt="Daily Quote"/>
</p>
<p align="center">
  <i>Cảm ơn bạn đã ghé thăm! Đừng quên nhấn <b>⭐️ Star</b> để ủng hộ mình nhé.</i>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=80&section=footer"/>


</div>