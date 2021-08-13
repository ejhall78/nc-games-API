exports.handle404s = (req, res, next) => {
  res
    .status(404)
    .send({
      msg: 'Welcome to the home page! Head over to /api to read about all the endpoints available on this API. Enjoy!',
    });
};

exports.pgErrors = (err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({
      msg: 'Invalid query type. Please use a number for all ID, limit and page queries :-)',
    });
  } else if (err.code === '23505') {
    res.status(400).send({
      msg: 'That already exists! Please try again :-)',
    });
  } else next(err);
};

exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handle500s = (err, req, res, next) => {
  res.status(500).send({ msg: 'Whoops! Something went wrong!' });
};
