import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiHomeAlt, BiUser, BiCog, BiLogOut, BiBell } from 'react-icons/bi';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useSocket } from '../context/SocketContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const socket = useSocket();

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

  useEffect(() => {
    if (socket && user && user.role === 'admin') {
      socket.emit('joinRoom', 'admin');
    }
  }, [socket, user]);

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
    <div className="flex flex-col h-screen bg-[#f4f6f8] font-sans text-gray-800 overflow-hidden">
      
      {/* Top Header */}
      <header className="h-[72px] bg-white flex items-center justify-between px-8 z-30 border-b border-gray-200 shrink-0">
        <div className="flex items-center">
          <img src="/images/logo.png" alt="Logo" className="h-12 object-contain" />
        </div>
        <div className="flex items-center space-x-6 text-gray-600">
          <button className="relative hover:text-blue-600 transition-colors">
            <BiBell className="text-2xl" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">3</span>
          </button>
          <div className="h-6 w-px bg-gray-200 ml-2"></div>
          <div className="relative">
            <div 
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <div className="w-9 h-9 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm">
                SA
              </div>
              <span className="text-sm font-semibold text-gray-800">Super Admin</span>
            </div>
            
            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 z-20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3.5 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm text-gray-500 hover:text-blue-500 z-30"
          >
            {isSidebarOpen ? <IoIosArrowBack size={14} /> : <IoIosArrowForward size={14} />}
          </button>

          {/* Nav Links */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `flex items-center px-3 py-3 rounded-md transition-colors ${isActive ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <div className="text-xl shrink-0">{item.icon}</div>
                {isSidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
              </NavLink>
            ))}
            
            <div className="my-4 border-t border-gray-100 mx-3"></div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <div className="text-xl shrink-0"><BiLogOut /></div>
              {isSidebarOpen && <span className="ml-3 text-sm flex-1 text-left">Logout</span>}
            </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100 flex items-center">
            <div className="w-9 h-9 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm shrink-0">
              SA
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">Super Admin</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-[#f4f6f8] p-8">
            <Outlet context={{ user }} />
          </main>
        </div>
      </div>
    </div>
  );
}
