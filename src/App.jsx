import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OrdersDetails from "./components/OrdersDetails";

import { useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import { Toaster } from "react-hot-toast";

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1">
          <Login />
        </div>

        <Footer />

        <Toaster position="top-center" reverseOrder={false} />
      </div>
    );
  }

  return (
    <CartProvider>
      <>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />

            <Route path="/orders" element={<Orders />} />
            <Route
              path="/orders/:id"
              element={<OrdersDetails />}
            />

            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>

        <Toaster position="top-center" reverseOrder={false} />
      </>
    </CartProvider>
  );
}