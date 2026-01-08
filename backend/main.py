"""FastAPI Backend for AI Agent"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
from pathlib import Path
import io

from google import genai
from google.genai import types
from tools.web_search import search_web
from tools.wolfram_tool import wolfram_compute
from tools.data_analysis import DataAnalysisTool
from tools.vision_tools import vision_tools
from tools.local_llm import get_local_llm, get_gemini_api
from tools.summarization_tool import get_summarization_tool
from tools.speech_to_text import get_speech_tool
from tools.asr_tool import get_asr_tool
from tools.image_generation import get_image_generation_tool
from tools.video_generation import get_video_generation_tool
from tools.translation_tool import get_translation_tool
from tools.slide_generation_tool import get_slide_generation_tool
from tools.latex_ocr_tool import get_latex_ocr_tool
from config import Config

# For TTS
from gtts import gTTS
import tempfile

# Initialize FastAPI app
app = FastAPI(title="AI Agent API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
Config.validate()
client = genai.Client(api_key=Config.GEMINI_API_KEY)

# Global data analysis tool
data_tool = DataAnalysisTool()

# Create directories
UPLOAD_DIR = Path("uploads")
CHARTS_DIR = Path("charts")
OUTPUT_DIR = Path("output")
SLIDES_DIR = Path("slides")
SLIDES_IMAGES_DIR = Path("slides/images")
UPLOAD_DIR.mkdir(exist_ok=True)
CHARTS_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
SLIDES_DIR.mkdir(exist_ok=True)
SLIDES_IMAGES_DIR.mkdir(exist_ok=True)

# Mount static file directories
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/charts", StaticFiles(directory="charts"), name="charts")
app.mount("/output", StaticFiles(directory="output"), name="output")
app.mount("/slides", StaticFiles(directory="slides"), name="slides")


# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    feature: str  # "search", "math", "data_analysis"
    search_engine: Optional[str] = "duckduckgo"  # "duckduckgo" or "serpapi"


class ChatResponse(BaseModel):
    response: str
    status: str


class SearchRequest(BaseModel):
    query: str
    search_engine: str = "duckduckgo"
    max_results: int = 5


class MathRequest(BaseModel):
    query: str


class DataAnalysisRequest(BaseModel):
    action: str  # "summary", "info", "analyze_column", "create_chart", "ai_analyze"
    column: Optional[str] = None
    chart_type: Optional[str] = None
    x_col: Optional[str] = None
    y_col: Optional[str] = None
    title: Optional[str] = None
    prompt: Optional[str] = None  # For AI analysis


class SmartChatRequest(BaseModel):
    message: str
    search_engine: str = "google"  # "duckduckgo", "serpapi", "google"
    image_filenames: Optional[List[str]] = []  # Optional list of uploaded image filenames


class SmartChatResponse(BaseModel):
    response: str
    status: str
    search_performed: bool
    search_engine: Optional[str] = None


class TextToSpeechRequest(BaseModel):
    text: str
    lang: str = "vi"  # Default to Vietnamese


class LocalLLMRequest(BaseModel):
    message: str
    max_length: int = 512
    temperature: float = 0.7
    use_api: bool = False  # True for Gemini API, False for Local LLM
    api_key: Optional[str] = None  # Gemini API key
    model_name: Optional[str] = "gemini-2.5-flash"  # Gemini model name


class CreateSlidesRequest(BaseModel):
    topic: str
    num_slides: int = 5
    use_api: bool = False  # True for Gemini API, False for Local LLM
    api_key: Optional[str] = None  # Gemini API key
    model_name: Optional[str] = "gemini-2.5-flash"  # Gemini model name


class VisionRequest(BaseModel):
    action: str  # "vqa", "ocr_deepseek", or "ocr_paddle"
    image_filename: str
    question: Optional[str] = None  # For VQA only


class SummarizationRequest(BaseModel):
    text: str
    max_length: int = 130
    min_length: int = 30
    do_sample: bool = False


class SpeechToTextRequest(BaseModel):
    method: str = "auto"  # "auto", "whisper", or "google"
    language: Optional[str] = "vi"  # Language code
    translate_to_english: bool = False  # For Whisper only
    openai_api_key: Optional[str] = None  # OpenAI API key for Whisper


class TextToImageRequest(BaseModel):
    prompt: str
    width: int = 1024
    height: int = 1024


class TextToVideoRequest(BaseModel):
    prompt: str
    max_wait_time: int = 300  # Maximum wait time in seconds


class ImageToVideoRequest(BaseModel):
    image_filename: str
    prompt: Optional[str] = None
    max_wait_time: int = 300  # Maximum wait time in seconds


class ReferenceImagesToVideoRequest(BaseModel):
    image_filenames: List[str]  # List of uploaded image filenames
    prompt: str  # Required for reference mode
    max_wait_time: int = 300  # Maximum wait time in seconds


class PromptToImageToVideoRequest(BaseModel):
    prompt: str  # Prompt to generate image and video
    max_wait_time: int = 300  # Maximum wait time in seconds


class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "auto"  # 'auto' for auto-detection
    target_lang: str = "en"


class SlideGenerationRequest(BaseModel):
    num_slides: int = 10
    filenames: List[str]  # List of uploaded document filenames


class LatexOCRRequest(BaseModel):
    image_filename: str
    action: str = "convert"  # "convert", "start_service", "stop_service", "health_check"


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Agent API",
        "version": "1.0.0",
        "features": ["search", "math", "data_analysis"]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_configured": bool(Config.GEMINI_API_KEY),
        "wolfram_configured": bool(Config.WOLFRAM_APP_ID),
        "serpapi_configured": bool(Config.SERPAPI_KEY)
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint that routes to different features"""
    try:
        if request.feature == "search":
            # Web search - trả về kết quả thuần túy không qua Gemini
            results = search_web(
                request.message,
                search_engine=request.search_engine,
                max_results=5
            )
            
            return ChatResponse(
                response=results,
                status="success"
            )
        
        elif request.feature == "math":
            # Wolfram computation only - no Gemini
            wolfram_result = wolfram_compute(request.message)
            
            # Format result for text display while keeping full data for frontend
            if isinstance(wolfram_result, dict):
                formatted_text = ""
                if wolfram_result.get('text_results'):
                    formatted_text = "\n".join(wolfram_result['text_results'])
                
                if wolfram_result.get('plots'):
                    if formatted_text:
                        formatted_text += "\n\n"
                    formatted_text += f"📊 Đã tạo {len(wolfram_result['plots'])} biểu đồ"
                
                if wolfram_result.get('images'):
                    if formatted_text:
                        formatted_text += "\n\n"
                    formatted_text += f"🖼️ Đã tạo {len(wolfram_result['images'])} hình ảnh"
                
                # Return the full result object as JSON string so frontend can parse it
                import json
                return ChatResponse(
                    response=json.dumps(wolfram_result),
                    status="success"
                )
            else:
                return ChatResponse(
                    response=str(wolfram_result),
                    status="success"
                )
        
        else:
            # General AI response
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=request.message
            )
            
            return ChatResponse(
                response=response.text,
                status="success"
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/smart-chat", response_model=SmartChatResponse)
async def smart_chat(request: SmartChatRequest):
    """
    Smart chat endpoint that automatically decides when to search for information
    AI will analyze the query and determine if web search is needed
    Supports multimodal input with images
    """
    try:
        # Prepare images if any
        image_parts = []
        if request.image_filenames:
            from PIL import Image as PILImage
            for filename in request.image_filenames:
                image_path = UPLOAD_DIR / filename
                if image_path.exists():
                    # Load image and convert to Gemini format
                    img = PILImage.open(str(image_path))
                    image_parts.append(img)
        
        # First, ask AI if search is needed (only if no images)
        need_search = False
        if not image_parts:
            decision_prompt = f"""Phân tích câu hỏi sau và quyết định xem có cần tìm kiếm thông tin trên web không.

Câu hỏi: {request.message}

Trả lời CHÍNH XÁC theo format JSON sau (không thêm text nào khác):
{{"need_search": true/false, "reason": "lý do ngắn gọn"}}

Cần tìm kiếm (need_search: true) khi:
- Câu hỏi về tin tức, sự kiện hiện tại, giá cả thị trường
- Thông tin cập nhật (thời tiết, giá vàng, giá bitcoin, chứng khoán)
- Sự kiện, tin tức mới, xu hướng
- Thông tin cụ thể về sản phẩm, địa điểm, người nổi tiếng

KHÔNG cần tìm kiếm (need_search: false) khi:
- Câu hỏi về kiến thức chung, định nghĩa
- Tính toán toán học
- Câu hỏi mang tính triết lý, ý kiến cá nhân
- Lời khuyên chung không cần dữ liệu cụ thể"""

            decision_response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=decision_prompt
            )
            
            # Parse decision
            import json
            decision_text = decision_response.text.strip()
            
            # Extract JSON from response (handle markdown code blocks)
            if "```json" in decision_text:
                decision_text = decision_text.split("```json")[1].split("```")[0].strip()
            elif "```" in decision_text:
                decision_text = decision_text.split("```")[1].split("```")[0].strip()
            
            try:
                decision = json.loads(decision_text)
                need_search = decision.get("need_search", False)
            except:
                # Fallback: check for keywords
                search_keywords = ["tin tức", "hiện tại", "hôm nay", "giá", "cập nhật", "mới nhất", "thời tiết"]
                need_search = any(keyword in request.message.lower() for keyword in search_keywords)
        
        search_performed = False
        search_engine_used = None
        
        # If we have images, handle them with vision capabilities
        if image_parts:
            # Create multimodal content with images
            content_parts = []
            
            # Add text message if present
            if request.message:
                content_parts.append(request.message)
            
            # Add all images
            content_parts.extend(image_parts)
            
            # Generate response with vision
            final_response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=content_parts
            )
            
            return SmartChatResponse(
                response=final_response.text,
                status="success",
                search_performed=False,
                search_engine=None
            )
        
        if need_search:
            # Use the search engine specified by user
            search_engine = request.search_engine
            search_engine_used = search_engine
            
            if search_engine == "google":
                # Use Gemini with Google Search grounding
                search_performed = True
                
                grounding_tool = types.Tool(
                    google_search=types.GoogleSearch()
                )
                
                config = types.GenerateContentConfig(
                    tools=[grounding_tool]
                )
                
                final_response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=request.message,
                    config=config
                )
                
                return SmartChatResponse(
                    response=final_response.text,
                    status="success",
                    search_performed=search_performed,
                    search_engine=search_engine_used
                )
            else:
                # Use DuckDuckGo or SerpAPI
                search_results = search_web(
                    request.message,
                    search_engine=search_engine,
                    max_results=5
                )
                search_performed = True
                
                # Generate answer based on search results
                answer_prompt = f"""Dựa trên kết quả tìm kiếm, hãy trả lời câu hỏi một cách chi tiết và hữu ích.

Câu hỏi: {request.message}

Kết quả tìm kiếm:
{search_results}

Hãy:
1. Tổng hợp thông tin từ kết quả tìm kiếm
2. Trả lời trực tiếp câu hỏi
3. Đưa ra lời khuyên, phân tích nếu được yêu cầu
4. Sử dụng định dạng Markdown để dễ đọc
5. Trả lời bằng tiếng Việt

Trả lời:"""
                
                # Generate final answer for DuckDuckGo/SerpAPI
                final_response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=answer_prompt
                )
                
                return SmartChatResponse(
                    response=final_response.text,
                    status="success",
                    search_performed=search_performed,
                    search_engine=search_engine_used
                )
            
        else:
            # Answer without search
            answer_prompt = f"""Trả lời câu hỏi sau một cách chi tiết và hữu ích:

{request.message}

Hãy:
1. Trả lời dựa trên kiến thức của bạn
2. Sử dụng định dạng Markdown
3. Trả lời bằng tiếng Việt

Trả lời:"""
        
        # Generate final answer
        final_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=answer_prompt
        )
        
        return SmartChatResponse(
            response=final_response.text,
            status="success",
            search_performed=search_performed,
            search_engine=search_engine_used
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def web_search(request: SearchRequest):
    """Web search endpoint"""
    try:
        results = search_web(
            request.query,
            search_engine=request.search_engine,
            max_results=request.max_results
        )
        return {"results": results, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/math")
async def math_compute(request: MathRequest):
    """Wolfram Alpha computation endpoint"""
    try:
        result = wolfram_compute(request.query)
        return {
            "result": result, 
            "status": "success",
            "text_results": result.get('text_results', []),
            "images": result.get('images', []),
            "plots": result.get('plots', []),
            "success": result.get('success', False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """Upload CSV file for analysis"""
    try:
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Load and analyze
        summary = data_tool.load_csv(str(file_path))
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "summary": summary,
            "columns": data_tool.df.columns.tolist() if data_tool.df is not None else [],
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-data")
async def analyze_data(request: DataAnalysisRequest):
    """Analyze uploaded CSV data"""
    try:
        if data_tool.df is None:
            raise HTTPException(status_code=400, detail="No CSV file loaded")
        
        if request.action == "summary":
            result = data_tool.get_summary()
        elif request.action == "info":
            result = data_tool.get_info()
        elif request.action == "analyze_column":
            if not request.column:
                raise HTTPException(status_code=400, detail="Column name required")
            result = data_tool.analyze_column(request.column)
        elif request.action == "ai_analyze":
            if not request.prompt:
                raise HTTPException(status_code=400, detail="Prompt required for AI analysis")
            result = data_tool.analyze_with_ai(request.prompt)
        elif request.action == "create_chart":
            import time
            # Use timestamp to create unique filename
            output_filename = f"chart_{request.chart_type or 'bar'}_{int(time.time())}"
            result = data_tool.create_chart(
                chart_type=request.chart_type or "bar",
                x_col=request.x_col,
                y_col=request.y_col,
                title=request.title,
                output_file=output_filename
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        return {"result": result, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/charts/{filename}")
async def get_chart(filename: str):
    """Get generated chart image"""
    file_path = CHARTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Chart not found")
    return FileResponse(file_path)


@app.get("/charts")
async def list_charts():
    """List all generated charts"""
    charts = [f.name for f in CHARTS_DIR.glob("*.png")]
    return {"charts": charts, "status": "success"}


@app.delete("/clear-data")
async def clear_data():
    """Clear uploaded data"""
    global data_tool
    data_tool = DataAnalysisTool()
    return {"message": "Data cleared", "status": "success"}


@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech using gTTS
    Returns audio file
    """
    try:
        # Validate and clean text
        text = request.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Limit text length to avoid timeout (max ~5000 chars)
        if len(text) > 5000:
            text = text[:5000] + "..."
        
        # Remove markdown formatting for better TTS
        import re
        text = re.sub(r'[#*`_\[\]()]', '', text)
        text = re.sub(r'\n+', '. ', text)
        
        # Create TTS
        tts = gTTS(text=text, lang=request.lang, slow=False)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as fp:
            temp_path = fp.name
        
        tts.save(temp_path)
        
        # Read file content
        with open(temp_path, 'rb') as audio_file:
            audio_content = audio_file.read()
        
        # Delete temp file
        try:
            os.unlink(temp_path)
        except:
            pass
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_content),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"TTS error: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")


@app.post("/local-llm")
async def local_llm_chat(request: LocalLLMRequest):
    """
    Chat using local LLM (Qwen 1.5B) or Gemini API
    """
    try:
        if request.use_api:
            # Use Gemini API
            if not request.api_key:
                raise HTTPException(status_code=400, detail="API key is required for Gemini API")
            
            llm = get_gemini_api(request.api_key, request.model_name)
            result = llm.generate(
                prompt=request.message,
                max_length=request.max_length,
                temperature=request.temperature
            )
        else:
            # Use local LLM
            llm = get_local_llm()
            result = llm.generate(
                prompt=request.message,
                max_length=request.max_length,
                temperature=request.temperature
            )
        
        if result["success"]:
            return {
                "response": result["response"],
                "model": result["model"],
                "device": result["device"],
                "status": "success"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")


@app.post("/create-slides")
async def create_slides(request: CreateSlidesRequest):
    """
    Create presentation slides using local LLM or Gemini API
    """
    try:
        if request.use_api:
            # Use Gemini API
            if not request.api_key:
                raise HTTPException(status_code=400, detail="API key is required for Gemini API")
            
            llm = get_gemini_api(request.api_key, request.model_name)
            result = llm.create_presentation_slides(
                topic=request.topic,
                num_slides=request.num_slides
            )
        else:
            # Use local LLM
            llm = get_local_llm()
            result = llm.create_presentation_slides(
                topic=request.topic,
                num_slides=request.num_slides
            )
        
        if result["success"]:
            return {
                "filename": result["filename"],
                "title": result["title"],
                "num_slides": result["num_slides"],
                "num_images": result.get("num_images", 0),
                "model": result["model"],
                "status": "success"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slides creation error: {str(e)}")


@app.get("/download-slides/{filename}")
async def download_slides(filename: str):
    """
    Download created presentation slides
    """
    try:
        file_path = Path("slides") / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")



@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload image for vision analysis"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "message": "Image uploaded successfully",
            "filename": file.filename,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vision")
async def vision_analysis(request: VisionRequest):
    """
    Vision analysis: VQA or OCR
    """
    try:
        image_path = UPLOAD_DIR / request.image_filename
        
        if not image_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")
        
        if request.action == "vqa":
            # Visual Question Answering
            if not request.question:
                raise HTTPException(status_code=400, detail="Question required for VQA")
            
            result = vision_tools.visual_question_answering(
                str(image_path),
                request.question
            )
            
        elif request.action == "ocr_easyocr":
            # OCR - EasyOCR (simple and accurate)
            result = vision_tools.extract_text_easyocr(str(image_path))
            
        elif request.action == "ocr_paddle":
            # OCR - PaddleOCR (traditional OCR with Vietnamese support)
            result = vision_tools.extract_text_paddleocr(str(image_path))
            
        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use 'vqa', 'ocr_easyocr', or 'ocr_paddle'")
        
        return {
            "result": result,
            "status": "success" if result.get("success") else "error"
        }
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"❌ Vision Error: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Vision analysis error: {str(e)}")


@app.post("/summarization")
async def summarize_text(request: SummarizationRequest):
    """
    Text summarization using facebook/bart-large-cnn
    """
    try:
        summarizer = get_summarization_tool()
        result = summarizer.summarize(
            text=request.text,
            max_length=request.max_length,
            min_length=request.min_length,
            do_sample=request.do_sample
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "summary": result["summary"],
            "original_length": result["original_length"],
            "summary_length": result["summary_length"],
            "compression_ratio": result["compression_ratio"],
            "truncated": result.get("truncated", False),
            "model": result["model"],
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")


@app.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...),
    method: str = Form("auto"),
    language: str = Form("vi"),
    translate_to_english: bool = Form(False),
    openai_api_key: Optional[str] = Form(None)
):
    """
    Speech-to-Text endpoint supporting multiple methods:
    - OpenAI Whisper: High accuracy, can translate to English
    - Google Speech Recognition: Free, supports multiple languages
    
    Args:
        file: Audio file (wav, mp3, m4a, webm, etc.)
        method: "auto", "whisper", or "google"
        language: Language code (e.g., 'vi', 'en', 'vi-VN', 'en-US')
        translate_to_english: If True, translate to English (Whisper only)
        openai_api_key: Optional OpenAI API key for Whisper
    """
    temp_file_path = None
    
    try:
        print(f"📥 Received speech-to-text request: method={method}, language={language}")
        
        # Save uploaded file temporarily
        suffix = Path(file.filename).suffix or '.wav'
        print(f"📄 File: {file.filename}, suffix: {suffix}")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            print(f"💾 Saved to: {temp_file_path}, size: {len(content)} bytes")
        
        # Validate file size
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Audio file is empty")
        
        # Get speech tool and transcribe
        speech_tool = get_speech_tool(openai_api_key=openai_api_key)
        print(f"🎤 Starting transcription with method: {method}")
        
        result = speech_tool.transcribe(
            audio_file_path=temp_file_path,
            method=method,
            language=language,
            translate_to_english=translate_to_english
        )
        
        print(f"✅ Transcription result: {result}")
        
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        if result["success"]:
            return {
                "text": result["text"],
                "method": result["method"],
                "language": result.get("language"),
                "translated": result.get("translated", False),
                "status": "success"
            }
        else:
            error_msg = result.get("error", "Transcription failed")
            print(f"❌ Transcription failed: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
            
    except HTTPException:
        raise
    except Exception as e:
        # Clean up temp file on error
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        error_msg = f"Speech-to-text error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


# ============== ASR (Automatic Speech Recognition) Endpoints ==============

class ASRRequest(BaseModel):
    """Request model for ASR"""
    language: Optional[str] = None  # e.g., 'vi', 'en', None for auto-detect
    task: str = "transcribe"  # 'transcribe' or 'translate'
    model_name: Optional[str] = "large-v3"

@app.post("/api/asr/transcribe")
async def asr_transcribe(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    task: str = Form("transcribe"),
    model_name: str = Form("large-v3")
):
    """
    Transcribe audio using Whisper model
    """
    temp_file_path = None
    try:
        print(f"📝 ASR Transcription request - Language: {language}, Task: {task}, Model: {model_name}")
        
        # Save uploaded file temporarily
        temp_file_path = f"temp_{audio.filename}"
        with open(temp_file_path, "wb") as f:
            content = await audio.read()
            f.write(content)
        
        print(f"💾 Audio file saved: {temp_file_path}")
        
        # Get ASR tool
        asr_tool = get_asr_tool(model_name=model_name)
        
        # Transcribe
        result = asr_tool.transcribe_audio(
            audio_path=temp_file_path,
            language=language,
            task=task
        )
        
        print(f"✅ ASR result: {result}")
        
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        if result["success"]:
            return {
                "transcription": result["transcription"],
                "language": result["language"],
                "task": result["task"],
                "model": result["model"],
                "device": result["device"],
                "status": "success"
            }
        else:
            error_msg = result.get("error", "ASR transcription failed")
            print(f"❌ ASR failed: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
            
    except HTTPException:
        raise
    except Exception as e:
        # Clean up temp file on error
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        error_msg = f"ASR error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


# ==================== IMAGE GENERATION ENDPOINT ====================

@app.post("/text-to-image")
async def text_to_image(request: TextToImageRequest):
    """
    Generate image from text prompt using Clipdrop API
    """
    try:
        print(f"🎨 Text-to-Image request - Prompt: {request.prompt}")
        
        # Get image generation tool
        img_tool = get_image_generation_tool(Config.CLIPDROP_API_KEY)
        
        # Generate image
        result = img_tool.text_to_image(
            prompt=request.prompt,
            width=request.width,
            height=request.height
        )
        
        if result["status"] == "success":
            print(f"✅ Image generated: {result['image_path']}")
            return {
                "status": "success",
                "message": result["message"],
                "image_url": f"/output/{Path(result['image_path']).name}"
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Text-to-Image error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


# ==================== VIDEO GENERATION ENDPOINT ====================

@app.post("/text-to-video")
async def text_to_video(request: TextToVideoRequest):
    """
    Generate video from text prompt using Google Veo 3.1
    """
    try:
        print(f"🎬 Text-to-Video request - Prompt: {request.prompt}")
        
        # Get video generation tool
        video_tool = get_video_generation_tool(Config.GEMINI_API_KEY)
        
        # Generate video
        result = video_tool.text_to_video(
            prompt=request.prompt,
            max_wait_time=request.max_wait_time
        )
        
        if result["status"] == "success":
            print(f"✅ Video generated: {result['video_path']}")
            return {
                "status": "success",
                "message": result["message"],
                "video_url": f"/output/{Path(result['video_path']).name}",
                "generation_time": result.get("generation_time", 0)
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Text-to-Video error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/image-to-video")
async def image_to_video(request: ImageToVideoRequest):
    """
    Generate video from image using Google Veo 3.1
    """
    try:
        print(f"🎬 Image-to-Video request - Image: {request.image_filename}")
        
        # Construct image path
        image_path = UPLOAD_DIR / request.image_filename
        
        if not image_path.exists():
            raise HTTPException(status_code=404, detail=f"Image not found: {request.image_filename}")
        
        # Get video generation tool
        video_tool = get_video_generation_tool(Config.GEMINI_API_KEY)
        
        # Generate video
        result = video_tool.image_to_video(
            image_path=str(image_path),
            prompt=request.prompt,
            max_wait_time=request.max_wait_time,
            mode="single"
        )
        
        if result["status"] == "success":
            print(f"✅ Video generated: {result['video_path']}")
            return {
                "status": "success",
                "message": result["message"],
                "video_url": f"/output/{Path(result['video_path']).name}",
                "generation_time": result.get("generation_time", 0)
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Image-to-Video error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/reference-images-to-video")
async def reference_images_to_video(request: ReferenceImagesToVideoRequest):
    """
    Generate video from multiple reference images using Google Veo 3.1
    """
    try:
        print(f"🎬 Reference Images-to-Video request - {len(request.image_filenames)} images")
        
        # Construct image paths
        image_paths = []
        for filename in request.image_filenames:
            image_path = UPLOAD_DIR / filename
            if not image_path.exists():
                raise HTTPException(status_code=404, detail=f"Image not found: {filename}")
            image_paths.append(str(image_path))
        
        # Get video generation tool
        video_tool = get_video_generation_tool(Config.GEMINI_API_KEY)
        
        # Generate video with reference images
        result = video_tool.reference_images_to_video(
            image_paths=image_paths,
            prompt=request.prompt,
            max_wait_time=request.max_wait_time
        )
        
        if result["status"] == "success":
            print(f"✅ Video generated: {result['video_path']}")
            return {
                "status": "success",
                "message": result["message"],
                "video_url": f"/output/{Path(result['video_path']).name}",
                "generation_time": result.get("generation_time", 0)
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Reference Images-to-Video error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/prompt-to-image-to-video")
async def prompt_to_image_to_video(request: PromptToImageToVideoRequest):
    """
    Generate image from prompt then generate video using Google Veo 3.1
    """
    try:
        print(f"🎬 Prompt-to-Image-to-Video request - Prompt: {request.prompt}")
        
        # Get video generation tool
        video_tool = get_video_generation_tool(Config.GEMINI_API_KEY)
        
        # Generate image then video from prompt
        result = video_tool.prompt_to_image_to_video(
            prompt=request.prompt,
            max_wait_time=request.max_wait_time
        )
        
        if result["status"] == "success":
            print(f"✅ Video generated: {result['video_path']}")
            return {
                "status": "success",
                "message": result["message"],
                "video_url": f"/output/{Path(result['video_path']).name}",
                "generated_image_url": f"/output/{Path(result['generated_image_path']).name}",
                "generation_time": result.get("generation_time", 0)
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Prompt-to-Image-to-Video error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/translate")
async def translate_text(request: TranslationRequest):
    """
    Translate text using Google Translate
    Supports auto language detection and all Google Translate languages
    """
    try:
        tool = get_translation_tool()
        result = await tool.translate_async(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
        
        if result["success"]:
            return {
                "original_text": result["original_text"],
                "translated_text": result["translated_text"],
                "source_language": {
                    "code": result["source_language_code"],
                    "name": result["source_language_name"]
                },
                "target_language": {
                    "code": result["target_language_code"],
                    "name": result["target_language_name"]
                },
                "pronunciation": result.get("pronunciation"),
                "status": "success"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Translation failed"))
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Translation error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/translation/languages")
async def get_supported_languages():
    """
    Get all supported languages for translation
    """
    try:
        tool = get_translation_tool()
        result = tool.get_supported_languages()
        
        if result["success"]:
            return {
                "languages": result["languages"],
                "count": result["count"],
                "status": "success"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to get languages")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/translation/detect")
async def detect_language(text: str = Form(...)):
    """
    Detect language of given text
    """
    try:
        tool = get_translation_tool()
        result = await tool.detect_language_async(text)
        
        if result["success"]:
            return {
                "language_code": result["language_code"],
                "language_name": result["language_name"],
                "confidence": result["confidence"],
                "status": "success"
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Detection failed"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file (document, image, etc.) for processing
    Supports: PDF, DOCX, TXT, PNG, JPG, JPEG, GIF
    """
    try:
        # Validate file extension
        allowed_extensions = {'.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.bmp'}
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Save uploaded file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "size": file_path.stat().st_size,
            "type": file_ext,
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")


@app.post("/generate-slides")
async def generate_slides_from_documents(request: SlideGenerationRequest):
    """
    Generate presentation slides from multiple uploaded documents
    
    This endpoint:
    1. Accepts multiple document files (PDF, DOCX, TXT, images)
    2. Extracts text and images from all documents
    3. Uses Gemini AI to analyze content and create a structured outline
    4. Generates a professional PowerPoint presentation
    5. Returns the presentation file for download
    """
    try:
        # Validate that files exist
        file_paths = []
        for filename in request.filenames:
            file_path = UPLOAD_DIR / filename
            if not file_path.exists():
                raise HTTPException(
                    status_code=404, 
                    detail=f"File not found: {filename}"
                )
            file_paths.append(str(file_path))
        
        if not file_paths:
            raise HTTPException(
                status_code=400,
                detail="No valid files provided"
            )
        
        # Create unique filename for output
        import time
        timestamp = int(time.time())
        output_filename = f"presentation_{timestamp}.pptx"
        output_path = str(SLIDES_DIR / output_filename)
        images_dir = str(SLIDES_IMAGES_DIR)
        
        # Initialize slide generation tool
        slide_tool = get_slide_generation_tool(api_key=Config.GEMINI_API_KEY)
        
        # Generate slides
        print(f"🎨 Generating presentation from {len(file_paths)} document(s)...")
        result = slide_tool.generate_slides_from_documents(
            file_paths=file_paths,
            output_path=output_path,
            num_slides=request.num_slides,
            images_dir=images_dir
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Presentation generated successfully",
                "presentation_url": f"/slides/{output_filename}",
                "filename": output_filename,
                "num_slides": result["num_slides"],
                "num_images": result["num_images"],
                "title": result["title"],
                "status": "success"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to generate presentation")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Slide generation error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


@app.get("/slides/{filename}")
async def download_presentation(filename: str):
    """
    Download generated presentation file
    """
    file_path = SLIDES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Presentation not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )


@app.post("/latex-ocr")
async def latex_ocr_convert(request: LatexOCRRequest):
    """
    LaTeX OCR: Convert image to LaTeX code
    Supports actions: convert, start_service, stop_service, health_check
    """
    try:
        latex_tool = get_latex_ocr_tool()
        
        if request.action == "health_check":
            # Check service health
            health = latex_tool.health_check()
            return {
                "status": "success",
                "health": health
            }
        
        elif request.action == "start_service":
            # Start the pix2tex container
            result = latex_tool.start_container()
            return result
        
        elif request.action == "stop_service":
            # Stop the pix2tex container
            result = latex_tool.stop_container()
            return result
        
        elif request.action == "convert":
            # Convert image to LaTeX
            image_path = UPLOAD_DIR / request.image_filename
            
            if not image_path.exists():
                raise HTTPException(status_code=404, detail="Image not found")
            
            result = latex_tool.get_latex_from_image(str(image_path))
            
            if result["status"] == "success":
                return {
                    "latex_code": result["latex_code"],
                    "message": result["message"],
                    "status": "success"
                }
            else:
                raise HTTPException(status_code=500, detail=result["message"])
        
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid action. Use 'convert', 'start_service', 'stop_service', or 'health_check'"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"LaTeX OCR error: {str(e)}"
        print(f"❌ Error: {error_msg}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Import string thay vì object để hỗ trợ reload
        host="0.0.0.0", 
        port=8000,
        reload=True  # Auto-reload khi có thay đổi code
    )
