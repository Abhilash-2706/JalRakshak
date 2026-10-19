import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, Clock, Wrench, AlertCircle, Droplet } from 'lucide-react';

const API = 'http://localhost:5000/api';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Report Submitted', icon: CheckCircle },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Search },
  { key: 'VERIFIED', label: 'Leak Verified', icon: CheckCircle },
  { key: 'ASSIGNED', label: 'Officer Assigned', icon: AlertCircle },
  { key: 'REPAIR_SCHEDULED', label: 'Repair Scheduled', icon: Clock },
  { key: 'REPAIR_IN_PROGRESS', label: 'Repair In Progress', icon: Wrench },
  { key: 'RESOLVED', label: 'Repair Completed', icon: CheckCircle },
];

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setComplaint(null);
    try {
      const res = await fetch(`${API}/complaints/${complaintId.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || 'Complaint not found.');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = complaint ? STATUS_STEPS.findIndex(s => s.key === complaint.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Droplet className="h-8 w-8 text-blue-600" fill="currentColor" />
            <span className="text-2xl font-bold text-gray-900">JalRakshak</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Track Your Complaint</h1>
          <p className="text-gray-500">Enter your complaint ID to see real-time status updates.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex gap-3">
            <input
              value={complaintId} onChange={e => setComplaintId(e.target.value)} required
              placeholder="e.g. JL-2026-000001"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
            <button type="submit" disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm">
              {loading ? '...' : 'Track'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>

        {/* Complaint Details */}
        {complaint && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Info */}
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm">Complaint ID</p>
                  <p className="text-2xl font-mono font-bold">{complaint.complaintId}</p>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">{complaint.priority}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-blue-200">Type</p>
                  <p className="font-medium">{complaint.leakType}</p>
                </div>
                <div>
                  <p className="text-blue-200">Severity</p>
                  <p className="font-medium">{complaint.severity}</p>
                </div>
                <div>
                  <p className="text-blue-200">Location</p>
                  <p className="font-medium">{complaint.area || complaint.address}</p>
                </div>
                <div>
                  <p className="text-blue-200">Reported</p>
                  <p className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-5">Status Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                {STATUS_STEPS.map((step, idx) => {
                  const isPast = idx < currentIndex;
                  const isCurrent = idx === currentIndex;
                  const isFuture = idx > currentIndex;
                  const historyEntry = complaint.statusHistory?.find((h: any) => h.status === step.key);
                  return (
                    <div key={step.key} className="relative flex items-start gap-4 mb-6 last:mb-0">
                      <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${isFuture ? 'text-gray-400' : 'text-gray-800'}`}>{step.label}</p>
                        {historyEntry && <p className="text-xs text-gray-400 mt-0.5">{new Date(historyEntry.createdAt).toLocaleString()}</p>}
                        {isCurrent && <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Current</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
