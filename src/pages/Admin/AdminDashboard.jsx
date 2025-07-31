import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Tag, ShoppingCart, LogOut } from "lucide-react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksOnSale: 0,
    totalOrders: 0,
  });

  const categoryData = [
    { name: "Fiction", value: 4 },
    { name: "Non-fiction", value: 3},
    { name: "Science", value: 2 },
    { name: "Romance", value: 1 },
  ];

  const monthlyOrders = [
    { month: "Jan", orders: 30 },
    { month: "Feb", orders: 45 },
    { month: "Mar", orders: 60 },
    { month: "Apr", orders: 20 },
    { month: "May", orders: 50 },
  ];

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'Admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch books
        const booksResponse = await axios.get("https://localhost:7098/api/books/all?page=1&pageSize=10", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Fetch discounts
        const discountsResponse = await axios.get("https://localhost:7098/api/discounts", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Fetch orders
        const ordersResponse = await axios.get("https://localhost:7098/api/Order/all", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (booksResponse.data.success && discountsResponse.data.success && ordersResponse.data.success) {
          setStats({
            totalBooks: booksResponse.data.data.metadata.totalItems,
            booksOnSale: discountsResponse.data.data.length,
            totalOrders: ordersResponse.data.data
          });
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, [navigate]);

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

  const Card = ({ icon: Icon, title, value, color }) => (
    <div className="p-6 bg-white rounded-lg shadow flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Welcome, Admin!</h3>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          icon={Book}
          title="Total Books"
          value={stats.totalBooks}
          color="text-blue-500"
        />
        <Card
          icon={Tag}
          title="Books On Sale"
          value={stats.booksOnSale}
          color="text-green-500"
        />
        <Card
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalOrders}
          color="text-red-500"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/admin/books")}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow"
        >
           Book Management
        </button>
        <button
          onClick={() => navigate("/admin/discounts")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg shadow"
        >
           Discount Management
        </button>
        <button
          onClick={() => navigate("/admin/announcements")}
          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg shadow"
        >
          Announcements Management
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Book Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Monthly Orders
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
