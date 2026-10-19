import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportLeak from './pages/ReportLeak';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrackComplaint from './pages/TrackComplaint';
import { Droplet, MapPin, Phone, AlertTriangle } from 'lucide-react';

function LandingPage() {
  const stats = [
    { label: 'Total Reports', value: '248+' },
    { label: 'Active Leaks', value: '37' },
    { label: 'Leaks Repaired', value: '189' },
    { label: 'Water Saved', value: '1.82M L' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-8 w-8 text-blue-600" fill="currentColor" />
            <div>
              <span className="text-xl font-bold text-gray-900">JalRakshak</span>
              <p className="text-xs text-blue-500 -mt-1">Report. Repair. Save Every Drop.</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/track" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Track Complaint</Link>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700">Register</Link>
          </nav>
          <Link to="/login" className="md:hidden text-blue-600 font-medium text-sm">Login</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <AlertTriangle className="h-4 w-4" />
          Civic Technology for Water Conservation
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Every Drop Matters.<br/>
          <span className="text-blue-600">Report Water Leaks.</span><br/>
          Save Water.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Help your community identify public pipeline leaks and get them repaired faster with real-time tracking and officer dispatch.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/report" className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg text-lg">
            🚨 Report a Leak
          </Link>
          <Link to="/track" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 border-2 border-blue-200 rounded-xl font-bold hover:bg-blue-50 text-lg">
            <MapPin className="h-5 w-5" />
            Track Complaint
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center text-white">
              <p className="text-3xl md:text-4xl font-extrabold">{s.value}</p>
              <p className="text-blue-100 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How JalRakshak Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📍', title: 'Report a Leak', desc: 'Submit a leak report with your location, photos, and severity in under 2 minutes.' },
            { icon: '🔍', title: 'Officer Dispatched', desc: 'A field officer is assigned and dispatched to verify and begin repairs.' },
            { icon: '✅', title: 'Leak Repaired', desc: 'Track progress in real-time and provide feedback once the repair is complete.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Droplet className="h-5 w-5 text-blue-400" fill="currentColor" />
          <span className="text-white font-bold">JalRakshak</span>
        </div>
        <p className="text-sm">Report. Repair. Save Every Drop. © 2026</p>
      </footer>
    </div>
  );
}

function ProtectedRoute({ children, roles }: { children: JSX.Element, roles: string[] }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;
  const user = JSON.parse(userStr);
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ReportLeak />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/dashboard" element={<ProtectedRoute roles={['CITIZEN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/officer-dashboard" element={<ProtectedRoute roles={['OFFICER']}><OfficerDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
