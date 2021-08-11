const db = require('../connection');

exports.checkValidInc_Votes = inc_votes => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: 'Cannot update votes! Make sure you only include a key of "inc_votes" :-)',
    });
  }

  if (typeof inc_votes !== 'number') {
    return Promise.reject({
      status: 400,
      msg: 'Cannot update votes! Make sure your newVotes value is a number :-)',
    });
  }
};
