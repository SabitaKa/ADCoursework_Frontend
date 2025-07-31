import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCreditCard } from "react-icons/fa";

export default function CheckoutPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://localhost:7098/api/checkout/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSummary(response.data.data);
        setShippingAddress(response.data.data.address || "");
      } catch (err) {
        setError("Failed to load checkout summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    setOrderMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://localhost:7098/api/orders",
        { shippingAddress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setOrderMessage("Order placed successfully! Redirecting to home page...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setOrderMessage("Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!summary) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Details */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Customer Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={summary.fullName || ""}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={summary.email || ""}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={summary.phoneNumber || ""}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter shipping address"
                />
              </div>
            </div>

            {/* Place Order Button here */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handlePlaceOrder}
                disabled={orderLoading}
              >
                {orderLoading ? "Placing Order..." : "PLACE ORDER"}
              </button>
              {orderMessage && (
                <div className={orderMessage.includes("success") ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {orderMessage}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white p-0 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-5">
              <h2 className="text-2xl font-bold text-white tracking-wide">Order Details</h2>
            </div>
            <div className="space-y-4 max-h-72 overflow-y-auto bg-blue-50 px-8 py-6">
              {summary.items.map(item => (
                <div key={item.bookId} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-gray-800 font-medium">{item.bookTitle}</span>
                      <div className="text-left text-xs text-gray-500">Qty: {item.quantity} &bull; ${item.unitPrice}</div>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-700 text-lg">${item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="bg-white px-8 py-6 border-t border-blue-100">
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Total Amount</span>
                <span className="font-medium">${summary.subtotal}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Discount</span>
                <span className="font-medium text-green-600">-${summary.discountAmount}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-200 mt-4">
                <span className="font-bold text-lg text-gray-800">Grand Total</span>
                <span className="font-bold text-lg text-blue-600">${summary.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
