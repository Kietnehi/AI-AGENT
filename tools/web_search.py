"""Web search tools supporting DuckDuckGo and SerpAPI"""
from typing import List, Dict
from duckduckgo_search import DDGS
from serpapi import GoogleSearch
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
        
    def search(self, query: str, max_results: int = 5) -> List[Dict]:
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
        """Search using DuckDuckGo"""
        try:
            results = []
            with DDGS() as ddgs:
                for i, result in enumerate(ddgs.text(query, max_results=max_results)):
                    if i >= max_results:
                        break
                    results.append({
                        'title': result.get('title', ''),
                        'link': result.get('href', ''),
                        'snippet': result.get('body', '')
                    })
            return results
        except Exception as e:
            print(f"DuckDuckGo search error: {e}")
            return []
    
    def _search_serpapi(self, query: str, max_results: int) -> List[Dict]:
        """Search using SerpAPI"""
        try:
            params = {
                "q": query,
                "api_key": Config.SERPAPI_KEY,
                "num": max_results
            }
            
            search = GoogleSearch(params)
            results_data = search.get_dict()
            
            results = []
            organic_results = results_data.get("organic_results", [])
            
            for result in organic_results[:max_results]:
                results.append({
                    'title': result.get('title', ''),
                    'link': result.get('link', ''),
                    'snippet': result.get('snippet', '')
                })
            
            return results
        except Exception as e:
            print(f"SerpAPI search error: {e}")
            return []
    
    def format_results(self, results: List[Dict]) -> str:
        """Format search results as readable text"""
        if not results:
            return "Không tìm thấy kết quả nào."
        
        formatted = f"Kết quả tìm kiếm (sử dụng {Config.get_search_engine_display()}):\n\n"
        
        for i, result in enumerate(results, 1):
            formatted += f"{i}. {result['title']}\n"
            formatted += f"   Link: {result['link']}\n"
            formatted += f"   Mô tả: {result['snippet']}\n\n"
        
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
