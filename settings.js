'use strict';

var _ = require('underscore');

var settings = {};

settings.cookieSecret = process.env.COOKIE_SECRET;

settings.movesClientId = '9uuys57PvQY7G2rFn2uBqPi6uoFabcTT';
settings.movesSecret = process.env.MOVES_SECRET;

module.exports = settings
