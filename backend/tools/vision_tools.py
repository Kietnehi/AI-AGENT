"""Vision Tools: Visual Question Answering and OCR using compatible Hugging Face models"""
from PIL import Image
import os
import numpy as np
from typing import Optional, Dict, Any

# Import transformers for Hugging Face models
try:
    from transformers import (
        BlipProcessor, BlipForQuestionAnswering, 
        AutoModel, AutoTokenizer,
        TrOCRProcessor, VisionEncoderDecoderModel
    )
    import torch
    TRANSFORMERS_AVAILABLE = True
    print("✓ Transformers available for Vision models")
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ Transformers not installed. Please run: pip install transformers torch torchvision")
    raise Exception("Transformers is required for vision models")

# Import PaddleOCRVL
PADDLEOCR_AVAILABLE = False
try:
    from paddleocr import PaddleOCRVL
    PADDLEOCR_AVAILABLE = True
    print("✓ PaddleOCRVL available")
except Exception as e:
    PADDLEOCR_AVAILABLE = False
    print(f"⚠️ PaddleOCRVL not available: {str(e)[:100]}")

class VisionTools:
    """Tools for image analysis: VQA and OCR using BLIP, DeepSeek-OCR and PaddleOCRVL"""
    
    def __init__(self):
        """Initialize vision models"""
        self.vqa_processor = None
        self.vqa_model = None
        self.trocr_processor = None
        self.trocr_model = None
        self.deepseek_tokenizer = None
        self.deepseek_model = None
        self.paddleocr_vl = None
        self.device = "cuda" if TRANSFORMERS_AVAILABLE and torch.cuda.is_available() else "cpu"
        
        print(f"🖥️ Vision tools will use device: {self.device}")
        print("📦 Models: BLIP-VQA (VQA) + DeepSeek-OCR/PaddleOCRVL (OCR)")
        print("💡 Using official API for better compatibility")
        
    def load_vqa_model(self):
        """Lazy load Visual Question Answering model - BLIP-VQA"""
        if self.vqa_processor is None or self.vqa_model is None:
            try:
                print("🔄 Loading BLIP-VQA processor and model (Salesforce/blip-vqa-base)...")
                
                # Load processor
                self.vqa_processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
                
                # Load model and move to device
                self.vqa_model = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base")
                self.vqa_model = self.vqa_model.to(self.device)
                
                print(f"✓ BLIP-VQA loaded successfully on {self.device}!")
            except Exception as e:
                print(f"✗ Error loading BLIP-VQA: {e}")
                raise Exception(f"Failed to load BLIP-VQA model: {e}")
        return self.vqa_processor, self.vqa_model
    
    def load_trocr_model(self):
        """Lazy load TrOCR model - Basic OCR for printed text"""
        if self.trocr_processor is None or self.trocr_model is None:
            try:
                print("🔄 Loading TrOCR model (microsoft/trocr-base-printed)...")
                
                # Load processor and model
                self.trocr_processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
                self.trocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
                
                # Move model to device
                self.trocr_model = self.trocr_model.to(self.device)
                
                print("✓ TrOCR model loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading TrOCR: {e}")
                raise Exception(f"Failed to load TrOCR model: {e}")
        return self.trocr_processor, self.trocr_model
    
    def load_deepseek_ocr_model(self):
        """Lazy load DeepSeek OCR - Advanced multimodal OCR"""
        if self.deepseek_tokenizer is None or self.deepseek_model is None:
            try:
                print("🔄 Loading DeepSeek-OCR model (deepseek-ai/DeepSeek-OCR)...")
                model_name = 'deepseek-ai/DeepSeek-OCR'
                
                # Load tokenizer
                self.deepseek_tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
                
                # Load model with auto dtype
                self.deepseek_model = AutoModel.from_pretrained(
                    model_name,
                    trust_remote_code=True,
                    dtype="auto"
                )
                    
                print("✓ DeepSeek-OCR model loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading DeepSeek-OCR: {e}")
                print("Falling back to TrOCR base...")
                return None, None
        return self.deepseek_tokenizer, self.deepseek_model
    
    def load_paddleocr_vl(self):
        """Lazy load PaddleOCRVL - Advanced OCR with structured output"""
        if self.paddleocr_vl is None:
            if not PADDLEOCR_AVAILABLE:
                raise Exception("PaddleOCRVL not available. Please install: pip install paddleocr")
            try:
                print("🔄 Loading PaddleOCRVL pipeline...")
                self.paddleocr_vl = PaddleOCRVL()
                print("✓ PaddleOCRVL loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading PaddleOCRVL: {e}")
                raise Exception(f"Failed to load PaddleOCRVL: {e}")
        return self.paddleocr_vl
    
    def visual_question_answering(self, image_path: str, question: str) -> Dict[str, Any]:
        """
        Answer questions about an image using BLIP VQA model
        
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
            print(f"📸 Loading image: {image_path}")
            raw_image = Image.open(image_path).convert("RGB")
            print(f"✓ Image loaded: {raw_image.size}")
            
            # Load BLIP processor and model
            print(f"🤔 Analyzing image with question: {question}")
            processor, model = self.load_vqa_model()
            
            # Process inputs
            inputs = processor(raw_image, question, return_tensors="pt").to(self.device)
            
            # Generate answer
            out = model.generate(**inputs)
            
            # Decode answer
            answer = processor.decode(out[0], skip_special_tokens=True)
            print(f"✓ VQA answer: {answer}")
            
            return {
                "success": True,
                "answer": answer,
                "question": question,
                "image": image_path,
                "model": "BLIP-VQA"
            }
            
        except Exception as e:
            import traceback
            error_detail = f"{str(e)}\n{traceback.format_exc()}"
            print(f"✗ VQA Error: {error_detail}")
            return {
                "success": False,
                "error": f"VQA failed: {str(e)}"
            }
    
    def extract_text_deepseek_ocr(self, image_path: str, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Extract text using DeepSeek-OCR multimodal model
        
        Args:
            image_path: Path to image file
            output_path: Optional output directory for results
            
        Returns:
            Dict with extracted text
        """
        try:
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"Image not found: {image_path}"
                }
            
            # Load DeepSeek-OCR model
            tokenizer, model = self.load_deepseek_ocr_model()
            
            if tokenizer is None or model is None:
                # Fallback to TrOCR if DeepSeek-OCR failed
                print("⚠️ Using TrOCR as fallback...")
                processor, trocr_model = self.load_trocr_model()
                image = Image.open(image_path).convert("RGB")
                
                # Process image
                pixel_values = processor(image, return_tensors="pt").pixel_values.to(self.device)
                generated_ids = trocr_model.generate(pixel_values)
                extracted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                
                return {
                    "success": True,
                    "text": extracted_text,
                    "image": image_path,
                    "model": "TrOCR (fallback)"
                }
            
            print("📄 Extracting text from image with DeepSeek-OCR...")
            
            # Use DeepSeek-OCR with proper API
            # prompt = "<image>\nFree OCR. "  # Simple OCR
            prompt = "<image>\n<|grounding|>Convert the document to markdown. "  # Structured OCR
            
            # Set output path if not provided
            if output_path is None:
                output_path = os.path.dirname(image_path)
            
            # Call infer method with Gundam configuration (base_size=1024, image_size=640, crop_mode=True)
            result = model.infer(
                tokenizer,
                prompt=prompt,
                image_file=image_path,
                output_path=output_path,
                base_size=1024,
                image_size=640,
                crop_mode=True,
                save_results=False,  # Don't save files by default
                test_compress=True
            )
            
            # Extract text from result
            extracted_text = result if isinstance(result, str) else str(result)
            
            return {
                "success": True,
                "text": extracted_text,
                "image": image_path,
                "model": "DeepSeek-OCR"
            }
            
        except Exception as e:
            import traceback
            error_msg = traceback.format_exc()
            print(f"✗ DeepSeek-OCR Error: {error_msg}")
            return {
                "success": False,
                "error": f"DeepSeek-OCR failed: {str(e)}"
            }
    
    def extract_text_paddleocr(self, image_path: str, output_path: Optional[str] = "output") -> Dict[str, Any]:
        """Extract text using PaddleOCRVL (supports structured output)
        
        Args:
            image_path: Path to image file or URL
            output_path: Optional output directory for JSON and Markdown results
            
        Returns:
            Dict with extracted text and structured data
        """
        try:
            # Check if local file exists
            if not image_path.startswith("http") and not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"Image not found: {image_path}"
                }
            
            # Load PaddleOCRVL
            pipeline = self.load_paddleocr_vl()
            print(f"📄 Extracting text from image with PaddleOCRVL...")
            
            # Run prediction
            output = pipeline.predict(image_path)
            
            # Process results
            all_text = []
            results_data = []
            
            for res in output:
                # Print to console
                res.print()
                
                # Save to JSON and Markdown if output_path provided
                if output_path:
                    res.save_to_json(save_path=output_path)
                    res.save_to_markdown(save_path=output_path)
                
                # Extract text and metadata
                if hasattr(res, 'text'):
                    all_text.append(res.text)
                    results_data.append({
                        "text": res.text,
                        "metadata": str(res)
                    })
            
            full_text = "\n".join(all_text)
            
            return {
                "success": True,
                "text": full_text,
                "results": results_data,
                "image": image_path,
                "model": "PaddleOCRVL",
                "output_saved": output_path if output_path else None
            }
            
        except Exception as e:
            import traceback
            print(f"✗ PaddleOCRVL Error: {traceback.format_exc()}")
            return {
                "success": False,
                "error": f"PaddleOCRVL failed: {str(e)}"
            }
    
    def cleanup(self):
        """Clean up models from memory"""
        if self.vqa_processor is not None:
            del self.vqa_processor
            self.vqa_processor = None
            
        if self.vqa_model is not None:
            del self.vqa_model
            self.vqa_model = None
        
        if self.trocr_processor is not None:
            del self.trocr_processor
            self.trocr_processor = None
            
        if self.trocr_model is not None:
            del self.trocr_model
            self.trocr_model = None
            
        if self.deepseek_tokenizer is not None:
            del self.deepseek_tokenizer
            self.deepseek_tokenizer = None
            
        if self.deepseek_model is not None:
            del self.deepseek_model
            self.deepseek_model = None
        
        if self.paddleocr_vl is not None:
            del self.paddleocr_vl
            self.paddleocr_vl = None
        
        # Clear CUDA cache if available
        if TRANSFORMERS_AVAILABLE and torch.cuda.is_available():
            torch.cuda.empty_cache()


# Global instance
vision_tools = VisionTools()
