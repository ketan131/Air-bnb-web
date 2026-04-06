const express = require("express");
const router =  express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Message = require("../models/message.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const User = require("../models/user.js"); // Ye bhulna mat warna 'User is not defined' error aayega
const { generateAIReview } = require("../services/aiAnalysis.js");
// Added with AI assistance: AI review API and wishlist toggle logic.

 
 const listingcontrollers = require("../controllers/listings.js");
  const multer = require("multer");
  const { storage} = require("../cloudconfig.js");
  const upload = multer({storage});
 router
 .route("/")
 .get ( wrapAsync(listingcontrollers.index))
 .post(
  isLoggedIn,
  upload.single("listing[image]"),
   validateListing,
  wrapAsync(
    listingcontrollers.createListing)
  );
  /*y help of friend kiya h */
  router.get("/search", async (req, res) => {
  let { query } = req.query;

  if (!query) {
    return res.redirect("/listings");
  }

  let allListings = await Listing.find({
    title: { $regex: query, $options: "i" }
  });

  res.render("listings/index.ejs", { allListings });
});
/* yha tk */
/* --- Naya Unique Feature: Price Filter --- */
router.get("/filter", wrapAsync(async (req, res) => {
  let { price } = req.query; // Slider se aayi value (e.g. 10000)
  
  // MongoDB Query: Price should be less than or equal to ($lte)
  const allListings = await Listing.find({ price: { $lte: price } });

  if (allListings.length === 0) {
    req.flash("error", "Is budget mein koi property nahi mili!");
    return res.redirect("/listings");
  }

  // Wahi index page render karenge par filtered results ke sath
  res.render("listings/index.ejs", { allListings });
}));
/* --- End of Price Filter --- */
/*-- wishka route--*/
// Wishlist Route
router.post("/:id/wishlist", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let user = await User.findById(req.user._id); // Current logged-in user

    // Toggle behavior: second click removes listing from wishlist (unlike support).
    const alreadyWishlisted = user.wishlist.some((wishId) => wishId.toString() === id.toString());

    if (alreadyWishlisted) {
        user.wishlist = user.wishlist.filter((wishId) => wishId.toString() !== id.toString());
        await user.save();
        req.flash("success", "Removed from Wishlist!");
    } else {
        user.wishlist.push(id);
        await user.save();
        req.flash("success", "Added to Wishlist!");
    }

    const redirectTo = req.get("referer") || "/listings";
    res.redirect(redirectTo);
}));
/*-- yha tk --*/
//New route
router.get("/new", isLoggedIn, listingcontrollers.renderNewForm);

router.route("/:id")
  .get( wrapAsync(listingcontrollers.showListing)
  )
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(listingcontrollers.updatesListing))

  .delete(isLoggedIn, isOwner, wrapAsync(listingcontrollers.destroyListing));


//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingcontrollers.renderEditForm));

// NEW: Chat room page for logged-in users (User <-> Host)
router.get("/:id/chat", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  // NEW: Guard for old/seed listings that do not have an owner assigned.
  if (!listing.owner) {
    req.flash("error", "Chat unavailable for this listing (owner missing).");
    return res.redirect(`/listings/${id}`);
  }

  const messages = await Message.find({ listing: id })
    .populate("sender", "username")
    .sort({ createdAt: 1 });

  res.render("listings/chat.ejs", { listing, messages });
}));

// NEW: Save chat message then broadcast in room
router.post("/:id/chat/messages", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const text = (req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const saved = await Message.create({
    listing: id,
    sender: req.user._id,
    text,
  });
  await saved.populate("sender", "username");

  const payload = {
    _id: saved._id,
    listingId: id,
    text: saved.text,
    createdAt: saved.createdAt,
    sender: {
      _id: saved.sender._id,
      username: saved.sender.username,
    },
    role: listing.owner && listing.owner._id.equals(saved.sender._id) ? "Host" : "User",
  };

  const io = req.app.get("io");
  if (io) {
    io.to(`listing:${id}`).emit("listing:new-message", payload);
  }

  res.status(201).json(payload);
}));

// AI Review route for listing details page
router.get("/:id/ai-review", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  try {
    const aiReview = await generateAIReview(listing);
    res.json(aiReview);
  } catch (err) {
    console.log("AI Review generation failed:", err.message);
    res.status(500).json({ error: "AI review generation failed" });
  }
}));



module.exports = router;