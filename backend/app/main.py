from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os

app = FastAPI(
    title="SmartFarm API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Import WebSocket components only if they exist
try:
    from app.websockets.main import websocket_endpoint, manager
    HAS_WEBSOCKETS = True
except ImportError:
    HAS_WEBSOCKETS = False
    print("WebSocket components not found. WebSocket functionality will be disabled.")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "SmartFarm API is running"}

@app.websocket("/ws/{client_id}")
async def websocket_route(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication"""
    await websocket_endpoint(websocket, client_id)

@app.on_event("startup")
async def startup():
    """Startup event handler"""
    if HAS_WEBSOCKETS:
        print("Starting WebSocket metrics broadcast")
        await manager.start_metrics_broadcast()
    else:
        print("WebSocket manager not available. Skipping WebSocket initialization.")

@app.on_event("shutdown")
async def shutdown():
    """Shutdown event handler"""
    if HAS_WEBSOCKETS:
        print("Stopping WebSocket metrics broadcast")
        await manager.stop_metrics_broadcast()

# This block ensures the app can be run with `python -m app.main`
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
