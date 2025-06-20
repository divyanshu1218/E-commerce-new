import React, { useState, useEffect } from "react";
import axios from "axios";

const categories = [
  "All",
  "Accessories",
  "Keyboards",
  "Webcams",
  "Headphones"
];

function Search() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    let result = products;
    if (category !== "All") {
      result = result.filter(p => p.name.toLowerCase().includes(category.toLowerCase()));
    }
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(result);
  }, [search, category, products]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Search & Filter Products</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full md:w-1/4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No products found.</div>
        ) : (
          filtered.map(product => (
            <div key={product._id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center hover:shadow-2xl transition-shadow">
              <img 
                src={`http://localhost:5000${product.image}`} 
                alt={product.name} 
                className="w-24 h-24 object-contain mb-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                }}
              />
              <h2 className="text-lg font-bold text-gray-800 mb-1 text-center">{product.name}</h2>
              <p className="text-xl font-extrabold text-blue-700 mb-4 text-center">₹{(product.price / 100).toFixed(2)}</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Search; 