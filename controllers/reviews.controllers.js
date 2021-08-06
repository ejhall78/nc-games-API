const {
  selectReviewById,
  updateVotes,
  selectReviews,
  selectCommentsByReview,
  insertComment,
} = require('../models/reviews.models');

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  selectReviewById(review_id)
    .then(review => {
      res.status(200).send({ review });
    })
    .catch(err => next(err));
};

exports.patchVotes = (req, res, next) => {
  const { inc_votes } = req.body;
  const { review_id } = req.params;

  if (Object.keys(req.body).length > 1) {
    const err = {
      status: 400,
      msg: 'Cannot update votes! Make sure you only include inc_votes on your request :-)',
    };
    next(err);
  }

  updateVotes({ inc_votes, review_id })
    .then(review => {
      res.status(200).send({ review });
    })
    .catch(err => next(err));
};

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category } = req.query;
  const queryObj = { sort_by, order, category };

  selectReviews(queryObj)
    .then(reviews => {
      res.status(200).send({ reviews });
    })
    .catch(err => next(err));
};

exports.getCommentsByReview = (req, res, next) => {
  const { review_id } = req.params;
  selectCommentsByReview(review_id)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => next(err));
};

exports.postComment = (req, res, next) => {
  const { review_id } = req.params;
  const { username, body } = req.body;

  const queryObj = { username, body, review_id };

  if (Object.keys(req.body).length > 2) {
    const err = {
      status: 400,
      msg: 'Comment not added. Please make sure to only include both username and body keys :-)',
    };
    next(err);
  }

  insertComment(queryObj)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(err => next(err));
};
