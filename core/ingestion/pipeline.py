import asyncio
import time
from collections import deque
from typing import Dict, Any, List

class RingBuffer:
    """In-memory ring buffer for low-latency processing."""
    def __init__(self, capacity: int):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, event: Dict[str, Any]):
        self.buffer.append(event)
    
    def pop_all(self) -> List[Dict[str, Any]]:
        events = list(self.buffer)
        self.buffer.clear()
        return events

class IngestionPipeline:
    """
    Layer 1: Data Normalization
    Handles 500+ events/sec through AsyncIO-based pipeline.
    """
    def __init__(self):
        self.buffer = RingBuffer(capacity=5000)
        self.schema = ["timestamp", "source_ip", "dest_ip", "protocol", "event_type", "payload_info"]
        
    def normalize(self, raw_data: Dict[str, Any], fmt: str) -> Dict[str, Any]:
        """Normalizes heterogeneous logs into a unified event schema."""
        normalized = {k: None for k in self.schema}
        normalized["timestamp"] = time.time()
        
        if fmt == "netflow":
            normalized.update({
                "source_ip": raw_data.get("src"),
                "dest_ip": raw_data.get("dst"),
                "protocol": raw_data.get("proto"),
                "event_type": "network_flow",
                "payload_info": {"bytes": raw_data.get("bytes")}
            })
        elif fmt == "syslog":
            normalized.update({
                "source_ip": raw_data.get("host"),
                "event_type": "system_log",
                "payload_info": {"msg": raw_data.get("message")}
            })
        elif fmt == "cef":
            normalized.update({
                "source_ip": raw_data.get("src"),
                "dest_ip": raw_data.get("dst"),
                "event_type": "common_event_format",
                "payload_info": {"signature": raw_data.get("sig")}
            })
            
        return normalized

    async def ingest_stream(self, data_stream: List[Dict[str, Any]], format_type: str):
        """Asynchronously ingests and buffers normalized events."""
        for raw_event in data_stream:
            normalized_event = self.normalize(raw_event, format_type)
            self.buffer.push(normalized_event)
            # Simulate high-throughput processing speed
            if len(self.buffer.buffer) % 100 == 0:
                await asyncio.sleep(0.001) 
        
        print(f"[Layer 1] Ingested {len(data_stream)} events. Buffer state: {len(self.buffer.buffer)} events cached.")

    def get_ready_events(self) -> List[Dict[str, Any]]:
        return self.buffer.pop_all()
