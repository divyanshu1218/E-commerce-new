import React from "react";
import { useNavigate } from "react-router-dom";

function Cart({ cart, setCart }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <ul className="divide-y divide-gray-200 mb-6">
            {cart.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-800">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-700 font-bold">₹{(item.price / 100).toFixed(2)}</span>
                  <button className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded transition" onClick={() => removeFromCart(idx)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center mb-6">
            <span className="font-semibold text-lg">Total:</span>
            <span className="text-2xl font-extrabold text-blue-700">₹{(total / 100).toFixed(2)}</span>
          </div>
          <button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-colors duration-200 text-lg"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart; 