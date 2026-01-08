"""LaTeX OCR Tool: Convert images to LaTeX code using pix2tex API"""
import requests
import os
from typing import Optional, Dict, Any
import subprocess
import time
import socket


class LatexOCRTool:
    """Tool for converting images to LaTeX code using pix2tex Docker container"""
    
    def __init__(self):
        """Initialize the LaTeX OCR tool"""
        self.api_url = "http://localhost:8502/predict/"
        self.container_name = "pix2tex-api"
        self.docker_image = "lukasblecher/pix2tex:api"
        self._container_running = False
        
    def _is_port_in_use(self, port: int) -> bool:
        """Check if a port is in use"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    
    def _is_container_running(self) -> bool:
        """Check if the pix2tex container is running"""
        try:
            result = subprocess.run(
                ["docker", "ps", "--filter", f"name={self.container_name}", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return self.container_name in result.stdout
        except Exception as e:
            print(f"Error checking container status: {e}")
            return False
    
    def start_container(self) -> Dict[str, Any]:
        """Start the pix2tex Docker container if not already running"""
        try:
            # Check if container is already running
            if self._is_container_running():
                print(f"✓ Container {self.container_name} is already running")
                self._container_running = True
                return {"status": "success", "message": "Container already running"}
            
            # Check if port is in use
            if self._is_port_in_use(8502):
                return {
                    "status": "error",
                    "message": "Port 8502 is already in use. Please stop the service using it."
                }
            
            print(f"Starting pix2tex container on port 8502...")
            
            # Pull the image if not exists
            subprocess.run(
                ["docker", "pull", self.docker_image],
                capture_output=True,
                timeout=300
            )
            
            # Start the container
            subprocess.run(
                [
                    "docker", "run", "-d",
                    "--name", self.container_name,
                    "--rm",
                    "-p", "8502:8502",
                    self.docker_image
                ],
                capture_output=True,
                timeout=30
            )
            
            # Wait for container to be ready
            max_retries = 30
            for i in range(max_retries):
                if self._is_port_in_use(8502):
                    time.sleep(2)  # Wait a bit more for API to be fully ready
                    self._container_running = True
                    print(f"✓ Container started successfully on port 8502")
                    return {
                        "status": "success",
                        "message": "Container started successfully"
                    }
                time.sleep(1)
            
            return {
                "status": "error",
                "message": "Container started but API not responding on port 8502"
            }
            
        except subprocess.TimeoutExpired:
            return {
                "status": "error",
                "message": "Timeout while starting container"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error starting container: {str(e)}"
            }
    
    def stop_container(self) -> Dict[str, Any]:
        """Stop the pix2tex Docker container"""
        try:
            if not self._is_container_running():
                return {"status": "success", "message": "Container not running"}
            
            print(f"Stopping container {self.container_name}...")
            subprocess.run(
                ["docker", "stop", self.container_name],
                capture_output=True,
                timeout=30
            )
            
            self._container_running = False
            print(f"✓ Container stopped successfully")
            return {"status": "success", "message": "Container stopped successfully"}
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error stopping container: {str(e)}"
            }
    
    def get_latex_from_image(self, image_path: str) -> Dict[str, Any]:
        """
        Convert an image to LaTeX code
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with status and LaTeX code
        """
        try:
            # Check if container is running
            if not self._is_container_running():
                # Try to start container
                start_result = self.start_container()
                if start_result["status"] != "success":
                    return start_result
            
            # Check if image file exists
            if not os.path.exists(image_path):
                return {
                    "status": "error",
                    "message": f"Image file not found: {image_path}"
                }
            
            # Send request to API
            with open(image_path, 'rb') as f:
                files = {'file': f}
                response = requests.post(
                    self.api_url,
                    files=files,
                    timeout=30
                )
            
            if response.status_code == 200:
                try:
                    # Try to parse as JSON
                    latex_code = response.json()
                except:
                    # If plain text, clean it up
                    latex_code = response.text.strip().strip('"')
                
                return {
                    "status": "success",
                    "latex_code": latex_code,
                    "message": "LaTeX code extracted successfully"
                }
            else:
                return {
                    "status": "error",
                    "message": f"API returned status code {response.status_code}"
                }
                
        except requests.exceptions.ConnectionError:
            return {
                "status": "error",
                "message": "Cannot connect to pix2tex API. Container may not be running."
            }
        except requests.exceptions.Timeout:
            return {
                "status": "error",
                "message": "Request timeout. Image may be too large or complex."
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing image: {str(e)}"
            }
    
    def health_check(self) -> Dict[str, Any]:
        """Check if the service is ready"""
        return {
            "container_running": self._is_container_running(),
            "port_8502_open": self._is_port_in_use(8502),
            "ready": self._is_container_running() and self._is_port_in_use(8502)
        }


# Global instance
latex_ocr_tool = LatexOCRTool()


def get_latex_ocr_tool():
    """Get the global LaTeX OCR tool instance"""
    return latex_ocr_tool
