const db = require('../db/connection.js');
const request = require('supertest');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const app = require('../app.js');
const endpoints = require('../endpoints.json');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('/*', () => {
  test('404 - invalid url', () => {
    return request(app)
      .get('/invalid')
      .expect(404)
      .then(res => {
        const message = res.body.msg;
        expect(message).toBe("Oh no! That doesn't exist!");
      });
  });
});

describe('/api', () => {
  test('GET 200 - returns endpoints.json', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});

describe('/api/categories', () => {
  test('GET 200 - should return an array of the categories on a key of "categories"', () => {
    return request(app)
      .get('/api/categories')
      .expect(200)
      .then(response => {
        const { categories } = response.body;
        expect(categories).toHaveLength(4);
        categories.forEach(category => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe('/api/reviews', () => {
  // GET 200 - responds with reviews
  // 200 - sorts by created_at by default
  // 200 - sorts by an valid column
  // 200 - orders results either asc or desc
  // 200 - filter review results by category
  // 200 - returns specified number of reviews from limit query - default to 10 items
  // 200 - returns correct reviews for relevant page

  // 400 - sort_by an invalid column
  // 400 - order !== "asc" or "desc"
  // 404 - category that doesn't exist
  // 200 - category that exists but doesn't have any reviews - respond with empty array

  // 400 - invalid limit number
  // 400 - invalid page number
  // 200 - valid page number but doesn't exist - send back empty array

  // POST 201 - adds a review and responds with newly added review
  // 404 - username does not exist
  // 404 - category does not exist
  // 400 - missing fields (violates NOT NULLs)
  // 400 - unwanted properties on request body

  /* *** note - error handling to make sure the title, match with the corresponding designer and category
    would require separate designers' and games' tables. In this case we would only need a game_id in 
    place of where we have title and the relevant properties could be joined from there */

  test('GET 200 - responds with an array of reviews', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
        reviews.forEach(review => {
          expect(review).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test('200 - reviews array is sorted by DATE by default', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
        expect(reviews).toBeSortedBy('created_at');
      });
  });
  test('200 - sort reviews by any valid column', () => {
    return request(app)
      .get('/api/reviews?sort_by=votes')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
        expect(reviews).toBeSortedBy('votes');
      });
  });
  test('200 - orders results either asc or desc - default by date when no sort_by', () => {
    return request(app)
      .get('/api/reviews?order=desc')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
        expect(reviews).toBeSortedBy('created_at', {
          descending: true,
        });
      });
  });
  test('200 - orders results either asc or desc - when chained with specified sort_by column', () => {
    return request(app)
      .get('/api/reviews?sort_by=votes&order=desc')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
        expect(reviews).toBeSortedBy('votes', {
          descending: true,
        });
      });
  });
  test('200 - filter review results by category', () => {
    return request(app)
      .get('/api/reviews?category=social_deduction')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
        reviews.forEach(review => {
          expect(review.category).toBe('social deduction');
        });
      });
  });
  test('200 - returns specified number of reviews from limit query - default to 10 items', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(10);
      });
  });
  test('200 - returns specified number of reviews from limit query', () => {
    return request(app)
      .get('/api/reviews?limit=3')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(3);
      });
  });
  test('200 - returns correct reviews for relevant page', () => {
    return request(app)
      .get('/api/reviews?page=2')
      .expect(200)
      .then(({ body: { reviews } }) => {
        // second page of reviews sorted by date (default)
        expect(reviews[0].review_id).toBe(12);
        expect(reviews[1].review_id).toBe(4);
        expect(reviews[2].review_id).toBe(7);
      });
  });
  test('200 - responds with reviews and a total_count property that displays total reviews after filters applied (disregarding limit)', () => {
    return request(app)
      .get('/api/reviews?limit=2&category=social_deduction')
      .expect(200)
      .then(({ body: { reviews, total_count } }) => {
        expect(reviews).toHaveLength(2);
        expect(total_count).toBe(11);
      });
  });

  test('400 - sort_by an invalid column', () => {
    return request(app)
      .get('/api/reviews?sort_by=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot sort by a column name that does not exist. Please try one of the following: owner, title, review_id, category, review_img_url, created_at, votes, comment_count :-)'
        );
      });
  });
  test('400 - order !== "asc" or "desc"', () => {
    return request(app)
      .get('/api/reviews?order=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Invalid order. Please try either asc or desc :-)');
      });
  });
  test('404 - filter by category that does not exist', () => {
    return request(app)
      .get('/api/reviews?category=invalid')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'That category does not exist! Remember to use underscores "_" instead of spaces for your request :-)'
        );
      });
  });
  test('200 - category exists but does not have any reviews - respond with empty array', () => {
    return request(app)
      .get("/api/reviews?category=children's_games")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toEqual([]);
      });
  });
  test('400 - invalid limit query', () => {
    return request(app)
      .get('/api/reviews?limit=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('400 - invalid page number', () => {
    return request(app)
      .get('/api/reviews?page=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('200 - valid page number but does not exist - send back empty array', () => {
    return request(app)
      .get('/api/reviews?page=100000')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(0);
        expect(reviews).toEqual([]);
      });
  });

  test('POST 201 - adds a review and responds with newly added review', () => {
    return request(app)
      .post('/api/reviews')
      .send({
        owner: 'mallionaire',
        title: 'Jenga',
        review_body: 'This is an example review blah blah blah...',
        designer: 'Leslie Scott',
        category: 'dexterity',
      })
      .expect(201)
      .then(({ body: { review } }) => {
        expect(review).toMatchObject({
          review_id: 14,
          votes: 0,
          created_at: expect.any(String),
          comment_count: 3,
          owner: 'mallionaire',
          title: 'Jenga',
          review_body: 'This is an example review blah blah blah...',
          designer: 'Leslie Scott',
          category: 'dexterity',
        });
      });
  });
  test('404 - username does not exist', () => {
    return request(app)
      .post('/api/reviews')
      .send({
        owner: 'unknown user that does not exist',
        title: 'Jenga',
        review_body: 'This is an example review blah blah blah...',
        designer: 'Leslie Scott',
        category: 'dexterity',
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'That user does not exist! Please try another one :-)'
        );
      });
  });
  test('404 - category does not exist', () => {
    return request(app)
      .post('/api/reviews')
      .send({
        owner: 'mallionaire',
        title: 'Jenga',
        review_body: 'This is an example review blah blah blah...',
        designer: 'Leslie Scott',
        category: 'not a category',
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'That category does not exist! Remember to use underscores "_" instead of spaces for your request :-)'
        );
      });
  });
  test('400 - title, review_body or designer are empty (violates NOT NULLs)', () => {
    return request(app)
      .post('/api/reviews')
      .send({
        owner: 'mallionaire',
        review_body: 'This is an example review blah blah blah...',
        designer: 'Leslie Scott',
        category: 'not a category',
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Missing required fields. Please make sure to include: owner, title, review_body, designer and category in your request :-)'
        );
      });
  });
  test('400 - unwanted properties on request body', () => {
    return request(app)
      .post('/api/reviews')
      .send({
        owner: 'mallionaire',
        review_body: 'This is an example review blah blah blah...',
        title: 'Jenga',
        designer: 'Leslie Scott',
        category: 'not a category',
        unwanted: 'property',
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Review not added. Please make sure to ONLY include: owner, title, review_body, designer and category in your request :-)'
        );
      });
  });
});

