"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 24;

const CATEGORIES = [
  "All",
  "Smartphones",
  "Men Ethnic",
  "Women Ethnic",
  "Audio & Tech",
  "Footwear",
  "Watches",
  "Home Decor",
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    loadProducts(0, "All", true);
  }, []);

  const loadProducts = async (pageNumber: number, category: string, reset = false) => {
    try {
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (category !== "All") {
        query = query.eq("category", category);
      }

      const { data, count, error } = await query.range(from, to);

      if (!error && Array.isArray(data)) {
        if (count !== null) setTotalCount(count);
        if (reset) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Load products error:", err);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery("");
    setIsSearching(false);
    setPage(0);
    loadProducts(0, cat, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, selectedCategory);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSelectedCategory("All");
      setPage(0);
      loadProducts(0, "All", true);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    setProducts([]); // Purana Supabase catalog turant screen se clear

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchQuery.trim() }),
      });

      const data = await res.json();

      if (Array.isArray(data?.results) && data.results.length > 0) {
        setProducts(data.results);
        setHasMore(false);
      } else {
        alert(data?.error || "No products found for this query.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Failed to connect to search API.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (item: any) => {
    const targetUrl =
      item?.affiliate_url ||
      item?.product_url ||
      item?.url ||
      `/api/track?id=${item?.id}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const formatPrice = (val: any) => {
    if (!val || val === "Check Price") return "Check Price";
    const clean = String(val).replace(/[^0-9.]/g, "");
    return clean ? `₹${clean}` : String(val);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 md:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Multi-Store Shopping Engine
        </h1>
        <p className="text-slate-400 mb-8">
          Compare Amazon, Flipkart, TataCliq, and more in real time.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shoes, smartphones, watches..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer text-white"
          >
            {loading ? "Searching Stores..." : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto pt-2">
          {CATEGORIES.map((cat) => {
            const isActive = !isSearching && selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition border ${
                  isActive
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-300">
            {loading
              ? "Fetching live multi-store prices..."
              : isSearching
              ? `Live Results (${products.length} Stores Found)`
              : `${selectedCategory === "All" ? "Catalog Inventory" : selectedCategory} (${totalCount} Total)`}
          </h2>
          {(isSearching || selectedCategory !== "All") && (
            <button
              onClick={() => handleCategoryClick("All")}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {products.length === 0 && !loading ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-slate-400">No products found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item, index) => {
              const merchantName = item?.merchant || "Store";
              const lower = merchantName.toLowerCase();
              const badgeColor = lower.includes("flipkart")
                ? "bg-blue-600 text-white"
                : lower.includes("tata")
                ? "bg-purple-600 text-white"
                : lower.includes("amazon")
                ? "bg-amber-600 text-white"
                : "bg-emerald-600 text-white";

              return (
                <div
                  key={item?.id || index}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
                >
                  <div className="relative h-56 w-full bg-white flex items-center justify-center p-3">
                    <img
                      src={item?.image_url || "https://placehold.co/600x400?text=Product"}
                      alt={item?.title || "Product"}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span
                      className={`absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded shadow ${badgeColor}`}
                    >
                      {merchantName}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {item?.tag || merchantName}
                      </span>
                      <h3 className="text-sm font-medium text-white mt-1 line-clamp-2">
                        {item?.title || "Product Details"}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-white">
                          {formatPrice(item?.price)}
                        </span>
                        {item?.original_price && (
                          <span className="text-xs text-slate-500 line-through ml-2">
                            {formatPrice(item?.original_price)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBuyNow(item)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md font-medium cursor-pointer"
                      >
                        Buy on {merchantName}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isSearching && hasMore && products.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition cursor-pointer"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </main>
  );
}