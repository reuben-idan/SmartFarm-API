from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uuid

from app.websockets.main import websocket_endpoint, manager

app = FastAPI(title="SmartFarm API", version="1.0.0")

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
    print("Starting WebSocket metrics broadcast")
    await manager.start_metrics_broadcast()

@app.on_event("shutdown")
async def shutdown():
    """Shutdown event handler"""
    print("Stopping WebSocket metrics broadcast")
    await manager.stop_metrics_broadcast()
