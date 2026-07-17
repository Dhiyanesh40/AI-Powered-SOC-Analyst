import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (incidentId) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('disconnected');
  const ws = useRef(null);

  // Simulated agent thoughts to ensure UI operates gracefully
  const mockThoughts = [
    { agent_name: "Orchestrator Agent", thought: "Evaluating incoming ML intrusion detection alert...", action: "Triage Alert" },
    { agent_name: "Log Analysis Agent", thought: "Parsing network logs. Extracting flow details: Source 192.168.10.5 targeting port 80. Packet lengths indicate potential SYN flood.", action: "Extract IoCs" },
    { agent_name: "Threat Detection Agent", thought: "Verifying signature. Comparing TCP SYN rate against DoS profiles. Matching positive for DDoS Hulk behavior.", action: "Verify Anomaly" },
    { agent_name: "Threat Intelligence Agent", thought: "Searching knowledge base ChromaDB collection 'playbooks' and 'mitre_attack' for T1498 (Network DoS). Found 2 relevant mitigation chunks.", action: "Retrieve Playbook" },
    { agent_name: "Investigation Agent", thought: "Synthesizing log analysis and playbooks context. Constructing firewall remediation rules for IP 192.168.10.5.", action: "Build Containment Strategy" },
    { agent_name: "Report Generation Agent", thought: "Formatting incident report. Compiling Executive Summary, IoC tables, and command checklists.", action: "Compile Report" }
  ];

  const triggerSimulation = () => {
    setStatus('streaming');
    setMessages([]);
    
    mockThoughts.forEach((thought, idx) => {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          ...thought,
          timestamp: new Date().toLocaleTimeString()
        }]);
        if (idx === mockThoughts.length - 1) {
          setStatus('completed');
        }
      }, (idx + 1) * 2000);
    });
  };

  useEffect(() => {
    if (!incidentId) return;

    setStatus('connecting');
    // Try connecting to live WebSocket
    const wsUrl = `ws://${window.location.hostname}:8000/ws/agents/${incidentId}`;
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setStatus('connected');
        console.log('Agent WebSocket connected.');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, data]);
        } catch (e) {
          console.error("Error parsing WS packet:", e);
        }
      };

      ws.current.onerror = () => {
        setStatus('failed');
        console.warn("WebSocket connection failed. Operating in simulated agent demo mode.");
        triggerSimulation();
      };

      ws.current.onclose = () => {
        setStatus('disconnected');
      };
    } catch (err) {
      console.warn("WS initialization error. Running simulation.", err);
      triggerSimulation();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [incidentId]);

  return {
    messages,
    status,
    triggerSimulation // Expose simulation trigger for manual testing
  };
};
