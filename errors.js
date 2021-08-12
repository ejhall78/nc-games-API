exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Oh no! That doesn't exist!" });
};

exports.pgErrors = (err, req, res, next) => {
  // console.log(err);
  if (err.code === '22P02') {
    res.status(400).send({
      msg: 'Invalid query type. Please use a number for all ID, limit and page queries :-)',
    });
  } else next(err);
};

exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handle500s = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: 'Whoops! Something went wrong!' });
};
