const {
  deleteCommentFromDB,
  updateComment,
} = require('../models/comments.models');

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentFromDB(comment_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch(err => next(err));
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  const queryObj = { inc_votes, comment_id };

  if (Object.keys(req.body).length > 1) {
    const err = {
      status: 400,
      msg: 'Cannot update votes! Make sure you only include inc_votes on your request :-)',
    };
    next(err);
  }

  updateComment(queryObj)
    .then(comment => {
      res.status(200).send({ comment });
    })
    .catch(err => next(err));
};
