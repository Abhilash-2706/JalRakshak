import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, AlertTriangle, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000/api';

const STEPS = ['Leak Info', 'Location', 'Submit'];

export default function ReportLeak() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    leakType: 'Water pipeline',
    leakCategory: 'Small leak',
    severity: 'Medium',
    description: '',
    isEmergency: false,
    address: '',
    area: '',
    city: 'Bangalore',
    pincode: '',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.address) return setError('Please enter the leak location address.');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, citizenId: user?.id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(data);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Leak Reported!</h2>
          <p className="text-gray-500 mb-6">Your complaint has been successfully submitted.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Complaint ID</span>
              <span className="font-mono font-bold text-blue-600">{submitted.complaintId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Priority</span>
              <span className="font-semibold">{submitted.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className="font-semibold text-green-600">SUBMITTED</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm">Go to Dashboard</button>
            <button onClick={() => navigate('/track')} className="flex-1 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 text-sm">Track Complaint</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Emergency Banner */}
        {form.isEmergency && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <p className="text-red-700 font-semibold">Emergency Report — This will be prioritized immediately</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Droplet className="h-8 w-8 text-blue-600" fill="currentColor" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Report a Pipeline Leak</h1>
              <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>

          {/* Step 1 – Leak Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Leak Information</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isEmergency} onChange={e => set('isEmergency', e.target.checked)} className="w-4 h-4" />
                  <span className="text-sm text-red-600 font-semibold">🚨 Emergency</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Leak Type</label>
                <select value={form.leakType} onChange={e => set('leakType', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Water pipeline</option>
                  <option>Sewage pipeline</option>
                  <option>Gas pipeline</option>
                  <option>Other public pipeline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Leak Category</label>
                <select value={form.leakCategory} onChange={e => set('leakCategory', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Small leak</option>
                  <option>Major leak</option>
                  <option>Burst pipeline</option>
                  <option>Continuous water flow</option>
                  <option>Underground leakage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 'Low', color: 'border-green-400 text-green-700 bg-green-50', ring: 'ring-green-400' },
                    { val: 'Medium', color: 'border-yellow-400 text-yellow-700 bg-yellow-50', ring: 'ring-yellow-400' },
                    { val: 'High', color: 'border-orange-400 text-orange-700 bg-orange-50', ring: 'ring-orange-400' },
                    { val: 'Critical', color: 'border-red-500 text-red-700 bg-red-50', ring: 'ring-red-500' },
                  ].map(s => (
                    <button key={s.val} type="button" onClick={() => set('severity', s.val)}
                      className={`py-2 border-2 rounded-lg text-sm font-semibold transition ${s.color} ${form.severity === s.val ? `ring-2 ${s.ring}` : ''}`}>
                      {s.val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                  placeholder="Describe the leak situation in detail..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
            </div>
          )}

          {/* Step 2 – Location */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Leak Location</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address / Landmark *</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} required
                  placeholder="E.g., Near City Center Mall, MG Road"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Area / Locality</label>
                  <input value={form.area} onChange={e => set('area', e.target.value)}
                    placeholder="Koramangala"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                <input value={form.pincode} onChange={e => set('pincode', e.target.value)}
                  placeholder="560001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-700 text-sm font-semibold mb-1">📍 Location Preview</p>
                <p className="text-sm text-blue-600">{form.address || 'No address entered'}{form.area ? ', ' + form.area : ''}{form.city ? ', ' + form.city : ''}</p>
              </div>
            </div>
          )}

          {/* Step 3 – Review */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Review & Submit</h2>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                {[
                  { label: 'Leak Type', value: form.leakType },
                  { label: 'Category', value: form.leakCategory },
                  { label: 'Severity', value: form.severity },
                  { label: 'Location', value: `${form.address}, ${form.area}, ${form.city}` },
                  { label: 'Emergency', value: form.isEmergency ? '🚨 Yes' : 'No' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button onClick={() => step === 0 ? navigate('/') : setStep(step - 1)}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50">
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-8 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Submitting...' : '✅ Submit Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
