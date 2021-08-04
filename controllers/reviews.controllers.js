const { selectReviewById, updateVotes } = require('../models/reviews.models');

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
  updateVotes({ inc_votes, review_id })
    .then(review => {
      res.status(200).send({ review });
    })
    .catch(err => next(err));
};
