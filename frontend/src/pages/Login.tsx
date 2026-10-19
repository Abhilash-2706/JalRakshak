import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'OFFICER') navigate('/officer-dashboard');
      else if (data.user.role === 'ADMIN') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const accounts: Record<string, { email: string; password: string }> = {
      citizen: { email: 'citizen@example.com', password: 'password123' },
      officer: { email: 'officer@example.com', password: 'password123' },
      admin: { email: 'admin@example.com', password: 'password123' },
    };
    setEmail(accounts[role].email);
    setPassword(accounts[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplet className="h-9 w-9 text-blue-600" fill="currentColor" />
            <span className="text-2xl font-bold text-gray-900">JalRakshak</span>
          </div>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm pr-12"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition text-sm">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Quick Login */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Demo Login</p>
          <div className="flex gap-2">
            {['citizen', 'officer', 'admin'].map(role => (
              <button key={role} onClick={() => quickLogin(role)}
                className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 capitalize transition">
                {role}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Password for all: <strong>password123</strong></p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
