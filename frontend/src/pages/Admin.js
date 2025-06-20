import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Admin() {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // New state for active admin tab
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // State for orders
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Accessories',
    stock: '',
    features: '',
    image: ''
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: {
          Authorization: `Bearer ${token}` // Include token for fetching products
        }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to fetch products.');
      if (error.response?.status === 401) {
        logout(); // Token expired or invalid, log out
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const fetchOrders = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}` // Only admin can fetch all orders
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders.');
      if (error.response?.status === 401) {
        logout(); // Token expired or invalid, log out
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchProducts, fetchOrders]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      submitData.append('features', formData.features);

      if (selectedFile) {
        submitData.append('image', selectedFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, submitData, config);
      } else {
        await axios.post('http://localhost:5000/api/products', submitData, config);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Accessories',
        stock: '',
        features: '',
        image: ''
      });
      setSelectedFile(null);
      setEditingProduct(null);
      
      // Clear file input
      const fileInput = document.getElementById('product-image');
      if (fileInput) fileInput.value = '';
      
      fetchProducts(); // Refresh products list
    } catch (error) {
      console.error('Error saving product:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save product.');
      if (error.response?.status === 401) {
        logout(); 
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toString(),
      category: product.category,
      stock: product.stock.toString(),
      features: product.features.join(', '),
      image: product.image
    });
    setSelectedFile(null);
    // Clear file input when editing
    const fileInput = document.getElementById('product-image');
    if (fileInput) fileInput.value = '';
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setError("");
      setLoading(true);
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchProducts(); // Refresh products list
      } catch (error) {
        console.error('Error deleting product:', error.response?.data);
        setError(error.response?.data?.message || 'Failed to delete product.');
        if (error.response?.status === 401) {
          logout(); 
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setSelectedFile(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Accessories',
      stock: '',
      features: '',
      image: ''
    });
    // Clear file input
    const fileInput = document.getElementById('product-image');
    if (fileInput) fileInput.value = '';
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setError("");
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, 
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error updating order status:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to update order status.');
      if (error.response?.status === 401) {
        logout(); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Admin Panel</h1>
      
      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      {loading && <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">Loading...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Admin Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Menu</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Product Management
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'orders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Order Management
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add/Edit Product Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Accessories">Accessories</option>
                      <option value="Keyboards">Keyboards</option>
                      <option value="Webcams">Webcams</option>
                      <option value="Headphones">Headphones</option>
                      <option value="Mice">Mice</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="High quality, Warranty, Fast shipping"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image {!editingProduct && '*'}
                    </label>
                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!editingProduct}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Accepted formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                    {editingProduct && !selectedFile && (
                      <p className="text-sm text-blue-600 mt-1">
                        Current image will be kept if no new file is selected
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                      disabled={loading}
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Products</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.map(product => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={`http://localhost:5000${product.image}`} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-600">₹{(product.price / 100).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading orders...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-700">{error}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No orders found.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order._id.slice(-6)}</h3>
                          <p className="text-gray-600">Customer: {order.customer.name} ({order.customer.email})</p>
                          <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                          <br/>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                            className="mt-2 px-2 py-1 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="font-semibold text-gray-700">Items:</p>
                        <ul className="list-disc list-inside text-gray-600">
                          {order.items.map(item => (
                            <li key={item._id}>{item.product ? item.product.name : 'N/A'} (Qty: {item.quantity}) - ₹{(item.price / 100).toFixed(2)}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total: ₹{(order.total / 100).toFixed(2)}</span>
                        <button
                          onClick={() => alert(`View full details for order ${order._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin; 