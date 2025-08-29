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
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client {client_id} connected")

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
    await manager.connect(websocket, client_id)
    await manager.start_metrics_broadcast()
    
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            print(f"Received from {client_id}: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id)
