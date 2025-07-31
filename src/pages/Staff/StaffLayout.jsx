import { Outlet, Link, useLocation } from 'react-router-dom';

const StaffLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-blue-800 text-white">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-8">Staff Portal</h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/staff/orders"
                    className={`block px-4 py-2 rounded hover:bg-blue-700 ${isActive('/staff/orders')}`}
                  >
                    Process Orders
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffLayout; 