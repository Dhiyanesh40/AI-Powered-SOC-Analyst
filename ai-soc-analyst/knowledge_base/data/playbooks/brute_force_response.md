# SOC Playbook: Credential Brute Force Response (SSH / FTP)

## 1. Detection and Verification
- Monitor auth logs (`/var/log/auth.log` or `/var/log/secure`) for high frequencies of password authentication failures.
- Check target ports (Port 22 for SSH-Patator, Port 21 for FTP-Patator).
- Identify source IPs initiating the scan.

## 2. Containment Strategy
- **Firewall Blocking:** Immediately drop all traffic from the offending source IP at the edge firewall:
  ```bash
  iptables -A INPUT -s <attacker_ip> -j DROP
  ```
- **Fail2Ban Implementation:** Enforce automatic blocking policies. Configure Fail2Ban to block IPs with more than 5 authentication failures within 10 minutes.
- **Port Relocation / Disabling:** Disable password authentication on critical assets, forcing SSH Key-based authentication instead:
  ```ssh
  PasswordAuthentication no
  ```
- **Host Isolation:** If a brute force attack successfully logs in (indicated by a login event immediately following many failures), isolate the host and start forensic analysis.
