import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Wishlist({ cart, setCart }) {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // In a real app, this would fetch from user's wishlist
    // For now, we'll use localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const moveToCart = (product) => {
    setCart([...cart, product]);
    removeFromWishlist(product.id);
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('wishlist');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-800">My Wishlist</h1>
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-red-600 hover:text-red-800 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding products you love to your wishlist!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
              <div className="relative">
                <img 
                  src={`http://localhost:5000${product.image}`} 
                  alt={product.name} 
                  className="w-24 h-24 object-contain mb-4"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                  }}
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                >
                  ×
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-xl font-bold text-blue-600 mb-4">₹{(product.price / 100).toFixed(2)}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => moveToCart(product)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist; 