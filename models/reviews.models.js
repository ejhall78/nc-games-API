const db = require('../db/connection');

exports.selectReviewById = async review_id => {
  // const { rows: review_IDs } = await db.query(
  //   `SELECT review_id FROM comments;`
  // );

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

  console.log(review);

  // let commentCount = 0;

  // for (let i = 0; i < review_IDs.length; i++) {
  //   if (review_IDs[i].review_id === review.review_id) {
  //     commentCount++;
  //   }
  // }

  // review.comment_count = commentCount;

  return review;
};
