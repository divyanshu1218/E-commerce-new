import React, { useEffect, useState } from "react";
import axios from "axios";

function Home({ cart, setCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-10 text-center tracking-tight drop-shadow">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div
            key={product._id}
            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6 flex flex-col items-center border border-gray-100 hover:border-blue-200 relative overflow-hidden"
          >
            <div className="w-32 h-32 mb-4 flex items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-200 rounded-xl overflow-hidden">
              <img 
                src={`http://localhost:5000${product.image}`} 
                alt={product.name} 
                className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                }}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">{product.name}</h2>
            <p className="text-xl font-extrabold text-blue-700 mb-4 text-center">₹{(product.price / 100).toFixed(2)}</p>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home; 