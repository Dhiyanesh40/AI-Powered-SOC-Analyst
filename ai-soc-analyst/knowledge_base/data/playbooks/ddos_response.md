# SOC Playbook: Distributed Denial of Service (DDoS) Mitigation

## 1. Detection and Verification
- Monitor for sudden spikes in network bandwidth or TCP connection counts.
- Identify the attack subtype (e.g., TCP SYN Flood, UDP Flood, application-layer HTTP flood like DDoS Hulk).
- Verify that the target server is unresponsive or has elevated latency.

## 2. Containment Strategy
- **IP Blocking:** Identify top offending source IPs from Netflow records. Apply block rules at the perimeter firewall or upstream ISP (via BGP flowspec).
- **Rate Limiting:** Enable rate limiting at the firewall or reverse proxy (Nginx limit_req).
- **SYN Flood Protection:** Enable TCP SYN Cookies on target servers:
  ```bash
  sysctl -w net.ipv4.tcp_syncookies=1
  ```
- **WAF Rules:** For HTTP floods, configure WAF challenge screens (e.g., Cloudflare JS challenge) for requests matching anomalous headers or user agents.

## 3. Post-Incident Review
- Analyze traffic flow records to optimize detection thresholds.
- Update WAF/firewall rules to automate block list ingestion.
