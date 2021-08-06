const { categoriesRouter } = require('./categories.router');
const { reviewsRouter } = require('./reviews.router');
const endpoints = require('../endpoints.json');

const apiRouter = require('express').Router();

apiRouter.get('/', (req, res, next) => {
  res.status(200).json(endpoints);
});

apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/reviews', reviewsRouter);

module.exports = apiRouter;
