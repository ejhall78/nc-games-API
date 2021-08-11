const { selectUsers, selectUserByUsername } = require('../models/users.models');

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then(users => {
      res.send({ users });
    })
    .catch(err => next(err));
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  selectUserByUsername(username)
    .then(user => {
      res.send({ user });
    })
    .catch(err => next(err));
};
