"""FastAPI Backend for AI Agent"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
from pathlib import Path

from google import genai
from google.genai import types
from tools.web_search import search_web
from tools.wolfram_tool import wolfram_compute
from tools.data_analysis import DataAnalysisTool
from config import Config

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",  # Import string thay vì object để hỗ trợ reload
        host="0.0.0.0", 
        port=8000,
        reload=True  # Auto-reload khi có thay đổi code
    )
