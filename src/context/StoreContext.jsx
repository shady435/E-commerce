import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const StoreContext = createContext(null);
const API_BASE = "https://e-commerce-api-3wara.vercel.app";

export function StoreProvider({ children }) {
  const { token, isAuthenticated } = useAuth();

  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    total: 0,
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchCart = async () => {
    if (!token) return;

    setCartLoading(true);

    try {
      const res = await fetch(`${API_BASE}/carts`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data);
        }
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart();
    } else {
      setCart({ items: [], itemCount: 0, subtotal: 0, total: 0 });
    }
  }, [token, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (!token) return false;

    try {
      const res = await fetch(`${API_BASE}/carts/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCart(data);
        toast.success("Product added to cart");
        return true;
      } else {
        toast.error(data.message || "Failed to add item to cart");
        return false;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      return false;
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (!token) return false;

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      const res = await fetch(`${API_BASE}/carts/items`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCart(data);
        toast.success("Quantity updated");
        return true;
      } else {
        toast.error(data.message || "Failed to update quantity");
        return false;
      }
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return false;

    try {
      const res = await fetch(`${API_BASE}/carts/items/${productId}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCart(data);
        toast.success("Item removed from cart");
        return true;
      } else {
        toast.error(data.message || "Failed to remove item from cart");
        return false;
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      return false;
    }
  };

  const clearCart = () => {
    setCart({ items: [], itemCount: 0, subtotal: 0, total: 0 });
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);

      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartLoading,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        fetchCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}