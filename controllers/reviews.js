const Listing = require("../models/listing");
const Review = require ("../models/review");
module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  req.flash("success", "Successfully added a review!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
   let { id, reviewId } = req.params;
   await Review.findOneAndDelete({ _id: reviewId });
   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
   req.flash("success", "Review deleted");
   res.redirect(`/listings/${id}`);
};
