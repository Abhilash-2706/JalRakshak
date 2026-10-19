import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, LogOut, MapPin } from 'lucide-react';

const API = 'http://localhost:5000/api';

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetch(`${API}/complaints`)
      .then(r => r.json())
      .then(data => {
        setComplaints(data.filter((c: any) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (complaintId: string, status: string) => {
    try {
      const res = await fetch(`${API}/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: `Updated by Officer ${user?.name}` }),
      });
      if (res.ok) {
        setComplaints(prev => prev.map(c => c.complaintId === complaintId ? { ...c, status } : c));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.priority === filter);

  const stats = [
    { label: 'Total Assigned', value: complaints.length, color: 'border-blue-500' },
    { label: 'Critical', value: complaints.filter(c => c.priority === 'CRITICAL').length, color: 'border-red-500' },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'REPAIR_IN_PROGRESS').length, color: 'border-orange-500' },
    { label: 'Pending Verify', value: complaints.filter(c => c.status === 'SUBMITTED').length, color: 'border-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-7 w-7 text-blue-600" fill="currentColor" />
            <div>
              <span className="font-bold text-gray-900">JalRakshak</span>
              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">OFFICER</span>
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
          <p className="text-gray-500">Manage and resolve assigned complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${s.color}`}>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Complaints */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No complaints found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Location', 'Type', 'Priority', 'Status', 'Update Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c: any) => (
                    <tr key={c.id} className={`hover:bg-gray-50 ${c.isEmergency ? 'bg-red-50' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm font-medium text-blue-600">{c.complaintId}</div>
                        {c.isEmergency && <span className="text-xs text-red-600 font-semibold">🚨 EMERGENCY</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" /> {c.area || c.address}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{c.leakType}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{c.status.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-4">
                        <select value={c.status} onChange={e => updateStatus(c.complaintId, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="REPAIR_SCHEDULED">Repair Scheduled</option>
                          <option value="REPAIR_IN_PROGRESS">Repair In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
