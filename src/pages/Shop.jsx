import React, { useEffect, useState } from "react";

import { useStore } from "../context/StoreContext";

import { FaSearch, FaShoppingCart, FaHeart } from "react-icons/fa";

import StarRating from "../components/StarRating.jsx";

import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

const API_BASE = "https://e-commerce-api-3wara.vercel.app";


function normalizeProduct(p) {
  return {
    id: p._id || p.id,
    name: p.name,   
    images: p.images,          
    category: p.category,
    price: p.discountPrice || p.price,
    oldPrice: p.discountPrice ? p.price : null,
    discount: p.discountPrice ? `-${Math.round(((p.price - p.discountPrice) / p.price) * 100).toLocaleString("en-US")}%` : null,
    stock: p.stock,

    image: p.images?.[0]?.url,
    averageRating: p.averageRating,
    numReviews: p.numReviews,
  };
}

export default function Shop() {

  const { wishlist, toggleWishlist, isInWishlist } = useStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("Default");

  const { addToCart } = useCart();
  
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        const raw = Array.isArray(data)
          ? data
          : data.products ?? data.data ?? [];
        setProducts(raw.map(normalizeProduct));
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);



  const categories = ["All", ...new Set(products.map((p) => p.category))];

  let filteredProducts = products.filter((p) => {
    const categoryMatch =
      selectedCategory === "All" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const searchMatch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const minMatch = minPrice ? p.price >= Number(minPrice) : true;
    const maxMatch = maxPrice ? p.price <= Number(maxPrice) : true;

    return categoryMatch && searchMatch && minMatch && maxMatch;
  });

  if (sortOption === "Price Low") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortOption === "Price High") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  if (loading) return <div className="text-center py-20 text-xl dark:text-gray-200 dark:bg-gray-900">Loading..</div>;

  return (
    <div className="bg-[#fafafa] dark:bg-gray-900 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="relative mb-8">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full h-14 rounded-2xl border pl-14 pr-5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700" />

        </div>

        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-3 space-y-8">
            <div>
              <h2 className="font-bold text-2xl mb-4 dark:text-gray-100">Category</h2>
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer dark:text-gray-300">
                  <input
                    type="radio"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="accent-indigo-600"/>
                  
                  <span className="capitalize">{category}</span>
                </label>
              ))}
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-4 dark:text-gray-100">Price Range</h2>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full h-11 rounded-xl border px-3 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700" />

                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full h-11 rounded-xl border px-3 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700" />

              </div>
            </div>

            <div>
              <h2 className="font-bold text-2xl mb-4 dark:text-gray-100">Sort By</h2>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full h-12 rounded-xl border px-3 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">

                <option>Default</option>
                <option>Price Low</option>
                <option>Price High</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
                setMinPrice("");
                setMaxPrice("");
                setSortOption("Default");
              }}
              className="w-full h-12 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-600 hover:text-white transition" >

              Clear All Filters
            </button>

          </aside>

          <main className="col-span-9">

            <div className="mb-4 text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length.toLocaleString("en-US")} products
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-lg duration-300 overflow-hidden">
                  <div className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden">

                     <img  src={p.image} alt={p.name}  className="w-full h-full object-contain p-5 transition-transform duration-300 hover:scale-105"/>
                    <button
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 transition">

                     <FaHeart className={`text-sm ${isInWishlist(p.id) ? "text-red-500" : "text-gray-300 dark:text-gray-600"}`} />
                    </button>
                    <div className="absolute top-4 left-4 flex gap-2">
                      {p.category && (
                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs px-3 py-1 rounded-full capitalize">
                          {p.category}
                        </span>
                      )}

                      {p.discount && (
                        <span className="bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 text-xs px-3 py-1 rounded-full">
                          {p.discount}
                        </span>
                      )}
                    </div>
                    {p.stock === 0 && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 px-4 py-2 rounded-full text-sm font-semibold">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg truncate dark:text-gray-100">{p.name}</h3>

                    <StarRating rating={p.averageRating} count={p.numReviews} />

                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        EGP {p.price.toLocaleString("en-US")}
                      </span>
                      {p.oldPrice && (<span className="text-gray-400 dark:text-gray-500 line-through"> EGP {p.oldPrice.toLocaleString("en-US")} </span>)}



                    </div>
                    <button
                      disabled={p.stock === 0}
                      onClick={() => {
                        addToCart(p);
                        toast.success(`${p.name} added to cart`, {
                          position: "top-center",
                        });
                      }}

                      className={`w-full h-12 rounded-xl font-semibold flex justify-center items-center gap-2 ${p.stock > 0 ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"}`} >
                      <FaShoppingCart />
                      {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>

                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}