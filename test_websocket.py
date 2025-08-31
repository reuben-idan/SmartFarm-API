import asyncio
import websockets
import json
import uuid

async def test_websocket():
    client_id = str(uuid.uuid4())
    uri = f"ws://localhost:8000/ws/{client_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to WebSocket with ID: {client_id}")
            
            # Test sending a ping message
            ping_msg = json.dumps({"type": "ping"})
            await websocket.send(ping_msg)
            print(f"Sent: {ping_msg}")
            
            # Wait for the pong response
            response = await websocket.recv()
            print(f"Received: {response}")
            
            # Wait for some metrics
            for _ in range(3):
                response = await websocket.recv()
                print(f"Received metrics: {response[:200]}...")  # Print first 200 chars
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(test_websocket())
