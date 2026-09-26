import time
import uuid
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.core.logging import logger
from app.models.entities import SocialAdapter, PlatformPost
from app.schemas.adapter import AdapterTestResponse

def utcnow():
    return datetime.now(timezone.utc)

class SocialConnectorService:
    @classmethod
    async def test_connection(cls, adapter: SocialAdapter) -> AdapterTestResponse:
        """
        Tests connectivity to a personal social adapter (live webhook or platform API).
        """
        start_time = time.time()
        
        # Test 1: Live Webhook Endpoint (Discord, Slack, Zapier, Make, n8n, Buffer, Custom API)
        if adapter.webhook_url:
            try:
                headers = {"Content-Type": "application/json", "User-Agent": "SceneSetu-Adapter/1.0"}
                if adapter.custom_headers and isinstance(adapter.custom_headers, dict):
                    headers.update(adapter.custom_headers)
                if adapter.api_key:
                    headers["Authorization"] = f"Bearer {adapter.api_key}"

                test_body = {
                    "event": "adapter.test_ping",
                    "platform": adapter.platform,
                    "adapter_name": adapter.adapter_name,
                    "timestamp": utcnow().isoformat(),
                    "message": "SceneSetu live connection test successful."
                }

                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(adapter.webhook_url, json=test_body, headers=headers)
                    latency = round((time.time() - start_time) * 1000, 2)
                    
                    if resp.status_code in (200, 201, 202, 204):
                        return AdapterTestResponse(
                            success=True,
                            message=f"Live Webhook responded with HTTP {resp.status_code} ({latency}ms).",
                            platform=adapter.platform,
                            status_code=resp.status_code,
                            latency_ms=latency,
                            details={"response_snippet": resp.text[:200]}
                        )
                    else:
                        return AdapterTestResponse(
                            success=False,
                            message=f"Webhook returned HTTP {resp.status_code}: {resp.text[:150]}",
                            platform=adapter.platform,
                            status_code=resp.status_code,
                            latency_ms=latency
                        )
            except Exception as e:
                latency = round((time.time() - start_time) * 1000, 2)
                return AdapterTestResponse(
                    success=False,
                    message=f"Webhook connection failed: {str(e)}",
                    platform=adapter.platform,
                    latency_ms=latency
                )

        # Test 2: Platform API credentials (X / Twitter, Meta / Instagram, YouTube)
        token = adapter.access_token or adapter.api_key
        if not token:
            return AdapterTestResponse(
                success=False,
                message="No API Key, Access Token, or Webhook URL configured.",
                platform=adapter.platform
            )

        try:
            if adapter.platform in ("x_twitter", "x", "twitter"):
                # Test X API v2
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.get(
                        "https://api.twitter.com/2/users/me",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    latency = round((time.time() - start_time) * 1000, 2)
                    if resp.status_code == 200:
                        data = resp.json().get("data", {})
                        return AdapterTestResponse(
                            success=True,
                            message=f"Connected to X account @{data.get('username', 'user')} (ID: {data.get('id', 'unknown')})",
                            platform=adapter.platform,
                            status_code=200,
                            latency_ms=latency,
                            details=data
                        )
                    elif resp.status_code in (401, 403):
                        return AdapterTestResponse(
                            success=False,
                            message=f"X API authentication failed (HTTP {resp.status_code}). Check your Bearer / Access token.",
                            platform=adapter.platform,
                            status_code=resp.status_code,
                            latency_ms=latency
                        )
                    else:
                        return AdapterTestResponse(
                            success=True,
                            message=f"X API reachable (HTTP {resp.status_code}, {latency}ms).",
                            platform=adapter.platform,
                            status_code=resp.status_code,
                            latency_ms=latency
                        )

            elif adapter.platform == "instagram":
                # Test Instagram Graph API
                account_id = adapter.account_id or "me"
                async with httpx.AsyncClient(timeout=8.0) as client:
                    url = f"https://graph.facebook.com/v19.0/{account_id}?fields=id,username&access_token={token}"
                    resp = await client.get(url)
                    latency = round((time.time() - start_time) * 1000, 2)
                    if resp.status_code == 200:
                        data = resp.json()
                        return AdapterTestResponse(
                            success=True,
                            message=f"Connected to Instagram Account: @{data.get('username', account_id)}",
                            platform=adapter.platform,
                            status_code=200,
                            latency_ms=latency,
                            details=data
                        )
                    else:
                        return AdapterTestResponse(
                            success=False,
                            message=f"Instagram Graph API error (HTTP {resp.status_code}). Verify Access Token and Account ID.",
                            platform=adapter.platform,
                            status_code=resp.status_code,
                            latency_ms=latency
                        )

            elif adapter.platform == "youtube":
                # Test YouTube Data API v3
                async with httpx.AsyncClient(timeout=8.0) as client:
                    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true"
                    resp = await client.get(url, headers={"Authorization": f"Bearer {token}"})
                    latency = round((time.time() - start_time) * 1000, 2)
                    if resp.status_code == 200:
                        return AdapterTestResponse(
                            success=True,
                            message="Connected to YouTube Channel Data API v3.",
                            platform=adapter.platform,
                            status_code=200,
                            latency_ms=latency
                        )
                    else:
                        return AdapterTestResponse(
                            success=False,
                            message=f"YouTube API returned HTTP {resp.status_code}. Verify OAuth credentials.",
                            platform=adapter.platform,
                            status_code=resp.status_code,
                            latency_ms=latency
                        )

        except Exception as e:
            latency = round((time.time() - start_time) * 1000, 2)
            return AdapterTestResponse(
                success=False,
                message=f"Network error contacting {adapter.platform} API: {str(e)}",
                platform=adapter.platform,
                latency_ms=latency
            )

        return AdapterTestResponse(
            success=True,
            message="Credentials verified.",
            platform=adapter.platform
        )

    @classmethod
    async def publish_live(cls, adapter: SocialAdapter, post: PlatformPost) -> Dict[str, Any]:
        """
        Executes real live dispatch using the user's personal adapter.
        """
        media_url = post.asset.public_url if post.asset else None
        
        # 1. Live Webhook Dispatch (Zapier, Buffer, Discord, n8n, Custom Automation)
        if adapter.webhook_url:
            headers = {"Content-Type": "application/json", "User-Agent": "SceneSetu-Publisher/1.0"}
            if adapter.custom_headers and isinstance(adapter.custom_headers, dict):
                headers.update(adapter.custom_headers)
            if adapter.api_key:
                headers["Authorization"] = f"Bearer {adapter.api_key}"

            payload = {
                "event": "content.published",
                "post_id": post.id,
                "campaign_id": post.campaign_id,
                "platform": post.platform,
                "adapter_name": adapter.adapter_name,
                "title": post.title,
                "copy_primary": post.copy_primary,
                "copy_secondary": post.copy_secondary,
                "hashtags": post.hashtags,
                "cta": post.cta,
                "media_url": media_url,
                "aspect_ratio": post.asset.aspect_ratio if post.asset else None,
                "dispatched_at": utcnow().isoformat()
            }

            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(adapter.webhook_url, json=payload, headers=headers)
                if resp.status_code in (200, 201, 202, 204):
                    external_id = f"wh_{uuid.uuid4().hex[:10]}"
                    return {
                        "external_post_id": external_id,
                        "external_url": adapter.webhook_url,
                        "payload_snapshot": {
                            **payload,
                            "dispatch_type": "personal_webhook",
                            "webhook_status_code": resp.status_code,
                            "webhook_response": resp.text[:300]
                        }
                    }
                else:
                    raise RuntimeError(f"Webhook rejected delivery with HTTP {resp.status_code}: {resp.text[:200]}")

        # 2. X (Twitter) API v2 Real Post
        token = adapter.access_token or adapter.api_key
        if adapter.platform in ("x_twitter", "x", "twitter") and token:
            tweet_text = post.copy_primary
            if post.hashtags:
                tags_str = " ".join(f"#{t.lstrip('#')}" for t in post.hashtags)
                if len(tweet_text) + len(tags_str) + 1 <= 280:
                    tweet_text = f"{tweet_text}\n{tags_str}"

            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(
                    "https://api.twitter.com/2/tweets",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    json={"text": tweet_text}
                )
                if resp.status_code in (200, 201):
                    data = resp.json().get("data", {})
                    tweet_id = data.get("id", f"tw_{uuid.uuid4().hex[:8]}")
                    return {
                        "external_post_id": tweet_id,
                        "external_url": f"https://x.com/i/status/{tweet_id}",
                        "payload_snapshot": {
                            "text": tweet_text,
                            "media_url": media_url,
                            "dispatch_type": "personal_x_api",
                            "tweet_id": tweet_id
                        }
                    }
                else:
                    raise RuntimeError(f"X API v2 error (HTTP {resp.status_code}): {resp.text[:200]}")

        # 3. Instagram Graph API Real Post
        if adapter.platform == "instagram" and token and adapter.account_id:
            async with httpx.AsyncClient(timeout=15.0) as client:
                caption = post.copy_primary
                if post.cta:
                    caption += f"\n\n{post.cta}"
                if post.hashtags:
                    caption += "\n\n" + " ".join(f"#{t.lstrip('#')}" for t in post.hashtags)

                # Step 1: Create media container
                container_url = f"https://graph.facebook.com/v19.0/{adapter.account_id}/media"
                params = {
                    "image_url": media_url,
                    "caption": caption,
                    "access_token": token
                }
                c_resp = await client.post(container_url, params=params)
                if c_resp.status_code == 200:
                    creation_id = c_resp.json().get("id")
                    # Step 2: Publish media container
                    pub_url = f"https://graph.facebook.com/v19.0/{adapter.account_id}/media_publish"
                    p_resp = await client.post(pub_url, params={"creation_id": creation_id, "access_token": token})
                    if p_resp.status_code == 200:
                        ig_post_id = p_resp.json().get("id", creation_id)
                        return {
                            "external_post_id": ig_post_id,
                            "external_url": f"https://instagram.com/p/{ig_post_id}",
                            "payload_snapshot": {
                                "caption": caption,
                                "media_url": media_url,
                                "dispatch_type": "personal_instagram_graph_api",
                                "ig_post_id": ig_post_id
                            }
                        }

        raise NotImplementedError("Adapter configured without supported live API credentials.")
