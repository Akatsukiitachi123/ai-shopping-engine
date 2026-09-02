import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://udzdhzkbvtedyntmrpxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const newItems = [
  {
    title: "Designer Silk Blend Embroidered Wedding Kurta Set with Pajama",
    category: "Men Fashion",
    price: 2999.0,
    original_price: 6999.0,
    merchant: "Myntra",
    affiliate_url: "https://myntra.com?aff=wedding-kurta",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    tag: "Wedding Essential",
  },
  {
    title: "Royal Lucknowi Chikankari Festive Wedding Kurta for Men",
    category: "Men Fashion",
    price: 2199.0,
    original_price: 4999.0,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=wedding-kurta-men",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    tag: "Trending Ethnic",
  },
  {
    title: "Apple iPhone 15 (128 GB) - Blue",
    category: "Mobile",
    price: 65999.0,
    original_price: 79900.0,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=iphone-15",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    tag: "Best Seller Mobile",
  },
  {
    title: "Samsung Galaxy S24 5G Smartphone (Onyx Black, 256GB)",
    category: "Mobile",
    price: 74999.0,
    original_price: 89999.0,
    merchant: "Flipkart",
    affiliate_url: "https://flipkart.com?affid=samsung-s24",
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    tag: "Flagship Mobile",
  },
  {
    title: "OnePlus Nord CE 4 5G (Dark Chrome, 8GB RAM, 128GB)",
    category: "Mobile",
    price: 24999.0,
    original_price: 27999.0,
    merchant: "Amazon",
    affiliate_url: "https://amazon.in?tag=oneplus-nord",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
    tag: "Budget 5G Mobile",
  }
];

async function insertItems() {
  console.log("Inserting mobiles and wedding kurtas...");
  const { data, error } = await supabase.from("products").insert(newItems).select();

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log(`Success! Added ${data.length} new items.`);
  }
}

insertItems();