import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://udzdhzkbvtedyntmrpxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const largeCatalog = [
  // --- MOBILES & GADGETS ---
  {
    title: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    category: "Mobile",
    price: 127990,
    original_price: 134900,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    tag: "Flagship",
  },
  {
    title: "Google Pixel 8 Pro 5G (Obsidian, 128 GB)",
    category: "Mobile",
    price: 79999,
    original_price: 106999,
    merchant: "Flipkart",
    affiliate_url: "https://flipkart.com?affid=yourtag",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
    tag: "Best Camera Phone",
  },
  {
    title: "Redmi Note 13 Pro+ 5G (Fusion Purple, 256 GB)",
    category: "Mobile",
    price: 31999,
    original_price: 35999,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=800&q=80",
    tag: "Mid-Range Beast",
  },
  {
    title: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
    category: "Electronics",
    price: 28990,
    original_price: 34990,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    tag: "Premium Audio",
  },
  {
    title: "Apple iPad Air (5th Gen) 64 GB Wi-Fi with M1 Chip",
    category: "Electronics",
    price: 54900,
    original_price: 59900,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    tag: "Top Tablet",
  },

  // --- ETHNIC & WEDDING FASHION ---
  {
    title: "Royal Embroidered Sherwani with Stole for Groom",
    category: "Men Fashion",
    price: 14999,
    original_price: 29999,
    merchant: "Myntra",
    affiliate_url: "https://myntra.com?aff=wedding",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    tag: "Wedding Special",
  },
  {
    title: "Pure Kanjivaram Soft Silk Saree with Heavy Zari Border",
    category: "Women Fashion",
    price: 4899,
    original_price: 9999,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    tag: "Bridal Pick",
  },
  {
    title: "Velvet Embroidered Semi-Stitched Bridal Lehenga Choli",
    category: "Women Fashion",
    price: 8999,
    original_price: 18999,
    merchant: "Myntra",
    affiliate_url: "https://myntra.com?aff=wedding",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    tag: "Bridal Lehenga",
  },
  {
    title: "Men Pure Linen Casual Kurta Shirt with Roll-Up Sleeves",
    category: "Men Fashion",
    price: 1299,
    original_price: 2499,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    tag: "Casual Ethnic",
  },

  // --- FOOTWEAR & WATCHES ---
  {
    title: "Nike Air Jordan 1 Low Men Basketball Shoes",
    category: "Footwear",
    price: 8995,
    original_price: 10995,
    merchant: "Myntra",
    affiliate_url: "https://myntra.com?aff=shoes",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    tag: "Sneakerhead",
  },
  {
    title: "Fossil Gen 6 Smartwatch with Stainless Steel Mesh Band",
    category: "Watches",
    price: 14495,
    original_price: 23995,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    tag: "Best Seller Watch",
  },
  {
    title: "Titan Mechanical Automatic Skeleton Dial Watch for Men",
    category: "Watches",
    price: 19995,
    original_price: 24995,
    merchant: "TataCliq",
    affiliate_url: "https://tatacliq.com?aff=titan",
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
    tag: "Luxury Watch",
  },

  // --- HOME DECOR & LIVING ---
  {
    title: "Handcrafted Sheesham Wood Queen Size Bed with Storage",
    category: "Home Decor",
    price: 28499,
    original_price: 45000,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    tag: "Solid Wood",
  },
  {
    title: "Vintage Industrial Floor Lamp with Tripod Brass Stand",
    category: "Home Decor",
    price: 3499,
    original_price: 6999,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=yourtag-21",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    tag: "Aesthetic Room",
  },
  {
    title: "Bohemian Hand-Woven Jute Area Rug (5x7 Feet)",
    category: "Home Decor",
    price: 2499,
    original_price: 4999,
    merchant: "Pepperfry",
    affiliate_url: "https://pepperfry.com?aff=rug",
    image_url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80",
    tag: "Living Room Pick",
  }
];

async function seedLarge() {
  console.log("Seeding large catalog into Supabase...");
  const { data, error } = await supabase.from("products").insert(largeCatalog).select();

  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`Successfully added ${data.length} new diverse products!`);
    
    // Count total products in database
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
    console.log(`Total products currently in Supabase: ${count}`);
  }
}

seedLarge();