const express = require('express');
const apiRouter = require('./routers/api.router');
const cors = require('cors');
const app = express();
const { handle404s, pgErrors, customErrors, handle500s } = require('./errors');

app.use(cors());

app.use(express.json());

app.use('/api', apiRouter);

app.use('*', handle404s);
app.use(pgErrors);
app.use(customErrors);
app.use(handle500s);

module.exports = app;
