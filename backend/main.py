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
            # Web search
            results = search_web(
                request.message,
                search_engine=request.search_engine,
                max_results=5
            )
            
            # Use Gemini to summarize and answer
            prompt = f"""Dựa trên kết quả tìm kiếm sau, hãy trả lời câu hỏi của người dùng một cách ngắn gọn và chính xác.

Câu hỏi: {request.message}

Kết quả tìm kiếm:
{results}

Trả lời bằng tiếng Việt:"""
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            return ChatResponse(
                response=response.text,
                status="success"
            )
        
        elif request.feature == "math":
            # Wolfram computation
            wolfram_result = wolfram_compute(request.message)
            
            # Use Gemini to explain the result
            prompt = f"""Giải thích kết quả tính toán sau một cách dễ hiểu:

Câu hỏi: {request.message}
Kết quả từ Wolfram Alpha: {wolfram_result}

Giải thích bằng tiếng Việt:"""
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            return ChatResponse(
                response=f"🧮 **Kết quả tính toán:**\n\n{wolfram_result}\n\n📝 **Giải thích:**\n\n{response.text}",
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
        return {"result": result, "status": "success"}
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
