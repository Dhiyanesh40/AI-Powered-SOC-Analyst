from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Path
from typing import Dict, List
import json
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, incident_id: str):
        await websocket.accept()
        if incident_id not in self.active_connections:
            self.active_connections[incident_id] = []
        self.active_connections[incident_id].append(websocket)
        logger.info(f"WebSocket client connected to incident: {incident_id}")
        
    def disconnect(self, websocket: WebSocket, incident_id: str):
        if incident_id in self.active_connections:
            if websocket in self.active_connections[incident_id]:
                self.active_connections[incident_id].remove(websocket)
            if not self.active_connections[incident_id]:
                del self.active_connections[incident_id]
        logger.info(f"WebSocket client disconnected from incident: {incident_id}")
                
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
        
    async def broadcast_to_incident(self, incident_id: str, message: dict):
        if incident_id in self.active_connections:
            payload = json.dumps(message)
            for connection in self.active_connections[incident_id]:
                try:
                    await connection.send_text(payload)
                except Exception as e:
                    logger.error(f"Error sending websocket message: {e}")

manager = ConnectionManager()

@router.websocket("/ws/agents/{incident_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    incident_id: str = Path(...)
):
    await manager.connect(websocket, incident_id)
    try:
        # Keep connection open and handle incoming messages if any
        while True:
            data = await websocket.receive_text()
            # If the client sends a message, echo it or process it
            try:
                parsed_data = json.loads(data)
                # echo for keepalive / testing
                await manager.send_personal_message(
                    json.dumps({"status": "received", "data": parsed_data}),
                    websocket
                )
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({"error": "Invalid JSON format"}),
                    websocket
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket, incident_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, incident_id)
