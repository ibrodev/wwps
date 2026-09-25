import json
import re
from typing import Any

import redis

from app.schemas.geojson import Result


redis_client = redis.Redis(
    host="redis",
    port=6379,
    decode_responses=True,
)


def progress_key(job_id: str) -> str:
    return f"wapor:job:{job_id}"

def set_result_cache(progress_key: str, result: Result):
    redis_client.hset(
        progress_key,
        mapping={
            "data": json.dumps(result)
        }
    )

def get_result_cache(progress_key: str):
    
    data = redis_client.hgetall(progress_key)

    return data


def set_progress(
    job_id: str,
    *,
    status: str,
    cached: int = 0,
    current: int = 0,
    total: int = 0,
    percent: float = 0,
    message: str | None = None,
    results: list[Result] | None = None
):
    data: dict[str, Any] = {
        "status": status,
        "current": current,
        "total": total,
        "percent": percent,
        "cached": cached,
    }

    if message is not None:
        data["message"] = message

    if results is not None:
        data["results"] = results

    redis_client.hset(
        progress_key(job_id),
        mapping=data,
    )


def get_progress(job_id: str):
    data = redis_client.hgetall(
        progress_key(job_id)
    )

    if not data:
        return None

    return {
        "job_id": job_id,
        "status": data.get("status"),
        "cached": int(data.get("cached", 0)),
        "current": int(data.get("current", 0)),
        "total": int(data.get("total", 0)),
        "percent": float(data.get("percent", 0)),
        "message": data.get("message"),
        "results": data.get("results")
    }