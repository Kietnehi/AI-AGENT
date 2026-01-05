# 🐳 Docker Guide - Tối ưu cho Project với nhiều AI Models

## 📋 Tổng quan

Project này sử dụng nhiều AI models (Qwen LLM, BLIP Vision, OCR models). Để tránh lag khi build Docker, tôi đã tối ưu:

### ✨ Các tối ưu hóa chính:

1. **Multi-stage build**: Giảm kích thước image cuối cùng
2. **Layer caching**: Tận dụng cache của Docker layers
3. **Volume mounting**: Models được cache và không cần download lại
4. **Selective copying**: Chỉ copy files cần thiết (`.dockerignore`)

## 🚀 Cách sử dụng

### 1. Build lần đầu (sẽ mất thời gian vì phải download models)

```bash
# Build all services
docker-compose build

# Hoặc build riêng từng service
docker-compose build backend
docker-compose build frontend
```

### 2. Chạy services

```bash
# Start all services
docker-compose up

# Chạy background
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### 3. Lần chạy sau (nhanh hơn nhiều vì đã có cache)

```bash
docker-compose up
```

## 💡 Mẹo tối ưu hóa

### 1. **Sử dụng BuildKit** (build nhanh hơn 2-3 lần)

```bash
# Windows PowerShell
$env:DOCKER_BUILDKIT=1
docker-compose build

# Linux/Mac
DOCKER_BUILDKIT=1 docker-compose build
```

### 2. **Pre-download models** (tùy chọn)

Nếu muốn download models trước để lần build đầu nhanh hơn:

```bash
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
.\venv\Scripts\activate  # Windows

# Install requirements
pip install -r requirements.txt

# Chạy script để download models
python -c "
from transformers import AutoTokenizer, AutoModelForCausalLM
from transformers import BlipProcessor, BlipForQuestionAnswering

# Download Qwen model
print('Downloading Qwen model...')
AutoTokenizer.from_pretrained('Qwen/Qwen2.5-1.5B-Instruct')
AutoModelForCausalLM.from_pretrained('Qwen/Qwen2.5-1.5B-Instruct')

# Download BLIP model
print('Downloading BLIP model...')
BlipProcessor.from_pretrained('Salesforce/blip-vqa-base')
BlipForQuestionAnswering.from_pretrained('Salesforce/blip-vqa-base')

print('✅ Models downloaded!')
"
```

### 3. **Sử dụng volumes để persist models**

Models sẽ được lưu trong Docker volumes:
- `huggingface_cache`: Chứa Qwen, BLIP models (~2-3GB)
- `paddleocr_cache`: Chứa PaddleOCR models (~10MB)
- `easyocr_cache`: Chứa EasyOCR models (~100MB)

**Lần build/run đầu tiên**: Models sẽ được download (mất 10-30 phút tùy mạng)
**Các lần sau**: Sử dụng models đã cache (chỉ mất vài giây)

### 4. **Xóa cache để rebuild từ đầu**

```bash
# Xóa tất cả (bao gồm models cache)
docker-compose down -v

# Rebuild
docker-compose build --no-cache
```

### 5. **Build với GPU support** (nếu có NVIDIA GPU)

Uncomment các dòng GPU trong `docker-compose.yml`:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

Yêu cầu:
- Cài đặt NVIDIA Docker runtime
- Driver NVIDIA >= 450.x

## 📊 Thời gian build ước tính

### Lần đầu tiên:
- **Backend**: 15-30 phút (tùy tốc độ mạng để download models)
- **Frontend**: 3-5 phút
- **Tổng**: ~20-35 phút

### Lần sau (với cache):
- **Backend**: 30-60 giây (chỉ copy code mới)
- **Frontend**: 20-40 giây
- **Tổng**: ~1-2 phút

## 🔍 Troubleshooting

### Lỗi: Out of memory khi build

**Giải pháp**: Tăng memory cho Docker Desktop
- Windows/Mac: Settings → Resources → Memory (khuyến nghị >= 8GB)

### Lỗi: Models download chậm

**Giải pháp**: 
1. Sử dụng VPN nếu bị chặn Hugging Face
2. Download models thủ công (xem mục "Pre-download models")
3. Sử dụng mirror của Hugging Face (China):
   ```bash
   export HF_ENDPOINT=https://hf-mirror.com
   ```

### Lỗi: Build bị stuck

**Giải pháp**:
```bash
# Stop tất cả
docker-compose down

# Clean up
docker system prune -a

# Rebuild với verbose
docker-compose build --no-cache --progress=plain
```

## 📝 Files quan trọng

- `backend/Dockerfile`: Backend image definition
- `frontend/Dockerfile`: Frontend image definition  
- `docker-compose.yml`: Orchestration configuration
- `backend/.dockerignore`: Files không copy vào backend image
- `frontend/.dockerignore`: Files không copy vào frontend image

## 🎯 Best Practices

1. **Không commit models vào Git**: Models rất nặng (1-3GB), để Docker download
2. **Sử dụng `.dockerignore`**: Tránh copy files không cần thiết
3. **Multi-stage build**: Giảm kích thước final image
4. **Volume mounting**: Persist data và cache
5. **BuildKit**: Enable để build nhanh hơn

## 📞 Hỗ trợ

Nếu gặp vấn đề, check:
1. Docker Desktop có đủ resources (RAM, Disk)
2. Internet connection stable (để download models)
3. Logs: `docker-compose logs -f`
