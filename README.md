# nc-games API

## Project Summary

The purpose of this project is to build an API that allows access to application data programmatically. This will serve as the back-end of my project. Here is a like to the front-end so you can have a look:

https://nc-games-ejhall78.netlify.app/

https://github.com/ejhall78/nc-games

The theme of the data is board games! Users can create, read, update and delete reviews of certain board games; comments on said reviews; the users that made the comments and the game categories

Here is a link to the API so you can try it out for yourself: https://be-nc-games-ejhall78.herokuapp.com/

Enjoy :-)

## Installation

If you want to run the app on your own machine, there are a few steps to setting it up:

- `Cloning the repo`
- `Installing dependencies`
- `Seeding a local database`
- `Setting up and running the tests`

## Cloning the repo

- cd (change directory) into the location where you want to save this on your machine

```
cd <desired location>
```

- Press the green Code button on the repo on GitHub
- Copy the relevant link whether you are using HTTPS or SSH
- In your desired directory on your local machine, type the following and hit enter:

```
git clone <paste link from GitHub here>
```

- cd into be-nc-games

```
cd be-nc-games
```

- You have now successfully cloned the repo and may choose to open it with your code editor of choice
- Hint: if you use VSCode, type the following and press enter to open your current directory:

```
code .
```

## Installing dependencies

Now type the following and hit enter:

```
npm i
```

## Seeding a local database

In order to set up a local database we first need to delete any databases you may have with the same name

Then we need to create our db

This is all set up for you in the file `/db/setup.sql`

There is a script set up for you in the `package.json`, type the following into your terminal to run the script:

```
npm run setup-dbs
```

Next we need to create the structure of our database and seed some data to populate it

This has been done in `/db/seeds/seed.js`

There is also a script that will cover this:

```
npm run seed
```

## Setting up and running the tests

### .env files

You will need to create two .env files: `.env.test` and `.env.development` in the root directory. Into each, add `PGDATABASE=<database_name_here>`, with the correct database name for that environment (see /db/setup.sql for the database names). Double check that these .env files are .gitignored.

### Running the tests

In order to run the tests type the following into your terminal:

```
npm test
```

Hint: you can choose to test only certain test files by specifying which one you choose eg:

```
npm test app
```

In the above case, Jest will look for any test files that start will `app` and run only those

## Required software

- `Node version v16.3.0`
- `PostgreSQL version 12.8`
