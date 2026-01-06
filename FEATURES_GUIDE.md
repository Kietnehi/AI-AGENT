# Hướng Dẫn Cài Đặt và Sử Dụng Các Tính Năng Mới

## 🎉 Các Tính Năng Đã Thêm

### 1. 🔊 Text-to-Speech (Đọc Kết Quả AI)
- Thêm nút **"Nghe"** ở mỗi phản hồi của AI trong Smart Chat
- Sử dụng gTTS (Google Text-to-Speech) để chuyển văn bản thành giọng nói
- Hỗ trợ tiếng Việt

### 2. 🖥️ Local LLM với Qwen 1.5B
- Cho phép người dùng chạy mô hình AI local trên máy
- Không cần internet sau khi tải model
- Sử dụng Qwen 2.5-1.5B-Instruct (phiên bản nhẹ hơn)
- Tự động detect GPU/CPU

### 3. 👁️ Vision AI (VQA - Visual Question Answering)
- Hỏi đáp về nội dung hình ảnh
- Sử dụng model Llava-Phi2
- Upload ảnh và đặt câu hỏi bằng tiếng Anh

### 4. 📄 OCR (Trích Xuất Văn Bản từ Ảnh)
- Trích xuất văn bản từ hình ảnh
- Sử dụng DeepSeek-OCR model
- Hỗ trợ nhiều loại hình ảnh

## 📦 Cài Đặt

### Backend

1. **Cập nhật dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Lưu ý:** Các models sẽ tự động tải về khi sử dụng lần đầu:
- Qwen 2.5-1.5B-Instruct (~3GB)
- Llava-Phi2 cho VQA (~6GB)
- DeepSeek-OCR cho OCR (~2GB)

2. **Khởi động backend:**
```bash
python main.py
```

### Frontend

Không cần cài thêm gì, frontend đã có sẵn các component mới.

## 🚀 Sử Dụng

### Text-to-Speech
1. Mở **Smart Chat**
2. Gửi tin nhắn và nhận phản hồi từ AI
3. Click nút **"Nghe"** để nghe AI đọc kết quả
4. Audio sẽ tự động phát

### Local LLM (Qwen 1.5B)
1. Click vào tab **"Local LLM"** trong menu
2. Nhập tin nhắn của bạn
3. Click **"Gửi"**
4. Lần đầu sẽ tải model (mất vài phút)
5. Sau đó AI sẽ trả lời từ model local

**Ưu điểm:**
- ✅ Chạy offline (sau khi tải model)
- ✅ Bảo mật (dữ liệu không gửi lên server)
- ✅ Miễn phí (không tốn API)

**Nhược điểm:**
- ⚠️ Cần RAM/VRAM (khuyến nghị >= 8GB)
- ⚠️ Chậm hơn cloud API
- ⚠️ Model nhỏ hơn có thể kém thông minh hơn

### Vision AI (VQA)
1. Click vào tab **"Vision AI"**
2. Chọn **"Hỏi Đáp Về Ảnh (VQA)"**
3. Click **"Chọn Ảnh"** và chọn file
4. Click **"Tải Lên"**
5. Nhập câu hỏi bằng tiếng Anh (ví dụ: "What is in this image?")
6. Click **"Trả Lời Câu Hỏi"**
7. Lần đầu sẽ tải model (mất vài phút)
8. AI sẽ trả lời câu hỏi về ảnh

**Ví dụ câu hỏi:**
- "What objects are in this image?"
- "Describe this image"
- "What color is the car?"
- "How many people are there?"

### OCR (Trích Xuất Văn Bản)
1. Click vào tab **"Vision AI"**
2. Chọn **"Trích Xuất Văn Bản (OCR)"**
3. Click **"Chọn Ảnh"** và chọn file ảnh có chữ
4. Click **"Tải Lên"**
5. Click **"Trích Xuất Văn Bản"**
6. Lần đầu sẽ tải model (mất vài phút)
7. Văn bản sẽ được trích xuất và hiển thị

**Thích hợp cho:**
- Ảnh chụp tài liệu
- Screenshot có text
- Hóa đơn, biển báo
- Bất kỳ ảnh nào có chữ

## ⚙️ Yêu Cầu Hệ Thống

### Tối Thiểu:
- RAM: 8GB
- Disk: 15GB trống (cho models)
- CPU: Intel i5 hoặc tương đương

### Khuyến Nghị:
- RAM: 16GB+
- GPU: NVIDIA với 6GB+ VRAM (sử dụng CUDA)
- Disk: SSD với 20GB+ trống
- CPU: Intel i7 hoặc tương đương

### Kiểm Tra GPU Support:
```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'No GPU'}")
```

