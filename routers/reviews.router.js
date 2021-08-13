const {
  getReviewById,
  getReviews,
  patchVotes,
  getCommentsByReview,
  postComment,
  postReview,
  deleteReviewByID,
} = require('../controllers/reviews.controllers');

const reviewsRouter = require('express').Router();

reviewsRouter.route('/').get(getReviews).post(postReview);

reviewsRouter
  .route('/:review_id')
  .get(getReviewById)
  .patch(patchVotes)
  .delete(deleteReviewByID);

reviewsRouter
  .route('/:review_id/comments')
  .get(getCommentsByReview)
  .post(postComment);

module.exports = { reviewsRouter };
