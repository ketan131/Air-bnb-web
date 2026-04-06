const axios = require("axios");

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function fallbackAnalysis(listing) {
  const description = (listing.description || "").toLowerCase();
  const locationText = `${listing.location || ""} ${listing.country || ""}`.toLowerCase();
  const price = safeNumber(listing.price);

  const featureHints = [
    "wifi",
    "pool",
    "parking",
    "kitchen",
    "balcony",
    "ac",
    "air conditioning",
    "metro",
    "security",
    "garden",
    "gym",
    "view",
  ];

  const features = featureHints
    .filter((f) => description.includes(f))
    .slice(0, 6)
    .map((f) => (f === "ac" ? "AC" : f.charAt(0).toUpperCase() + f.slice(1)));

  if (features.length === 0) {
    features.push("Clean and practical layout");
    features.push("Useful for short and long stays");
  }

  let valueLabel = "Moderate";
  let valueReason = "Price and details look balanced.";
  if (price !== null && price <= 3000) {
    valueLabel = "Yes";
    valueReason = "Is budget range me yeh achha option lag raha hai.";
  } else if (price !== null && price >= 12000) {
    valueLabel = "No";
    valueReason = "Price kaafi high hai, compare karke decide karein.";
  }

  let locationLabel = "Moderate";
  let locationReason = "Area ke baare me neutral signals mil rahe hain.";
  if (/(safe|prime|popular|central|city center|mall|metro|market)/i.test(locationText + " " + description)) {
    locationLabel = "Safe/Popular";
    locationReason = "Location popular lag rahi hai aur amenities ke paas ho sakti hai.";
  } else if (/(isolated|remote|unsafe|crime)/i.test(locationText + " " + description)) {
    locationLabel = "Needs Verification";
    locationReason = "Safety/area details ko final booking se pehle verify karein.";
  }

  return {
    valueForMoney: { label: valueLabel, reason: valueReason },
    location: { label: locationLabel, reason: locationReason },
    features,
    source: "fallback",
  };
}

function tryParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function generateAIReview(listing) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackAnalysis(listing);

  const prompt = `
You are a real-estate analyzer. Return only valid JSON.

Property:
- Title: ${listing.title || "N/A"}
- Description: ${listing.description || "N/A"}
- Price (INR): ${listing.price ?? "N/A"}
- Location: ${listing.location || "N/A"}
- Country: ${listing.country || "N/A"}

Required JSON format:
{
  "valueForMoney": { "label": "Yes|No|Moderate", "reason": "short reason in simple Hinglish" },
  "location": { "label": "Safe/Popular|Moderate|Needs Verification", "reason": "short reason in simple Hinglish" },
  "features": ["3 to 6 short bullet points"]
}
`;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const response = await axios.post(
    `${url}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3 },
    },
    { timeout: 15000 }
  );

  const text =
    response?.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";
  const parsed = tryParseJson(text);

  if (!parsed || !parsed.valueForMoney || !parsed.location || !Array.isArray(parsed.features)) {
    return fallbackAnalysis(listing);
  }

  return { ...parsed, source: "gemini" };
}

module.exports = { generateAIReview };

