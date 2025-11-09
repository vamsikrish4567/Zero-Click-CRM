"""Voice processing service using Google Speech-to-Text."""

from app.core.config import settings
import os


class VoiceProcessingService:
    """Service for transcribing voice recordings."""

    def __init__(self):
        """Initialize Speech-to-Text client lazily."""
        self._client = None
        self._credentials_available = self._check_credentials()

    def _check_credentials(self) -> bool:
        """Check if Google Cloud credentials are available."""
        if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            return True
        try:
            import google.auth
            google.auth.default()
            return True
        except Exception:
            return False

    @property
    def client(self):
        """Get or create Speech client."""
        if self._client is None:
            if not self._credentials_available:
                raise Exception("Google Cloud credentials not configured")
            from google.cloud import speech
            self._client = speech.SpeechClient()
        return self._client

    def transcribe_audio(self, audio_content: bytes, audio_format: str = "mp3") -> str:
        """Transcribe audio content to text.

        Args:
            audio_content: Audio file content as bytes
            audio_format: Audio format (mp3, wav, flac, etc.)

        Returns:
            Transcribed text
        """
        if not self._credentials_available:
            raise Exception(
                "Google Cloud Speech-to-Text not configured. "
                "Please set up credentials as described in SETUP.md"
            )

        from google.cloud import speech

        # Map format to encoding
        encoding_map = {
            "mp3": speech.RecognitionConfig.AudioEncoding.MP3,
            "wav": speech.RecognitionConfig.AudioEncoding.LINEAR16,
            "flac": speech.RecognitionConfig.AudioEncoding.FLAC,
            "ogg": speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
            "webm": speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        }

        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=encoding_map.get(audio_format.lower(), speech.RecognitionConfig.AudioEncoding.MP3),
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_automatic_punctuation=True,
            enable_word_time_offsets=False,
            model="latest_long",
        )

        try:
            response = self.client.recognize(config=config, audio=audio)
            
            # Combine all transcripts
            transcript = ""
            for result in response.results:
                transcript += result.alternatives[0].transcript + " "
            
            return transcript.strip()
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            raise


# Global instance
voice_service = VoiceProcessingService()

