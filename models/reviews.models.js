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
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: 'Cannot update votes! Make sure you only include a key of "inc_votes" :-)',
    });
  }

  if (typeof inc_votes !== 'number') {
    return Promise.reject({
      status: 400,
      msg: 'Cannot update votes! Make sure your newVotes value is a number :-)',
    });
  }

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

exports.selectReviews = async ({ sort_by = 'created_at', order = 'asc' }) => {
  // sanitize sort_by
  if (
    ![
      'owner',
      'title',
      'review_id',
      'category',
      'review_img_url',
      'created_at',
      'votes',
      'comment_count',
    ].includes(sort_by)
  ) {
    return Promise.reject({
      status: 400,
      msg: 'Cannot sort by a column name that does not exist. Please try one of the following: owner, title, review_id, category, review_img_url, created_at, votes, comment_count :-)',
    });
  }

  // sanitize order
  if (!['asc', 'desc'].includes(order)) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid order. Please try either asc or desc :-)',
    });
  }

  const result = await db.query(`
    SELECT 
      reviews.owner, 
      reviews.title, 
      reviews.review_id, 
      reviews.category, 
      reviews.review_img_url, 
      reviews.created_at, 
      reviews.votes, 
      COUNT(comments.review_id) AS comment_count 
    FROM reviews 
    FULL OUTER JOIN comments
    ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.${sort_by} ${order};`);

  const reviews = result.rows;

  return reviews;
};
