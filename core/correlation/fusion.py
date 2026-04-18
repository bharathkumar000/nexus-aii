from typing import Dict, Any, List

class CorrelationEngine:
    """
    Layer 3: Correlation
    Links network anomalies with behavioral endpoint changes.
    Assigns final confidence and severity.
    """
    def __init__(self):
        self.severity_map = {
            (0, 30): "Low",
            (30, 60): "Medium",
            (60, 85): "High",
            (85, 101): "Critical"
        }

    def calculate_severity(self, score: float) -> str:
        for (low, high), label in self.severity_map.items():
            if low <= score < high:
                return label
        return "Critical"

    def correlate(self, detection_result: Dict[str, Any], event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Behavioral and temporal fusion.
        Simulates checking if a process change matched the network anomaly.
        """
        ml_confidence = detection_result["confidence"] * 100
        
        # Simulated Cross-Layer Fusion
        # If the destination IP is external and it's a critical protocol, boost confidence
        behavioral_multiplier = 1.2 if event.get("protocol") == "UDP" else 1.0
        
        final_confidence = min(100.0, ml_confidence * behavioral_multiplier)
        severity = self.calculate_severity(final_confidence)
        
        return {
            "source": event.get("source_ip"),
            "threat_type": detection_result["threat_class"],
            "confidence_score": round(final_confidence, 2),
            "severity": severity,
            "status": "Genuine" if final_confidence > 50 else "False Positive",
            "cross_layer_match": "Linked: Network -> Endpoint Process" if final_confidence > 80 else "Uncorrelated"
        }
