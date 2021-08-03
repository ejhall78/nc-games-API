const db = require('../db/connection');

exports.selectReviewById = async review_id => {
  const { rows: review_IDs } = await db.query(
    `SELECT review_id FROM comments;`
  );

  const result = await db.query(`SELECT * FROM reviews WHERE review_id = $1;`, [
    review_id,
  ]);

  const review = result.rows[0];

  let commentCount = 0;

  for (let i = 0; i < review_IDs.length; i++) {
    if (review_IDs[i].review_id === review.review_id) {
      commentCount++;
    }
  }

  review.comment_count = commentCount;

  // console.log(review_IDs);
  // console.log(review);

  return review;
};
