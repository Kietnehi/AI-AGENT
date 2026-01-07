"""Video Generation Tool: Text-to-Video and Image-to-Video using Google Veo 3.1"""
import time
import os
from pathlib import Path
from typing import Optional, Dict, Any, List
from google import genai
from google.genai import types


class VideoGenerationTools:
    """Tool for video generation using Google Veo 3.1 (Text-to-Video and Image-to-Video)"""
    
    def __init__(self, api_key: str):
        """Initialize with Google API key"""
        self.api_key = api_key
        self.client = genai.Client(api_key=self.api_key)
        
    def text_to_video(
        self, 
        prompt: str, 
        output_path: Optional[str] = None,
        max_wait_time: int = 300  # 5 minutes max wait time
    ) -> Dict[str, Any]:
        """
        Generate video from text prompt using Google Veo 3.1
        
        Args:
            prompt: Text description of the video to generate
            output_path: Path to save the generated video
            max_wait_time: Maximum time to wait for video generation (seconds)
            
        Returns:
            Dictionary with status, message, and video_path
        """
        try:
            # Start video generation
            print(f"Starting video generation with prompt: {prompt}")
            operation = self.client.models.generate_videos(
                model="veo-3.1-generate-preview",
                prompt=prompt,
            )
            
            # Poll the operation status until the video is ready
            elapsed_time = 0
            poll_interval = 10  # Check every 10 seconds
            
            while not operation.done:
                if elapsed_time >= max_wait_time:
                    return {
                        "status": "error",
                        "message": f"Video generation timeout after {max_wait_time} seconds"
                    }
                
                print(f"Waiting for video generation... ({elapsed_time}s elapsed)")
                time.sleep(poll_interval)
                elapsed_time += poll_interval
                operation = self.client.operations.get(operation)
            
            # Download the generated video
            generated_video = operation.response.generated_videos[0]
            
            # Determine output path
            if not output_path:
                output_dir = Path("output")
                output_dir.mkdir(exist_ok=True)
                # Create a safe filename from prompt
                safe_prompt = "".join(c for c in prompt[:30] if c.isalnum() or c in (' ', '_')).rstrip()
                safe_prompt = safe_prompt.replace(' ', '_')
                output_path = output_dir / f"video_{safe_prompt}_{int(time.time())}.mp4"
            
            # Download and save video
            self.client.files.download(file=generated_video.video)
            generated_video.video.save(str(output_path))
            
            print(f"Generated video saved to {output_path}")
            
            return {
                "status": "success",
                "message": f"Video generated successfully from prompt: {prompt}",
                "video_path": str(output_path),
                "generation_time": elapsed_time
            }
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating video: {error_message}")
            return {
                "status": "error",
                "message": f"Error generating video: {error_message}"
            }

    def image_to_video(
        self, 
        image_path: str,
        prompt: Optional[str] = None,
        output_path: Optional[str] = None,
        max_wait_time: int = 300,  # 5 minutes max wait time
        mode: str = "single"  # "single" or "reference"
    ) -> Dict[str, Any]:
        """
        Generate video from image using Google Veo 3.1
        
        Args:
            image_path: Path to the input image (single mode only)
            prompt: Text prompt to guide video generation
            output_path: Path to save the generated video
            max_wait_time: Maximum time to wait for video generation (seconds)
            mode: "single" for single image input, "reference" for reference images
            
        Returns:
            Dictionary with status, message, and video_path
        """
        try:
            # Check if image exists
            if not os.path.exists(image_path):
                return {
                    "status": "error",
                    "message": f"Image file not found: {image_path}"
                }
            
            # Upload image to Google
            print(f"Uploading image: {image_path}")
            uploaded_image = self.client.files.upload(path=image_path)
            
            # Prepare generation config based on mode
            if mode == "single":
                # Single image as input
                config = {
                    "model": "veo-3.1-generate-preview",
                    "prompt": prompt if prompt else "Create a video from this image",
                    "image": uploaded_image
                }
                print(f"Starting single image-to-video generation")
            else:
                return {
                    "status": "error",
                    "message": "Invalid mode. Use 'reference' mode for multiple images."
                }
            
            # Start video generation
            operation = self.client.models.generate_videos(**config)
            
            # Poll the operation status until the video is ready
            elapsed_time = 0
            poll_interval = 10  # Check every 10 seconds
            
            while not operation.done:
                if elapsed_time >= max_wait_time:
                    return {
                        "status": "error",
                        "message": f"Video generation timeout after {max_wait_time} seconds"
                    }
                
                print(f"Waiting for video generation... ({elapsed_time}s elapsed)")
                time.sleep(poll_interval)
                elapsed_time += poll_interval
                operation = self.client.operations.get(operation)
            
            # Download the generated video
            generated_video = operation.response.generated_videos[0]
            
            # Determine output path
            if not output_path:
                output_dir = Path("output")
                output_dir.mkdir(exist_ok=True)
                # Create a safe filename
                image_name = Path(image_path).stem
                output_path = output_dir / f"video_from_{image_name}_{int(time.time())}.mp4"
            
            # Download and save video
            self.client.files.download(file=generated_video.video)
            generated_video.video.save(str(output_path))
            
            print(f"Generated video saved to {output_path}")
            
            return {
                "status": "success",
                "message": f"Video generated successfully from image: {Path(image_path).name}",
                "video_path": str(output_path),
                "generation_time": elapsed_time
            }
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating video from image: {error_message}")
            return {
                "status": "error",
                "message": f"Error generating video from image: {error_message}"
            }

    def reference_images_to_video(
        self, 
        image_paths: List[str],
        prompt: str,
        output_path: Optional[str] = None,
        max_wait_time: int = 300  # 5 minutes max wait time
    ) -> Dict[str, Any]:
        """
        Generate video from multiple reference images using Google Veo 3.1
        
        Args:
            image_paths: List of paths to reference images
            prompt: Text prompt to guide video generation
            output_path: Path to save the generated video
            max_wait_time: Maximum time to wait for video generation (seconds)
            
        Returns:
            Dictionary with status, message, and video_path
        """
        try:
            if not image_paths or len(image_paths) == 0:
                return {
                    "status": "error",
                    "message": "No images provided"
                }
            
            if not prompt or not prompt.strip():
                return {
                    "status": "error",
                    "message": "Prompt is required for reference images mode"
                }
            
            # Upload all images and create reference list
            reference_images = []
            for image_path in image_paths:
                if not os.path.exists(image_path):
                    return {
                        "status": "error",
                        "message": f"Image file not found: {image_path}"
                    }
                
                print(f"Uploading reference image: {image_path}")
                uploaded_image = self.client.files.upload(path=image_path)
                
                # Create reference image with asset type
                reference = types.VideoGenerationReferenceImage(
                    image=uploaded_image,
                    reference_type="asset"
                )
                reference_images.append(reference)
            
            print(f"Starting video generation with {len(reference_images)} reference images")
            
            # Start video generation with reference images
            operation = self.client.models.generate_videos(
                model="veo-3.1-generate-preview",
                prompt=prompt,
                config=types.GenerateVideosConfig(
                    reference_images=reference_images,
                ),
            )
            
            # Poll the operation status until the video is ready
            elapsed_time = 0
            poll_interval = 10  # Check every 10 seconds
            
            while not operation.done:
                if elapsed_time >= max_wait_time:
                    return {
                        "status": "error",
                        "message": f"Video generation timeout after {max_wait_time} seconds"
                    }
                
                print(f"Waiting for video generation... ({elapsed_time}s elapsed)")
                time.sleep(poll_interval)
                elapsed_time += poll_interval
                operation = self.client.operations.get(operation)
            
            # Download the generated video
            generated_video = operation.response.generated_videos[0]
            
            # Determine output path
            if not output_path:
                output_dir = Path("output")
                output_dir.mkdir(exist_ok=True)
                output_path = output_dir / f"video_reference_{int(time.time())}.mp4"
            
            # Download and save video
            self.client.files.download(file=generated_video.video)
            generated_video.video.save(str(output_path))
            
            print(f"Generated video saved to {output_path}")
            
            return {
                "status": "success",
                "message": f"Video generated successfully from {len(image_paths)} reference images",
                "video_path": str(output_path),
                "generation_time": elapsed_time
            }
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating video from reference images: {error_message}")
            return {
                "status": "error",
                "message": f"Error generating video from reference images: {error_message}"
            }

    def prompt_to_image_to_video(
        self, 
        prompt: str,
        output_path: Optional[str] = None,
        max_wait_time: int = 300  # 5 minutes max wait time
    ) -> Dict[str, Any]:
        """
        Generate image from prompt using Gemini 2.5 Flash Image, 
        then generate video from that image using Google Veo 3.1
        
        Args:
            prompt: Text prompt to generate both image and video
            output_path: Path to save the generated video
            max_wait_time: Maximum time to wait for video generation (seconds)
            
        Returns:
            Dictionary with status, message, video_path, and generated_image_path
        """
        try:
            if not prompt or not prompt.strip():
                return {
                    "status": "error",
                    "message": "Prompt is required"
                }
            
            print(f"Step 1: Generating image from prompt: {prompt}")
            
            # Step 1: Generate image with Gemini 2.5 Flash Image (Nano Banana)
            image_response = self.client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=prompt,
                config={"response_modalities": ['IMAGE']}
            )
            
            # Save the generated image
            output_dir = Path("output")
            output_dir.mkdir(exist_ok=True)
            safe_prompt = "".join(c for c in prompt[:30] if c.isalnum() or c in (' ', '_')).rstrip()
            safe_prompt = safe_prompt.replace(' ', '_')
            image_path = output_dir / f"generated_image_{safe_prompt}_{int(time.time())}.png"
            
            # Save image to file
            generated_image = image_response.parts[0].as_image()
            generated_image.save(str(image_path))
            print(f"Generated image saved to {image_path}")
            
            print(f"Step 2: Generating video from the generated image")
            
            # Step 2: Generate video with Veo 3.1 using the generated image
            operation = self.client.models.generate_videos(
                model="veo-3.1-generate-preview",
                prompt=prompt,
                image=image_response.parts[0].as_image(),
            )
            
            # Poll the operation status until the video is ready
            elapsed_time = 0
            poll_interval = 10  # Check every 10 seconds
            
            while not operation.done:
                if elapsed_time >= max_wait_time:
                    return {
                        "status": "error",
                        "message": f"Video generation timeout after {max_wait_time} seconds",
                        "generated_image_path": str(image_path)
                    }
                
                print(f"Waiting for video generation... ({elapsed_time}s elapsed)")
                time.sleep(poll_interval)
                elapsed_time += poll_interval
                operation = self.client.operations.get(operation)
            
            # Download the generated video
            generated_video = operation.response.generated_videos[0]
            
            # Determine output path
            if not output_path:
                output_path = output_dir / f"video_from_prompt_{safe_prompt}_{int(time.time())}.mp4"
            
            # Download and save video
            self.client.files.download(file=generated_video.video)
            generated_video.video.save(str(output_path))
            
            print(f"Generated video saved to {output_path}")
            
            return {
                "status": "success",
                "message": f"Video generated successfully from prompt-generated image",
                "video_path": str(output_path),
                "generated_image_path": str(image_path),
                "generation_time": elapsed_time
            }
            
        except Exception as e:
            error_message = str(e)
            print(f"Error generating video from prompt: {error_message}")
            return {
                "status": "error",
                "message": f"Error generating video from prompt: {error_message}"
            }


# Initialize global video generation tool
video_gen_tool = None


def get_video_generation_tool(api_key: str) -> VideoGenerationTools:
    """Get or create video generation tool instance"""
    global video_gen_tool
    if video_gen_tool is None:
        video_gen_tool = VideoGenerationTools(api_key)
    return video_gen_tool
