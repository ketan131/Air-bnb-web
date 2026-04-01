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