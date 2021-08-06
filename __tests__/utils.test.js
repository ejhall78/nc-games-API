const {
  categoriesFormatter,
  usersFormatter,
  reviewsFormatter,
} = require('../db/utils/data-manipulation.js');

describe('categoriesFormatter', () => {
  test('returns an empty array when passed an empty array', () => {
    const testArr = [];
    expect(categoriesFormatter(testArr)).toEqual([]);
  });
  test('returns a single nested array when passed an array containing ONE object', () => {
    const testArr = [{ slug: 'test', description: 'data' }];
    expect(categoriesFormatter(testArr)).toEqual([['test', 'data']]);
  });
  test('returns an array nested arrays containing values from MULTIPLE objects contained in passed array', () => {
    const testData = [
      {
        slug: 'euro game',
        description: 'Abstact games that involve little luck',
      },
      {
        slug: 'social deduction',
        description: "Players attempt to uncover each other's hidden role",
      },
    ];

    const output = [
      ['euro game', 'Abstact games that involve little luck'],
      [
        'social deduction',
        "Players attempt to uncover each other's hidden role",
      ],
    ];

    expect(categoriesFormatter(testData)).toEqual(output);
  });
  test('does NOT mutate original array', () => {
    const testData = [
      {
        slug: 'euro game',
        description: 'Abstact games that involve little luck',
      },
      {
        slug: 'social deduction',
        description: "Players attempt to uncover each other's hidden role",
      },
    ];
    const testDataCopy = [...testData];

    categoriesFormatter(testData);
    expect(testData).toEqual(testDataCopy);
  });
});

describe('usersFormatter', () => {
  test('returns an empty array when passed an empty array', () => {
    const testArr = [];
    expect(usersFormatter(testArr)).toEqual([]);
  });
  test('returns a single nested array when passed an array containing ONE object', () => {
    const testArr = [
      {
        username: 'mallionaire',
        name: 'haz',
        avatar_url:
          'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
      },
    ];
    expect(usersFormatter(testArr)).toEqual([
      [
        'mallionaire',
        'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
        'haz',
      ],
    ]);
  });
  test('returns an array nested arrays containing values from MULTIPLE objects contained in passed array', () => {
    const testData = [
      {
        username: 'mallionaire',
        name: 'haz',
        avatar_url:
          'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
      },
      {
        username: 'philippaclaire9',
        name: 'philippa',
        avatar_url:
          'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
      },
    ];

    const output = [
      [
        'mallionaire',
        'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
        'haz',
      ],
      [
        'philippaclaire9',
        'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
        'philippa',
      ],
    ];

    expect(usersFormatter(testData)).toEqual(output);
  });
  test('does NOT mutate original array', () => {
    const testData = [
      {
        username: 'mallionaire',
        name: 'haz',
        avatar_url:
          'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
      },
      {
        username: 'philippaclaire9',
        name: 'philippa',
        avatar_url:
          'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
      },
    ];
    const testDataCopy = [...testData];

    usersFormatter(testData);
    expect(testData).toEqual(testDataCopy);
  });
});

describe('reviewsFormatter', () => {
  test('returns an empty array when passed an empty array', () => {
    const testArr = [];
    expect(reviewsFormatter(testArr)).toEqual([]);
  });
  test('returns a single nested array when passed an array containing ONE object', () => {
    const testArr = [
      {
        title: 'Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_img_url:
          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        review_body: 'Farmyard fun!',
        category: 'euro game',
        created_at: new Date(1610964020514),
        votes: 1,
      },
    ];
    expect(reviewsFormatter(testArr)).toEqual([
      [
        'Agricola',
        'Farmyard fun!',
        'Uwe Rosenberg',
        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        1,
        'euro game',
        'mallionaire',
        new Date(1610964020514),
      ],
    ]);
  });
  test('returns an array nested arrays containing values from MULTIPLE objects contained in passed array', () => {
    const testData = [
      {
        title: 'Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_img_url:
          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        review_body: 'Farmyard fun!',
        category: 'euro game',
        created_at: new Date(1610964020514),
        votes: 1,
      },
      {
        title: 'Jenga',
        designer: 'Leslie Scott',
        owner: 'philippaclaire9',
        review_img_url:
          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        review_body: 'Fiddly fun for all the family',
        category: 'dexterity',
        created_at: new Date(1610964101251),
        votes: 5,
      },
    ];

    const output = [
      [
        'Agricola',
        'Farmyard fun!',
        'Uwe Rosenberg',
        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        1,
        'euro game',
        'mallionaire',
        new Date(1610964020514),
      ],
      [
        'Jenga',
        'Fiddly fun for all the family',
        'Leslie Scott',
        'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        5,
        'dexterity',
        'philippaclaire9',
        new Date(1610964101251),
      ],
    ];

    expect(reviewsFormatter(testData)).toEqual(output);
  });
  test('does NOT mutate original array', () => {
    const testData = [
      {
        title: 'Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_img_url:
          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        review_body: 'Farmyard fun!',
        category: 'euro game',
        created_at: new Date(1610964020514),
        votes: 1,
      },
      {
        title: 'Jenga',
        designer: 'Leslie Scott',
        owner: 'philippaclaire9',
        review_img_url:
          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
        review_body: 'Fiddly fun for all the family',
        category: 'dexterity',
        created_at: new Date(1610964101251),
        votes: 5,
      },
    ];
    const testDataCopy = [...testData];

    reviewsFormatter(testData);
    expect(testData).toEqual(testDataCopy);
  });
});
