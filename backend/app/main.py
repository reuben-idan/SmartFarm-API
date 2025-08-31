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
frontend_urls = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:5173"  # Vite's default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
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

# WebSocket CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],
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
    if not HAS_WEBSOCKETS:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Set CORS headers for WebSocket
    origin = websocket.headers.get('origin')
    allowed_origins = ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003"]
    
    if origin and origin not in allowed_origins:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # Accept the connection with CORS headers
    await websocket.accept()
    
    try:
        # Use the websocket_endpoint from the websocket module
        await websocket_endpoint(websocket, client_id)
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
        if client_id in manager.active_connections:
            manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error for {client_id}: {str(e)}")
        if not websocket.client_state == WebSocketState.DISCONNECTED:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        manager.disconnect(client_id)

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
