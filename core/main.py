import asyncio
from core.ingestion.pipeline import IngestionPipeline
from core.detection.classifier import MLClassificationEngine
from core.correlation.fusion import CorrelationEngine
from core.output.explainability import ExplainabilityEngine

async def run_nexus_core():
    # Initialize 4-Layer System
    ingestor = IngestionPipeline()
    detector = MLClassificationEngine()
    correlator = CorrelationEngine()
    output_gen = ExplainabilityEngine()

    print("--- NEXUS.AI CORE ML SYSTEM INITIALIZING ---")
    
    # Layer 1: Ingestion Simulation
    raw_logs = [
        {"src": "192.168.1.105", "dst": "10.0.0.1", "proto": "TCP", "bytes": 4500},
        {"host": "Server-01", "message": "Failed login attempt from admin"},
        {"src": "45.12.1.22", "dst": "10.0.0.1", "proto": "UDP", "sig": "MALWARE_WIN_X64"}
    ]
    
    # Simulate AsyncIO ingestion
    await ingestor.ingest_stream(raw_logs[:1], "netflow")
    await ingestor.ingest_stream(raw_logs[1:2], "syslog")
    await ingestor.ingest_stream(raw_logs[2:], "cef")
    
    normalized_events = ingestor.get_ready_events()
    
    final_alerts = []

    # Processing through Layers 2, 3, and 4
    for event in normalized_events:
        print(f"\n[Processing Event] {event['event_type']} from {event['source_ip']}")
        
        # Layer 2: Detection
        prediction = detector.classify(event)
        
        # Layer 3: Correlation
        correlated_incident = correlator.correlate(prediction, event)
        
        # Layer 4: Output
        final_alert = output_gen.finalize_alert(correlated_incident)
        final_alerts.append(final_alert)
        
        # Display results for SOC
        print(f" > Threat Identified: {final_alert['alert']['threat_type']}")
        print(f" > Severity: {final_alert['alert']['severity']} ({final_alert['alert']['confidence_score']}%)")
        print(f" > Reasoning: {final_alert['explainability']}")
        print(f" > Dynamic Playbook: {final_alert['playbook']}")

    print("\n--- NEXUS.AI CORE ML SYSTEM IDLE ---")

if __name__ == "__main__":
    asyncio.run(run_nexus_core())
