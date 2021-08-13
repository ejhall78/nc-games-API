const {
  selectCategories,
  insertCategory,
} = require('../models/categories.models');

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then(categories => {
      res.status(200).send({ categories });
    })
    .catch(err => next(err));
};

exports.postCategory = (req, res, next) => {
  const { slug, description } = req.body;
  const queryObj = { slug, description };

  if (Object.keys(req.body).length > 2) {
    const err = {
      status: 400,
      msg: 'Category not added. Please sure to include only slug and description properties :-)',
    };
    next(err);
  }

  insertCategory(queryObj)
    .then(category => {
      res.status(201).send({ category });
    })
    .catch(err => next(err));
};
