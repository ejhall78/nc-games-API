const db = require('../db/connection');
const { checkUserExists } = require('../db/utils/query-validation');

exports.selectUsers = async (order = 'ASC') => {
  if (!['asc', 'ASC', 'desc', 'DESC'].includes(order)) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid order query. Please use either ASC/asc or DESC/desc :-)',
    });
  }

  const result = await db.query(`
  SELECT username FROM users
  ORDER BY username ${order};`);

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
