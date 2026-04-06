const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: { type: String },
  description: String,
  price: Number,
  // Added with AI assistance: category used by UI filters (Trending/Rooms/Pools etc.)
  category: {
    type: String,
    enum: [
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
    ],
    default: "trending",
  },
  location: String,
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  image: {
    url: String,
    filename: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      
    },
    coordinates: {
      type: [Number],
     
    },
  },
  //category: {
    //type: String,
    //enum: ["mountains", "arctic", "farms", "deserts"]
 // }
}); // 👈 yaha tak hi schema close hona chahiye

// Middleware: delete reviews after listing deletion
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }

});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
