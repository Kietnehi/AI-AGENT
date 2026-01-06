"""Speech-to-Text Tools using OpenAI Whisper and SpeechRecognition"""
import os
import tempfile
from pathlib import Path
from typing import Dict, Any, Literal
import speech_recognition as sr

# Check if OpenAI is available
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI not installed. Whisper features will be unavailable.")

# Check if pydub is available for audio conversion
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False
    print("⚠️  pydub not installed. Audio conversion may be limited.")


class SpeechToTextTool:
    """
    Speech-to-Text tool supporting multiple methods:
    - OpenAI Whisper: High accuracy, can translate to English automatically
    - SpeechRecognition (Google): Free, supports multiple languages
    """
    
    def __init__(self, openai_api_key: str = None):
        """
        Initialize Speech-to-Text tool
        
        Args:
            openai_api_key: OpenAI API key for Whisper (optional)
        """
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        
        if self.openai_api_key and OPENAI_AVAILABLE:
            openai.api_key = self.openai_api_key
            self.whisper_available = True
            print("✅ OpenAI Whisper initialized")
        else:
            self.whisper_available = False
            print("⚠️  Whisper unavailable - no API key or OpenAI not installed")
        
        # Initialize speech recognizer for fallback method
        self.recognizer = sr.Recognizer()
        print("✅ SpeechRecognition initialized")
    
    def transcribe_with_whisper(
        self,
        audio_file_path: str,
        language: str = None,
        translate_to_english: bool = False,
        model: str = "whisper-1"
    ) -> Dict[str, Any]:
        """
        Transcribe audio using OpenAI Whisper
        
        Args:
            audio_file_path: Path to audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm)
            language: Language code (e.g., 'vi', 'en'). Auto-detect if None.
            translate_to_english: If True, translate to English
            model: Whisper model to use (default: 'whisper-1')
            
        Returns:
            Dict with transcription result
        """
        if not self.whisper_available:
            return {
                "success": False,
                "error": "Whisper not available. Check OpenAI API key."
            }
        
        try:
            with open(audio_file_path, "rb") as audio_file:
                if translate_to_english:
                    # Translate to English
                    response = openai.audio.translations.create(
                        model=model,
                        file=audio_file
                    )
                else:
                    # Transcribe in original language
                    response = openai.audio.transcriptions.create(
                        model=model,
                        file=audio_file,
                        language=language if language else None
                    )
            
            return {
                "success": True,
                "text": response.text,
                "method": "whisper",
                "language": language if language else "auto",
                "translated": translate_to_english
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Whisper transcription error: {str(e)}",
                "method": "whisper"
            }
    
    def transcribe_with_google(
        self,
        audio_file_path: str,
        language: str = "vi-VN"
    ) -> Dict[str, Any]:
        """
        Transcribe audio using Google Speech Recognition (free)
        
        Args:
            audio_file_path: Path to audio file (will be converted to WAV if needed)
            language: Language code (e.g., 'vi-VN', 'en-US')
            
        Returns:
            Dict with transcription result
        """
        converted_path = None
        try:
            # Check if file is WAV format, if not convert it
            file_ext = Path(audio_file_path).suffix.lower()
            
            if file_ext != '.wav':
                print(f"🔄 Converting {file_ext} to WAV format...")
                if not PYDUB_AVAILABLE:
                    return {
                        "success": False,
                        "error": "Audio format conversion not available. Please use WAV format.",
                        "method": "google_speech_recognition"
                    }
                
                # Convert to WAV
                try:
                    audio = AudioSegment.from_file(audio_file_path)
                    # Export as WAV with proper settings for speech recognition
                    converted_path = audio_file_path.replace(file_ext, '.wav')
                    audio.export(
                        converted_path,
                        format='wav',
                        parameters=['-ar', '16000', '-ac', '1']  # 16kHz, mono
                    )
                    audio_file_path = converted_path
                    print(f"✅ Converted to WAV: {converted_path}")
                except Exception as conv_error:
                    print(f"❌ Conversion error: {conv_error}")
                    return {
                        "success": False,
                        "error": f"Audio conversion failed: {str(conv_error)}",
                        "method": "google_speech_recognition"
                    }
            
            # Load audio file
            print(f"🎤 Loading audio file: {audio_file_path}")
            with sr.AudioFile(audio_file_path) as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                # Record the audio
                audio_data = self.recognizer.record(source)
            
            print(f"🌐 Calling Google Speech Recognition API...")
            # Recognize speech using Google Speech Recognition
            text = self.recognizer.recognize_google(audio_data, language=language)
            
            print(f"✅ Transcription successful: {text}")
            
            # Clean up converted file
            if converted_path and os.path.exists(converted_path):
                os.unlink(converted_path)
            
            return {
                "success": True,
                "text": text,
                "method": "google_speech_recognition",
                "language": language
            }
            
        except sr.UnknownValueError:
            # Clean up converted file
            if converted_path and os.path.exists(converted_path):
                os.unlink(converted_path)
            return {
                "success": False,
                "error": "Could not understand audio. Please speak clearly and try again.",
                "method": "google_speech_recognition"
            }
        except sr.RequestError as e:
            # Clean up converted file
            if converted_path and os.path.exists(converted_path):
                os.unlink(converted_path)
            return {
                "success": False,
                "error": f"Google Speech Recognition service error: {str(e)}",
                "method": "google_speech_recognition"
            }
        except Exception as e:
            # Clean up converted file
            if converted_path and os.path.exists(converted_path):
                os.unlink(converted_path)
            import traceback
            error_detail = traceback.format_exc()
            print(f"❌ Google Speech Error:\n{error_detail}")
            return {
                "success": False,
                "error": f"Transcription error: {str(e)}",
                "method": "google_speech_recognition"
            }
    
    def transcribe(
        self,
        audio_file_path: str,
        method: Literal["auto", "whisper", "google"] = "auto",
        language: str = None,
        translate_to_english: bool = False
    ) -> Dict[str, Any]:
        """
        Transcribe audio using the specified method or auto-select
        
        Args:
            audio_file_path: Path to audio file
            method: 'whisper', 'google', or 'auto' (tries Whisper first, falls back to Google)
            language: Language code (e.g., 'vi', 'vi-VN', 'en', 'en-US')
            translate_to_english: If True, translate to English (Whisper only)
            
        Returns:
            Dict with transcription result
        """
        # Normalize language code
        if language:
            if '-' not in language:
                # Convert short codes to full codes for Google
                lang_map = {
                    'vi': 'vi-VN',
                    'en': 'en-US',
                    'zh': 'zh-CN',
                    'ja': 'ja-JP',
                    'ko': 'ko-KR',
                    'fr': 'fr-FR',
                    'de': 'de-DE',
                    'es': 'es-ES'
                }
                google_lang = lang_map.get(language, f"{language}-{language.upper()}")
                whisper_lang = language
            else:
                google_lang = language
                whisper_lang = language.split('-')[0]
        else:
            google_lang = 'vi-VN'
            whisper_lang = None
        
        # Method selection
        if method == "whisper":
            return self.transcribe_with_whisper(
                audio_file_path,
                language=whisper_lang,
                translate_to_english=translate_to_english
            )
        
        elif method == "google":
            return self.transcribe_with_google(audio_file_path, language=google_lang)
        
        else:  # auto
            # Try Whisper first if available
            if self.whisper_available:
                result = self.transcribe_with_whisper(
                    audio_file_path,
                    language=whisper_lang,
                    translate_to_english=translate_to_english
                )
                if result["success"]:
                    return result
                # Fall back to Google if Whisper fails
                print("⚠️  Whisper failed, falling back to Google Speech Recognition")
            
            # Use Google Speech Recognition as fallback
            return self.transcribe_with_google(audio_file_path, language=google_lang)


# Global instance
_speech_tool = None


def get_speech_tool(openai_api_key: str = None) -> SpeechToTextTool:
    """
    Get or create the global SpeechToTextTool instance
    
    Args:
        openai_api_key: OpenAI API key (optional)
        
    Returns:
        SpeechToTextTool instance
    """
    global _speech_tool
    if _speech_tool is None:
        _speech_tool = SpeechToTextTool(openai_api_key=openai_api_key)
    return _speech_tool


# Example usage
if __name__ == "__main__":
    tool = get_speech_tool()
    
    # Example: Transcribe an audio file
    # result = tool.transcribe("audio.wav", method="auto", language="vi")
    # print(result)
