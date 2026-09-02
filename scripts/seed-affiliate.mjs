import { createClient } from "@supabase/supabase-js";

// Supabase Credentials
const SUPABASE_URL = "https://udzdhzkbvtedyntmrpxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Yahan aap apne affiliate links aur details dal sakte hain
const affiliateCatalog = [
  {
    title: "Handcrafted Solid Teakwood Coffee Table",
    category: "Home Decor",
    price: 6499.0,
    original_price: 11999.0,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=your-affiliate-tag",
    image_url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80",
    tag: "Trending",
  },
  {
    title: "Embroidered Banarasi Silk Saree with Blouse Piece",
    category: "Fashion",
    price: 3499.0,
    original_price: 7999.0,
    merchant: "Myntra",
    affiliate_url: "https://myntra.com?aff=your-tag",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    tag: "Festive Pick",
  },
  {
    title: "Wireless Over-Ear Studio Headphones (Active Noise Cancelling)",
    category: "Electronics",
    price: 4999.0,
    original_price: 9999.0,
    merchant: "Flipkart",
    affiliate_url: "https://flipkart.com?affid=your-tag",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    tag: "Top Rated",
  },
  {
    title: "Antique Brass Hand-Hammered Urli Bowl for Living Room",
    category: "Home Decor",
    price: 1450.0,
    original_price: 2800.0,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=your-affiliate-tag",
    image_url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80",
    tag: "Best Value",
  },
  {
    title: "Pure Linen Slim-Fit Casual Mandarin Collar Shirt",
    category: "Fashion",
    price: 1899.0,
    original_price: 3599.0,
    merchant: "Myntra",
    affiliate_url: "https://myntra.com?aff=your-tag",
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    tag: "Editor Pick",
  },
];

async function seedProducts() {
  console.log("Syncing products with Supabase...");

  const { data, error } = await supabase.from("products").insert(affiliateCatalog).select();

  if (error) {
    console.error("Failed to insert:", error.message);
  } else {
    console.log(`Successfully added ${data.length} affiliate products to your live engine!`);
  }
}

seedProducts();