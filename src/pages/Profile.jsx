import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfileSidebar from '../components/ProfileSidebar';
import { MdLock, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Package, CheckCircle, Edit2, X } from 'lucide-react';
import { ShoppingBag, Clock, DollarSign, ChevronDown, ChevronUp, ChevronRight, Search, Filter, RefreshCw } from 'lucide-react';
import { Key, ShieldCheck, Lock } from 'lucide-react';
import axios from 'axios';

const ProfileInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    address: ""
  });
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('https://localhost:7098/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
          setFormData({
            username: data.data.username,
            email: data.data.email,
            fullName: data.data.fullName,
            phoneNumber: data.data.phoneNumber || "",
            address: data.data.address || ""
          });
        } else {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching profile data');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7098/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address
        })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        // Log the raw response for debugging
        const rawText = await response.text();
        console.error('Non-JSON response:', rawText);
        throw new Error('Server response was not JSON');
      }

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join(', '));
        }
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success) {
        setSuccess(data.message || 'Profile updated successfully');
        
        try {
          const profileResponse = await fetch('https://localhost:7098/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!profileResponse.ok) {
            throw new Error('Failed to refresh profile data');
          }

          const profileData = await profileResponse.json();
          if (profileData.success) {
            setUserData(profileData.data);
            setFormData({
              username: profileData.data.username,
              email: profileData.data.email,
              fullName: profileData.data.fullName,
              phoneNumber: profileData.data.phoneNumber || "",
              address: profileData.data.address || ""
            });
          }
        } catch (refreshError) {
          console.error('Error refreshing profile:', refreshError);
        }
        
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium text-lg">Loading your profile...</span>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative bg-gradient-to-r from-blue-500 to-pink-600 p-6 mb-8 shadow-lg">
  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mt-10 -mr-10"></div>
  <div className="flex flex-row items-center space-x-6">
    <div className="bg-white p-1 shadow-md">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
        {getInitials(userData?.fullName)}
      </div>
    </div>
    <div className="flex-1 text-left">
      <h1 className="text-3xl font-bold text-white">{userData?.fullName}</h1>
      <p className="text-blue-100 mt-1">@{userData?.username}</p>
      {userData?.isEligibleForLoyaltyDiscount && (
        <div className="mt-3 bg-white/20 inline-flex items-center px-3 py-1 text-white">
          <CheckCircle size={16} className="mr-1" />
          <span>Loyalty Member</span>
        </div>
      )}
    </div>
    <div>
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className={`px-4 py-2 transition-colors shadow-md flex items-center space-x-2 ${
          isEditing 
            ? 'bg-white text-red-600 hover:bg-gray-100' 
            : 'bg-white text-blue-600 hover:bg-blue-50'
        }`}
      >
        {isEditing ? (
          <>

            <X size={18} />
            <span>Cancel</span>
          </>
        ) : (
          <>
            <Edit2 size={18} />
            <span>Edit Profile</span>
          </>
        )}
      </button>
    </div>
  </div>
</div>
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in flex items-start">
            <div className="mr-3 flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in flex items-start">
            <div className="mr-3 flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>{success}</div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'personal'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={18} className="mr-2" />
              Personal Information
            </button>
            
          </div>
        </div>
        
        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {activeTab === 'personal' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 pb-2">Personal Information</h3>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {activeTab === 'address' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                            <MapPin size={18} className="text-gray-400" />
                          </div>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating...
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {activeTab === 'personal' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <User size={18} className="text-blue-600 mr-2" />
                              <h4 className="text-sm font-medium text-gray-500">Username</h4>
                            </div>
                            <p className="text-left mt-1 text-lg font-medium text-gray-900">{userData?.username}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-blue-600 mr-2">👤</span>
                              <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                            </div>
                            <p className="text-left mt-1 text-lg font-medium text-gray-900">{userData?.fullName}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <Mail size={18} className="text-blue-600 mr-2" />
                              <h4 className="text-sm font-medium text-gray-500">Email</h4>
                            </div>
                            <p className="text-left mt-1 text-lg font-medium text-gray-900">{userData?.email}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <Phone size={18} className="text-blue-600 mr-2" />
                              <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                            </div>
                            <p className="text-left mt-1 text-lg font-medium text-gray-900">{userData?.phoneNumber || 'Not provided'}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                              <Calendar size={18} className="text-blue-600 mr-2" />
                              <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                            </div>
                            <p className="text-left mt-1 text-lg font-medium text-gray-900">
                              {userData?.registrationDate ? new Date(userData.registrationDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          
                          
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'address' && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <MapPin size={18} className="text-blue-600 mr-2" />
                            <h4 className="text-sm font-medium text-gray-500">Primary Address</h4>
                          </div>
                          {userData?.address ? (
                            <div className="mt-2 text-gray-900">
                              {userData.address.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No address provided</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'address' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 pb-2">Address Book</h3>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                          <MapPin size={18} className="text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating...
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin size={18} className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-medium text-gray-500">Primary Address</h4>
                      </div>
                      {userData?.address ? (
                        <div className="text-left mt-2 text-gray-900">
                          {userData.address.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No address provided</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 pb-2 border-b">Account Status</h3>
              
              <div className="space-y-4">
                {userData?.isEligibleForLoyaltyDiscount ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle size={20} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">Loyalty Member</h4>
                        <p className="mt-1 text-sm text-blue-600">You're eligible for special discounts on purchases!</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Package size={20} className="text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-left text-sm font-medium text-gray-800">Regular Member</h4>
  
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Calendar size={20} className="text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-left text-sm font-medium text-gray-800">Member Since</h4>
                      <p className="text-left mt-1 text-sm text-gray-600">
                        {userData?.registrationDate ? new Date(userData.registrationDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
              
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [placingAgainOrderId, setPlacingAgainOrderId] = useState(null);
  const [placeAgainMessage, setPlaceAgainMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://localhost:7098/api/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return <Package size={16} className="mr-1" />;
      case 'cancelled': return <RefreshCw size={16} className="mr-1" />;
      case 'pending': return <Clock size={16} className="mr-1" />;
      default: return <Clock size={16} className="mr-1" />;
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const handlePlaceAgain = async (order) => {
    setPlacingAgainOrderId(order.id);
    setPlaceAgainMessage("");
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://localhost:7098/api/orders/${order.id}/placeagain`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaceAgainMessage("Order placed again successfully.");
      setTimeout(() => {
        setPlaceAgainMessage("");
        window.location.reload();
      }, 1500);
    } catch (err) {
      setPlaceAgainMessage("Failed to place order again. Please try again.");
    } finally {
      setPlacingAgainOrderId(null);
    }
  };

  const handleViewDetails = (order) => {
    // TODO: Implement view details functionality
    console.log('View details for order:', order.id);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleCancelOrder = async (order) => {
    setCancellingOrderId(order.id);
    setCancelMessage("");
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://localhost:7098/api/orders/${order.id}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o));
      setCancelMessage("Order cancelled successfully.");
    } catch (err) {
      setCancelMessage("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId(null);
      setTimeout(() => setCancelMessage(""), 2000);
    }
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesStatus;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Something went wrong
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <ShoppingBag className="mr-3 text-blue-600" /> 
              My Orders
            </h1>
            <p className="text-gray-500 mt-2">View and manage your previous orders</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter size={16} className="mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('all')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  statusFilter === 'all' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('pending')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilter('completed')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  statusFilter === 'completed' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => handleStatusFilter('cancelled')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  statusFilter === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500">
                {statusFilter !== 'all' 
                  ? "Try adjusting your filter criteria" 
                  : "You haven't placed any orders yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="hover:bg-gray-50 transition-colors">
                  <div 
                    className="p-4 md:px-6 md:py-4 cursor-pointer" 
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mr-4 hidden md:block">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-blue-600 mr-2">Order #{order.id}</span>
                            <span className={`px-2 py-0.5 inline-flex items-center text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-4">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Package size={14} className="mr-1" />
                              {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 md:mt-0">
                        <div className="flex items-center mr-4">
                          <DollarSign size={16} className="text-gray-500" />
                          <span className="font-semibold">{order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          {expandedOrder === order.id ? 
                            <ChevronUp size={20} className="text-gray-500" /> : 
                            <ChevronDown size={20} className="text-gray-500" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="bg-gray-50 px-4 py-6 md:px-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 mb-2">Order Items</h4>
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-200">
                              {order.orderItems.map((item, index) => (
                                <div key={index} className="p-3 flex items-start">
                                  <div className="bg-gray-100 rounded-md w-12 h-12 flex items-center justify-center mr-3">
                                    {/* No imageUrl in API, so just icon */}
                                    <Package size={20} className="text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{item.bookTitle || `Product #${item.bookId}`}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Qty: {item.quantity} × ${item.unitPrice?.toFixed(2) || '0.00'}
                                    </div>
                                  </div>
                                  <div className="font-medium text-sm">
                                    ${(item.quantity * (item.unitPrice || 0)).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-500 mb-2">Order Summary</h4>
                          <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Discount</span>
                                <span>-${order.discountAmount?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-3">
                            {order.status.toLowerCase() === 'cancelled' ? (
                              <button 
                                onClick={() => handlePlaceAgain(order)}
                                className="flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={placingAgainOrderId === order.id}
                              >
                                {placingAgainOrderId === order.id ? 'Placing Again...' : (<><RefreshCw size={16} className="mr-2" />Place Again</>)}
                              </button>
                            ) : order.status.toLowerCase() === 'pending' ? (
                              <button
                                onClick={() => handleCancelOrder(order)}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={cancellingOrderId === order.id}
                              >
                                {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleViewDetails(order)}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
                              >
                                View Details
                                <ChevronRight size={16} className="ml-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-center text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
        {cancelMessage && (
          <div className={`mt-2 text-center font-medium ${cancelMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{cancelMessage}</div>
        )}
        {placeAgainMessage && (
          <div className={`mt-2 text-center font-medium ${placeAgainMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{placeAgainMessage}</div>
        )}
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Too weak'
  });

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    // Simple password strength checker
    const { newPassword } = formData;
    if (!newPassword) {
      setPasswordStrength({ score: 0, label: 'Too weak' });
      return;
    }

    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    const labels = ['Too weak', 'Weak', 'Medium', 'Strong', 'Very strong'];
    setPasswordStrength({ score, label: labels[score] });
  }, [formData.newPassword]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate passwords
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://localhost:7098/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (err) {
      setError(err.message || 'An error occurred while changing password');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    const colors = ['bg-red-400', 'bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];
    return colors[passwordStrength.score] || 'bg-gray-200';
  };

  const getStrengthTextColor = () => {
    const colors = ['text-red-600', 'text-red-600', 'text-yellow-600', 'text-green-600', 'text-green-700'];
    return colors[passwordStrength.score] || 'text-gray-400';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10"></div>
          <div className="flex flex-row items-center space-x-6">
            <div className="bg-white rounded-full p-1 shadow-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                <Key size={24} />
              </div>
            </div>
            <div className="flex-1 text-left">
              <h1 className="text-3xl font-bold text-white">Password Security</h1>
              <p className="text-blue-100 mt-1">Manage your account password</p>
            </div>
          </div>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in flex items-start">
            <div className="mr-3 flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in flex items-start">
            <div className="mr-3 flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>{success}</div>
          </div>
        )}
        
        <div className="">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 pb-2">Change Password</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.currentPassword ? (
                        <MdOutlineVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdOutlineVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.newPassword ? (
                        <MdOutlineVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdOutlineVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-gray-500">Password strength:</p>
                        <p className={`text-xs font-medium ${getStrengthTextColor()}`}>{passwordStrength.label}</p>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${getStrengthColor()}`} style={{ width: `${(passwordStrength.score + 1) * 20}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.confirmNewPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmNewPassword')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirmNewPassword ? (
                        <MdOutlineVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdOutlineVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {formData.newPassword && formData.confirmNewPassword && (
                    <div className="mt-2 flex items-center">
                      {formData.newPassword === formData.confirmNewPassword ? (
                        <>
                          <CheckCircle size={14} className="text-green-500 mr-1" />
                          <span className="text-xs text-green-500">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-red-500">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating Password...
                      </div>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfileSidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ProfileInfo />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      </main>
    </div>
  );
};

export default Profile;