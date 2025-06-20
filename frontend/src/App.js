import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function Navbar({ cart }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur shadow-md mb-8">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-blue-700 hover:text-blue-900 transition">🛒 Product Store</Link>
        <div className="flex items-center gap-6">
          <Link to="/search" className={`text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/search' ? 'text-blue-700' : 'text-gray-700'}`}>Search</Link>
          <Link to="/wishlist" className={`text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/wishlist' ? 'text-blue-700' : 'text-gray-700'}`}>Wishlist</Link>
          {user ? (
            <>
              <Link to="/profile" className={`text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/profile' ? 'text-blue-700' : 'text-gray-700'}`}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={`text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/admin' ? 'text-blue-700' : 'text-gray-700'}`}>Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="text-lg font-medium text-gray-700 hover:text-blue-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/login' ? 'text-blue-700' : 'text-gray-700'}`}>Login</Link>
              <Link to="/signup" className={`text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/signup' ? 'text-blue-700' : 'text-gray-700'}`}>Signup</Link>
            </>
          )}
          <Link
            to="/cart"
            className={`relative text-lg font-medium hover:text-blue-700 transition ${location.pathname === '/cart' ? 'text-blue-700' : 'text-gray-700'}`}
          >
            Cart
            <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg">
              {cart.length}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const [cart, setCart] = useState([]);
  const { login } = useAuth();

  return (
    <Router>
      <Navbar cart={cart} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-12">
        <Routes>
          <Route path="/" element={<Home cart={cart} setCart={setCart} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail cart={cart} setCart={setCart} />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/signup" element={<Signup onLogin={login} />} />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Cart cart={cart} setCart={setCart} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout cart={cart} setCart={setCart} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist cart={cart} setCart={setCart} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
