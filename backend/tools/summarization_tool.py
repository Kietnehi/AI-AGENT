"""Text Summarization Tool using BART"""
from transformers import pipeline
from typing import Optional, Dict, Any
import torch

class SummarizationTool:
    """Text Summarization using facebook/bart-large-cnn"""
    
    def __init__(self, model_name: str = "facebook/bart-large-cnn"):
        """
        Initialize Summarization Tool
        
        Args:
            model_name: Hugging Face model name (default: facebook/bart-large-cnn)
        """
        self.model_name = model_name
        self.pipeline = None
        self.device = 0 if torch.cuda.is_available() else -1
        print(f"🖥️ Summarization Tool will use device: {'GPU' if self.device == 0 else 'CPU'}")
    
    def load_model(self):
        """Lazy load the summarization pipeline"""
        if self.pipeline is None:
            try:
                print(f"🔄 Loading summarization model: {self.model_name}...")
                self.pipeline = pipeline(
                    "summarization",
                    model=self.model_name,
                    device=self.device
                )
                print(f"✅ Summarization model loaded successfully!")
            except Exception as e:
                print(f"❌ Error loading summarization model: {str(e)}")
                raise
    
    def summarize(
        self,
        text: str,
        max_length: int = 130,
        min_length: int = 30,
        do_sample: bool = False
    ) -> Dict[str, Any]:
        """
        Summarize the given text
        
        Args:
            text: The text to summarize
            max_length: Maximum length of summary (default: 130)
            min_length: Minimum length of summary (default: 30)
            do_sample: Whether to use sampling (default: False for deterministic)
            
        Returns:
            Dict containing the summary and metadata
        """
        self.load_model()
        
        try:
            # Validate text length
            if len(text.strip()) < 50:
                return {
                    "error": "Text is too short to summarize. Please provide at least 50 characters.",
                    "original_length": len(text)
                }
            
            # Truncate if text is too long (BART max is 1024 tokens)
            # Rough estimation: 1 token ≈ 4 characters
            max_input_chars = 3000  # Conservative limit
            if len(text) > max_input_chars:
                text = text[:max_input_chars]
                truncated = True
            else:
                truncated = False
            
            print(f"📝 Summarizing text ({len(text)} characters)...")
            
            # Generate summary
            result = self.pipeline(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=do_sample,
                truncation=True
            )
            
            summary_text = result[0]['summary_text']
            
            return {
                "summary": summary_text,
                "original_length": len(text),
                "summary_length": len(summary_text),
                "compression_ratio": round(len(summary_text) / len(text) * 100, 2),
                "truncated": truncated,
                "model": self.model_name
            }
            
        except Exception as e:
            print(f"❌ Error during summarization: {str(e)}")
            return {
                "error": f"Summarization failed: {str(e)}",
                "original_length": len(text)
            }


# Global instance (lazy-loaded)
_summarization_tool = None

def get_summarization_tool() -> SummarizationTool:
    """Get or create the global summarization tool instance"""
    global _summarization_tool
    if _summarization_tool is None:
        _summarization_tool = SummarizationTool()
    return _summarization_tool
