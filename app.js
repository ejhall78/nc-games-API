const express = require('express');
const apiRouter = require('./routers/api.router');
const app = express();
const { handle404s, pgErrors, customErrors } = require('./errors');

app.use(express.json());

app.use('/api', apiRouter);

app.use('*', handle404s);
app.use(pgErrors);
app.use(customErrors);

module.exports = app;
