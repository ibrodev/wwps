from fastapi import FastAPI


app = FastAPI(
    name="Wheat Water Productivity System - API Backend Service"
)



@app.get('/api/health')
async def health():
    return {
        "status": "Okay"
    }