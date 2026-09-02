"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Load initial products on startup
  useEffect(() => {
    async function loadInitial() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
    }
    loadInitial();
  }, []);

  // AI Search Execution
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchQuery }),
      });

      const data = await res.json();
      if (data.results) {
        setProducts(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12 md:px-8">
      {/* Header & Search Bar */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Find Any Product or Look in Seconds.
        </h1>
        <p className="text-slate-400 mb-8">
          Powered by Gemini AI. Describe style, budget, or occasions to discover matching products.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Traditional silk saree under 4000 or rustic wooden table..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Product Results */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-slate-300">
          {loading ? "AI is selecting the best matches..." : `Showing ${products.length} Products`}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                <img
                  src={item.image_url || "https://placehold.co/600x400?text=Product"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.tag && (
                  <span className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
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
                    href={item.affiliate_url}
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
      </div>
    </main>
  );
}