describe('/api/reviews/:review_id', () => {
  // GET 200 - gets user by id
  // 400 - invalid id
  // 404 - valid id but doesn't exist

  // PATCH 200 - updates review's votes - increase when positive inc_votes
  // PATCH 200 - updates review's votes - decrease when negative inc_votes
  // 400 - no/invalid key of 'inc_votes' in request body
  // 400 - invalid increment value eg inc_votes: "cat"
  // 400 - other unwanted properties on request body eg { inc_votes : 1, name: 'Mitch' }
  // 400 - invalid id
  // 404 - valid id but doesn't exist

  test('GET 200 - correctly gets a valid user', () => {
    return request(app)
      .get('/api/reviews/2')
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toMatchObject({
          owner: 'philippaclaire9',
          title: 'Jenga',
          review_id: 2,
          review_body: 'Fiddly fun for all the family',
          designer: 'Leslie Scott',
          review_img_url:
            'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          category: 'dexterity',
          created_at: new Date(1610964101251).toJSON(),
          votes: 5,
          comment_count: '3',
        });
      });
  });
  test('400 - id is invalid', () => {
    return request(app)
      .get('/api/reviews/invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('404 - valid id but does not exist', () => {
    return request(app)
      .get('/api/reviews/1000000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'This review does not exist! Please try another one :-)'
        );
      });
  });
  test('PATCH 200 - updates reviews votes - increase when positive inc_votes', () => {
    return request(app)
      .patch('/api/reviews/3')
      .expect(200)
      .send({ inc_votes: 2 })
      .then(({ body: { review } }) => {
        expect(review).toMatchObject({
          owner: 'bainesface',
          title: 'Ultimate Werewolf',
          review_id: 3,
          review_body: "We couldn't find the werewolf!",
          designer: 'Akihisa Okui',
          review_img_url:
            'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          category: 'social deduction',
          created_at: new Date(1610964101251).toJSON(),
          votes: 7,
          comment_count: '3',
        });
      });
  });
  test('PATCH 200 - updates reviews votes - decrease when negative inc_votes', () => {
    return request(app)
      .patch('/api/reviews/3')
      .expect(200)
      .send({ inc_votes: -1 })
      .then(({ body: { review } }) => {
        expect(review).toMatchObject({
          owner: 'bainesface',
          title: 'Ultimate Werewolf',
          review_id: 3,
          review_body: "We couldn't find the werewolf!",
          designer: 'Akihisa Okui',
          review_img_url:
            'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
          category: 'social deduction',
          created_at: new Date(1610964101251).toJSON(),
          votes: 4,
          comment_count: '3',
        });
      });
  });
  test('400 - request body contains no/invalid key of inc_votes', () => {
    return request(app)
      .patch('/api/reviews/3')
      .expect(400)
      .send({ invalid_key: 2 })
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot update votes! Make sure you only include a key of "inc_votes" :-)'
        );
      });
  });
  test('400 - invalid increment value eg inc_votes: "cat"', () => {
    return request(app)
      .patch('/api/reviews/3')
      .expect(400)
      .send({ inc_votes: 'cat' })
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot update votes! Make sure your newVotes value is a number :-)'
        );
      });
  });
  test('400 - other unwanted properties on request body eg { inc_votes : 1, name: "Mitch" }', () => {
    return request(app)
      .patch('/api/reviews/3')
      .expect(400)
      .send({ inc_votes: 2, name: 'Mitch' })
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot update votes! Make sure you only include inc_votes on your request :-)'
        );
      });
  });
  test('404 - valid id that does not exits', () => {
    return request(app)
      .patch('/api/reviews/1000000')
      .send({ inc_votes: 2 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'This review does not exist! Please try another one :-)'
        );
      });
  });
  test('400 - invalid id', () => {
    return request(app)
      .patch('/api/reviews/invalid')
      .send({ inc_votes: 2 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
});

describe('/api/reviews/:review_id/comments', () => {
  // GET 200 - responds with an array of comments for the given review id
  // 400 - invalid review id
  // 404 - valid id but non existent review
  // 200 - returns the specified number of comments based on limit
  // 200 - returns correct comments when page specified

  // POST 201 - adds a comment to the db and responds with the posted comment
  // 400 - invalid review id
  // 404 - valid id but non existent review
  // 400 - missing required fields in request body
  // 404 - username does not exist
  // 400 - unwanted properties on request body

  // 400 - invalid limit number
  // 400 - invalid page number
  // 200 - valid page number but doesn't exist - send back empty array
  test('GET 200 - responds with comments for given review id', () => {
    return request(app)
      .get('/api/reviews/2/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(3);
        comments.forEach(comment => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
          });
        });
      });
  });
  test('400 - id is invalid', () => {
    return request(app)
      .get('/api/reviews/invalid/comments')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('404 - valid id but does not exist', () => {
    return request(app)
      .get('/api/reviews/1000000/comments')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'This review does not exist! Please try another one :-)'
        );
      });
  });
  test('200 - valid review id but no comments on that review - responds with an empty array', () => {
    return request(app)
      .get('/api/reviews/4/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test('200 - returns specified number of comments from limit query', () => {
    return request(app)
      .get('/api/reviews/2/comments?limit=2')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(2);
      });
  });
  test('200 - returns correct reviews for relevant page', () => {
    return request(app)
      .get('/api/reviews/2/comments?limit=1&page=2')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments[0].comment_id).toBe(4);
      });
  });

  test('POST 201 - adds a comment to the db and responds with the posted comment', () => {
    return request(app)
      .post('/api/reviews/4/comments')
      .send({ username: 'mallionaire', body: 'Great game.' })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(Object.keys(comment)).toHaveLength(6);
        expect(comment).toHaveProperty('comment_id');
        expect(comment.comment_id).toBe(7);
        expect(comment).toHaveProperty('votes');
        expect(comment.votes).toBe(0);
        expect(comment).toHaveProperty('author');
        expect(comment.author).toBe('mallionaire');
        expect(comment).toHaveProperty('review_id');
        expect(comment.review_id).toBe(4);
        expect(comment).toHaveProperty('body');
        expect(comment.body).toBe('Great game.');
        expect(comment).toHaveProperty('created_at');
      })
      .then(() => {
        return db.query('SELECT * FROM comments WHERE review_id = 4');
      })
      .then(result => {
        const commentsForReview4 = result.rows;
        expect(commentsForReview4).toHaveLength(1);
        expect(commentsForReview4[0]).toHaveProperty('comment_id');
        expect(commentsForReview4[0]).toHaveProperty('votes');
        expect(commentsForReview4[0]).toHaveProperty('author');
        expect(commentsForReview4[0]).toHaveProperty('review_id');
        expect(commentsForReview4[0]).toHaveProperty('body');
        expect(commentsForReview4[0]).toHaveProperty('created_at');
      });
  });
  test('400 - id is invalid', () => {
    return request(app)
      .post('/api/reviews/invalid/comments')
      .send({ username: 'mallionaire', body: 'Great game.' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('404 - valid id but does not exist', () => {
    return request(app)
      .post('/api/reviews/1000000/comments')
      .send({ username: 'mallionaire', body: 'Great game.' })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'This review does not exist! Please try another one :-)'
        );
      });
  });
  test('400 - no correct fields in request body', () => {
    return request(app)
      .post('/api/reviews/4/comments')
      .send({ wrong: 'stuff' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot add comment. Please make sure to only include both username and body keys :-)'
        );
      });
  });
  test('400 - only username in request body', () => {
    return request(app)
      .post('/api/reviews/4/comments')
      .send({ username: 'mallionaire', wrong: 'stuff' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot add comment. Please make sure to only include both username and body keys :-)'
        );
      });
  });
  test('400 - only body in request body', () => {
    return request(app)
      .post('/api/reviews/4/comments')
      .send({ body: 'hello', wrong: 'stuff' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot add comment. Please make sure to only include both username and body keys :-)'
        );
      });
  });
  test('404 - username does not exist', () => {
    return request(app)
      .post('/api/reviews/4/comments')
      .send({ username: 'hello', body: 'stuff' })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'That user does not exist! Please try another one :-)'
        );
      });
  });
  test('400 - unwanted properties on request body', () => {
    return request(app)
      .post('/api/reviews/4/comments')
      .send({ username: 'hello', body: 'stuff', wrong: 'stuff' })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Comment not added. Please make sure to only include both username and body keys :-)'
        );
      });
  });
  test('400 - invalid limit query', () => {
    return request(app)
      .get('/api/reviews/2/comments?limit=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('400 - invalid page number', () => {
    return request(app)
      .get('/api/reviews/2/comments?page=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('200 - valid page number but does not exist - send back empty array', () => {
    return request(app)
      .get('/api/reviews/2/comments?page=100000')
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(0);
        expect(comments).toEqual([]);
      });
  });
});

