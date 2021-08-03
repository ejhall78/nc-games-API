const express = require('express');
const apiRouter = require('./routers/api.router');
const app = express();
const { handle404s } = require('./errors');

app.use(express.json());

app.use('/api', apiRouter);

app.use('*', handle404s);

app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ msg: 'Invalid review ID. Please use a number :-)' });
  }
});

module.exports = app;
