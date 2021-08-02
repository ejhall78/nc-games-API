const db = require("../db/connection.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require('../app.js');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET - /api/categories", () => {
  test('should return an array of the categories on a key of "categories"', () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((response) => {
          const { categories } = response.body;
          expect(categories).toHaveLength(4);
          categories.forEach(category => {
              expect(category).toMatchObject({
                  slug: expect.any(String),
                  description: expect.any(String)
              });
          })
      });
  });
});