describe('/api/comments/:comment_id', () => {
  // DELETE 204 - deletes the given comment by comment_id and responds with no content
  // 400 - invalid comment_id
  // 404 - valid comment_id but does not exist

  // PATCH 200 - updates comment's votes - increase when positive inc_votes
  // PATCH 200 - updates comment's votes - decrease when negative inc_votes
  // 400 - no/invalid key of 'inc_votes' in request body
  // 400 - invalid increment value eg inc_votes: "cat"
  // 400 - other unwanted properties on request body eg { inc_votes : 1, name: 'Mitch' }
  // 400 - invalid id
  // 404 - valid id but doesn't exist
  test('DELETE 204 - deletes the given comment by comment_id and responds with no content', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
        return db.query('SELECT * FROM comments;');
      })
      .then(result => {
        const comments = result.rows;
        expect(comments).toHaveLength(5);
      });
  });
  test('400 - invalid comment_id', () => {
    return request(app)
      .delete('/api/comments/invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('404 - valid comment_id but does not exist', () => {
    return request(app)
      .delete('/api/comments/1000000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'This comment does not exist! Please try another one :-)'
        );
      });
  });

  test('PATCH 200 - updates comments votes - increase when positive inc_votes', () => {
    return request(app)
      .patch('/api/comments/1')
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 1,
          body: 'I loved this game too!',
          author: 'bainesface',
          votes: 17,
          created_at: new Date(1511354613389).toJSON(),
        });
      });
  });
  test('PATCH 200 - updates comments votes - decrease when negative inc_votes', () => {
    return request(app)
      .patch('/api/comments/1')
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 1,
          body: 'I loved this game too!',
          author: 'bainesface',
          votes: 15,
          created_at: new Date(1511354613389).toJSON(),
        });
      });
  });
  test('400 - no/invalid key of inc_votes in request body', () => {
    return request(app)
      .patch('/api/comments/1')
      .expect(400)
      .send({ invalid_key: 2 })
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot update votes! Make sure you only include a key of "inc_votes" :-)'
        );
      });
  });
  test('400 - invalid increment value eg inc_votes: "cat"', () => {
    return request(app)
      .patch('/api/comments/1')
      .expect(400)
      .send({ inc_votes: 'cat' })
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot update votes! Make sure your newVotes value is a number :-)'
        );
      });
  });
  test('400 - other unwanted properties on request body eg { inc_votes : 1, name: "Mitch" }', () => {
    return request(app)
      .patch('/api/comments/1')
      .expect(400)
      .send({ inc_votes: 2, name: 'Mitch' })
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Cannot update votes! Make sure you only include inc_votes on your request :-)'
        );
      });
  });
  test('400 - invalid comment_id', () => {
    return request(app)
      .delete('/api/comments/invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid query type. Please use a number for all ID, limit and page queries :-)'
        );
      });
  });
  test('404 - valid comment_id but does not exist', () => {
    return request(app)
      .delete('/api/comments/1000000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'This comment does not exist! Please try another one :-)'
        );
      });
  });
});

