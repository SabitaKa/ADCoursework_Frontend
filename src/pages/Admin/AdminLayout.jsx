import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingCart, 
  Megaphone, 
  LogOut,
  Menu,
  X
} from "lucide-react";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/books", label: " Book Management", icon: BookOpen },
    { path: "/admin/discounts", label: " Discounts Management", icon: ShoppingCart },
    { path: "/admin/announcements", label: "Announcements Management", icon: Megaphone },
  ];

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login', {
      state: {
        message: "You have been successfully logged out.",
        type: 'success'
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-slate-800 text-white md:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-blue-800 text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Title */}
          <div className="p-6 pt-9">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white "
          >
            <LogOut size={20} />
            Logout
          </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
