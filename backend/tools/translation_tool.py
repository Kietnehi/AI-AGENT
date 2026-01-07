"""Google Translation Tool using googletrans library"""
from googletrans import Translator, LANGUAGES
import traceback
import asyncio

class TranslationTool:
    def __init__(self):
        self.translator = Translator()
        self.supported_languages = LANGUAGES
    
    async def translate_async(self, text: str, source_lang: str = 'auto', target_lang: str = 'en'):
        """
        Translate text from source language to target language (async)
        
        Args:
            text: Text to translate
            source_lang: Source language code (default: 'auto' for auto-detection)
            target_lang: Target language code (default: 'en')
        
        Returns:
            dict with translation result
        """
        try:
            # Perform translation
            result = await self.translator.translate(
                text,
                src=source_lang,
                dest=target_lang
            )
            
            # Get detected or source language name
            detected_lang_code = result.src
            detected_lang_name = LANGUAGES.get(detected_lang_code, detected_lang_code)
            
            # Get target language name
            target_lang_name = LANGUAGES.get(target_lang, target_lang)
            
            return {
                "success": True,
                "original_text": text,
                "translated_text": result.text,
                "source_language_code": detected_lang_code,
                "source_language_name": detected_lang_name,
                "target_language_code": target_lang,
                "target_language_name": target_lang_name,
                "pronunciation": getattr(result, 'pronunciation', None)
            }
            
        except Exception as e:
            error_detail = traceback.format_exc()
            print(f"Translation Error: {error_detail}")
            return {
                "success": False,
                "error": str(e),
                "message": "Translation failed. Please try again."
            }
    
    def translate(self, text: str, source_lang: str = 'auto', target_lang: str = 'en'):
        """
        Synchronous wrapper for translate_async
        """
        # Create new event loop if needed
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self.translate_async(text, source_lang, target_lang))
    
    def get_supported_languages(self):
        """Get all supported languages"""
        return {
            "success": True,
            "languages": self.supported_languages,
            "count": len(self.supported_languages)
        }
    
    async def detect_language_async(self, text: str):
        """Detect language of given text (async)"""
        try:
            detection = await self.translator.detect(text)
            lang_code = detection.lang
            lang_name = LANGUAGES.get(lang_code, lang_code)
            
            return {
                "success": True,
                "language_code": lang_code,
                "language_name": lang_name,
                "confidence": detection.confidence
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def detect_language(self, text: str):
        """Synchronous wrapper for detect_language_async"""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self.detect_language_async(text))


# Global instance
_translation_tool = None

def get_translation_tool():
    """Get or create translation tool instance"""
    global _translation_tool
    if _translation_tool is None:
        _translation_tool = TranslationTool()
    return _translation_tool
