"""Wolfram Alpha computation tool with plotting support"""
import requests
import xml.etree.ElementTree as ET
import base64
from config import Config


class WolframTool:
    """Wolfram Alpha computation interface with plotting support"""
    
    def __init__(self):
        """Initialize Wolfram Alpha client"""
        if not Config.WOLFRAM_APP_ID:
            raise ValueError("WOLFRAM_APP_ID is required for Wolfram calculations")
        
        self.app_id = Config.WOLFRAM_APP_ID
        self.base_url = "http://api.wolframalpha.com/v2/query"
    
    def compute(self, query: str) -> dict:
        """
        Compute using Wolfram Alpha API with enhanced output
        
        Args:
            query: Mathematical or computational query
            
        Returns:
            Dict containing text results, images, and plots
        """
        try:
            # Request both plaintext and image formats
            params = {
                'input': query,
                'appid': self.app_id,
                'format': 'plaintext,image',
                'output': 'xml'
            }
            
            response = requests.get(self.base_url, params=params, timeout=20)
            
            if response.status_code == 200:
                # Parse XML response
                root = ET.fromstring(response.content)
                
                # Check if query was successful
                if root.attrib.get('success') == 'true':
                    result = {
                        'text_results': [],
                        'images': [],
                        'plots': [],
                        'success': True
                    }
                    
                    # Extract all pods with results
                    for pod in root.findall('.//pod'):
                        title = pod.attrib.get('title', '')
                        
                        # Extract text results
                        subpods = pod.findall('.//subpod')
                        for subpod in subpods:
                            # Get plaintext
                            plaintext = subpod.find('plaintext')
                            if plaintext is not None and plaintext.text:
                                result['text_results'].append(f"{title}: {plaintext.text}")
                            
                            # Get images/plots
                            img = subpod.find('img')
                            if img is not None:
                                img_src = img.attrib.get('src')
                                img_alt = img.attrib.get('alt', title)
                                
                                if img_src:
                                    # Check if it's a plot/graph
                                    is_plot = any(keyword in title.lower() for keyword in 
                                                ['plot', 'graph', 'chart', 'curve', 'function'])
                                    
                                    img_data = {
                                        'url': img_src,
                                        'alt': img_alt,
                                        'title': title
                                    }
                                    
                                    if is_plot:
                                        result['plots'].append(img_data)
                                    else:
                                        result['images'].append(img_data)
                    
                    return result
                else:
                    return {
                        'text_results': ["Wolfram Alpha không thể hiểu câu hỏi này."],
                        'images': [],
                        'plots': [],
                        'success': False
                    }
            else:
                return {
                    'text_results': [f"Lỗi kết nối Wolfram Alpha: {response.status_code}"],
                    'images': [],
                    'plots': [],
                    'success': False
                }
                
        except Exception as e:
            return {
                'text_results': [f"Lỗi khi tính toán với Wolfram Alpha: {str(e)}"],
                'images': [],
                'plots': [],
                'success': False
            }


def wolfram_compute(query: str) -> dict:
    """
    Convenience function for Wolfram Alpha computation
    
    Args:
        query: Computation query
        
    Returns:
        Dict containing computation results, images, and plots
    """
    try:
        tool = WolframTool()
        return tool.compute(query)
    except ValueError as e:
        return {
            'text_results': [f"Wolfram Alpha không khả dụng: {str(e)}"],
            'images': [],
            'plots': [],
            'success': False
        }
    except Exception as e:
        return {
            'text_results': [f"Lỗi: {str(e)}"],
            'images': [],
            'plots': [],
            'success': False
        }
