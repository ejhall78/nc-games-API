const express = require('express');
const apiRouter = require('./routers/api.router');
const app = express();
const { handle404s } = require('./errors');

app.use(express.json());

app.use('/api', apiRouter);

app.use('*', handle404s);

module.exports = app;
