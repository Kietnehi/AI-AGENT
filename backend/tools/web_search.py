"""Web search tools supporting DuckDuckGo and SerpAPI"""
from typing import List, Dict
import requests
from duckduckgo_search import DDGS
from config import Config


class WebSearchTool:
    """Unified web search interface"""
    
    def __init__(self, search_engine: str = None):
        """
        Initialize web search tool
        
        Args:
            search_engine: 'duckduckgo' or 'serpapi'. If None, uses Config.SEARCH_ENGINE
        """
        self.search_engine = search_engine or Config.SEARCH_ENGINE
        
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search the web using configured search engine
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of search results with title, link, and snippet
        """
        if self.search_engine == "serpapi":
            return self._search_serpapi(query, max_results)
        else:
            return self._search_duckduckgo(query, max_results)
    
    def _search_duckduckgo(self, query: str, max_results: int) -> List[Dict]:
        import time
        max_retries = 2
        
        print(f"\n{'='*60}")
        print(f"🔍 [DuckDuckGo] Bắt đầu tìm kiếm...")
        print(f"📝 Query: '{query}'")
        print(f"🎯 Max results: {max_results}")
        print(f"{'='*60}\n")
        
        for attempt in range(max_retries):
            print(f"🔄 Lần thử: {attempt + 1}/{max_retries}")
            
            try:
                results = []
                print(f"⚙️  Khởi tạo DDGS với backend='api', timelimit='y'")
                
                with DDGS() as ddgs:
                    # Try with timelimit to avoid hanging
                    print(f"🚀 Đang gửi request đến DuckDuckGo...")
                    search_results = ddgs.text(
                        query,
                        max_results=max_results,
                        region="vn-vi",  # Vietnam region for better Vietnamese results
                        safesearch="moderate",
                        timelimit="y",  # Results from last year
                        backend="api"  # Use API backend for better reliability
                    )
                    
                    print(f"📥 Đã nhận response từ DuckDuckGo")
                    print(f"🔄 Đang parse kết quả...")
                    
                    result_count = 0
                    for result in search_results:
                        result_count += 1
                        print(f"  ✓ Kết quả #{result_count}:")
                        print(f"    - Title: {result.get('title', 'N/A')[:80]}...")
                        print(f"    - Link: {result.get('href') or result.get('url', 'N/A')}")
                        print(f"    - Snippet: {result.get('body', 'N/A')[:100]}...")
                        
                        results.append({
                            "title": result.get("title", ""),
                            "link": result.get("href") or result.get("url", ""),
                            "snippet": result.get("body", "")
                        })
                        
                        if len(results) >= max_results:
                            break
                
                print(f"\n✅ Tổng số kết quả tìm được: {len(results)}")
                
                if results:
                    print(f"🎉 Tìm kiếm thành công!")
                    print(f"{'='*60}\n")
                    return results
                else:
                    print(f"⚠️  Không có kết quả nào được trả về")
                    
                # If no results, try again with different parameters
                if attempt < max_retries - 1:
                    print(f"⏳ Chờ 1 giây trước khi thử lại...\n")
                    time.sleep(1)
                    continue
                    
            except Exception as e:
                print(f"❌ Lỗi DuckDuckGo (lần thử {attempt + 1}): {type(e).__name__}")
                print(f"📄 Chi tiết lỗi: {str(e)}")
                
                if attempt < max_retries - 1:
                    print(f"⏳ Chờ 2 giây trước khi thử lại...\n")
                    time.sleep(2)
                else:
                    print(f"💔 Đã hết số lần thử. Trả về danh sách rỗng.")
                    print(f"{'='*60}\n")
                    return []
        
        print(f"⚠️  Kết thúc tìm kiếm với 0 kết quả")
        print(f"{'='*60}\n")
        return []
    
    def _search_serpapi(self, query: str, max_results: int) -> List[Dict]:
        """Search using SerpAPI"""
        try:
            url = "https://serpapi.com/search"
            params = {
                "q": query,
                "api_key": Config.SERPAPI_KEY,
                "num": max_results,
                "engine": "google"
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                results_data = response.json()
                results = []
                organic_results = results_data.get("organic_results", [])
                
                for result in organic_results[:max_results]:
                    results.append({
                        'title': result.get('title', ''),
                        'link': result.get('link', ''),
                        'snippet': result.get('snippet', '')
                    })
                
                return results
            else:
                print(f"SerpAPI error: {response.status_code}")
                return []
        except Exception as e:
            print(f"SerpAPI search error: {e}")
            return []
    
    def format_results(self, results: List[Dict]) -> str:
        """Format search results as readable text"""
        if not results:
            engine_name = Config.get_search_engine_display()
            return f"⚠️ Không tìm thấy kết quả từ {engine_name}.\n\n" + \
                   "Có thể do:\n" + \
                   "- Truy vấn quá cụ thể hoặc phức tạp\n" + \
                   "- Rate limit tạm thời\n" + \
                   "- Vấn đề kết nối mạng\n\n" + \
                   "💡 Gợi ý: Thử rephrase câu hỏi hoặc sử dụng SerpAPI (nếu đã cấu hình)."
        
        formatted = f"📊 Kết quả tìm kiếm (sử dụng {Config.get_search_engine_display()}):\n\n"
        
        for i, result in enumerate(results, 1):
            formatted += f"**{i}. {result['title']}**\n"
            formatted += f"🔗 {result['link']}\n"
            formatted += f"📝 {result['snippet']}\n\n"
        
        return formatted


def search_web(query: str, search_engine: str = None, max_results: int = 5) -> str:
    """
    Convenience function to search the web
    
    Args:
        query: Search query
        search_engine: 'duckduckgo' or 'serpapi' (optional)
        max_results: Maximum number of results
        
    Returns:
        Formatted search results as string
    """
    tool = WebSearchTool(search_engine)
    results = tool.search(query, max_results)
    return tool.format_results(results)
