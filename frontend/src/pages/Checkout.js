import React, { useState } from "react";
import axios from "axios";

function Checkout({ cart, setCart }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Razorpay Payment
  const handleRazorpay = async () => {
    setMessage("");
    try {
      const { data } = await axios.post("http://localhost:5000/api/create-order", {
        amount: total / 100, // in INR
        currency: "INR"
      });
      const options = {
        key: "rzp_test_cQa7vCemKPy4EU", // Replace with your Razorpay key
        amount: data.amount,
        currency: data.currency,
        name: name,
        description: "Product Purchase",
        order_id: data.id,
        handler: function (response) {
          setMessage("Payment Successful via Razorpay!");
          setCart([]);
        },
        prefill: {
          name: name,
          email: email
        },
        theme: { color: "#3399cc" }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage("Error initiating Razorpay payment");
    }
  };

  // PayPal Payment
  const handlePayPal = () => {
    setMessage("");
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: (total / 100).toFixed(2),
              currency_code: "USD"
            },
            description: "Product Purchase"
          }],
          payer: {
            name: { given_name: name },
            email_address: email
          }
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(function (details) {
          setMessage("Payment Completed via PayPal!");
          setCart([]);
        });
      },
      onError: (err) => {
        setMessage("Error with PayPal payment");
      }
    }).render("#paypal-button-container");
  };

  // Load Razorpay and PayPal SDKs
  React.useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_SANDBOX_CLIENT_ID&currency=USD`;
      script.async = true;
      script.onload = handlePayPal;
      document.body.appendChild(script);
    } else {
      handlePayPal();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container mx-auto px-4 max-w-lg">
      <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">Checkout</h1>
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Name</label>
          <input
            className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Email</label>
          <input
            className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-8 flex justify-between items-center">
          <span className="font-semibold text-lg">Total:</span>
          <span className="text-2xl font-extrabold text-blue-700">₹{(total / 100).toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-4">
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition-colors duration-200 text-lg"
            onClick={handleRazorpay}
          >
            Pay with Razorpay (UPI/Card)
          </button>
          <div className="relative w-full flex flex-col items-center">
            <div id="paypal-button-container" className="w-full"></div>
          </div>
        </div>
        {message && <div className="mt-6 text-green-600 font-bold text-center">{message}</div>}
      </div>
    </div>
  );
}

export default Checkout; 