const db = require('../db/connection');
const {
  checkCategoryExists,
  checkReviewExists,
  checkUserExists,
} = require('../db/utils/query-validation');
const { checkValidInc_Votes } = require('../db/utils/request-body-validation');

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
      msg: 'This review does not exist! Please try another one :-)',
    });
  }

  const review = result.rows[0];

  return review;
};

exports.updateVotes = async ({ inc_votes, review_id }) => {
  await checkValidInc_Votes(inc_votes);

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

exports.selectReviews = async ({
  sort_by = 'created_at',
  order = 'asc',
  category,
  limit = 10,
  page = 1,
}) => {
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

  const whereClause = `WHERE reviews.category = $3`;

  const offset = (page - 1) * limit;

  let queryStr = `
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
  ${category ? whereClause : ''}
  GROUP BY reviews.review_id
  ORDER BY reviews.${sort_by} ${order}
  LIMIT $1 OFFSET $2;`;

  // category
  const pgCategory = category ? category.replace('_', ' ') : ''; // remove underscores

  const result = category
    ? await db.query(queryStr, [limit, offset, pgCategory])
    : await db.query(queryStr, [limit, offset]);

  const reviews = result.rows;

  // check if category does not exist or has no reviews
  if (!reviews.length && category) {
    await checkCategoryExists('categories', 'slug', pgCategory);
  }

  // separate query to calculate number of reviews taking into account filter but not limit
  const noLimitResult = category
    ? await db.query(`SELECT * FROM reviews WHERE reviews.category = $1`, [
        pgCategory,
      ])
    : await db.query(`SELECT * FROM reviews`);

  const total_count = noLimitResult.rows.length;

  return { reviews, total_count };
};

exports.selectCommentsByReview = async ({
  limit = 10,
  page = 1,
  review_id,
}) => {
  const offset = (page - 1) * limit;

  const result = await db.query(
    `
  SELECT 
    comments.comment_id,
    comments.votes,
    comments.created_at,
    comments.author,
    comments.body
  FROM comments
  JOIN reviews
  ON reviews.review_id = comments.review_id
  WHERE reviews.review_id = $1
  LIMIT $2 OFFSET $3`,
    [review_id, limit, offset]
  );

  const comments = result.rows;

  if (!comments.length) {
    await checkReviewExists('reviews', 'review_id', review_id);
  }

  return comments;
};

exports.insertComment = async ({ username, body, review_id }) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: 'Cannot add comment. Please make sure to only include both username and body keys :-)',
    });
  }

  await checkReviewExists('reviews', 'review_id', review_id);
  await checkUserExists('users', 'username', username);

  const result = await db.query(
    `
  INSERT INTO comments
    (author, body, review_id)
  VALUES
    ($1, $2, $3)
  RETURNING *;`,
    [username, body, review_id]
  );

  const newComment = result.rows[0];

  return newComment;
};
