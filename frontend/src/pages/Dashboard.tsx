import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Bell, LogOut, Plus, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const API = 'http://localhost:5000/api';

const STATUS_COLOR: Record<string, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  REPAIR_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  REPAIR_IN_PROGRESS: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`${API}/complaints`).then(r => r.json()),
      fetch(`${API}/notifications/${user.id}`).then(r => r.json()),
    ]).then(([comp, notif]) => {
      setComplaints(comp.filter((c: any) => c.citizenId === user.id));
      setNotifications(notif);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n: any) => !n.isRead).length;

  const stats = [
    { label: 'Submitted', value: complaints.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Under Review', value: complaints.filter(c => c.status === 'UNDER_REVIEW').length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'In Progress', value: complaints.filter(c => c.status === 'REPAIR_IN_PROGRESS').length, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-7 w-7 text-blue-600" fill="currentColor" />
            <span className="font-bold text-gray-900">JalRakshak</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/report" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">
              <Plus className="h-4 w-4" /> Report Leak
            </Link>
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                {unread > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50">
                  <div className="p-4 border-b font-semibold text-gray-700">Notifications</div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">No notifications</p>
                  ) : notifications.map((n: any) => (
                    <div key={n.id} className={`p-4 border-b text-sm ${n.isRead ? 'text-gray-500' : 'text-gray-900 bg-blue-50'}`}>
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-xs mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { localStorage.clear(); navigate('/'); }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Here's an overview of your leak reports.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">My Reports</h2>
            <Link to="/report" className="text-sm text-blue-600 hover:underline">+ New Report</Link>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No reports yet.</p>
              <Link to="/report" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Report a Leak</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Complaint ID', 'Location', 'Type', 'Priority', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complaints.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">{c.complaintId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.area || c.address}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.leakType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLOR[c.priority] || 'bg-gray-100 text-gray-700'}`}>{c.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLOR[c.status] || 'bg-gray-100 text-gray-700'}`}>{c.status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex gap-4">
          <Link to="/report" className="flex-1 text-center py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 text-sm">🚨 Report Emergency</Link>
          <Link to="/track" className="flex-1 text-center py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 text-sm">📋 Track Complaint</Link>
        </div>
      </main>
    </div>
  );
}
