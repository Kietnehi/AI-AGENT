"""Local LLM Tool with Qwen 2.5B"""
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
import torch
from typing import Optional, Dict, Any

class LocalLLM:
    """Local Language Model using Qwen 2.5B with 4-bit quantization"""
    
    def __init__(self, model_name: str = "Qwen/Qwen2.5-1.5B-Instruct"):
        """
        Initialize Local LLM with 4-bit quantization for low VRAM (4GB GPU)
        
        Args:
            model_name: Hugging Face model name (default: Qwen2.5-1.5B-Instruct for lighter weight)
        """
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🖥️ Local LLM will use device: {self.device}")
        if self.device == "cuda":
            print(f"💾 GPU VRAM optimization: 4-bit quantization enabled")
    
    def load_model(self):
        """Lazy load the model with 4-bit quantization"""
        if self.model is None:
            try:
                print(f"🔄 Loading local LLM: {self.model_name}...")
                
                # Load tokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(
                    self.model_name,
                    trust_remote_code=True
                )
                
                # Configure 4-bit quantization for 4GB VRAM
                if self.device == "cuda":
                    quantization_config = BitsAndBytesConfig(
                        load_in_4bit=True,
                        bnb_4bit_compute_dtype=torch.float16,
                        bnb_4bit_use_double_quant=True,
                        bnb_4bit_quant_type="nf4"
                    )
                    
                    print("⚙️ Using 4-bit quantization (NF4) for low VRAM...")
                    
                    # Load model with 4-bit quantization
                    self.model = AutoModelForCausalLM.from_pretrained(
                        self.model_name,
                        quantization_config=quantization_config,
                        device_map="auto",
                        trust_remote_code=True
                    )
                else:
                    # CPU mode - no quantization
                    self.model = AutoModelForCausalLM.from_pretrained(
                        self.model_name,
                        torch_dtype=torch.float32,
                        trust_remote_code=True
                    )
                    self.model = self.model.to(self.device)
                
                # Create pipeline without device parameter when using device_map="auto"
                self.pipeline = pipeline(
                    "text-generation",
                    model=self.model,
                    tokenizer=self.tokenizer
                )
                
                print("✓ Local LLM loaded successfully with 4-bit quantization!")
                print("📊 Memory usage: ~1-1.5GB VRAM (model weights)")
                
            except Exception as e:
                print(f"✗ Error loading local LLM: {e}")
                raise
        
        return self.pipeline
    
    def generate(
        self,
        prompt: str,
        max_length: int = 512,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 50
    ) -> Dict[str, Any]:
        """
        Generate text using local LLM
        
        Args:
            prompt: Input text prompt
            max_length: Maximum length of generated text
            temperature: Sampling temperature (higher = more random)
            top_p: Nucleus sampling parameter
            top_k: Top-k sampling parameter
            
        Returns:
            Dict with generated text and metadata
        """
        try:
            # Load model if not loaded
            pipe = self.load_model()
            
            # Format prompt for Qwen chat model
            messages = [
                {"role": "user", "content": prompt}
            ]
            
            # Generate
            outputs = pipe(
                messages,
                max_new_tokens=max_length,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                do_sample=True,
                return_full_text=False
            )
            
            # Extract generated text
            generated_text = outputs[0]["generated_text"]
            
            return {
                "success": True,
                "response": generated_text,
                "model": self.model_name,
                "device": self.device
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": self.model_name
            }
    
    def chat(
        self,
        message: str,
        history: Optional[list] = None,
        max_length: int = 512,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Chat with the model (with conversation history)
        
        Args:
            message: User message
            history: Conversation history as list of {"role": "user"/"assistant", "content": "..."}
            max_length: Maximum length of response
            temperature: Sampling temperature
            
        Returns:
            Dict with response and updated history
        """
        try:
            # Load model if not loaded
            pipe = self.load_model()
            
            # Build messages
            messages = history if history else []
            messages.append({"role": "user", "content": message})
            
            # Generate
            outputs = pipe(
                messages,
                max_new_tokens=max_length,
                temperature=temperature,
                do_sample=True,
                return_full_text=False
            )
            
            # Extract response
            response = outputs[0]["generated_text"]
            
            # Update history
            messages.append({"role": "assistant", "content": response})
            
            return {
                "success": True,
                "response": response,
                "history": messages,
                "model": self.model_name
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": self.model_name
            }
    
    def cleanup(self):
        """Clean up model from memory"""
        if self.model is not None:
            del self.model
            self.model = None
        
        if self.tokenizer is not None:
            del self.tokenizer
            self.tokenizer = None
        
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
        
        # Clear CUDA cache
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        print("Local LLM cleaned up")


# Global instance (will be initialized on first use)
local_llm = None

def get_local_llm() -> LocalLLM:
    """Get or create local LLM instance"""
    global local_llm
    if local_llm is None:
        local_llm = LocalLLM()
    return local_llm
