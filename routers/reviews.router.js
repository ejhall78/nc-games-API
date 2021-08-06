const {
  getReviewById,
  getReviews,
  patchVotes,
  getCommentsByReview,
  postComment,
} = require('../controllers/reviews.controllers');

const reviewsRouter = require('express').Router();

reviewsRouter.route('/').get(getReviews);

reviewsRouter.route('/:review_id').get(getReviewById).patch(patchVotes);

reviewsRouter
  .route('/:review_id/comments')
  .get(getCommentsByReview)
  .post(postComment);

module.exports = { reviewsRouter };
