import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Play, 
  Terminal, 
  BrainCircuit, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';

export const IncidentInvestigationPage = () => {
  const { alertId = 'demo-alert' } = useParams();
  const { messages, status, triggerSimulation } = useWebSocket(alertId);
  const [activeTab, setActiveTab] = useState('agent-run');

  // Hardcoded detail metrics for presentation
  const mockAlertInfo = {
    id: alertId,
    type: "DDoS Hulk",
    src: "192.168.10.5",
    dest: "192.168.10.3",
    src_port: "49202",
    dest_port: "80",
    protocol: "TCP",
    duration: "112,059 ms",
    confidence: "94.2%"
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-100">Incident Investigation</h2>
            <Badge value="Active Investigation" type="status" />
          </div>
          <p className="text-sm text-slate-400 mt-1">Incident Reference ID: {alertId}</p>
        </div>
        
        {/* Trigger agent action */}
        {status !== 'streaming' && status !== 'completed' && (
          <button 
            onClick={triggerSimulation}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold px-5 py-2.5 rounded-lg shadow-md transition-all duration-300 transform active:scale-95"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Multi-Agent Analysis</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Alert Summary Card */}
        <div className="space-y-6">
          <Card title="Threat Telemetry Details" icon={<ShieldAlert className="text-red-400" />}>
            <div className="space-y-4 mt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-700/40">
                <span className="text-slate-400">Target Attack Class</span>
                <span className="font-bold text-red-400">{mockAlertInfo.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/40">
                <span className="text-slate-400">Attacker Source IP</span>
                <span className="font-mono font-bold">{mockAlertInfo.src}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/40">
                <span className="text-slate-400">Target Destination IP</span>
                <span className="font-mono font-bold">{mockAlertInfo.dest}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/40">
                <span className="text-slate-400">Communication Ports</span>
                <span className="font-mono font-semibold">{mockAlertInfo.src_port} → {mockAlertInfo.dest_port}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/40">
                <span className="text-slate-400">Protocol</span>
                <span className="font-bold uppercase text-slate-300">{mockAlertInfo.protocol}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/40">
                <span className="text-slate-400">Flow Duration</span>
                <span className="font-mono">{mockAlertInfo.duration}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Model Confidence</span>
                <span className="font-mono text-cyan-400 font-bold">{mockAlertInfo.confidence}</span>
              </div>
            </div>
          </Card>
          
          {/* Status Tracker */}
          <Card title="MAS Pipeline Status">
            <div className="flex items-center space-x-3 mt-2">
              <div className={`h-3.5 w-3.5 rounded-full ${
                status === 'streaming' ? 'bg-purple-500 animate-pulse' :
                status === 'completed' ? 'bg-emerald-500' : 'bg-slate-600'
              }`}></div>
              <span className="text-xs capitalize font-semibold text-slate-300">
                Pipeline Mode: {status}
              </span>
            </div>
          </Card>
        </div>

        {/* Right Side: Agent Reasoning Logs Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('agent-run')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-300 ${
                activeTab === 'agent-run' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Multi-Agent Telemetry Stream
            </button>
            <button 
              onClick={() => setActiveTab('playbook')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all duration-300 ${
                activeTab === 'playbook' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified Containment Playbook
            </button>
          </div>

          {activeTab === 'agent-run' && (
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="bg-slate-800/10 border border-dashed border-slate-700/50 rounded-xl p-12 text-center text-slate-400 space-y-4">
                  <BrainCircuit className="mx-auto text-slate-500 animate-pulse" size={40} />
                  <div>
                    <h4 className="text-slate-200 font-semibold">Ready for Analysis</h4>
                    <p className="text-xs mt-1">Launch the Multi-Agent System above to evaluate, investigate CVE files, and synthesize playbooks.</p>
                  </div>
                </div>
              ) : (
                <div className="relative border-l border-slate-800 pl-6 space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="relative group transition-all duration-300">
                      {/* Timeline marker */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-cyan-500 shadow-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                      </span>
                      
                      {/* Agent Thought Card */}
                      <div className="bg-slate-850/40 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-400">{msg.agent_name}</span>
                          <span className="font-mono text-slate-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{msg.thought}</p>
                        {msg.action && (
                          <div className="inline-flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800 text-[10px] text-slate-400">
                            <Terminal size={12} />
                            <span className="font-mono font-semibold">Action: {msg.action}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playbook' && (
            <Card title="Containment & Remediation Checklist" subtitle="Step-by-step mitigation actions generated by investigation agent">
              {status !== 'completed' ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Playbook will populate automatically once the Multi-Agent analysis run completes.
                </div>
              ) : (
                <div className="space-y-4 mt-2">
                  <div className="flex items-start space-x-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-bold text-slate-200">1. Apply Edge Firewall Block</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Drop incoming TCP traffic from source IP 192.168.10.5 at the border interface.</p>
                      <code className="block bg-slate-950 p-2 rounded mt-2 text-[10px] font-mono text-orange-400">
                        iptables -A INPUT -s 192.168.10.5 -j DROP
                      </code>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-bold text-slate-200">2. Enforce Host Rate Limits</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Configure limit request bursts on target Nginx proxy server.</p>
                      <code className="block bg-slate-950 p-2 rounded mt-2 text-[10px] font-mono text-orange-400">
                        limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
                      </code>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                    <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-bold text-slate-200">3. Activate TCP SYN Cookies</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Toggle operating system kernel params to drop half-open connections.</p>
                      <code className="block bg-slate-950 p-2 rounded mt-2 text-[10px] font-mono text-orange-400">
                        sysctl -w net.ipv4.tcp_syncookies=1
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default IncidentInvestigationPage;
