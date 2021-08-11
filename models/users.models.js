const db = require('../db/connection');
const { checkUserExists } = require('../db/utils/query-validation');

exports.selectUsers = async () => {
  const result = await db.query(`
  SELECT username FROM users;`);

  const users = result.rows;

  return users;
};

exports.selectUserByUsername = async username => {
  await checkUserExists('users', 'username', username);
  const result = await db.query(
    `
  SELECT * FROM users
  WHERE username = $1`,
    [username]
  );

  const user = result.rows[0];

  return user;
};
