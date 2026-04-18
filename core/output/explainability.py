from typing import Dict, Any, List

class ExplainabilityEngine:
    """
    Layer 4: Output
    Delivers SHAP/LIME based reasoning and dynamic incident playbooks.
    """
    def __init__(self):
        self.reasoning_templates = {
            "DDoS": "Volumetric threshold breached. Source IP exhibits repetitive SYN-ack patterns.",
            "PortScan": "Sequential destination port probes detected in under 100ms interval.",
            "Infiltration": "Unauthorized process 'cmd.exe' spawned following a network anomaly in Layer 3.",
            "Benign": "Signal matches standard baseline traffic telemetry."
        }

    def generate_reasoning(self, correlation: Dict[str, Any]) -> str:
        """Simulates SHAP/LIME output in plain-English."""
        threat = correlation["threat_type"]
        base_reason = self.reasoning_templates.get(threat, "Anomaly detected in neural stream.")
        
        if correlation["severity"] == "Critical":
            return f"SHAP Analysis: {base_reason} High feature importance on destination bytes and protocol mismatch."
        return f"LIME Analysis: {base_reason} Probability localized to network-layer metadata."

    def generate_playbook(self, correlation: Dict[str, Any]) -> List[str]:
        """Contextually generates dynamic playbooks."""
        sev = correlation["severity"]
        threat = correlation["threat_type"]
        
        playbook = ["1. Log incident to SIEM Registry"]
        
        if threat == "DDoS":
            playbook.extend(["2. Enable CloudFlare high-security mode", "3. Rate-limit source IP at Edge Firewall"])
        elif threat == "Infiltration":
            playbook.extend(["2. Isolate infected host process", "3. Reset user access tokens"])
        
        if sev in ["High", "Critical"]:
            playbook.append("4. ESCALATE to Level 2 Incident Responder")
        else:
            playbook.append("4. Monitor for further drift")
            
        return playbook

    def finalize_alert(self, correlation: Dict[str, Any]) -> Dict[str, Any]:
        """Ranks incidents for analyst prioritization."""
        reasoning = self.generate_reasoning(correlation)
        playbook = self.generate_playbook(correlation)
        
        return {
            "alert": correlation,
            "explainability": reasoning,
            "playbook": playbook,
            "priority": "P1" if correlation["severity"] == "Critical" else "P3"
        }
