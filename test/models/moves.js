"use strict";

var assert = require('assert'),
    _ = require('underscore');

var moves = require('../../models/moves')

describe('generateDatePairs', function (){
    it('should return [] when max days is less than zero', function (){
        assert.equal(moves.generateDatePairs('20130101', '20130401', -21).length, 0)
    })

    it('should return [] when start date is after the end date', function (){
        assert.equal(moves.generateDatePairs('20130102', '20130101', 31).length, 0)
    })

    it('should return valid date pairs when dates are in YYYYMMDD format', function (){
        assert.deepEqual(moves.generateDatePairs('20130101', '20130111', 5), [['2013-01-01', '2013-01-05'],['2013-01-06', '2013-01-10'], ['2013-01-11', '2013-01-11']])
    })

    it('should return valid date pairs when dates are in YYYY-MM-DD format', function (){
        assert.deepEqual(moves.generateDatePairs('2013-01-01', '2013-01-11', 5), [['2013-01-01', '2013-01-05'],['2013-01-06', '2013-01-10'], ['2013-01-11', '2013-01-11']])
    })

    it('should return a date pair with the same date twice when start date and end date are the same', function (){
        assert.deepEqual(moves.generateDatePairs('2013-01-01', '2013-01-01', 5), [['2013-01-01', '2013-01-01']])
    })

    it('should return valid date pairs when date range is evenly divisible by max days per pair', function (){
        assert.deepEqual(moves.generateDatePairs('20130101', '20130110', 5), [['2013-01-01', '2013-01-05'],['2013-01-06', '2013-01-10']])
    })
})
