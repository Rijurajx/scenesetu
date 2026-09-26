import os
import io
import json
import time
import asyncio
from typing import Optional, Dict, Any
import httpx
from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings
from app.core.logging import logger
from app.ai.base import VisualProvider, GeneratedVisualResult
from app.services.storage import storage_service

class PixazoProvider(VisualProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        image_endpoint: Optional[str] = None,
        status_endpoint: Optional[str] = None,
        video_endpoint: Optional[str] = None,
        image_to_video_endpoint: Optional[str] = None,
    ):
        self.api_key = api_key or settings.PIXAZO_API_KEY
        self.base_url = base_url or settings.PIXAZO_BASE_URL
        self.model = model or settings.PIXAZO_IMAGE_MODEL
        self.image_endpoint = image_endpoint or settings.PIXAZO_IMAGE_ENDPOINT
        self.status_endpoint = status_endpoint or settings.PIXAZO_STATUS_ENDPOINT
        self.video_endpoint = video_endpoint or settings.PIXAZO_VIDEO_ENDPOINT
        self.image_to_video_endpoint = image_to_video_endpoint or settings.PIXAZO_IMAGE_TO_VIDEO_ENDPOINT

    def _get_dimensions_for_aspect_ratio(self, aspect_ratio: str) -> tuple[int, int]:
        # Flux Schnell handles aspect-tailored dimensions up to 1MP
        mapping = {
            "1:1": (768, 768),
            "16:9": (896, 512),
            "9:16": (512, 896),
            "4:5": (640, 800)
        }
        return mapping.get(aspect_ratio, (768, 768))

    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        negative_prompt: Optional[str] = None
    ) -> GeneratedVisualResult:
        width, height = self._get_dimensions_for_aspect_ratio(aspect_ratio)

        # Real Pixazo API call when key is provided
        if self.api_key and self.api_key not in ("your-pixazo-api-key", "placeholder"):
            logger.info(f"Calling Pixazo FLUX Schnell: endpoint={self.image_endpoint}, aspect={aspect_ratio} ({width}x{height})")
            
            headers = {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Ocp-Apim-Subscription-Key": self.api_key
            }
            payload = {
                "prompt": prompt,
                "num_steps": 4,
                "seed": int(time.time() * 1000) % 100000,
                "height": height,
                "width": width
            }

            try:
                proc = await asyncio.create_subprocess_exec(
                    "curl", "-s", "--max-time", "120", "--connect-timeout", "15",
                    "-X", "POST", self.image_endpoint,
                    "-H", "Content-Type: application/json",
                    "-H", "Cache-Control: no-cache",
                    "-H", f"Ocp-Apim-Subscription-Key: {self.api_key}",
                    "-d", json.dumps(payload),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await proc.communicate()
                if proc.returncode != 0:
                    err_msg = f"Pixazo curl process failed with code {proc.returncode}: {stderr.decode()}"
                    logger.error(err_msg)
                    raise RuntimeError(err_msg)

                raw_text = stdout.decode().strip()
                try:
                    data = json.loads(raw_text)
                except Exception:
                    logger.error(f"Invalid JSON from Pixazo: {raw_text}")
                    raise RuntimeError(f"Invalid JSON from Pixazo: {raw_text}")

                image_url = data.get("output") or data.get("url")

                # If asynchronous requestId is returned, poll checkStatus
                if not image_url and ("requestId" in data or "request_id" in data):
                    request_id = data.get("requestId") or data.get("request_id")
                    logger.info(f"Pixazo generation queued as requestId: {request_id}. Polling status...")
                    poll_payload = {"requestId": request_id}
                    for attempt in range(25):  # up to ~50s
                        await asyncio.sleep(2)
                        status_proc = await asyncio.create_subprocess_exec(
                            "curl", "-s", "--max-time", "15", "--connect-timeout", "5",
                            "-X", "POST", self.status_endpoint,
                            "-H", "Content-Type: application/json",
                            "-H", f"Ocp-Apim-Subscription-Key: {self.api_key}",
                            "-d", json.dumps(poll_payload),
                            stdout=asyncio.subprocess.PIPE,
                            stderr=asyncio.subprocess.PIPE
                        )
                        s_out, _ = await status_proc.communicate()
                        if status_proc.returncode == 0:
                            try:
                                status_data = json.loads(s_out.decode())
                                if status_data.get("status") == "completed":
                                    image_url = status_data.get("output")
                                    break
                                elif status_data.get("status") in ("failed", "error"):
                                    raise RuntimeError(f"Pixazo generation task failed: {status_data}")
                            except json.JSONDecodeError:
                                pass

                if not image_url:
                    raise RuntimeError(f"Pixazo completed but returned no output image URL: {data}")

                logger.info(f"Pixazo FLUX image ready at: {image_url}")

                # Download image bytes and upload directly to Supabase Storage
                image_bytes = None
                try:
                    proc_dl = await asyncio.create_subprocess_exec(
                        "curl", "-s", "--max-time", "15", "--connect-timeout", "8",
                        "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                        image_url,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    stdout_dl, _ = await proc_dl.communicate()
                    if proc_dl.returncode == 0 and len(stdout_dl) > 1000:
                        image_bytes = stdout_dl
                except Exception as e_dl:
                    logger.warning(f"curl download from Pixazo CDN warning: {e_dl}")

                if image_bytes:
                    file_name = f"flux_{int(time.time() * 1000)}_{aspect_ratio.replace(':', '_')}.png"
                    storage_path, public_url = await storage_service.store_media(
                        file_name=file_name,
                        file_bytes=image_bytes,
                        mime_type="image/png"
                    )
                    file_size = len(image_bytes)
                else:
                    public_url = image_url
                    storage_path = image_url
                    file_size = 1024 * 500

                return GeneratedVisualResult(
                    provider="pixazo",
                    model_name=self.model,
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    media_url=public_url,
                    width=width,
                    height=height,
                    aspect_ratio=aspect_ratio,
                    file_size_bytes=file_size,
                    mime_type="image/png",
                    raw_response=data
                )

            except Exception as e:
                logger.error(f"Pixazo image generation error: {e}. Generating fallback asset.")
                return self._generate_fallback_asset(prompt, aspect_ratio, width, height)

        # Local fallback only when no API key is provided (offline / test mode)
        logger.warning("No Pixazo API key configured. Generating local fallback asset.")
        return self._generate_fallback_asset(prompt, aspect_ratio, width, height)

    async def generate_video(
        self,
        prompt: str,
        duration: int = 6,
        resolution: str = "720p"
    ) -> Dict[str, Any]:
        """
        LTX 2.5 Lite text-to-video generation on Pixazo Gateway.
        """
        if not self.api_key:
            raise ValueError("PIXAZO_API_KEY is not configured.")

        headers = {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": self.api_key
        }
        payload = {
            "prompt": prompt,
            "resolution": resolution,
            "duration": duration
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(self.video_endpoint, json=payload, headers=headers)
            if resp.status_code != 200:
                raise RuntimeError(f"Pixazo LTX video generation failed ({resp.status_code}): {resp.text}")
            return resp.json()

    async def image_to_video(
        self,
        prompt: str,
        image_url: str,
        duration: int = 6,
        resolution: str = "720p"
    ) -> Dict[str, Any]:
        """
        LTX 2.5 Lite image-to-video generation on Pixazo Gateway.
        """
        if not self.api_key:
            raise ValueError("PIXAZO_API_KEY is not configured.")

        headers = {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": self.api_key
        }
        payload = {
            "prompt": prompt,
            "image_url": image_url,
            "resolution": resolution,
            "duration": duration
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(self.image_to_video_endpoint, json=payload, headers=headers)
            if resp.status_code != 200:
                raise RuntimeError(f"Pixazo LTX image-to-video failed ({resp.status_code}): {resp.text}")
            return resp.json()

    def _generate_fallback_asset(self, prompt: str, aspect_ratio: str, width: int, height: int) -> GeneratedVisualResult:
        os.makedirs("storage/media", exist_ok=True)
        img = Image.new("RGB", (width, height), color=(20, 24, 33))
        draw = ImageDraw.Draw(img)

        draw.rectangle([(10, 10), (width - 10, height - 10)], outline=(229, 9, 20), width=4)
        draw.rectangle([(20, 20), (width - 20, 80)], fill=(30, 36, 50))
        
        header_text = f"SceneSetu AI Studio | {self.model} [{aspect_ratio}]"
        draw.text((35, 40), header_text, fill=(255, 255, 255))

        prompt_snippet = (prompt[:120] + "...") if len(prompt) > 120 else prompt
        draw.text((35, 120), f"Prompt: {prompt_snippet}", fill=(200, 205, 215))

        file_id = f"asset_{int(time.time() * 1000)}_{aspect_ratio.replace(':', '_')}.jpg"
        file_path = os.path.join("storage/media", file_id)
        img.save(file_path, "JPEG", quality=90)
        file_size = os.path.getsize(file_path)

        public_url = f"/api/v1/assets/media/{file_id}"
        logger.info(f"Synthesized fallback asset: {file_path} ({width}x{height}, {file_size} bytes)")

        return GeneratedVisualResult(
            provider="pixazo",
            model_name=self.model,
            prompt=prompt,
            negative_prompt="blurry, distorted, low quality",
            media_url=public_url,
            width=width,
            height=height,
            aspect_ratio=aspect_ratio,
            file_size_bytes=file_size,
            mime_type="image/jpeg",
            raw_response={"local_path": file_path, "status": "synthesized"}
        )
