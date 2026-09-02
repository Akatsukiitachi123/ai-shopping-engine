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

    if (!error && data) {
      if (count !== null) setTotalCount(count);
      if (reset) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
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
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchQuery }),
      });

      const data = await res.json();
      if (data.results) {
        setProducts(data.results);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 md:px-8">
      {/* Header & Search */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Find Any Product or Look in Seconds.
        </h1>
        <p className="text-slate-400 mb-8">
          Powered by Gemini AI. Describe style, budget, or occasions to discover matching products.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Wedding sherwani, running shoes, Noise smartwatch..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Category Filter Chips */}
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

      {/* Catalog Display */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-300">
            {loading
              ? "AI is selecting the best matches..."
              : isSearching
              ? `Found ${products.length} Matching Products`
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
            >
              <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                <img
                  src={item.image_url || "https://placehold.co/600x400?text=Product"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.tag && (
                  <span className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded font-medium shadow">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {item.merchant} · {item.category}
                  </span>
                  <h3 className="text-sm font-medium text-white mt-1 line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-white">₹{item.price}</span>
                    {item.original_price && (
                      <span className="text-xs text-slate-500 line-through ml-2">
                        ₹{item.original_price}
                      </span>
                    )}
                  </div>
                  <a
                    href={`/api/track?id=${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md font-medium"
                  >
                    Buy Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {!isSearching && hasMore && (
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