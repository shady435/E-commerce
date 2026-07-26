import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
} from "react-icons/fi";

import { BsCheckCircleFill, BsCircle } from "react-icons/bs";

const API_BASE = "https://e-commerce-api-3wara.vercel.app";

export default function OrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/my/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setOrder(data.order || data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const progress = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentStep = progress.indexOf(order?.status?.toLowerCase());

  const badgeStyle = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-violet-100 text-violet-700",
    shipped: "bg-cyan-100 text-cyan-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    returned: "bg-orange-100 text-orange-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Order not found
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Order Details
            </h1>

            <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
              Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              badgeStyle[order.status?.toLowerCase()] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>
        </div>

        {order.status?.toLowerCase() !== "cancelled" &&
          order.status?.toLowerCase() !== "returned" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">

              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Order Progress
              </h2>

              <div className="relative flex justify-between">
                {progress.map((step, index) => (
                  <div
                    key={step}
                    className="flex flex-col items-center flex-1 relative"
                  >
                    {index !== progress.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 h-[2px] w-full ${
                          index < currentStep
                            ? "bg-indigo-600"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}

                    <div
                      className={`z-10 w-9 h-9 rounded-full border-4 flex items-center justify-center ${
                        index <= currentStep
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-500"
                      }`}
                    >
                      {index <= currentStep ? (
                        <BsCheckCircleFill size={16} />
                      ) : (
                        <BsCircle size={16} />
                      )}
                    </div>

                    <span
                      className={`mt-2 text-xs font-medium ${
                        index <= currentStep
                          ? "text-indigo-600"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <FiPackage className="text-indigo-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Items
            </h2>
          </div>

          {order.items?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    item.product?.images?.[0] ||
                    "https://placehold.co/80x80"
                  }
                  alt={item.product?.name}
                  className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 object-cover"
                />

                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {item.product?.name}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Qty: {item.quantity} × EGP{" "}
                    {Number(item.price).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                EGP {Number(item.quantity * item.price).toLocaleString()}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-6">

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <FiMapPin className="text-indigo-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Shipping Address
              </h2>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {order.shippingAddress?.fullName}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.shippingAddress?.address}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.country}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <FiCreditCard className="text-indigo-600 text-xl" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Payment
              </h2>
            </div>

            <p className="text-base text-gray-700 dark:text-gray-300">
              {order.paymentMethod || "Cash on Delivery"}
            </p>

            <div className="border-t border-gray-100 dark:border-gray-700 my-5"></div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Total
              </span>

              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                EGP{" "}
                {Number(
                  order.totalPrice || order.total || 0
                ).toLocaleString()}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {(order.status?.toLowerCase() === "pending" ||
          order.status?.toLowerCase() === "confirmed") && (
          <div className="flex justify-center mt-6">
            <button
              onClick={async () => {
                try {
                  await fetch(
                    `${API_BASE}/orders/my/${order._id}/cancel`,
                    {
                      method: "PATCH",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  fetchOrder();
                } catch (err) {
                  console.log(err);
                }
              }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              <FiCheckCircle size={16} />
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}