describe('/api/users', () => {
  // GET 200 - responds with users

  // 200 - sorts by username by default
  // 200 - can accept asc / desc to sort usernames with order

  // 400 - invalid order
  test('GET 200 - responds with an array of user objects', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach(user => {
          expect(user).toMatchObject({
            username: expect.any(String),
          });
        });
      });
  });
  test('200 - sorts by username by default', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        expect(users).toBeSortedBy('username');
      });
  });
  test('200 - can accept asc / desc to sort usernames with order', () => {
    return request(app)
      .get('/api/users?order=desc')
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        expect(users).toBeSortedBy('username', { descending: true });
      });
  });
  test('400 - invalid order', () => {
    return request(app)
      .get('/api/users?order=invalid')
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'Invalid order query. Please use either ASC/asc or DESC/desc :-)'
        );
      });
  });
});

describe('/api/users/:username', () => {
  // GET 200 - responds with user object
  // 404 - username doesn't exist
  test('GET 200 - responds with user object', () => {
    return request(app)
      .get('/api/users/mallionaire')
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: 'mallionaire',
          name: 'haz',
          avatar_url:
            'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
        });
      });
  });
  test('404 - invalid username', () => {
    return request(app)
      .get('/api/users/123')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          'That user does not exist! Please try another one :-)'
        );
      });
  });
});
