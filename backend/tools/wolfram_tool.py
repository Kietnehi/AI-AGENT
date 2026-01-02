"""Wolfram Alpha computation tool"""
import requests
import xml.etree.ElementTree as ET
from config import Config


class WolframTool:
    """Wolfram Alpha computation interface"""
    
    def __init__(self):
        """Initialize Wolfram Alpha client"""
        if not Config.WOLFRAM_APP_ID:
            raise ValueError("WOLFRAM_APP_ID is required for Wolfram calculations")
        
        self.app_id = Config.WOLFRAM_APP_ID
        self.base_url = "http://api.wolframalpha.com/v2/query"
    
    def compute(self, query: str) -> str:
        """
        Compute using Wolfram Alpha API
        
        Args:
            query: Mathematical or computational query
            
        Returns:
            Formatted computation result
        """
        try:
            params = {
                'input': query,
                'appid': self.app_id,
                'format': 'plaintext'
            }
            
            response = requests.get(self.base_url, params=params, timeout=15)
            
            if response.status_code == 200:
                # Parse XML response
                root = ET.fromstring(response.content)
                
                # Check if query was successful
                if root.attrib.get('success') == 'true':
                    output = []
                    
                    # Extract all pods with plaintext results
                    for pod in root.findall('.//pod'):
                        title = pod.attrib.get('title', '')
                        subpods = pod.findall('.//subpod/plaintext')
                        
                        for subpod in subpods:
                            if subpod.text:
                                output.append(f"{title}: {subpod.text}")
                    
                    if output:
                        return "\n".join(output)
                    else:
                        return "Không thể tính toán được kết quả."
                else:
                    return "Wolfram Alpha không thể hiểu câu hỏi này."
            else:
                return f"Lỗi kết nối Wolfram Alpha: {response.status_code}"
                
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
