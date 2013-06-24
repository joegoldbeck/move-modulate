"use strict";

var settings = require('../settings'),
    request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    async = require('async')

var moves = {}

/*
Make an api call to Moves.

Path should include the leading slash
*/
var movesAPIRequest = function (token, path, callback) {
    var requestOptions = {
        url : settings.movesAPIUrl + path,
        qs : {
            access_token : token
        },
        json : true
    }

    request(requestOptions, function (err, response, body){
        if (response.statusCode === 401)
            callback('invalidToken', body)
        else if (err)
            callback(err, body)
        else if (response.statusCode !== 200)
            callback('Unexpected response code' + response.statusCode, body)
        else
            callback(null, body)
    })
}


/*
Get user profile.

Output is in the following format:
{
    "userId": 23138311640030064,
    "profile": {
        "firstDate": "20121211",
        "currentTimeZone": {
            "id": "Europe/Helsinki",
            "offset": 10800
        }
    }
}
*/
moves.getProfile = function (token, callback){
    movesAPIRequest(token, '/user/profile', function (err, profile){
        callback(err, profile)
    })
}

/*
Get the first date from which there might be data for the user

Output is of the form 'YYYYMMDD'
*/
moves.getFirstDate = function (token, callback){
    moves.getProfile(token, function (err, profile){
        if (err)
            return callback(err)
        return callback(err, profile.profile.firstDate)
    })
}

/*
Get the full daily summary of moves activity
*/
moves.fullDailySummary = function(token, callback){
    moves.getFirstDate(token, function (err, firstDate){
        if (err)
            return callback(err)

        async.map(moves.generateDatePairs(firstDate, moment().format('YYYYMMDD'), 31), function (datePair, cb){
            movesAPIRequest(token, '/user/summary/daily?from='+ datePair[0] + '&to=' + datePair[1], function (err, activityBody){
                cb(err, activityBody)
            })
        }, function(err, results){
            var fullActivityBody = _.flatten(results, true)

            var sortedActivityBody = _.sortBy(fullActivityBody, function(ele){ return parseInt(ele.date)})

            if (!sortedActivityBody[sortedActivityBody.length-1].summary) // if the most recent day has no activity
                sortedActivityBody.pop()                                // this is probably a timezone issue, so remove the last day from array

            var dates = _.map(sortedActivityBody, function(ele){
                return moment(ele.date, 'YYYYMMDD').format('YYYY-MM-DD')
            })

            // calculate future dates
            var futureDates = [moment(dates.slice(-1)[0]).add('days', 1).format('YYYY-MM-DD')]
            for (var i=0; i < 30; i++)
                futureDates.push(moment(futureDates.slice(-1)[0]).add('days', 1).format('YYYY-MM-DD'))

            var walkDistance = _.map(sortedActivityBody, function(ele){
                    var walk = _.where(ele.summary, {activity : 'wlk'})[0]
                    if (walk)
                        return walk.distance/1609.34
                    else
                        return 0
            })

            var walkDuration = _.map(sortedActivityBody, function(ele){
                var walk = _.where(ele.summary, {activity : 'wlk'})[0]
                if (walk)
                    return walk.duration/60
                else
                    return 0
            })

            var walkSteps = _.map(sortedActivityBody, function(ele){
                var walk = _.where(ele.summary, {activity : 'wlk'})[0]
                if (walk)
                    return walk.steps
                else
                    return 0
            })

            var walk = {
                distance : walkDistance,
                duration : walkDuration,
                steps : walkSteps
            }

            var summary = {
                dates : dates,
                walk : walk,
                futureDates : futureDates
            }

            callback(err, summary)
        })
    })
}

/*

Generate pairs of dates for multiple Moves calls recursively

Input date format can be 'YYYYMMDD' or 'YYYY-MM-DD'

Output is of the form [['YYYY-MM-DD', 'YYYY-MM-DD'], ['YYYY-MM-DD', 'YYYY-MM-DD']]

*/

moves.generateDatePairs = function(startDate, endDate, maxDaysPerPair){
    // validate inputs
    if (maxDaysPerPair < 1)
        return []

    var startMoment = moment(startDate, ['YYYYMMDD', 'YYYY-MM-DD']),
        endMoment = moment(endDate, ['YYYYMMDD', 'YYYY-MM-DD'])

    if (startMoment > endMoment)
        return []

    var maxPairEndMoment = startMoment.clone().add('days', maxDaysPerPair - 1) // latest moment the first pair can end

    if (maxPairEndMoment >= endMoment) // if the full date range is small enough to fit into one pair
        return [[startMoment.format('YYYY-MM-DD'), endMoment.format('YYYY-MM-DD')]]
    else{
        var nextPairStartDate = maxPairEndMoment.clone().add('days', 1).format('YYYY-MM-DD')
        return [[startMoment.format('YYYY-MM-DD'), maxPairEndMoment.format('YYYY-MM-DD')]].concat(moves.generateDatePairs(nextPairStartDate, endDate, maxDaysPerPair))
    }
}

module.exports = moves
