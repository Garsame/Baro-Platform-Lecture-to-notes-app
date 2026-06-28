import azure.cognitiveservices.speech as speechsdk
import os
import logging
import re
from app.core.config import settings

logger = logging.getLogger("somali_notes.speech_service")

class SpeechService:
    def __init__(self):
        self.speech_key = getattr(settings, "AZURE_SPEECH_KEY", None)
        self.speech_region = getattr(settings, "AZURE_SPEECH_REGION", None)

    def clean_notes_for_tts(self, summary: str | None, key_points: list | None, structured_content: str | None) -> str:
        parts = []
        if summary:
            parts.append("Fahamka Guud ahaan.")
            parts.append(summary)
        
        if key_points:
            parts.append("Qodobbada Muhiimka ah.")
            # Ensure key points are strings and clean them
            points_text = ". ".join([str(p) for p in key_points if p])
            parts.append(points_text)
            
        if structured_content:
            parts.append("Faahfaahin.")
            parts.append(structured_content)
            
        full_text = "\n\n".join(parts)
        
        # Clean markdown formatting: remove *, #, `, _, -, [ ], ( )
        cleaned = re.sub(r'[*#`_\-\[\]()]', '', full_text)
        # Clean double spaces/excessive newlines
        cleaned = re.sub(r'\n+', '\n', cleaned)
        cleaned = re.sub(r' +', ' ', cleaned)
        return cleaned.strip()

    def split_text_into_chunks(self, text: str, max_chunk_size: int = 3000) -> list[str]:
        # Split text into paragraphs first
        paragraphs = text.split("\n")
        chunks = []
        current_chunk = []
        current_size = 0

        for p in paragraphs:
            p_strip = p.strip()
            if not p_strip:
                continue

            # If a single paragraph is larger than max_chunk_size, we split it by sentences
            if len(p_strip) > max_chunk_size:
                sentences = re.split(r'(?<=[.!?]) +', p_strip)
                for s in sentences:
                    if len(s) > max_chunk_size:
                        # If a sentence is still too long, split by length
                        for i in range(0, len(s), max_chunk_size):
                            chunks.append(s[i:i+max_chunk_size])
                    else:
                        if current_size + len(s) + 1 > max_chunk_size:
                            chunks.append(" ".join(current_chunk))
                            current_chunk = [s]
                            current_size = len(s)
                        else:
                            current_chunk.append(s)
                            current_size += len(s) + 1
            else:
                if current_size + len(p_strip) + 1 > max_chunk_size:
                    chunks.append("\n".join(current_chunk))
                    current_chunk = [p_strip]
                    current_size = len(p_strip)
                else:
                    current_chunk.append(p_strip)
                    current_size += len(p_strip) + 1

        if current_chunk:
            chunks.append("\n".join(current_chunk))

        return [c for c in chunks if c.strip()]

    def synthesize_notes(self, text: str, output_path: str, voice: str = "female") -> bool:
        if not self.speech_key or not self.speech_region:
            raise ValueError("Azure Speech key or region is not configured in settings.")

        voice_name = "so-SO-UbaxNeural" if voice == "female" else "so-SO-MuuseNeural"

        speech_config = speechsdk.SpeechConfig(subscription=self.speech_key, region=self.speech_region)
        # Configure output format to MP3
        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
        )
        speech_config.speech_synthesis_voice_name = voice_name

        # Split text into safe chunks to avoid 10-minute (600,000ms) limit errors
        chunks = self.split_text_into_chunks(text, max_chunk_size=3000)
        logger.info(f"Split text into {len(chunks)} chunks for synthesis.")

        # Create synthesizer with audio_config=None to write to memory
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=None)

        combined_audio_bytes = bytearray()

        for idx, chunk in enumerate(chunks):
            logger.info(f"Synthesizing chunk {idx + 1}/{len(chunks)} (length: {len(chunk)} chars)")
            result = synthesizer.speak_text_async(chunk).get()

            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                combined_audio_bytes.extend(result.audio_data)
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                error_msg = f"Speech synthesis canceled at chunk {idx + 1}: {cancellation_details.reason}"
                if cancellation_details.reason == speechsdk.CancellationReason.Error:
                    error_msg += f". Error details: {cancellation_details.error_details}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
            else:
                raise RuntimeError(f"Speech synthesis failed at chunk {idx + 1} with unknown reason.")

        # Write the concatenated MP3 bytes to the output file
        with open(output_path, "wb") as f:
            f.write(combined_audio_bytes)

        logger.info(f"Successfully wrote {len(combined_audio_bytes)} bytes of concatenated MP3 to {output_path}")
        return True
