// const Listing = require("../models/listing");
// module.exports.index = async (req , res) => {
//     const allListings = await Listing.find();
//     res.render("listings/index.ejs",{ allListings });
// };

// module.exports.renderNewForm = (req, res) =>{
//  res.render("listings/new.ejs");
// };
   

// module.exports.showListing= async (req, res)=>{
//    let {id} = req.params;
//   const listing = await Listing.findById(id).populate({path:
//     "reviews", populate: {path: "author"},}).populate("owner");
//   if (!listing) {
//     req.flash("error", "Listing your requested for dose not exist!");
//      res.redirect("/listings");
//   }
//   console.log(listing);
//   res.render("listings/show.ejs", {listing});
// };


// module.exports.createListing = async (req, res, next) => {
//   let url = req.file.path;
//   let filename = req.file.filename;
//   console.log(url, "..", filename);

//     // ✅ Image handling
//    // if (!req.body.listing.image) {
//       // Agar user ne image hi nahi di → default lagao
//      // req.body.listing.image = { url: "/images/default.jpg", filename: "default-image" };
//     //} else if (typeof req.body.listing.image === "string") {
//       // Agar sirf ek string URL mila (e.g. Cloudinary ka direct link)
//       //req.body.listing.image = { url: req.body.listing.image, filename: "default-image" };
//     //}
//     // Agar already {url, filename} object aaya hai to kuch change nahi karna

//     // ✅ New Listing create
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = { 
//       url:req.file.path,
//       filename:req.file.filename
//      };
//     await newListing.save();

//     req.flash("success", "Successfully created a new listing!");
//     res.redirect("/listings");
//   };

//   module.exports.renderEditFrom = async (req, res)=>{
//    let {id} = req.params;
//   const listing = await Listing.findById(id);
//    if (!listing) {
//     req.flash("error", "Listing your requested for dose not exist!");
//      res.redirect("/listings");
//   }
//    let originalImageUrl=  listing.image.url;
//     originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250" );
//   res.render("listings/edit.ejs", {listing, originalImageUrl});
// };

// module.exports.updatesListing= async (req, res)=>{
//   let {id} = req.params;
//    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing });
//   if(typeof req.file !== "undefined"){
//    let url = req.file.path;
//    let filename = req.file.filename;
//   listing.image = {url, filename};
//   await listing.save();
//   }
//    req.flash("success", "Successfully updated the listing!");
//    res.redirect(`/listings/${id}`);
// }; 

//   module.exports.destroyListing = async (req, res)=>{
//   let {id} = req.params;
//  await Listing.findByIdAndDelete(id);
//    req.flash("success", "Successfully deleted the listing!");
//   res.redirect("/listings");
// };

///////////////////////////////////////////////////////////////////
const Listing = require("../models/listing");



module.exports.index = async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // Check if file exists to prevent "undefined" error
    if (!req.file) {
        req.flash("error", "Image is required for a listing!");
        return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;
  

    
//chatgpt portion//


    const newListing = new Listing(req.body.listing);
   
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    // Lower resolution preview for edit form
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updatesListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};
