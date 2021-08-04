const db = require('../db/connection');

exports.selectReviewById = async review_id => {
  const result = await db.query(
    `
    SELECT reviews.*, COUNT(comments.review_id) 
    AS comment_count 
    FROM reviews 
    JOIN comments
    ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;`,
    [review_id]
  );

  // if review doesn't exist - send custom error
  if (result.rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: 'Review does not exist. Try a lower number :-)',
    });
  }

  const review = result.rows[0];

  return review;
};

exports.updateVotes = async ({ inc_votes, review_id }) => {
  await db.query(
    `
    UPDATE reviews
    SET
      votes = votes + $1
    WHERE review_id = $2;`,
    [inc_votes, review_id]
  );

  const updatedReview = await this.selectReviewById(review_id);

  return updatedReview;
};
