"""Wolfram Alpha computation tool"""
import wolframalpha
from config import Config


class WolframTool:
    """Wolfram Alpha computation interface"""
    
    def __init__(self):
        """Initialize Wolfram Alpha client"""
        if not Config.WOLFRAM_APP_ID:
            raise ValueError("WOLFRAM_APP_ID is required for Wolfram calculations")
        
        self.client = wolframalpha.Client(Config.WOLFRAM_APP_ID)
    
    def compute(self, query: str) -> str:
        """
        Compute using Wolfram Alpha
        
        Args:
            query: Mathematical or computational query
            
        Returns:
            Formatted computation result
        """
        try:
            res = self.client.query(query)
            
            # Try to get the primary result
            if hasattr(res, 'results'):
                results = list(res.results)
                if results:
                    return next(res.results).text
            
            # Fallback: get all pods
            output = []
            for pod in res.pods:
                if pod.title and hasattr(pod, 'text') and pod.text:
                    output.append(f"{pod.title}: {pod.text}")
            
            if output:
                return "\n".join(output)
            else:
                return "Không thể tính toán được kết quả."
                
        except Exception as e:
            return f"Lỗi khi tính toán với Wolfram Alpha: {str(e)}"


def wolfram_compute(query: str) -> str:
    """
    Convenience function for Wolfram Alpha computation
    
    Args:
        query: Computation query
        
    Returns:
        Computation result as string
    """
    try:
        tool = WolframTool()
        return tool.compute(query)
    except ValueError as e:
        return f"Wolfram Alpha không khả dụng: {str(e)}"
    except Exception as e:
        return f"Lỗi: {str(e)}"
