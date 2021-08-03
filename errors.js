exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Oh no! That doesn't exist!" });
};

exports.pgErrors = (err, req, res, next) => {
  console.log(err);
  if (err.code === '22P02') {
    res.status(400).send({ msg: 'Invalid review ID. Please use a number :-)' });
  } else next(err);
};

exports.customErrors = (err, req, res, next) => {
  res.status(err.status).send({ msg: err.msg });
};
