import fs from "fs";
import csv from "csv-parser";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://udzdhzkbvtedyntmrpxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Apna affiliate tracking tag yahan set karein (jaise Amazon tag ya Cuelinks wrapper)
const AMAZON_AFFILIATE_TAG = "yourtag-21";

function formatAffiliateUrl(rawUrl, merchant) {
  if (!rawUrl) return "#";
  if (merchant?.toLowerCase().includes("amazon")) {
    const separator = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${separator}tag=${AMAZON_AFFILIATE_TAG}`;
  }
  // Agar Cuelinks use kar rahe hain to link wrap kar sakte hain
  return rawUrl;
}

async function runCsvImport() {
  const filePath = "./products.csv";

  if (!fs.existsSync(filePath)) {
    console.error("Error: products.csv file nahi mili! Root folder me products.csv banayein.");
    return;
  }

  const batch = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      batch.push({
        title: row.title || row.Title,
        category: row.category || row.Category || "General",
        price: parseFloat(row.price || row.Price || 0),
        original_price: parseFloat(row.original_price || row.OriginalPrice || 0) || null,
        merchant: row.merchant || row.Merchant || "Online Store",
        affiliate_url: formatAffiliateUrl(row.url || row.affiliate_url || row.Link, row.merchant),
        image_url: row.image_url || row.Image || "https://placehold.co/600x400?text=Product",
        tag: row.tag || row.Tag || "Featured",
      });
    })
    .on("end", async () => {
      console.log(`CSV read complete. Uploading ${batch.length} products to Supabase...`);

      // 50-50 products ke chunks me upload karenge taaki rate-limit na lage
      const chunkSize = 50;
      for (let i = 0; i < batch.length; i += chunkSize) {
        const chunk = batch.slice(i, i + chunkSize);
        const { error } = await supabase.from("products").insert(chunk);

        if (error) {
          console.error(`Batch ${i / chunkSize + 1} failed:`, error.message);
        } else {
          console.log(`Uploaded batch ${i / chunkSize + 1} (${chunk.length} items)`);
        }
      }

      console.log("Bulk upload finished successfully!");
    });
}

runCsvImport();