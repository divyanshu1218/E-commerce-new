import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();
  const { user, token, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [orderError, setOrderError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError("");
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileError(error.response?.data?.message || 'Failed to load profile.');
      if (error.response?.status === 401) {
        logout(); // Token expired or invalid
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [token, logout]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrderError("");
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter orders by current user's email (if backend doesn't filter automatically)
      setOrders(response.data.filter(order => order.customer.email === user.email));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderError(error.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user, fetchOrders]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setLoadingProfile(true);
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(response.data); // Update user in AuthContext
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  if (!user) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-600">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-blue-800 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'wishlist' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {profileError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{profileError}</div>}
          {orderError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{orderError}</div>}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
              {loadingProfile ? (
                <div className="text-center py-8 text-gray-500">Loading profile...</div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly // Email is usually not editable
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    disabled={loadingProfile}
                  >
                    {loadingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
              {loadingOrders ? (
                <div className="text-center py-8 text-gray-500">Loading orders...</div>
              ) : orderError ? (
                <div className="text-center py-8 text-red-700">{orderError}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No orders found.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order._id.slice(-6)}</h3>
                          <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-600">Items: {order.items.map(item => item.product ? item.product.name : 'N/A').join(', ')}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">₹{(order.total / 100).toFixed(2)}</span>
                        <button
                          onClick={() => alert(`View details for order ${order._id}`)} // Replace with actual detail page navigation
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h2>
              <p className="text-gray-600">You can manage your wishlist items here.</p>
              <button
                onClick={() => navigate('/wishlist')}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View Wishlist
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      Email notifications
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      SMS notifications
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      Push notifications
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      Share order history
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      Allow marketing emails
                    </label>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 