## 🔧 Cấu Hình

### Thay Đổi Model LLM

Trong `backend/tools/local_llm.py`, bạn có thể thay đổi model:

```python
# Mặc định (nhẹ, nhanh)
local_llm = LocalLLM(model_name="Qwen/Qwen2.5-1.5B-Instruct")

# Hoặc dùng 3B (thông minh hơn nhưng nặng hơn)
local_llm = LocalLLM(model_name="Qwen/Qwen2.5-3B-Instruct")

# Hoặc 7B (rất thông minh nhưng cần GPU mạnh)
local_llm = LocalLLM(model_name="Qwen/Qwen2.5-7B-Instruct")
```

### Thay Đổi Voice Language

Trong `backend/main.py`, endpoint `/text-to-speech`:

```python
# Tiếng Việt (mặc định)
tts = gTTS(text=request.text, lang='vi')

# Tiếng Anh
tts = gTTS(text=request.text, lang='en')
```

## 📝 API Endpoints Mới

### 1. Text-to-Speech
```
POST /text-to-speech
Body: {
  "text": "Văn bản cần đọc",
  "lang": "vi"
}
Response: Audio file (MP3)
```

### 2. Local LLM
```
POST /local-llm
Body: {
  "message": "Tin nhắn của bạn",
  "max_length": 512,
  "temperature": 0.7
}
Response: {
  "response": "Phản hồi từ AI",
  "model": "Qwen/Qwen2.5-1.5B-Instruct",
  "device": "cuda/cpu",
  "status": "success"
}
```

### 3. Upload Image
```
POST /upload-image
Body: FormData with image file
Response: {
  "message": "Image uploaded successfully",
  "filename": "image.jpg",
  "status": "success"
}
```

### 4. Vision Analysis
```
POST /vision
Body: {
  "action": "vqa",  // or "ocr"
  "image_filename": "image.jpg",
  "question": "What is this?"  // for VQA only
}
Response: {
  "result": {
    "success": true,
    "answer": "...",  // for VQA
    "text": "..."     // for OCR
  },
  "status": "success"
}
```

## 🐛 Troubleshooting

### Model tải chậm
- Models tải từ Hugging Face, cần internet tốc độ cao
- Lần đầu tải sẽ lâu (có thể 10-30 phút)
- Các lần sau sẽ dùng cache, nhanh hơn

### Out of Memory (OOM)
- Giảm `max_length` trong Local LLM
- Đóng các ứng dụng khác đang chạy
- Dùng model nhỏ hơn (1.5B thay vì 3B/7B)
- Chạy trên CPU nếu GPU không đủ

### Lỗi CUDA
```bash
# Cài đặt PyTorch với CUDA support
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Model không load được
```bash
# Clear cache và tải lại
rm -rf ~/.cache/huggingface/
python -c "from transformers import AutoModel; AutoModel.from_pretrained('model_name')"
```

## 📊 So Sánh Models

| Feature | API (Gemini) | Local (Qwen 1.5B) |
|---------|--------------|-------------------|
| Tốc độ | ⚡⚡⚡ Nhanh | 🐌 Chậm |
| Offline | ❌ Cần internet | ✅ Không cần |
| Chi phí | 💰 Tốn API | ✅ Miễn phí |
| Bảo mật | ⚠️ Gửi lên server | ✅ Local |
| Thông minh | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Yêu cầu | 🔌 Internet | 💻 RAM/GPU |

## 🎯 Use Cases

### Smart Chat + TTS
- Trợ lý ảo có giọng nói
- Đọc tin tức, báo cáo
- Học ngoại ngữ

### Local LLM
- Xử lý dữ liệu nhạy cảm
- Môi trường không có internet
- Tiết kiệm chi phí API

### Vision AI (VQA)
- Phân tích ảnh sản phẩm
- Hỗ trợ người khiếm thị
- Kiểm tra chất lượng ảnh

### OCR
- Số hóa tài liệu giấy
- Đọc hóa đơn, biên lai
- Trích xuất text từ screenshot

## 📚 Resources

- [Qwen Models](https://huggingface.co/Qwen)
- [Llava-Phi2](https://huggingface.co/Navyabhat/Llava-Phi2)
- [DeepSeek-OCR](https://huggingface.co/deepseek-ai/DeepSeek-OCR)
- [gTTS Documentation](https://gtts.readthedocs.io/)

## 🤝 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Log của backend (terminal chạy `python main.py`)
2. Console của browser (F12)
3. Requirements đã cài đủ chưa
4. System có đủ RAM/GPU chưa

---

**Chúc bạn sử dụng vui vẻ! 🎉**
