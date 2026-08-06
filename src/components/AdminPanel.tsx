import React, { useState, useEffect } from 'react';
import { Shield, Lock, ShieldAlert, Activity, Users, FileText, Settings, Key, AlertTriangle, CheckCircle, LogOut, BellRing, Send } from 'lucide-react';

export const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [token, setToken] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ activeSessions: 12458, chatQueries: 3205, cpuUsage: 0, memoryUsage: 0 });
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [features, setFeatures] = useState({ chatEnabled: true, aiEnabled: true });
  const [users, setUsers] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [broadcastType, setBroadcastType] = useState('Exam Deadline Alert');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Setup SSE when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const eventSource = new EventSource('/api/admin/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          setFeatures(data.features || { chatEnabled: true, aiEnabled: true });
          setUsers(data.users || []);
          setContentList(data.content || []);
          setBroadcasts(data.broadcasts || []);
        } else if (data.type === 'metrics') {
          setMetrics(prev => ({ ...prev, ...data.metrics }));
        } else if (data.type === 'broadcast') {
          setBroadcasts(prev => [data.broadcast, ...prev]);
        } else if (data.type === 'features') {
          setFeatures(data.features);
        }
      } catch (err) {
        console.error("SSE Parse Error", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [isAuthenticated, token]);

  const handleBroadcast = async () => {
    if(!broadcastMsg.trim()) return;
    try {
      await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messageType: broadcastType, messageContent: broadcastMsg })
      });
      setBroadcastMsg('');
    } catch(err) {
      console.error(err);
    }
  };

  const toggleFeature = async (featureKey: string) => {
    try {
      const newFeatures = { ...features, [featureKey]: !features[featureKey as keyof typeof features] };
      await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ features: newFeatures })
      });
    } catch (err) {
      console.error(err);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          
          <div className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-950 rounded-2xl flex items-center justify-center mb-6 border border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <ShieldAlert className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">System Override</h2>
            <p className="text-slate-400 text-sm mb-8 text-center">Authorized personnel only. All access attempts are logged and monitored.</p>
            
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              {loginError && (
                <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operator ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600"
                    placeholder="Enter ID"
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Access Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-slate-600"
                    placeholder="Enter Key"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Authenticating...' : (
                    <>
                      <Key size={18} /> Authenticate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-950 z-[100] flex flex-col text-slate-200">
      <div className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3 text-red-500">
          <Shield size={24} />
          <h1 className="text-xl font-bold tracking-tight text-white">Core GPS <span className="text-red-500 font-mono text-sm ml-2 bg-red-950 px-2 py-0.5 rounded border border-red-900">ADMIN_OVERRIDE</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Secure
          </div>
          <button 
            onClick={() => { setIsAuthenticated(false); onClose(); }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors p-2"
          >
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Control Center</div>
          {[
            { id: 'dashboard', icon: Activity, label: 'Analytics & Health' },
            { id: 'users', icon: Users, label: 'User Management' },
            { id: 'content', icon: FileText, label: 'Content Management' },
            { id: 'security', icon: ShieldAlert, label: 'Security Logs' },
            { id: 'broadcast', icon: BellRing, label: 'Broadcast & Alerts' },
            { id: 'settings', icon: Settings, label: 'System Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white mb-4">System Analytics & Health</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="text-slate-400 text-sm font-medium mb-1">Active Users (24h)</div>
                  <div className="text-3xl font-bold text-white">{metrics.activeSessions}</div>
                  <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><TrendingUpIcon /> +14% vs yesterday</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="text-slate-400 text-sm font-medium mb-1">Study Streaks &gt; 7 Days</div>
                  <div className="text-3xl font-bold text-white">{metrics.chatQueries}</div>
                  <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1"><TrendingUpIcon /> +5% vs yesterday</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="text-slate-400 text-sm font-medium mb-1">Failed Logins (1h)</div>
                  <div className="text-3xl font-bold text-red-400">12</div>
                  <div className="text-red-400 text-xs mt-2 flex items-center gap-1">Action required</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="text-slate-400 text-sm font-medium mb-1">CPU Usage</div>
                  <div className="text-3xl font-bold text-white">{metrics.cpuUsage}%</div>
                  <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1">Live Server Node</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="text-slate-400 text-sm font-medium mb-1">Memory Usage</div>
                  <div className="text-3xl font-bold text-white">{metrics.memoryUsage}%</div>
                  <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1">Live Server Node</div>
                </div>
</div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mt-4">
                <h3 className="font-bold text-white mb-4">System Health</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-500" size={18} />
                      <span className="font-medium">Core Database Cluster</span>
                    </div>
                    <span className="text-slate-400 text-sm">99.99% Uptime</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-500" size={18} />
                      <span className="font-medium">Authentication Service</span>
                    </div>
                    <span className="text-slate-400 text-sm">24ms avg response</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-950/20 rounded border border-red-900/30">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-amber-500" size={18} />
                      <span className="font-medium">Rate Limiter (Edge)</span>
                    </div>
                    <span className="text-amber-500 text-sm">High Load Warning</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Content Management</h2>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                  + Add New Entry
                </button>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(contentList.length > 0 ? contentList : [
                      { mod: 'Current Affairs', title: 'Union Budget 2026 Analysis', status: 'Published' },
                      { mod: 'Study Material', title: 'UPSC Prelims 2025 PYQ', status: 'Published' }
                    ]).map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-300">{item.mod}</td>
                        <td className="py-3 px-4 text-sm text-white">{item.title}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            item.status === 'Published' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' :
                            item.status === 'Draft' ? 'bg-amber-900/30 text-amber-400 border border-amber-900' :
                            'bg-blue-900/30 text-blue-400 border border-blue-900'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-slate-400 hover:text-white text-sm font-medium mr-3">Edit</button>
                          <button className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white mb-4">Cyber Security Logs</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs font-bold">All Logs</span>
                    <span className="px-3 py-1 bg-red-900/20 border border-red-900/50 text-red-400 rounded text-xs font-bold">Threats Only</span>
                  </div>
                  <button className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2">
                    <DownloadIcon /> Export CSV
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-2 font-mono text-sm">
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-slate-300 flex items-start gap-3">
                    <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <div className="text-red-400 font-bold">[CRITICAL] SQL Injection Attempt Detected</div>
                      <div className="text-slate-500 text-xs mt-1">IP: 192.168.4.12 • Endpoint: /api/search • Payload: ' OR 1=1--</div>
                      <div className="text-slate-600 text-xs mt-1">Action taken: IP Blocked (Rate Limiter)</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 flex items-start gap-3">
                    <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <div className="text-amber-400 font-bold">[WARN] Multiple Failed Admin Logins</div>
                      <div className="text-slate-500 text-xs mt-1">IP: 10.0.0.55 • User: root</div>
                      <div className="text-slate-600 text-xs mt-1">Action taken: Temporarily Throttled</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-300 flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <div className="text-emerald-400 font-bold">[INFO] Admin Login Successful</div>
                      <div className="text-slate-500 text-xs mt-1">IP: 172.16.0.4 • User: admin_core</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "broadcast" && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white mb-4">Broadcast & Notification Center</h2>
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BellRing size={18} className="text-blue-400" /> Send Portal Announcement</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message Type</label>
                      <select value={broadcastType} onChange={e => setBroadcastType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500">
                        <option>Exam Deadline Alert</option>
                        <option>System Maintenance</option>
                        <option>New Study Material Added</option>
                        <option>General Announcement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message Content</label>
                      <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={4} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-600" placeholder="Type your announcement here..."></textarea>
                    </div>
                    <button onClick={handleBroadcast} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Send size={18} /> Broadcast to All Users
                    </button>
                  </div>
                </div>
                <div className="p-6 bg-slate-950/50">
                  <h3 className="font-bold text-slate-300 mb-4">Recent Broadcasts</h3>
                  
                  <div className="flex flex-col gap-3">
                    {broadcasts.map((bcast: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-start justify-between">
                        <div>
                          <div className="text-blue-400 text-xs font-bold mb-1">{bcast.type}</div>
                          <div className="text-white text-sm">{bcast.content}</div>
                        </div>
                        <span className="text-slate-500 text-xs">Just now</span>
                      </div>
                    ))}
                    {broadcasts.length === 0 && <div className="text-slate-500 text-sm">No broadcasts yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          
          {activeTab === 'users' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-300">{user.id}</td>
                        <td className="py-3 px-4 text-sm text-white">{user.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            user.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' : 'bg-red-900/30 text-red-400 border border-red-900'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white mb-4">System Features</h2>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Chat System</h3>
                    <p className="text-slate-400 text-sm mt-1">Enable or disable the global chat engine.</p>
                  </div>
                  <button 
                    onClick={() => toggleFeature('chatEnabled')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${features.chatEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  >
                    {features.chatEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Assistant Processing</h3>
                    <p className="text-slate-400 text-sm mt-1">Toggle the Gemini AI generation requests.</p>
                  </div>
                  <button 
                    onClick={() => toggleFeature('aiEnabled')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${features.aiEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                  >
                    {features.aiEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
