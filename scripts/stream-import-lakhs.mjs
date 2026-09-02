import fs from "fs";
import readline from "readline";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://udzdhzkbvtedyntmrpxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function streamUpload() {
  const filePath = "./large_catalog.csv"; // Aapka bada feed file
  if (!fs.existsSync(filePath)) {
    console.log("large_catalog.csv file project folder me rakhein.");
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let batch = [];
  let totalUploaded = 0;

  for await (const line of rl) {
    // CSV parsing logic
    const cols = line.split(",");
    if (cols.length < 5) continue;

    batch.push({
      title: cols[0]?.trim(),
      category: cols[1]?.trim() || "General",
      price: parseFloat(cols[2]) || 999,
      original_price: parseFloat(cols[3]) || null,
      merchant: cols[4]?.trim() || "Online",
      affiliate_url: cols[5]?.trim() || "#",
      image_url: cols[6]?.trim() || "https://placehold.co/600x400",
      tag: "Verified Deal",
    });

    // Har 500 products ka chunk banate hi Supabase me push karein
    if (batch.length >= 500) {
      const { error } = await supabase.from("products").insert(batch);
      if (!error) {
        totalUploaded += batch.length;
        console.log(`🚀 Successfully synced: ${totalUploaded} products...`);
      } else {
        console.error("Batch error:", error.message);
      }
      batch = [];
    }
  }

  if (batch.length > 0) {
    await supabase.from("products").insert(batch);
    totalUploaded += batch.length;
    console.log(`Finished! Total synced: ${totalUploaded}`);
  }
}

streamUpload();