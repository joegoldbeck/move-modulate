'use strict';

var _ = require('underscore');

var settings = {};

settings.cookieSecret = process.env.COOKIE_SECRET;

settings.movesClientId = '9uuys57PvQY7G2rFn2uBqPi6uoFabcTT';
settings.movesSecret = process.env.MOVES_SECRET;

settings.movesToken = process.env.MOVES_TOKEN; // if a token is in the environment for demonstration purposes

settings.movesAPIUrl = 'https://api.moves-app.com/api/v1';
settings.movesAuthUrl = 'https://api.moves-app.com/oauth/v1';

module.exports = settings;
