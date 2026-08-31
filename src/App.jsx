import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Quotations from './pages/Quotations';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Billing from './pages/Billing';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Support from './pages/Support';
import NewProject from './pages/NewProject';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuoteDetails from './pages/AdminQuoteDetails';
import AdminConfigurations from './pages/AdminConfigurations';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="quotes/:id" element={<AdminQuoteDetails />} />
          <Route path="customers" element={<div className="p-8">Customers Page (Coming Soon)</div>} />
          <Route path="configurations" element={<AdminConfigurations />} />
        </Route>

        {/* Customer Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="billing" element={<Billing />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Support />} />
          <Route path="new-project" element={<NewProject />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
