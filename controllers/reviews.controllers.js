const {
  selectReviewById,
  updateVotes,
  selectReviews,
  selectCommentsByReview,
  insertComment,
  insertReview,
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
  const { sort_by, order, category, limit, page } = req.query;
  const queryObj = { sort_by, order, category, limit, page };

  selectReviews(queryObj)
    .then(({ reviews, total_count }) => {
      res.status(200).send({ reviews, total_count });
    })
    .catch(err => next(err));
};

exports.getCommentsByReview = (req, res, next) => {
  const { review_id } = req.params;
  const { limit, page } = req.query;

  const queryObj = { limit, page, review_id };
  selectCommentsByReview(queryObj)
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

exports.postReview = (req, res, next) => {
  const { owner, title, review_body, designer, category } = req.body;
  const queryObj = { owner, title, review_body, designer, category };

  if (!title || !review_body || !designer) {
    const err = {
      status: 400,
      msg: 'Missing required fields. Please make sure to include: owner, title, review_body, designer and category in your request :-)',
    };
    next(err);
  }

  if (Object.keys(req.body).length > 5) {
    const err = {
      status: 400,
      msg: 'Review not added. Please make sure to ONLY include: owner, title, review_body, designer and category in your request :-)',
    };
    next(err);
  }

  insertReview(queryObj)
    .then(review => {
      res.status(201).send({ review });
    })
    .catch(err => next(err));
};
