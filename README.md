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

## 🐳 Cài Đặt & Chạy với Docker

> **💡 Khuyến nghị:** Sử dụng Docker để triển khai nhanh chóng, tránh các vấn đề về môi trường và dependencies!

### 📦 Docker Images & Containers

Sau khi build thành công, hệ thống sẽ có các Docker images và containers như sau:

<p align="center">
  <img src="./image/dockerimage.png" width="45%" alt="Docker Image"/>
</p>

<p align="center">
  <img src="./image/dockercontainer.png" width="45%" alt="Docker Container"/>
</p>

<p align="center">
  <em>Hình: Docker image (trên) và Docker container (dưới) của hệ thống AI Agent</em>
</p>

### 🚀 Quick Start với Docker

#### **Bước 1: Cài đặt Docker**

- **Windows/Mac**: Tải [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: 
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  ```

#### **Bước 2: Cấu hình API Keys**

Tạo file `.env` trong thư mục `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
WOLFRAM_APP_ID=your_wolfram_app_id_here
SERPAPI_KEY=your_serpapi_key_here
SEARCH_ENGINE=duckduckgo
```

#### **Bước 3: Build và Chạy**

```bash
# Build và start tất cả services
docker-compose up --build

# Hoặc chạy background
docker-compose up -d --build
```

#### **Bước 4: Truy cập ứng dụng**

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

#### **Các lệnh Docker hữu ích:**

```bash
# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Rebuild một service cụ thể
docker-compose up -d --build frontend
docker-compose up -d --build backend

# Xem trạng thái containers
docker ps
```

### 💡 Tối ưu hóa Docker

- **BuildKit**: Build nhanh hơn 2-3 lần
  ```bash
  # Windows PowerShell
  $env:DOCKER_BUILDKIT=1
  docker-compose build
  
  # Linux/Mac
  DOCKER_BUILDKIT=1 docker-compose build
  ```

- **Models Cache**: Models sẽ được lưu trong Docker volumes, không cần download lại:
  - `huggingface_cache`: Chứa Qwen, BLIP models (~2-3GB)
  - `paddleocr_cache`: Chứa PaddleOCR models (~10MB)  
  - `easyocr_cache`: Chứa EasyOCR models (~100MB)

📖 **Chi tiết về tối ưu hóa Docker**: Xem [README_DOCKER.md](README_DOCKER.md) để tìm hiểu thêm về multi-stage build, layer caching, và các mẹo tối ưu.

---

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

<div style="display: flex; justify-content: center; gap: 20px;">
  <div style="flex: 1; text-align: center;">
    <img src="./image/aiagent.png" style="width: 100%; height: auto;">
    <p><em>Giao diện phân tích dữ liệu</em></p>
  </div>

  <div style="flex: 1; text-align: center;">
    <img src="./image/cot.png" style="width: 100%; height: auto;">
    <p><em>Tự động tạo biểu đồ cột</em></p>
  </div>
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

  ### Speech-to-Text (Voice Input)

  - Mô tả ngắn: Ghi âm từ microphone, chuyển giọng nói thành text và tự động điền vào ô chat.

  - Vị trí: `frontend/src/components/MicrophoneButton.js`, `backend/tools/speech_to_text.py`, endpoint `/speech-to-text` trong `backend/main.py`.

  - Hướng dẫn nhanh: Click micro → nói → dừng → kiểm tra/ chỉnh sửa text → gửi.

  - Lưu ý: Trình duyệt cần hỗ trợ `MediaRecorder`; muốn nâng cao chất lượng, cấu hình backend dùng Whisper hoặc STT cloud.
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

    ![Local LLM Response](./image/localllm_response.png)
    *Local LLM Response — Ví dụ phản hồi từ Local LLM (QWEN 1.5B).*

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

  **Lưu ý về chất lượng kết quả:**

  - Khi sử dụng các mô hình open-source cỡ nhỏ (số lượng tham số ít) hoặc khi áp dụng quantization ở mức thấp như 4-bit để giảm kích thước và tiêu thụ VRAM, chất lượng đầu ra (độ chính xác, độ mạch lạc, khả năng hiểu ngữ cảnh) có thể bị suy giảm so với các mô hình lớn hơn hoặc chạy ở độ chính xác cao hơn.
  - Nếu kết quả trả về không tốt, nguyên nhân rất có thể là do sử dụng model nhỏ và/hoặc quantization 4-bit; để cải thiện, cân nhắc dùng model có kích thước lớn hơn, chạy ở FP16/FP32, hoặc giảm mức quantization (nếu tài nguyên cho phép).


  ### Tạo Slides (Slide Generation)

  - Mô tả: Tính năng tạo slide tự động từ chủ đề do người dùng nhập, sử dụng Local LLM hoặc API LLM để sinh nội dung từng slide và xuất file trình chiếu.
  - Vị trí frontend: [frontend/src/components/LocalLLMFeature.js](frontend/src/components/LocalLLMFeature.js)
  - Backend: Frontend sẽ gọi endpoint tạo slides (xem `backend/main.py` để biết chi tiết endpoint và cách backend trả về file PPTX).

  Hướng dẫn nhanh:

  1. Mở giao diện `Local LLM` trong webapp.
  2. Chọn nút **Tạo Slides**.
  3. Nhập **chủ đề** và **số lượng slides** mong muốn.
  4. Nhấn **Tạo Slides** — đợi quá trình sinh slide hoàn tất, sau đó nhấn **Tải xuống Slides** để lấy file PPTX.

  Minh họa giao diện (ví dụ):

<div align="center">

  <!-- Giao diện tạo Slides (in riêng) -->
  <div style="margin-bottom:24px; max-width:900px;">
    <h3 style="margin-bottom:12px;">Giao diện tạo Slides</h3>
    <img src="./image/createslides.png"
         style="width:100%; height:auto;"
         alt="Tạo Slides giao diện"/>
  </div>

  <!-- Bảng 2 cột -->
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <th style="width:50%; padding:16px; font-size:18px;">
        File PPTX ví dụ
      </th>
      <th style="width:50%; padding:16px; font-size:18px;">
        Slides được tạo
      </th>
    </tr>
    <tr>
      <td style="padding:16px;">
        <img src="./image/slidesppt.png"
             style="width:100%; height:auto;"
             alt="Slides PPT ví dụ"/>
      </td>
      <td style="padding:16px;">
        <img src="./image/slideduoctaotullm.png"
             style="width:100%; height:auto;"
             alt="Slides tạo từ chức năng tạo slide"/>
      </td>
    </tr>
  </table>

  <p style="margin-top:12px; font-style:italic; font-size:15px;">
    Hình: (1) Giao diện tạo Slides — (2) Ví dụ file PPTX — (3) Slides sinh bởi chức năng
  </p>

</div>


  </div>

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

### 8. 📷 Image to Text - OCR (Optical Character Recognition)

- Giới thiệu: AI Agent tích hợp hai công nghệ OCR mạnh mẽ để trích xuất văn bản từ hình ảnh: **EasyOCR** và **PaddleOCR**. Tính năng này giúp bạn chuyển đổi văn bản trong ảnh thành text có thể chỉnh sửa, hỗ trợ nhiều ngôn ngữ bao gồm tiếng Việt, tiếng Anh, và hàng chục ngôn ngữ khác.

- Tính năng chính:
  - **Hai engine OCR mạnh mẽ**: 
    - **EasyOCR**: Dễ sử dụng, hỗ trợ 80+ ngôn ngữ
    - **PaddleOCR**: Tốc độ nhanh, độ chính xác cao
  - Trích xuất văn bản từ ảnh với độ chính xác cao
  - Hỗ trợ tiếng Việt và nhiều ngôn ngữ khác
  - Xử lý cả ảnh có nhiều ngôn ngữ đan xen
  - Nhận diện văn bản in và viết tay (tùy model)
  - Xử lý ảnh từ file local hoặc URL

<div align="center">

<p align="center">
  <img src="./image/easyocr.png" width="45%" alt="EasyOCR Demo"/>
  <img src="./image/paddleocr.png" width="45%" alt="PaddleOCR Demo"/>
</p>

*Giao diện OCR với hai engine: EasyOCR (trái) và PaddleOCR (phải)*

</div>

- So sánh EasyOCR vs PaddleOCR:

| Tiêu chí | EasyOCR | PaddleOCR |
|----------|---------|-----------|
| **Dễ sử dụng** | ⭐⭐⭐⭐⭐ Rất dễ | ⭐⭐⭐⭐ Dễ |
| **Tốc độ** | ⭐⭐⭐ Trung bình | ⭐⭐⭐⭐⭐ Rất nhanh |
| **Độ chính xác** | ⭐⭐⭐⭐ Cao | ⭐⭐⭐⭐⭐ Rất cao |
| **Ngôn ngữ hỗ trợ** | 80+ ngôn ngữ | 80+ ngôn ngữ |
| **Tiếng Việt** | ✅ Tốt | ✅ Rất tốt |
| **Kích thước model** | ~100MB | ~10MB |
| **Cài đặt** | Đơn giản | Đơn giản |

- Ví dụ sử dụng EasyOCR:

```python
import easyocr

# Khởi tạo reader với tiếng Việt và tiếng Anh
reader = easyocr.Reader(['vi', 'en'], gpu=True)

# Đọc văn bản từ ảnh
results = reader.readtext('image.jpg')

# Hiển thị kết quả
for (bbox, text, confidence) in results:
    print(f"Text: {text}")
    print(f"Confidence: {confidence:.2f}")
```

- Ví dụ sử dụng PaddleOCR:

```python
from paddleocr import PaddleOCR

# Khởi tạo OCR với tiếng Việt
ocr = PaddleOCR(lang='vi', use_angle_cls=True)

# Đọc văn bản từ ảnh
result = ocr.ocr('image.jpg', cls=True)

# Hiển thị kết quả
for line in result[0]:
    text = line[1][0]
    confidence = line[1][1]
    print(f"Text: {text}")
    print(f"Confidence: {confidence:.2f}")
```

- Use cases thực tế:
  - Số hóa tài liệu, hóa đơn, biên lai
  - Trích xuất thông tin từ danh thiếp, CCCD, CMND
  - Đọc văn bản từ biển báo, bảng hiệu
  - Chuyển đổi sách, báo giấy thành văn bản số
  - Hỗ trợ người khiếm thị đọc văn bản
  - Tự động nhập liệu từ form, phiếu giấy

- Vị trí code:
  - Backend tool: [backend/tools/vision_tools.py](backend/tools/vision_tools.py)
  - Backend endpoint: [backend/main.py](backend/main.py) - `/ocr`
  - Frontend component: [frontend/src/components/VisionFeature.js](frontend/src/components/VisionFeature.js)

- Cài đặt:

```bash
# Cài đặt EasyOCR
pip install easyocr

# Cài đặt PaddleOCR
pip install paddlepaddle paddleocr
```

- Lưu ý kỹ thuật:
  - **EasyOCR**: Yêu cầu PyTorch, tốt nhất là có GPU (CUDA)
  - **PaddleOCR**: Nhẹ hơn, chạy tốt trên CPU, có hỗ trợ GPU
  - Lần đầu chạy sẽ tải model về (EasyOCR ~100MB, PaddleOCR ~10MB)
  - Để có kết quả tốt, ảnh đầu vào nên có độ phân giải cao, rõ nét
  - Hỗ trợ xử lý batch để OCR nhiều ảnh cùng lúc
  - Có thể tùy chỉnh threshold confidence để lọc kết quả

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

## **PUBLIC ID BẰNG NGROK (EXPOSE ỨNG DỤNG RA MẠNG)**

1. **Tải và cài đặt**

- Truy cập: https://ngrok.com/download và chọn bản Windows.
- Giải nén sẽ tạo file `ngrok.exe`.
- Mẹo: để chạy `ngrok` ở bất kỳ đâu, copy `ngrok.exe` vào `C:\Windows\System32` hoặc thêm vào `PATH`.

2. **Lấy API Key (Authtoken)**

- Đăng nhập: https://dashboard.ngrok.com/get-started/your-authtoken
- Copy giá trị trong mục "Your Authtoken".

3. **Cấu hình token (xác thực)**

Mở CMD/PowerShell/Git Bash và chạy:

```bash
ngrok config add-authtoken <DÁN_TOKEN_CỦA_BẠN_VÀO_ĐÂY>
```

Kết quả thành công sẽ hiển thị: "Authtoken saved...".

4. **Expose ứng dụng (chạy public tunnel)**

- Giả sử app chạy trên port `3000`. Để tránh lỗi `Invalid Host Header`, dùng:

```bash
ngrok http 3000 --host-header="localhost:3000"
```

(Thay `3000` bằng port thực tế của bạn.)

5. **Lấy link và debug**

- Copy URL công khai (ví dụ `https://xxxx.ngrok-free.dev`) và chia sẻ.
- Xem chi tiết request/response tại ngrok web UI: `http://localhost:4040`.

<figure>
  <img src="./image/ngrokhttp.png" alt="Ngrok terminal" />
  <figcaption><strong>Hình 1:</strong> Terminal khi chạy ngrok thành công</figcaption>
</figure>

<figure>
  <img src="./image/ngrok.png" alt="Ngrok web UI" />
  <figcaption><strong>Hình 2:</strong> Giao diện debug API của ngrok (http://localhost:4040)</figcaption>
</figure>

> **Ghi chú bảo mật:** Khi chia sẻ link, chỉ mở các route cần thiết và hạn chế lộ các endpoint nhạy cảm.

---
## 📄 License

**MIT License** – Bạn có thể tự do **sử dụng, chỉnh sửa và chia sẻ** dự án này.  
> 💡 Nhớ giữ lại thông báo bản quyền gốc khi phát hành lại nhé!

---

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp!  
Bạn có thể:

- 🛠 Tạo **Pull Request** để thêm tính năng hoặc sửa lỗi
- 🐛 Tạo **Issue** để báo lỗi hoặc gợi ý cải tiến
- 💬 Tham gia thảo luận và chia sẻ ý tưởng

> Mọi góp ý đều quý giá, giúp dự án ngày càng tốt hơn! ✨

---

## 📞 Liên Hệ

Nếu gặp vấn đề hoặc có câu hỏi:  

- 📨 Tạo **Issue** trên [GitHub](https://github.com/Kietnehi/AI-AGENT/issues)  
- 💌 Hoặc gửi email đến: `truongquockiet1211@gmail.com` (tuỳ bạn muốn)

> Tôi sẽ phản hồi sớm nhất có thể!

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
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=236AD3&background=00000000&center=true&vCenter=true&width=435&lines=Student+@+Sai+Gon+University;Fullstack+Dev+%26+AI+Researcher;Building+AI-AGENT+%26+Docker+Systems" alt="Typing SVG" />
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
  <a href="https://github.com/Kietnehi/AI-AGENT">
    <img src="https://img.shields.io/github/stars/Kietnehi/AI-AGENT?style=for-the-badge&color=yellow" alt="Stars"/>
    <img src="https://img.shields.io/github/forks/Kietnehi/AI-AGENT?style=for-the-badge&color=orange" alt="Forks"/>
    <img src="https://img.shields.io/github/issues/Kietnehi/AI-AGENT?style=for-the-badge&color=red" alt="Issues"/>
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