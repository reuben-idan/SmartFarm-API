import asyncio
import json
import random
from datetime import datetime
from typing import Dict, List

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.metrics_task = None

    async def connect(self, websocket: WebSocket, client_id: str):
        try:
            # Set CORS headers for WebSocket
            await websocket.accept()
            
            # Store the connection
            self.active_connections[client_id] = websocket
            print(f"Client {client_id} connected")
            
            # Send initial connection confirmation
            await self.send_personal_message(
                json.dumps({"type": "connection_established", "message": "Connected to SmartFarm WebSocket"}),
                client_id
            )
            
            # Start metrics broadcast if not already started
            await self.start_metrics_broadcast()
            
        except Exception as e:
            print(f"Error in WebSocket connection for {client_id}: {e}")
            if not websocket.client_state == WebSocketState.DISCONNECTED:
                await websocket.close()
            raise

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"Client {client_id} disconnected")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections and self.active_connections[client_id].client_state != WebSocketState.DISCONNECTED:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                print(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast(self, message: str):
        disconnected_clients = []
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error broadcasting to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        for client_id in disconnected_clients:
            self.disconnect(client_id)

    async def start_metrics_broadcast(self):
        """Start a background task to broadcast metrics to all connected clients"""
        if self.metrics_task is None or self.metrics_task.done():
            self.metrics_task = asyncio.create_task(self._broadcast_metrics())

    async def stop_metrics_broadcast(self):
        """Stop the metrics broadcast task"""
        if self.metrics_task and not self.metrics_task.done():
            self.metrics_task.cancel()
            try:
                await self.metrics_task
            except asyncio.CancelledError:
                pass

    async def _broadcast_metrics(self):
        """Background task to generate and broadcast fake metrics"""
        try:
            while True:
                if not self.active_connections:
                    await asyncio.sleep(1)
                    continue

                # Generate fake metrics
                metrics = {
                    'type': 'metrics',
                    'data': {
                        'temperature': round(random.uniform(18, 32), 1),  # 18°C to 32°C
                        'humidity': random.randint(40, 90),  # 40% to 90%
                        'soilMoisture': random.randint(20, 80),  # 20% to 80%
                        'lightIntensity': random.randint(1000, 10000),  # 1000 to 10000 lux
                        'timestamp': datetime.utcnow().isoformat()
                    }
                }
                await self.broadcast(json.dumps(metrics))
                await asyncio.sleep(5)  # Update every 5 seconds

        except asyncio.CancelledError:
            print("Metrics broadcast task cancelled")
        except Exception as e:
            print(f"Error in metrics broadcast: {e}")

# Global WebSocket manager instance
manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # Set CORS headers
    headers = {
        "Access-Control-Allow-Origin": "http://localhost:3000, http://localhost:3002",
        "Access-Control-Allow-Credentials": "true"
    }
    
    try:
        # Accept the WebSocket connection
        await websocket.accept(subprotocol="json", headers=headers)
        
        # Add client to connection manager
        await manager.connect(websocket, client_id)
        
        # Keep the connection alive
        while True:
            try:
                # Wait for any message from the client
                data = await websocket.receive_text()
                
                # Handle different message types
                try:
                    message = json.loads(data)
                    if message.get('type') == 'ping':
                        await manager.send_personal_message(
                            json.dumps({"type": "pong", "timestamp": datetime.utcnow().isoformat()}),
                            client_id
                        )
                except json.JSONDecodeError:
                    # If not JSON, just echo it back
                    await manager.send_personal_message(
                        json.dumps({"type": "echo", "message": data}),
                        client_id
                    )
                    
            except WebSocketDisconnect:
                print(f"Client {client_id} disconnected")
                manager.disconnect(client_id)
                break
                
            except Exception as e:
                print(f"Error handling WebSocket message from {client_id}: {e}")
                await manager.send_personal_message(
                    json.dumps({"type": "error", "message": str(e)}),
                    client_id
                )
    
    except Exception as e:
        print(f"WebSocket connection error for {client_id}: {e}")
        if not websocket.client_state == WebSocketState.DISCONNECTED:
            await websocket.close()
        manager.disconnect(client_id)
        raise
