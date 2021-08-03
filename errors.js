exports.handle404s = (req, res, next) => {
  res.status(404).send({ msg: "Oh no! That doesn't exist!" });
};
