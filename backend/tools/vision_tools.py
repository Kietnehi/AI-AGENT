"""Vision Tools: Visual Question Answering and OCR using compatible Hugging Face models"""
from PIL import Image
import os
import numpy as np
from typing import Optional, Dict, Any

# Import transformers for Hugging Face models
try:
    from transformers import (
        BlipProcessor, BlipForQuestionAnswering
    )
    import torch
    TRANSFORMERS_AVAILABLE = True
    print("✓ Transformers available for Vision models")
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ Transformers not installed. Please run: pip install transformers torch torchvision")
    raise Exception("Transformers is required for vision models")

# Import PaddleOCR
PADDLEOCR_AVAILABLE = False
try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
    print("✓ PaddleOCR available")
except Exception as e:
    PADDLEOCR_AVAILABLE = False
    print(f"⚠️ PaddleOCR not available: {str(e)[:100]}")

# Import EasyOCR
EASYOCR_AVAILABLE = False
try:
    import easyocr
    EASYOCR_AVAILABLE = True
    print("✓ EasyOCR available")
except Exception as e:
    EASYOCR_AVAILABLE = False
    print(f"⚠️ EasyOCR not available: {str(e)[:100]}")

class VisionTools:
    """Tools for image analysis: VQA and OCR using BLIP-VQA, PaddleOCR and EasyOCR"""
    
    def __init__(self):
        """Initialize vision models"""
        self.vqa_processor = None
        self.vqa_model = None
        self.paddleocr = None
        self.easyocr_reader = None
        self.device = "cuda" if TRANSFORMERS_AVAILABLE and torch.cuda.is_available() else "cpu"
        
        print(f"🖥️ Vision tools will use device: {self.device}")
        print("📦 Models: BLIP-VQA (VQA) + PaddleOCR/EasyOCR (OCR)")
        print("💡 Use extract_text_paddleocr() or extract_text_easyocr() for OCR")
        
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
    

    def load_easyocr(self):
        """Lazy load EasyOCR - Simple and accurate OCR"""
        if self.easyocr_reader is None:
            if not EASYOCR_AVAILABLE:
                raise Exception("EasyOCR not available. Please install: pip install easyocr")
            try:
                print("🔄 Loading EasyOCR reader (English + Vietnamese)...")
                import easyocr
                self.easyocr_reader = easyocr.Reader(['en', 'vi'], gpu=False)  # Dùng CPU trước
                print("✓ EasyOCR loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading EasyOCR: {e}")
                import traceback
                print(traceback.format_exc())
                raise Exception(f"Failed to load EasyOCR: {e}")
        return self.easyocr_reader
    
    def load_paddleocr(self):
        """Lazy load PaddleOCR - Advanced OCR with structured output"""
        if self.paddleocr is None:
            if not PADDLEOCR_AVAILABLE:
                raise Exception("PaddleOCR not available. Please install: pip install paddleocr")
            try:
                print("🔄 Loading PaddleOCR pipeline...")
                self.paddleocr = PaddleOCR(
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    use_textline_orientation=False
                )
                print("✓ PaddleOCR loaded successfully!")
            except Exception as e:
                print(f"✗ Error loading PaddleOCR: {e}")
                raise Exception(f"Failed to load PaddleOCR: {e}")
        return self.paddleocr
    
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
    
    def extract_text_easyocr(self, image_path: str, detail: int = 1) -> Dict[str, Any]:
        """
        Extract text using EasyOCR
        
        Args:
            image_path: Path to image file
            detail: 0 = simple text list, 1 = bounding boxes + text + confidence
            
        Returns:
            Dict with extracted text and detection details
        """
        try:
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"Image not found: {image_path}"
                }
            
            # Load EasyOCR reader
            reader = self.load_easyocr()
            
            print("📄 Extracting text from image with EasyOCR...")
            
            # Run OCR
            result = reader.readtext(image_path, detail=detail)
            
            # Process results
            if detail == 0:
                # Simple list of text
                extracted_text = "\n".join(result)
                detections = []
            else:
                # Detailed results with bounding boxes
                extracted_text = "\n".join([text for (bbox, text, conf) in result])
                detections = [
                    {
                        "bbox": [[int(x), int(y)] for x, y in bbox],  # Convert to JSON-serializable format
                        "text": text,
                        "confidence": float(conf)
                    }
                    for bbox, text, conf in result
                ]
            
            return {
                "success": True,
                "text": extracted_text,
                "detections": detections,
                "image": image_path,
                "model": "EasyOCR"
            }
            
        except Exception as e:
            import traceback
            error_msg = traceback.format_exc()
            print(f"✗ EasyOCR Error: {error_msg}")
            return {
                "success": False,
                "error": f"EasyOCR failed: {str(e)}"
            }
    
    def extract_text_paddleocr(self, image_path: str, output_path: Optional[str] = "output") -> Dict[str, Any]:
        """Extract text using PaddleOCR (supports structured output)
        
        Args:
            image_path: Path to image file or URL
            output_path: Optional output directory for image and JSON results
            
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
            
            # Load PaddleOCR
            ocr = self.load_paddleocr()
            print(f"📄 Extracting text from image with PaddleOCR...")
            
            # Run prediction
            result = ocr.predict(input=image_path)
            
            # Process results
            all_text = []
            results_data = []
            output_image_paths = []
            
            for idx, res in enumerate(result):
                # Print to console
                res.print()
                
                # Save to image and JSON if output_path provided
                if output_path:
                    # Create output directory if it doesn't exist
                    os.makedirs(output_path, exist_ok=True)
                    
                    # Save visualized image with bounding boxes
                    print(f"💾 Saving result to: {output_path}")
                    res.save_to_img(output_path)
                    res.save_to_json(output_path)
                    
                    # Get the saved image path - PaddleOCR tạo file với tên *_ocr_res_img.png
                    base_name = os.path.splitext(os.path.basename(image_path))[0]
                    output_img = os.path.join(output_path, f"{base_name}_ocr_res_img.png")
                    print(f"🔍 Looking for output image at: {output_img}")
                    if os.path.exists(output_img):
                        print(f"✓ Found output image: {output_img}")
                        output_image_paths.append(output_img)
                    else:
                        print(f"✗ Output image not found at: {output_img}")
                        # List files in output directory to see what was created
                        if os.path.exists(output_path):
                            files = os.listdir(output_path)
                            print(f"📁 Files in output directory: {files}")
                
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
                "output_images": output_image_paths,  # Hình ảnh đã OCR với bounding box
                "model": "PaddleOCR",
                "output_saved": output_path if output_path else None
            }
            
        except Exception as e:
            import traceback
            print(f"✗ PaddleOCR Error: {traceback.format_exc()}")
            return {
                "success": False,
                "error": f"PaddleOCR failed: {str(e)}"
            }
    
    def cleanup(self):
        """Clean up models from memory"""
        if self.vqa_processor is not None:
            del self.vqa_processor
            self.vqa_processor = None
            
        if self.vqa_model is not None:
            del self.vqa_model
            self.vqa_model = None
        
        if self.paddleocr is not None:
            del self.paddleocr
            self.paddleocr = None
        
        if self.easyocr_reader is not None:
            del self.easyocr_reader
            self.easyocr_reader = None
        
        # Clear CUDA cache if available
        if TRANSFORMERS_AVAILABLE and torch.cuda.is_available():
            torch.cuda.empty_cache()


# Global instance
vision_tools = VisionTools()
