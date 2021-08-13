const db = require('../db/connection.js');

exports.selectCategories = async () => {
  const result = await db.query(`SELECT * FROM categories;`);
  return result.rows;
};

exports.insertCategory = async ({ slug, description }) => {
  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: 'Category not added. Please sure to include only slug and description properties :-)',
    });
  }

  const result = await db.query(
    `
    INSERT INTO categories
        (slug, description)
    VALUES
        ($1, $2)
    RETURNING *;`,
    [slug, description]
  );

  const newCategory = result.rows[0];

  return newCategory;
};
