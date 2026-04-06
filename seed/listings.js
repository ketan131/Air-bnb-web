// Run: node seed/listings.js
// Adds demo listings for categories + budget ranges.

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const categories = [
  "trending",
  "rooms",
  "cities",
  "mountain",
  "castles",
  "pools",
  "camping",
  "farms",
  "arctic",
  "domes",
  "sailboats",
];

const demo = [
  { title: "Budget Room Near Metro", category: "rooms", price: 1200, location: "Jaipur", country: "India" },
  { title: "Cozy Farm Stay", category: "farms", price: 2200, location: "Pune", country: "India" },
  { title: "Trending City Studio", category: "trending", price: 3200, location: "Mumbai", country: "India" },
  { title: "Iconic City View Apartment", category: "cities", price: 4500, location: "Delhi", country: "India" },
  { title: "Mountain Cabin Escape", category: "mountain", price: 5500, location: "Manali", country: "India" },
  { title: "Pool Villa Weekend", category: "pools", price: 8000, location: "Goa", country: "India" },
  { title: "Castle Heritage Stay", category: "castles", price: 11000, location: "Udaipur", country: "India" },
  { title: "Arctic Theme Igloo", category: "arctic", price: 15000, location: "Gulmarg", country: "India" },
  { title: "Dome Glamping", category: "domes", price: 6500, location: "Jaisalmer", country: "India" },
  { title: "Sailboat Experience", category: "sailboats", price: 9000, location: "Kochi", country: "India" },
  { title: "Camping Under Stars", category: "camping", price: 3000, location: "Rishikesh", country: "India" },
];

function pickImage(i) {
  // Safe placeholder image (works without Cloudinary upload)
  const pics = [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=60",
  ];
  return { url: pics[i % pics.length], filename: "seed-unsplash" };
}

async function main() {
  await mongoose.connect(dbUrl);

  const count = await Listing.countDocuments();
  if (count > 0) {
    console.log("Listings already exist. Seed will add more demo listings.");
  }

  const toInsert = [];
  for (let i = 0; i < demo.length; i++) {
    const d = demo[i];
    toInsert.push({
      title: d.title,
      description:
        "A clean stay with helpful amenities. WiFi, parking and security. Great for families and couples.",
      price: d.price,
      category: d.category,
      location: d.location,
      country: d.country,
      image: pickImage(i),
      geometry: { type: "Point", coordinates: [75.7873, 26.9124] },
    });
  }

  // Also add a few random prices/categories to cover budgets
  for (let i = 0; i < 12; i++) {
    const category = categories[i % categories.length];
    const price = 500 + i * 2000; // 500..24500 approx
    toInsert.push({
      title: `Demo ${category} Stay #${i + 1}`,
      description:
        "Nice location, good connectivity, and practical facilities. Popular area, safe surroundings.",
      price,
      category,
      location: "Demo City",
      country: "India",
      image: pickImage(i + 20),
      geometry: { type: "Point", coordinates: [77.209, 28.6139] },
    });
  }

  await Listing.insertMany(toInsert);
  console.log(`Seeded ${toInsert.length} demo listings.`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

