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

exports.checkReviewExists = async (table, column, value) => {
  const queryStr = format('SELECT * FROM %I WHERE %I = $1', table, column);
  const result = await db.query(queryStr, [value]);

  if (result.rows.length === 0) {
    // resource does not exist
    return Promise.reject({
      status: 404,
      msg: 'This review does not exist! Please try another one :-)',
    });
  }
};

exports.checkUserExists = async (table, column, value) => {
  const queryStr = format('SELECT * FROM %I WHERE %I = $1', table, column);
  const result = await db.query(queryStr, [value]);

  if (result.rows.length === 0) {
    // resource does not exist
    return Promise.reject({
      status: 404,
      msg: 'That user does not exist! Please try another one :-)',
    });
  }
};

exports.checkCommentExists = async (table, column, value) => {
  const queryStr = format('SELECT * FROM %I WHERE %I = $1', table, column);
  const result = await db.query(queryStr, [value]);

  if (result.rows.length === 0) {
    // resource does not exist
    return Promise.reject({
      status: 404,
      msg: 'This comment does not exist! Please try another one :-)',
    });
  }
};
