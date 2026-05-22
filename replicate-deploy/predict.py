"""
DoramaAI TTS Predictor — Replicate Cog deployment.

Generates narration audio from text using Microsoft Edge TTS voices,
with optional SSML prosody for sensual/dramatic narration style.
"""

import asyncio
import io
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import edge_tts
from cog import BasePredictor, Input, Path as CogPath
from PIL import Image


# Supported voices matching DoramaAI catalog
VOICES = {
    "pt-BR-ThalitaMultilingualNeural": "🇧🇷 Português (BR) - Yuna Sensual",
    "pt-BR-AntonioNeural": "🇧🇷 Português (BR) - Galã Intenso",
    "en-US-AvaMultilingualNeural": "🇺🇸 English - Seductive",
    "es-ES-ElviraNeural": "🇪🇸 Español - Pasión",
    "ko-KR-SunHiNeural": "🇰🇷 한국어 - 감성",
    "ja-JP-NanamiNeural": "🇯🇵 日本語 - 艶やか",
    "fr-FR-DeniseNeural": "🇫🇷 Français - Romance",
    "it-IT-ElsaNeural": "🇮🇹 Italiano - Passione",
    "de-DE-KatjaNeural": "🇩🇪 Deutsch - Verführung",
    "zh-CN-XiaoxiaoNeural": "🇨🇳 中文 - 诱惑",
}

DEFAULT_VOICE = "pt-BR-ThalitaMultilingualNeural"


class Predictor(BasePredictor):
    def setup(self):
        """Load any resources on startup."""
        pass

    def predict(
        self,
        text: str = Input(
            description="Text to convert to speech (max 2000 chars)",
        ),
        voice: str = Input(
            description="Edge TTS voice ID",
            default=DEFAULT_VOICE,
            choices=list(VOICES.keys()),
        ),
        rate: str = Input(
            description="Speech rate adjustment (e.g. '-20%' for slower, '+10%' for faster). Default is slow and provocative.",
            default="-25%",
        ),
        pitch: str = Input(
            description="Pitch adjustment (e.g. '+5%' for higher/thinner feminine voice, '-10%' for deeper)",
            default="+4%",
        ),
        output_format: str = Input(
            description="Output audio format",
            default="mp3",
            choices=["mp3", "wav", "ogg"],
        ),
        volume: str = Input(
            description="Volume adjustment (e.g. '+0%', '+20%', '-10%')",
            default="+0%",
        ),
    ) -> CogPath:
        """Generate TTS audio from text."""
        # Clamp text length
        text = text[:2000]

        # Run async TTS
        output_path = asyncio.get_event_loop().run_until_complete(
            self._generate(text, voice, rate, pitch, volume, output_format)
        )

        return CogPath(output_path)

    async def _generate(
        self,
        text: str,
        voice: str,
        rate: str,
        pitch: str,
        volume: str,
        output_format: str,
    ) -> str:
        # Validate voice
        if voice not in VOICES:
            voice = DEFAULT_VOICE

        # Generate with edge-tts
        communicate = edge_tts.Communicate(
            text=text,
            voice=voice,
            rate=rate,
            pitch=pitch,
            volume=volume,
        )

        tmp_mp3 = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        tmp_mp3.close()

        await communicate.save(tmp_mp3.name)

        # Convert format if needed
        if output_format == "mp3":
            return tmp_mp3.name

        output_path = tmp_mp3.name.replace(".mp3", f".{output_format}")
        cmd = [
            "ffmpeg", "-y", "-i", tmp_mp3.name,
        ]

        if output_format == "wav":
            cmd += ["-acodec", "pcm_s16le", "-ar", "44100"]
        elif output_format == "ogg":
            cmd += ["-acodec", "libvorbis", "-q:a", "6"]

        cmd.append(output_path)

        subprocess.run(cmd, check=True, capture_output=True)

        # Cleanup temp mp3
        Path(tmp_mp3.name).unlink(missing_ok=True)

        return output_path
