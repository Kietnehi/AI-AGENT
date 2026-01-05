"""FastAPI Backend for AI Agent"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
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
UPLOAD_DIR.mkdir(exist_ok=True)
CHARTS_DIR.mkdir(exist_ok=True)


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
    """
    try:
        # First, ask AI if search is needed
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
    Chat using local LLM (Qwen 2.5B) or Gemini API
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
            
        elif request.action == "ocr_deepseek":
            # OCR - DeepSeek style (text-to-text multimodal)
            result = vision_tools.extract_text_deepseek_ocr(str(image_path))
            
        elif request.action == "ocr_paddle":
            # OCR - PaddleOCR (traditional OCR with Vietnamese support)
            result = vision_tools.extract_text_paddleocr(str(image_path))
            
        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use 'vqa', 'ocr_deepseek', or 'ocr_paddle'")
        
        return {
            "result": result,
            "status": "success" if result.get("success") else "error"
        }
        
    except Exception as e:
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Import string thay vì object để hỗ trợ reload
        host="0.0.0.0", 
        port=8000,
        reload=True  # Auto-reload khi có thay đổi code
    )
