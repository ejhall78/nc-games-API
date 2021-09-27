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
    LEFT JOIN comments
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
  LEFT JOIN comments
  ON reviews.review_id = comments.review_id
  ${category ? whereClause : ''}
  GROUP BY reviews.review_id
  ORDER BY ${sort_by} ${order}
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
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3`,
    [review_id, limit, offset]
  );

  const comments = result.rows;

  if (!comments.length) {
    await checkReviewExists('reviews', 'review_id', review_id);
  }

  // separate query to calculate number of reviews taking into account filter but not limit
  const noLimitResult = await db.query(
    `
  SELECT * FROM comments
  JOIN reviews
  ON reviews.review_id = comments.review_id
  WHERE reviews.review_id = $1`,
    [review_id]
  );

  const total_count = noLimitResult.rows.length;

  return { comments, total_count };
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

exports.insertReview = async ({
  owner,
  title,
  review_body,
  designer,
  category,
}) => {
  if (!title || !review_body || !designer) {
    return Promise.reject({
      status: 400,
      msg: 'Missing required fields. Please make sure to include: owner, title, review_body, designer and category in your request :-)',
    });
  }

  await checkUserExists('users', 'username', owner);
  await checkCategoryExists('categories', 'slug', category);

  const comment_countResult = await db.query(
    `
  SELECT COUNT(comments.review_id)
  AS comment_count
  FROM reviews
  LEFT JOIN comments
  ON reviews.review_id = comments.review_id
  WHERE reviews.title = $1;`,
    [title]
  );

  const { comment_count } = comment_countResult.rows[0];

  const result = await db.query(
    `
  INSERT INTO reviews (
    owner, 
    title, 
    review_body, 
    designer, 
    category
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;`,
    [owner, title, review_body, designer, category]
  );

  const newReview = result.rows[0];
  newReview.comment_count = parseInt(comment_count);

  return newReview;
};

exports.deleteReview = async review_id => {
  await checkReviewExists('reviews', 'review_id', review_id);
  await db.query(
    `
  DELETE FROM comments
  WHERE review_id = $1`,
    [review_id]
  );
  await db.query(
    `
  DELETE FROM reviews
  WHERE review_id = $1`,
    [review_id]
  );
};
