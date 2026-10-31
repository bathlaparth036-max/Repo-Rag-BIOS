"""Real Person AI Neural Voice Synthesis API.

Uses Edge Neural TTS for lifelike human speech voices (Jenny, Guy, Aria, etc.).
"""
import io
import re
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import edge_tts

logger = logging.getLogger("reporag.voice")

router = APIRouter(prefix="/voice", tags=["voice"])

REAL_PERSON_VOICES = [
    {
        "id": "en-US-JennyNeural",
        "name": "Jenny",
        "gender": "Female",
        "locale": "en-US",
        "description": "Natural human conversational female voice (Warm & Clear)",
        "recommended": True
    },
    {
        "id": "en-US-GuyNeural",
        "name": "Guy",
        "gender": "Male",
        "locale": "en-US",
        "description": "Natural human conversational male voice (Clear & Confident)",
        "recommended": True
    },
    {
        "id": "en-US-AriaNeural",
        "name": "Aria",
        "gender": "Female",
        "locale": "en-US",
        "description": "Expressive real human female narrator (Engaging & Dynamic)",
        "recommended": False
    },
    {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher",
        "gender": "Male",
        "locale": "en-US",
        "description": "Authoritative natural male narrator (Tech & Briefing)",
        "recommended": False
    },
    {
        "id": "en-US-AvaNeural",
        "name": "Ava",
        "gender": "Female",
        "locale": "en-US",
        "description": "Modern casual real human female voice",
        "recommended": False
    },
    {
        "id": "en-US-AndrewNeural",
        "name": "Andrew",
        "gender": "Male",
        "locale": "en-US",
        "description": "Warm real human male voice",
        "recommended": False
    },
    {
        "id": "en-GB-SoniaNeural",
        "name": "Sonia (UK)",
        "gender": "Female",
        "locale": "en-GB",
        "description": "Natural British real human female narrator",
        "recommended": False
    },
    {
        "id": "en-GB-RyanNeural",
        "name": "Ryan (UK)",
        "gender": "Male",
        "locale": "en-GB",
        "description": "Natural British real human male narrator",
        "recommended": False
    }
]


def clean_text_for_speech(text: str) -> str:
    """Preprocess technical text, code and markdown into natural spoken cadence."""
    # Remove code blocks
    cleaned = re.sub(r"```[\s\S]*?```", "Code snippet omitted.", text)
    # Remove markdown tables
    cleaned = re.sub(r"\|[^\n]+\|", " ", cleaned)
    # Remove URLs
    cleaned = re.sub(r"https?://\S+", "link", cleaned)
    # Inline code ticks
    cleaned = re.sub(r"`([^`]+)`", r"\1", cleaned)
    # Bold / Italic
    cleaned = re.sub(r"\*\*([^*]+)\*\*", r"\1", cleaned)
    cleaned = re.sub(r"\*([^*]+)\*", r"\1", cleaned)
    # Markdown links [Text](url) -> Text
    cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
    # Headings
    cleaned = re.sub(r"#+\s*", "", cleaned)
    # Bullet points / list marks
    cleaned = re.sub(r"^\s*[-*•]\s*", "", cleaned, flags=re.MULTILINE)
    # Replace technical symbols with spoken words
    cleaned = re.sub(r"\bAPI\b", "A.P.I.", cleaned)
    cleaned = re.sub(r"\bRAG\b", "rag", cleaned)
    cleaned = re.sub(r"\bUI\b", "U.I.", cleaned)
    cleaned = re.sub(r"\bRepoRAG\b", "Repo Rag", cleaned)
    cleaned = re.sub(r"->", " goes to ", cleaned)
    # Normalize whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


class SynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-JennyNeural"
    rate: Optional[str] = "+0%"
    pitch: Optional[str] = "+0Hz"


@router.get("/models")
def get_available_voices():
    """Returns available high-definition real human neural voice profiles."""
    return {
        "provider": "Edge Neural Human Speech",
        "type": "real_person",
        "voices": REAL_PERSON_VOICES
    }


@router.post("/synthesize")
async def synthesize_speech(req: SynthesizeRequest):
    """Synthesize high-fidelity real human speech from text and stream MP3."""
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    clean = clean_text_for_speech(req.text)
    if not clean:
        raise HTTPException(status_code=400, detail="No readable speech text found.")

    # Validate voice or fallback
    valid_ids = [v["id"] for v in REAL_PERSON_VOICES]
    voice_id = req.voice if req.voice in valid_ids else "en-US-JennyNeural"

    try:
        communicate = edge_tts.Communicate(clean, voice_id, rate=req.rate, pitch=req.pitch)
        
        async def audio_stream():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]

        return StreamingResponse(
            audio_stream(),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": 'inline; filename="speech.mp3"',
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as exc:
        logger.error(f"TTS synthesis error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(exc)}")


@router.get("/speak")
async def speak_get(
    text: str = Query(..., description="Text to synthesize"),
    voice: str = Query("en-US-JennyNeural", description="Voice ID"),
    rate: str = Query("+0%", description="Rate adjustment (e.g. +0%, +10%)"),
    pitch: str = Query("+0Hz", description="Pitch adjustment")
):
    """GET endpoint for direct audio streaming in audio tags or download."""
    return await synthesize_speech(SynthesizeRequest(text=text, voice=voice, rate=rate, pitch=pitch))
