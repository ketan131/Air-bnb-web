const express = require("express");
const router =  express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
 
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

//New route
router.get("/new", isLoggedIn, listingcontrollers.renderNewForm);

router.route("/:id")
  .get( wrapAsync(listingcontrollers.showListing)
  )
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), wrapAsync(listingcontrollers.updatesListing))

  .delete(isLoggedIn, isOwner, wrapAsync(listingcontrollers.destroyListing));


//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingcontrollers.renderEditForm));



module.exports = router;