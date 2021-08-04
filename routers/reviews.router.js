const {
  getReviewById,
  patchVotes,
} = require('../controllers/reviews.controllers');

const reviewsRouter = require('express').Router();

reviewsRouter.route('/').get();

reviewsRouter.route('/:review_id').get(getReviewById).patch(patchVotes);

reviewsRouter.route('/:review_id/comments').get().patch();

module.exports = { reviewsRouter };
