import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplet className="h-9 w-9 text-blue-600" fill="currentColor" />
            <span className="text-2xl font-bold text-gray-900">JalRakshak</span>
          </div>
          <p className="text-gray-500">Create your citizen account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Rahul Sharma' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'rahul@example.com' },
            { label: 'Mobile Number', key: 'phone', type: 'tel', placeholder: '+91 99999 99999' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 8 characters' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Re-enter password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                required placeholder={f.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm" />
            </div>
          ))}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
