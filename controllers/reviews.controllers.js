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
