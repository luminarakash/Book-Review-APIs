const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  const { id: bookId } = req.params;
  const { rating, comment } = req.body;

  const existing = await Review.findOne({ user: req.user._id, book: bookId });
  if (existing) return res.status(400).json({ message: 'Already reviewed' });

  const review = new Review({ user: req.user._id, book: bookId, rating, comment });
  await review.save();
  res.json(review);
};

exports.updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || !review.user.equals(req.user._id))
    return res.status(403).json({ message: 'Unauthorized' });

  review.rating = req.body.rating ?? review.rating;
  review.comment = req.body.comment ?? review.comment;
  await review.save();
  res.json(review);
};

exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review || !review.user.equals(req.user._id))
    return res.status(403).json({ message: 'Unauthorized' });

  await Review.deleteOne({ _id: review._id });

  res.json({ message: 'Review deleted' });
};
