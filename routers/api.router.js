const categoriesRouter = require('./categories.router');

const apiRouter = require('express').Router();

apiRouter.use('/categories', categoriesRouter);

module.exports = apiRouter;