const format = require('pg-format');
const db = require('../connection');

exports.checkCategoryExists = async (table, column, value) => {
  const queryStr = format('SELECT * FROM %I WHERE %I = $1', table, column);
  const result = await db.query(queryStr, [value]);

  if (result.rows.length === 0) {
    // resource does not exist
    return Promise.reject({
      status: 404,
      msg: 'Invalid category. Remember to use underscores "_" instead of spaces for your request :-)',
    });
  }
};