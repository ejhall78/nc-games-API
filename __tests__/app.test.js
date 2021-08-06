const db = require('../db/connection.js');
const request = require('supertest');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const app = require('../app.js');

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

describe('/api/categories', () => {
  test('200 GET - should return an array of the categories on a key of "categories"', () => {
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

  // 400 - sort_by an invalid column
  // 400 - order !== "asc" or "desc"
  // 404 - category that doesn't exist
  // 200 - category that exists but doesn't have any reviews - respond with empty array
  test('200 GET - responds with an array of reviews', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(13);
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
        expect(reviews).toHaveLength(13);
        expect(reviews).toBeSortedBy('created_at');
      });
  });
  test('200 - sort reviews by any valid column', () => {
    return request(app)
      .get('/api/reviews?sort_by=votes')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(13);
        expect(reviews).toBeSortedBy('votes');
      });
  });
  test('200 - orders results either asc or desc - default by date when no sort_by', () => {
    return request(app)
      .get('/api/reviews?order=desc')
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toHaveLength(13);
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
        expect(reviews).toHaveLength(13);
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
        expect(reviews).toHaveLength(11);
        reviews.forEach(review => {
          expect(review.category).toBe('social deduction');
        });
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
          'Invalid category. Remember to use underscores "_" instead of spaces for your request :-)'
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
});

describe('/api/reviews/:review_id', () => {
  // GET 200 - gets user by id
  // 400 - invalid id
  // 404 - valid id but doesn't exist

  // PATCH 201 - updates votes of a review
  // 400 - no/invalid key of 'inc_votes' in request body
  // 400 - invalid increment value eg inc_votes: "cat"
  // 400 - other unwanted properties on request body eg { inc_votes : 1, name: 'Mitch' }

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
        expect(msg).toBe('Invalid review ID. Please use a number :-)');
      });
  });
  test('404 - valid id but does not exist', () => {
    return request(app)
      .get('/api/reviews/1000000')
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Review does not exist. Try a lower number :-)');
      });
  });
  test('PATCH 200 - updates review votes and responds with the updated review', () => {
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
  test('404 - valid id that does not exits', () => {
    return request(app)
      .patch('/api/reviews/1000000')
      .send({ inc_votes: 2 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Review does not exist. Try a lower number :-)');
      });
  });
  test('400 - invalid id', () => {
    return request(app)
      .patch('/api/reviews/invalid')
      .send({ inc_votes: 2 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Invalid review ID. Please use a number :-)');
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
});

describe('/api/reviews/:review_id/comments', () => {
  // 200 GET - responds with an array of comments for the given review id

  // 201 POST - adds a comment to the db and responds with the posted comment
  test('200 GET - responds with comments for given review id', () => {
    return request(app)
      .get('/api/reviews/2/comments')
      .expect(200)
      .then(({ body: { comments } }) => {
        body.forEach(comment => {
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
});
