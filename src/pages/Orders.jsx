import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const API_BASE = "https://e-commerce-api-3wara.vercel.app";

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders/my?page=1&limit=10`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders || data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      case "shipped":
        return "bg-cyan-100 text-cyan-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "returned":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-base font-semibold">Loading Orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-500 text-base">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <p className="text-gray-500 text-lg">No Orders Yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-bold text-lg text-slate-900">
                        #
                        {order.orderNumber
                          ? order.orderNumber
                          : order._id.slice(-8).toUpperCase()}
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-gray-500 mt-2 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-indigo-600">
                      EGP{" "}
                      {Number(
                        order.totalPrice || order.total || 0
                      ).toLocaleString()}
                    </h2>

                    <FaChevronRight
                      size={16}
                      className="text-gray-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}