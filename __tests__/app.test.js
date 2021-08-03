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

describe('GET - /api/reviews', () => {
  describe('/:review_id', () => {
    // 200 :) - gets user by id

    // 400 :( - invalid id
    // 404 :( - valid id but doesn't exist

    test('200 - correctly gets a valid user', () => {
      return request(app)
        .get('/api/reviews/2')
        .expect(200)
        .then(res => {
          const review = res.body.review;
          expect(review).toMatchObject({
            owner: 'philippaclaire9',
            title: 'Jenga',
            review_id: expect.any(Number),
            review_body: 'Fiddly fun for all the family',
            designer: 'Leslie Scott',
            review_img_url:
              'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            category: 'dexterity',
            created_at: new Date(1610964101251).toJSON(),
            votes: 5,
            comment_count: 3,
          });
        });
    });
  });
});
