import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiHomeAlt, BiUser, BiCog, BiLogOut, BiBell } from 'react-icons/bi';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (res.data.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        
        setUser(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <BiHomeAlt />, path: '/admin/dashboard' },
    { name: 'Customers', icon: <BiUser />, path: '/admin/customers' },
    { name: 'Configurations', icon: <BiCog />, path: '/admin/configurations' },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`relative flex flex-col bg-white shadow-[2px_0_8px_rgba(0,0,0,0.05)] transition-all duration-300 z-20 ${isSidebarOpen ? 'w-[260px]' : 'w-20'}`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-16 bg-[#3b82f6] text-white rounded-full p-1.5 shadow-md hover:bg-blue-600 z-30"
        >
          {isSidebarOpen ? <IoIosArrowBack size={16} /> : <IoIosArrowForward size={16} />}
        </button>

        {/* Logo */}
        <div className="p-4 h-24 flex items-center justify-center border-b border-gray-50 shrink-0">
          <img src="/images/logo.png" alt="Logo" className={`${isSidebarOpen ? 'h-16' : 'h-10'} object-contain transition-all`} />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#3b82f6] text-white font-medium shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <div className="text-xl shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="ml-4 text-[15px]">{item.name}</span>}
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-gray-500 hover:bg-gray-50 hover:text-gray-900 mt-auto"
          >
            <div className="text-xl shrink-0"><BiLogOut /></div>
            {isSidebarOpen && <span className="ml-4 text-[15px]">Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[72px] bg-[#f8f9fc] flex items-center justify-end px-8 z-10 shrink-0">
          <div className="flex items-center space-x-6 text-gray-500">
            <button className="relative hover:text-gray-800 transition-colors">
              <BiBell className="text-[22px]" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#f8f9fc] flex items-center justify-center text-[8px] text-white font-bold pb-px">3</span>
            </button>
            <button className="hover:text-gray-800 transition-colors">
              <BiCog className="text-[22px]" />
            </button>
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                <BiUser className="text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-700">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 pt-2">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
