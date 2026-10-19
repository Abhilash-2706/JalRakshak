import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, LogOut, BarChart2, Users, MapPin, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API = 'http://localhost:5000/api';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#f97316'];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, resolved: 0, active: 0, underReview: 0, waterSaved: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    Promise.all([
      fetch(`${API}/complaints`).then(r => r.json()),
      fetch(`${API}/users`).then(r => r.json()),
      fetch(`${API}/stats`).then(r => r.json()),
    ]).then(([comp, usr, st]) => {
      setComplaints(comp);
      setUsers(usr);
      setStats(st);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Charts data
  const priorityData = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => ({
    name: p,
    count: complaints.filter(c => c.priority === p).length,
  }));

  const statusData = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'REPAIR_IN_PROGRESS', 'RESOLVED'].map(s => ({
    name: s.replace(/_/g, ' '),
    count: complaints.filter(c => c.status === s).length,
  }));

  const areaData = complaints.reduce((acc: any, c: any) => {
    const area = c.area || 'Unknown';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  const areaChartData = Object.entries(areaData).slice(0, 8).map(([name, count]) => ({ name, count }));

  const statCards = [
    { label: 'Total Reports', value: stats.total, color: 'text-blue-600 bg-blue-50', icon: BarChart2 },
    { label: 'Critical Leaks', value: stats.critical, color: 'text-red-600 bg-red-50', icon: AlertTriangle },
    { label: 'Active Leaks', value: stats.active, color: 'text-orange-600 bg-orange-50', icon: MapPin },
    { label: 'Resolved', value: stats.resolved, color: 'text-green-600 bg-green-50', icon: BarChart2 },
    { label: 'Under Review', value: stats.underReview, color: 'text-yellow-600 bg-yellow-50', icon: BarChart2 },
    { label: 'Water Saved (L)', value: stats.waterSaved.toLocaleString(), color: 'text-teal-600 bg-teal-50', icon: Droplet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-7 w-7 text-blue-600" fill="currentColor" />
            <div>
              <span className="font-bold text-gray-900">JalRakshak</span>
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 rounded-full hover:bg-gray-100">
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'complaints', label: '📋 Complaints' },
            { id: 'users', label: '👥 Users' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading dashboard...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {statCards.map(s => (
                    <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
                        <s.icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Reports by Priority</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Reports by Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                          {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Leaks by Area (Hotspot)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={areaChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === 'complaints' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
                  <span className="text-sm text-gray-500">{complaints.length} total</span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['ID', 'Citizen', 'Area', 'Type', 'Priority', 'Status', 'Date'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {complaints.map((c: any) => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 font-mono text-xs text-blue-600">{c.complaintId}</td>
                            <td className="px-5 py-3 text-sm">{c.isAnonymous ? '(Anonymous)' : (c.citizen?.name || 'N/A')}</td>
                            <td className="px-5 py-3 text-sm text-gray-600">{c.area || '-'}</td>
                            <td className="px-5 py-3 text-sm text-gray-600">{c.leakType}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${c.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : c.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : c.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{c.priority}</span>
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-500">{c.status.replace(/_/g, ' ')}</td>
                            <td className="px-5 py-3 text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {['CITIZEN', 'OFFICER', 'ADMIN'].map(role => (
                    <div key={role} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                      <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === role).length}</p>
                      <p className="text-sm text-gray-500 mt-1">{role}S</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Name', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 text-sm font-medium">{u.name}</td>
                            <td className="px-5 py-3 text-sm text-gray-600">{u.email}</td>
                            <td className="px-5 py-3 text-sm text-gray-500">{u.phone || '-'}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'OFFICER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                            </td>
                            <td className="px-5 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
