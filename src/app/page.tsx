"use client";

import React, { useState, useEffect } from "react";
import { Search, Sparkles, ExternalLink, Tag, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  original_price: number;
  merchant: string;
  image_url: string;
  affiliate_url: string;
  tag: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const suggestedPrompts = [
    "Wedding outfit under ₹5000",
    "Minimalist room decor",
    "Affordable wireless earbuds",
    "Casual summer style"
  ];

  // Initial load from Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Trigger Gemini AI Search
  const handleAISearch = async (searchPrompt?: string) => {
    const textToSearch = searchPrompt || query;
    if (!textToSearch.trim()) return;

    setSearching(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSearch }),
      });

      const data = await res.json();
      if (data.results) {
        setProducts(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            C
          </div>
          <span className="font-semibold text-lg tracking-tight">CurateAI</span>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Gemini AI Search Active
        </span>
      </header>

      {/* Hero & AI Prompt Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Natural Language Product Matching
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Find Any Product or Look in Seconds.
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto mb-8">
          Type what you want in plain words. AI analyzes prices, styles, and budget across multiple stores.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAISearch();
            }}
            className="relative flex items-center"
          >
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., I need a stylish kurta under ₹3,000 for a wedding..."
              className="w-full pl-12 pr-32 py-4 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xl text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Discover"}
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-500">Try asking:</span>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(prompt);
                  handleAISearch(prompt);
                }}
                className="text-xs px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-700 transition flex items-center gap-1"
              >
                {prompt}
                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-200">
            {searching ? "AI is curating recommendations..." : "Curated Matches"}
          </h2>
          <span className="text-xs text-slate-400">{products.length} Products Found</span>
        </div>

        {loading || searching ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Analyzing intent and filtering catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No matching products found. Try another prompt!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-indigo-400 border border-indigo-500/30 text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {prod.tag}
                  </span>
                  <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs px-2 py-1 rounded-lg border border-slate-700">
                    {prod.merchant}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="font-semibold text-slate-100 text-base mt-1 line-clamp-1">
                      {prod.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-white">₹{prod.price}</div>
                      {prod.original_price && (
                        <div className="text-xs text-slate-500 line-through">₹{prod.original_price}</div>
                      )}
                    </div>
                    <a
                      href={prod.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-semibold transition"
                    >
                      Buy on {prod.merchant}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}