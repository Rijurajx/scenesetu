import pytest
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone, timedelta
from app.main import app

@pytest.mark.asyncio
async def test_full_api_closed_loop():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health & Ready
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        res = await client.get("/api/v1/ready")
        assert res.status_code == 200

        # 2. Create Campaign from Brief
        campaign_payload = {
            "title": "নিশীথ রাতের ডাক (Midnight Call)",
            "brief": "A suspense crime thriller set in Kolkata involving an elusive radio jockey broadcasting encrypted messages at 2 AM.",
            "target_audience": "Bengali thriller fans, urban youth 18-35",
            "key_objectives": "Generate immense viral curiosity and drive app trailer downloads",
            "primary_language": "bengali"
        }
        create_res = await client.post("/api/v1/campaigns", json=campaign_payload)
        assert create_res.status_code == 201
        campaign_data = create_res.json()
        campaign_id = campaign_data["id"]

        # 3. Trigger Generation (Critical Vertical Slice)
        gen_res = await client.post(f"/api/v1/campaigns/{campaign_id}/generate")
        assert gen_res.status_code == 200
        gen_data = gen_res.json()
        assert gen_data["status"] == "success"
        assert gen_data["posts_generated"] == 3
        posts = gen_data["posts"]

        # 4. Verify Platform Differences & Native Bengali Copy
        platforms = [p["platform"] for p in posts]
        assert "instagram" in platforms
        assert "youtube" in platforms
        assert "x_twitter" in platforms

        # Check at least one post has native Bengali script
        bengali_post = next(p for p in posts if p["platform"] == "instagram")
        assert len(bengali_post["copy_primary"]) > 0
        assert bengali_post["status"] in ("pending_review", "validating")

        # 5. Human Approval Gate
        post_to_approve = bengali_post["id"]
        appr_res = await client.post(
            f"/api/v1/posts/{post_to_approve}/approve",
            json={"reviewer_name": "lead_editor", "feedback": "Excellent cultural nuance in Bengali copy."}
        )
        assert appr_res.status_code == 200
        assert appr_res.json()["status"] == "approved"

        # 6. Scheduling Approved Post
        sched_time = (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat()
        sched_res = await client.post(
            f"/api/v1/posts/{post_to_approve}/schedule",
            json={"scheduled_time": sched_time}
        )
        assert sched_res.status_code == 200
        assert sched_res.json()["status"] == "scheduled"

        # 7. Mock Publishing
        pub_res = await client.post(f"/api/v1/posts/{post_to_approve}/publish")
        assert pub_res.status_code == 200
        pub_data = pub_res.json()
        assert pub_data["status"] == "published"
        assert "instagram.com/p/ig_" in pub_data["external_url"]

        # 8. Seed Mock Metrics for Campaign Posts
        seed_res = await client.post(f"/api/v1/campaigns/{campaign_id}/seed-mock-metrics")
        assert seed_res.status_code == 200

        # 9. Like-for-Like Cross-Platform Comparison
        comp_res = await client.get(f"/api/v1/campaigns/{campaign_id}/comparison")
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert comp_data["campaign_id"] == campaign_id
        assert len(comp_data["posts"]) == 3

        # 10. Generate AI Insights with post ID citations
        insights_res = await client.post(f"/api/v1/campaigns/{campaign_id}/insights")
        assert insights_res.status_code == 200
        insights_data = insights_res.json()
        assert len(insights_data) > 0
        first_insight = insights_data[0]
        assert len(first_insight["evidence_post_ids"]) > 0
        assert first_insight["recommendation_for_next_brief"] != ""

        # 11. THE CLOSED LOOP: Retrieve insights to feed into the Next Campaign Brief!
        loop_res = await client.get("/api/v1/insights/next-brief-context")
        assert loop_res.status_code == 200
        feedbacks = loop_res.json()
        assert len(feedbacks) > 0

        # 12. Create a second campaign consuming the previous insight!
        next_campaign_payload = {
            "title": "অরণ্যের ছায়া (Shadows of the Forest)",
            "brief": "A follow-up mystery series set in the tea gardens of North Bengal.",
            "primary_language": "bilingual",
            "prior_insight_ids": [feedbacks[0]["id"]] # Closed loop evidence injection!
        }
        next_res = await client.post("/api/v1/campaigns", json=next_campaign_payload)
        assert next_res.status_code == 201
        assert next_res.json()["prior_insight_ids"] == [feedbacks[0]["id"]]

        # 13. Weekly Report Generation with citations
        rep_res = await client.post("/api/v1/reports/weekly", params={"reporting_period": "Week 38 - 2026"})
        assert rep_res.status_code == 200
        rep_data = rep_res.json()
        assert rep_data["reporting_period"] == "Week 38 - 2026"
        assert len(rep_data["evidence_citations"]) > 0
