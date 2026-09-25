from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import wapor

app = FastAPI(
    name="Wheat Water Productivity System - API Backend Service"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    wapor.router
)

@app.get('/api/health')
async def health():
    return {
        "status": "Okay"
    }