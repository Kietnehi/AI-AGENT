"""Vision Tools: Visual Question Answering and OCR using compatible Hugging Face models"""
from PIL import Image
import os
from typing import Optional, Dict, Any

# Import transformers for Hugging Face models
try:
    from transformers import pipeline
    import torch
    TRANSFORMERS_AVAILABLE = True
    print("✓ Transformers available for Vision models")
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ Transformers not installed. Please run: pip install transformers torch torchvision")
    raise Exception("Transformers is required for vision models")

class VisionTools:
    """Tools for image analysis: VQA and OCR using BLIP and TrOCR"""
    
    def __init__(self):
        """Initialize vision models"""
        self.vqa_pipeline = None
        self.ocr_pipeline = None
        self.device = "cuda" if TRANSFORMERS_AVAILABLE and torch.cuda.is_available() else "cpu"
        
        print(f"🖥️ Vision tools will use device: {self.device}")
        print("📦 Models: BLIP-VQA (VQA) + TrOCR (OCR)")
        print("💡 Using officially supported models for better compatibility")
        
    def load_vqa_model(self):
        """Lazy load Visual Question Answering model - BLIP-VQA"""
        if self.vqa_pipeline is None:
            try:
                print("🔄 Loading BLIP-VQA model (Salesforce/blip-vqa-base)...")
                self.vqa_pipeline = pipeline(
                    "visual-question-answering",
                    model="Salesforce/blip-vqa-base",
                    device=0 if self.device == "cuda" else -1
                )
                print("✓ BLIP-VQA model loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading BLIP-VQA: {e}")
                raise Exception(f"Failed to load BLIP-VQA model: {e}")
        return self.vqa_pipeline
    
    def load_ocr_model(self):
        """Lazy load OCR model - TrOCR"""
        if self.ocr_pipeline is None:
            try:
                print("🔄 Loading TrOCR model (microsoft/trocr-base-printed)...")
                self.ocr_pipeline = pipeline(
                    "image-to-text",
                    model="microsoft/trocr-base-printed",
                    device=0 if self.device == "cuda" else -1
                )
                print("✓ TrOCR model loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading TrOCR: {e}")
                raise Exception(f"Failed to load TrOCR model: {e}")
        return self.ocr_pipeline
    
    def visual_question_answering(self, image_path: str, question: str) -> Dict[str, Any]:
        """
        Answer questions about an image using Hugging Face VQA model
        
        Args:
            image_path: Path to image file
            question: Question about the image
            
        Returns:
            Dict with answer and confidence
        """
        try:
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"Image not found: {image_path}"
                }
            
            # Load image
            image = Image.open(image_path).convert("RGB")
            
            # Use BLIP-VQA model
            vqa = self.load_vqa_model()
            print(f"🤔 Analyzing image with question: {question}")
            result = vqa(image=image, question=question)
            
            # Extract answer from result
            if isinstance(result, list) and len(result) > 0:
                answer = result[0].get("answer", str(result))
            elif isinstance(result, dict):
                answer = result.get("answer", str(result))
            else:
                answer = str(result)
            
            return {
                "success": True,
                "answer": answer,
                "question": question,
                "image": image_path,
                "model": "BLIP-VQA"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def extract_text_ocr(self, image_path: str) -> Dict[str, Any]:
        """
        Extract text from image using Hugging Face OCR model
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dict with extracted text
        """
        try:
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"Image not found: {image_path}"
                }
            
            # Load image
            image = Image.open(image_path).convert("RGB")
            
            # Use TrOCR model
            ocr = self.load_ocr_model()
            print("📄 Extracting text from image with TrOCR...")
            result = ocr(image)
            
            # Parse result
            extracted_text = ""
            if isinstance(result, list) and len(result) > 0:
                if isinstance(result[0], dict):
                    extracted_text = result[0].get("generated_text", str(result))
                else:
                    extracted_text = str(result[0])
            elif isinstance(result, dict):
                extracted_text = result.get("generated_text", str(result))
            else:
                extracted_text = str(result)
            
            return {
                "success": True,
                "text": extracted_text,
                "image": image_path,
                "model": "TrOCR"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def cleanup(self):
        """Clean up models from memory"""
        if self.vqa_pipeline is not None:
            del self.vqa_pipeline
            self.vqa_pipeline = None
        
        if self.ocr_pipeline is not None:
            del self.ocr_pipeline
            self.ocr_pipeline = None
        
        # Clear CUDA cache if available
        if TRANSFORMERS_AVAILABLE and torch.cuda.is_available():
            torch.cuda.empty_cache()


# Global instance
vision_tools = VisionTools()
