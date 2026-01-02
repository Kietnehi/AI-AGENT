"""Configuration module for AI Agent"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for AI Agent"""
    
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    WOLFRAM_APP_ID = os.getenv("WOLFRAM_APP_ID")
    SERPAPI_KEY = os.getenv("SERPAPI_KEY")
    
    # Search Engine Configuration
    SEARCH_ENGINE = os.getenv("SEARCH_ENGINE", "duckduckgo")  # duckduckgo or serpapi
    
    # Data Analysis Configuration
    MAX_CSV_SIZE_MB = 100
    CHART_OUTPUT_DIR = "charts"
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required in .env file")
        
        if not cls.WOLFRAM_APP_ID:
            print("Warning: WOLFRAM_APP_ID not set. Wolfram features will be disabled.")
        
        if cls.SEARCH_ENGINE == "serpapi" and not cls.SERPAPI_KEY:
            print("Warning: SERPAPI_KEY not set. Falling back to DuckDuckGo.")
            cls.SEARCH_ENGINE = "duckduckgo"
    
    @classmethod
    def get_search_engine_display(cls):
        """Get display name for current search engine"""
        return "SerpAPI" if cls.SEARCH_ENGINE == "serpapi" else "DuckDuckGo"
