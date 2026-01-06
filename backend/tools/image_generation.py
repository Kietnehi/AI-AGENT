"""Image Generation Tool: Text-to-Image using Clipdrop API"""
import requests
import os
from pathlib import Path
from typing import Optional, Dict, Any

class ImageGenerationTools:
    """Tool for text-to-image generation using Clipdrop API"""
    
    def __init__(self, api_key: str):
        """Initialize with Clipdrop API key"""
        self.api_key = api_key
        self.base_url = "https://clipdrop-api.co"
        self.headers = {
            "x-api-key": self.api_key
        }
        
    def text_to_image(
        self, 
        prompt: str, 
        output_path: Optional[str] = None,
        width: int = 1024,
        height: int = 1024
    ) -> Dict[str, Any]:
        """
        Generate image from text prompt using Clipdrop API
        
        Args:
            prompt: Text description of the image to generate
            output_path: Path to save the generated image
            width: Image width (default: 1024)
            height: Image height (default: 1024)
            
        Returns:
            Dictionary with status, message, and image_path
        """
        try:
            url = f"{self.base_url}/text-to-image/v1"
            
            files = {
                'prompt': (None, prompt, 'text/plain')
            }
            
            response = requests.post(
                url,
                headers=self.headers,
                files=files
            )
            
            if response.status_code == 200:
                # Save image
                if not output_path:
                    output_dir = Path("output")
                    output_dir.mkdir(exist_ok=True)
                    output_path = output_dir / f"text_to_image_{len(os.listdir(output_dir)) + 1}.png"
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                return {
                    "status": "success",
                    "message": f"Image generated successfully from prompt: {prompt}",
                    "image_path": str(output_path)
                }
            else:
                return {
                    "status": "error",
                    "message": f"API error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error generating image: {str(e)}"
            }

# Initialize global image generation tool
image_gen_tool = None

def get_image_generation_tool(api_key: str) -> ImageGenerationTools:
    """Get or create image generation tool instance"""
    global image_gen_tool
    if image_gen_tool is None:
        image_gen_tool = ImageGenerationTools(api_key)
    return image_gen_tool
