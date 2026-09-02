import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { BiSad } from 'react-icons/bi';

export default function AdminCustomerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'x-auth-token': token };
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, { headers });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006fee]"></div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="p-8 text-center text-gray-500">
        User not found.
      </div>
    );
  }

  const { user, projects } = data;
  const name = `${user.firstName} ${user.lastName}`;
  const initial = user.firstName ? user.firstName[0].toUpperCase() : 'U';
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-[1400px] mx-auto pb-12 font-sans px-4 pt-4">
      
      {/* Back Link */}
      <Link to="/admin/customers" className="inline-flex items-center gap-2 text-[#006fee] hover:text-blue-700 font-medium mb-6 transition-colors">
        <FaArrowLeft size={14} /> Back to Users
      </Link>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-[#006fee] flex items-center justify-center text-2xl font-bold">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
            <p className="text-gray-500 text-sm capitalize">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50 rounded-xl">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Contact Information</h3>
            <p className="text-sm font-medium text-gray-800 mb-1">{user.email}</p>
            <p className="text-sm text-gray-600">{user.mobilePrefix}{user.mobile}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Company Information</h3>
            <p className="text-sm font-medium text-gray-800 mb-1">Individual</p>
            <p className="text-sm text-gray-500">Not specified</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Account Status</h3>
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold">
                Pending Verification
              </span>
            </div>
            <p className="text-sm text-gray-600">Joined on {joinedDate}</p>
          </div>
        </div>
      </div>

      {/* Quotations Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Quotations</h2>
        
        {projects && projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Project Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created At</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map(project => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">{project.title}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/admin/quotes/${project._id}`} className="text-sm text-[#006fee] hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <BiSad className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No quotations</h3>
            <p className="text-sm text-gray-500 mb-6">This user hasn't created any quotations yet.</p>
            <button className="bg-[#006fee] hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm">
              Create New Quotation
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
