"""
Automatic Speech Recognition Tool using OpenAI Whisper
"""
import whisper
import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class ASRTool:
    def __init__(self, model_name: str = "large-v3"):
        """
        Initialize ASR tool with Whisper model
        
        Args:
            model_name: Whisper model name (tiny, base, small, medium, large, large-v2, large-v3, turbo)
        """
        self.model_name = model_name
        self.model = None
        logger.info(f"ASR Tool initialized with model: {model_name}")
    
    def load_model(self):
        """Load Whisper model"""
        if self.model is None:
            try:
                logger.info(f"Loading Whisper model: {self.model_name}")
                self.model = whisper.load_model(self.model_name)
                logger.info(f"Whisper model loaded successfully on {self.model.device}")
            except Exception as e:
                logger.error(f"Error loading Whisper model: {str(e)}")
                raise
    
    def transcribe_audio(
        self, 
        audio_path: str,
        language: Optional[str] = None,
        task: str = "transcribe"
    ) -> Dict:
        """
        Transcribe audio file to text
        
        Args:
            audio_path: Path to audio file
            language: Language code (e.g., 'vi' for Vietnamese, 'en' for English)
            task: 'transcribe' or 'translate' (translate to English)
            
        Returns:
            Dictionary with transcription result
        """
        try:
            # Load model if not already loaded
            self.load_model()
            
            # Check if file exists
            if not os.path.exists(audio_path):
                raise FileNotFoundError(f"Audio file not found: {audio_path}")
            
            logger.info(f"Transcribing audio file: {audio_path}")
            
            # Transcribe using whisper
            result = self.model.transcribe(
                audio_path,
                language=language,
                task=task,
                verbose=False
            )
            
            logger.info("Transcription completed successfully")
            
            return {
                "success": True,
                "transcription": result["text"].strip(),
                "language": result.get("language", language or "auto-detected"),
                "task": task,
                "model": self.model_name,
                "device": str(self.model.device)
            }
            
        except Exception as e:
            logger.error(f"Error in transcription: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "transcription": None
            }
    
    def detect_language(self, audio_path: str) -> Dict:
        """
        Detect language of audio file
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Dictionary with detected language
        """
        try:
            self.load_model()
            
            # Load audio and pad/trim it to fit 30 seconds
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)
            
            # Make log-Mel spectrogram
            mel = whisper.log_mel_spectrogram(audio, n_mels=self.model.dims.n_mels).to(self.model.device)
            
            # Detect the spoken language
            _, probs = self.model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            
            return {
                "success": True,
                "language": detected_lang,
                "confidence": probs[detected_lang]
            }
            
        except Exception as e:
            logger.error(f"Error detecting language: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def unload_model(self):
        """Free up memory by unloading the model"""
        if self.model is not None:
            del self.model
            self.model = None
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("Whisper model unloaded")


# Global instance
_asr_tool = None

def get_asr_tool(model_name: str = "large-v3") -> ASRTool:
    """Get or create global ASR tool instance"""
    global _asr_tool
    if _asr_tool is None or _asr_tool.model_name != model_name:
        _asr_tool = ASRTool(model_name=model_name)
    return _asr_tool
