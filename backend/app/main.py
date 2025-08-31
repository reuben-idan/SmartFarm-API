from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import uuid
import os

from app.api.endpoints import auth as auth_endpoints

app = FastAPI(
    title="SmartFarm API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include API routers
app.include_router(
    auth_endpoints.router,
    prefix="/api/auth",
    tags=["Authentication"]
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

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to SmartFarm API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "Service is running"}

@app.websocket("/ws/{client_id}")
async def websocket_route(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication"""
    await websocket_endpoint(websocket, client_id)

@app.on_event("startup")
async def startup():
    """Startup event handler"""
    print("Starting up SmartFarm API...")
    # Initialize WebSocket manager if available
    if HAS_WEBSOCKETS:
        await manager.connect()
    print("Startup complete")

@app.on_event("shutdown")
async def shutdown():
    print("Shutting down SmartFarm API...")
    # Clean up WebSocket connections if available
    if HAS_WEBSOCKETS:
        await manager.disconnect()
    print("Shutdown complete")

# This block ensures the app can be run with `python -m app.main`
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
