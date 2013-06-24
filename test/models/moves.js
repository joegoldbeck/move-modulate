"use strict";

var assert = require('assert'),
    _ = require('underscore')

var moves = require('../../models/moves')

describe('generateDatePairs', function (){
    it('should return [] when max days is less than zero', function (){
        var datePairs = moves.generateDatePairs('20130101', '20130401', -21)
        assert.equal(datePairs.length, 0)
        assert.equal(typeof(datePairs), 'object')
    })

    it('should return [] when start date is after the end date', function (){
        var datePairs =moves.generateDatePairs('20130102', '20130101', 31)
        assert.equal(datePairs.length, 0)
        assert.equal(typeof(datePairs), 'object')
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

describe('parseSummaryBody', function () {
    it ('should return a parsed body with empty arrays if input is {}', function (){
        assert.deepEqual(moves.parseSummaryBody([]), {  dates: [],
                                                        walk: {
                                                            distance: [],
                                                            duration: [],
                                                            steps: []
                                                        }})
    })

    it ('should return a valid parsed body when body is valid and complete', function (){

        var body = [
            {
                date    : '20130226',
                summary : [
                    {
                        activity : 'wlk',
                        duration : 1508,
                        distance : 1097,
                        steps    : 2119
                    },
                    ]
            },
            {
                date  : '20130227',
                summary : [
                    {
                        activity : 'wlk',
                        duration : 1393,
                        distance : 1099,
                        steps    : 2065
                    }
                ] }
            ]

        var desiredParsedBody = {
            dates : [ '2013-02-26', '2013-02-27' ],
            walk  : {
                distance : [ 0.6816458921048381, 0.6828886375781377 ],
                duration : [ 25.133333333333333, 23.216666666666665 ],
                steps    : [ 2119, 2065 ]
            }}

        assert.deepEqual(moves.parseSummaryBody(body), desiredParsedBody)
    })

    it ('should return a valid parsed body with zero activity on days where summary is null', function (){

        var body = [
            {
                date    : '20130226',
                summary : [
                    {
                        activity : 'wlk',
                        duration : 1508,
                        distance : 1097,
                        steps    : 2119
                    },
                    ]
            },
            {
                date  : '20130227',
                summary : null
            } ]

        var desiredParsedBody = {
            dates : [ '2013-02-26', '2013-02-27' ],
            walk  : {
                distance : [ 0.6816458921048381, 0 ],
                duration : [ 25.133333333333333, 0 ],
                steps    : [ 2119, 0 ]
            }}

        assert.deepEqual(moves.parseSummaryBody(body), desiredParsedBody)
    })

    it ('should return a valid parsed body with zero walking activity on days where walking summary is not present', function (){

        var body = [
            {
                date    : '20130226',
                summary :[
                    {
                        activity : 'wlk',
                        duration : 1508,
                        distance : 1097,
                        steps    : 2119
                    },
                ]
            },
            {
                date  : '20130227',
                summary : [
                    {
                        activity : 'cyc',
                        duration : 1393,
                        distance : 1099,
                        steps    : 2065
                    },
                ]
            } ]

        var desiredParsedBody = {
            dates : [ '2013-02-26', '2013-02-27' ],
            walk  : {
                distance : [ 0.6816458921048381, 0 ],
                duration : [ 25.133333333333333, 0 ],
                steps    : [ 2119, 0 ]
            }}

        assert.deepEqual(moves.parseSummaryBody(body), desiredParsedBody)
    })

})
