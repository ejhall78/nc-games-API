const db = require('../db/connection');
const { checkCommentExists } = require('../db/utils/query-validation');
const { checkValidInc_Votes } = require('../db/utils/request-body-validation');

exports.deleteCommentFromDB = async comment_id => {
  await checkCommentExists('comments', 'comment_id', comment_id);
  await db.query(
    `
  DELETE FROM comments
  WHERE comment_id = $1;
  `,
    [comment_id]
  );
};

exports.updateComment = async ({ inc_votes, comment_id }) => {
  await checkValidInc_Votes(inc_votes);

  const result = await db.query(
    `
  UPDATE comments
  SET
    votes = votes + $1
  WHERE comment_id = $2
  RETURNING comment_id, votes, created_at, author, body;
  `,
    [inc_votes, comment_id]
  );

  const updatedComment = result.rows[0];

  return updatedComment;
};
