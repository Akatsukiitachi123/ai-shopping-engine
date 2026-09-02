import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://udzdhzkbvtedyntmrpxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const brands = {
  Electronics: ["boAt", "Noise", "Sony", "JBL", "OnePlus", "Apple", "Samsung"],
  Fashion: ["Fabindia", "Manyavar", "Biba", "Libas", "Raymond", "Peter England", "W for Woman"],
  Footwear: ["Nike", "Puma", "Adidas", "Red Tape", "Bata", "Woodland", "Asics"],
  HomeDecor: ["Home Centre", "Wakefit", "IKEA", "Urban Ladder", "Spaces", "D'Decor"],
  Watches: ["Titan", "Fastrack", "Fossil", "Casio", "Timex", "Noise", "Fire-Boltt"]
};

const items = {
  Electronics: [
    "Wireless Bluetooth Earbuds with ANC", "True Wireless Headphones", "Portable Waterproof Speaker",
    "Smart Fitness Band with SpO2", "Fast Charging 20000mAh Power Bank", "Mechanical Gaming Keyboard",
    "Ergonomic Wireless Mouse", "Smart LED Desk Lamp with Wireless Charger"
  ],
  Fashion: [
    "Embroidered Silk Blend Wedding Kurta", "Chikankari Pure Cotton Casual Kurta", "Banarasi Jacquard Heavy Saree",
    "Zari Work Festive Designer Lehenga", "Tailored Fit Mandarin Collar Linen Shirt", "Slim Fit Stretchable Formal Trousers",
    "Floral Printed Anarkali Kurti Set", "Embellished Silk Nehru Jacket"
  ],
  Footwear: [
    "Mesh Breathable Lightweight Running Shoes", "Retro Streetwear Classic Sneakers", "Genuine Leather Formal Oxford Shoes",
    "Handcrafted Traditional Ethnic Mojari", "Cushioned Everyday Walking Slip-Ons", "All-Terrain Rugged Leather Boots"
  ],
  HomeDecor: [
    "Hand-Hammered Antique Brass Urli Bowl", "Modern Tripod Standing Floor Lamp", "Solid Sheesham Wood Bedside Table",
    "Boho Hand-Woven Jute Floor Runner", "Ceramic Donut Flower Vase Set", "Velvet Accent Throw Pillow Covers"
  ],
  Watches: [
    "Automatic Skeleton Stainless Steel Watch", "AMOLED Display Bluetooth Calling Smartwatch",
    "Minimalist Ultra-Thin Quartz Leather Watch", "Chronograph Tachymeter Sports Watch",
    "Vintage Digital Multifunction Watch"
  ]
};

const images = {
  Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  Fashion: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
  Footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  HomeDecor: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
  Watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
};

const merchants = ["Amazon", "Flipkart", "Myntra", "TataCliq", "Ajio"];
const tags = ["Trending", "Best Seller", "Festive Pick", "Top Rated", "Editor Choice", "Limited Deal"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 5,000 items per run (safe chunk for API limits)
const TOTAL_TO_GENERATE = 5000;
const BATCH_SIZE = 250;

async function generateCatalog() {
  console.log(`Generating and inserting ${TOTAL_TO_GENERATE} diverse products into Supabase...`);
  const categories = Object.keys(items);
  let batch = [];
  let totalUploaded = 0;

  for (let i = 1; i <= TOTAL_TO_GENERATE; i++) {
    const category = getRandomItem(categories);
    const brand = getRandomItem(brands[category]);
    const itemType = getRandomItem(items[category]);
    const basePrice = getRandomPrice(499, 15999);
    const originalPrice = Math.round(basePrice * (1 + Math.random() * 0.8));
    const merchant = getRandomItem(merchants);

    batch.push({
      title: `${brand} ${itemType} (Edition ${i})`,
      category: category,
      price: basePrice,
      original_price: originalPrice,
      merchant: merchant,
      affiliate_url: `https://${merchant.toLowerCase()}.com?tag=shopping-engine-21`,
      image_url: images[category],
      tag: getRandomItem(tags),
    });

    if (batch.length === BATCH_SIZE) {
      const { error } = await supabase.from("products").insert(batch);
      if (error) {
        console.error("Batch insert failed:", error.message);
        break;
      }
      totalUploaded += batch.length;
      console.log(`Synced ${totalUploaded} / ${TOTAL_TO_GENERATE} products...`);
      batch = [];
    }
  }

  console.log(`All done! Added ${totalUploaded} products successfully.`);
}

generateCatalog();