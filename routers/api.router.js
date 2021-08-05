const { categoriesRouter } = require('./categories.router');
const { reviewsRouter } = require('./reviews.router');

const apiRouter = require('express').Router();

apiRouter.get('/', (req, res, next) => {
  res.status(200).sendFile('../endpoints.json');
});

apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/reviews', reviewsRouter);

module.exports = apiRouter;
