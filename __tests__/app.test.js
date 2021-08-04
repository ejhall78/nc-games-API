const db = require('../db/connection.js');
const request = require('supertest');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const app = require('../app.js');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('404 - invalid url', () => {
  test('responds with custom message', () => {
    return request(app)
      .get('/invalid')
      .expect(404)
      .then(res => {
        const message = res.body.msg;
        expect(message).toBe("Oh no! That doesn't exist!");
      });
  });
});

describe('GET - /api/categories', () => {
  test('should return an array of the categories on a key of "categories"', () => {
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
  describe('/:review_id', () => {
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
    test('400 - sends custom message when id is invalid', () => {
      return request(app)
        .get('/api/reviews/invalid')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('Invalid review ID. Please use a number :-)');
        });
    });
    test('404 - sends custom message when valid id but does not exist', () => {
      return request(app)
        .get('/api/reviews/1000000')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('Review does not exist. Try a lower number :-)');
        });
    });
    test.only('PATCH 200 - updates review votes and responds with the updated review', () => {
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
  });
});
