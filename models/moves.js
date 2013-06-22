"use strict";

var settings = require('../settings'),
    request = require('request'),
    moment = require('moment'),
    _ = require('underscore');

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
    };

    request(requestOptions, function (err, response, body){
        console.log(err)
        if (response.statusCode === 401)
            callback('invalidToken', body)
        else if (err)
            callback(err, body);
        else if (response.statusCode !== 200)
            callback('Unexpected response code' + response.statusCode, body);
        else
            callback(null, body);
    });
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

        // FOR NOW JUST GET A FEW DAYS IN JUNE
        movesAPIRequest(token, '/user/summary/daily?from=20130601&to=20130621', function (err, activityBody){
            // sort by date ascending.
            var sortedActivityBody = _.sortBy(activityBody, function(ele){ return parseInt(ele.date)})

            var dates = _.map(sortedActivityBody, function(ele){
                return moment(ele.date, 'YYYYMMDD').format('YYYY-MM-DD')
            })

            var walkDistance = _.map(sortedActivityBody, function(ele){
                    return _.where(ele.summary, {activity : 'wlk'})[0].distance/1609.34
            })

            var walkDuration = _.map(sortedActivityBody, function(ele){
                    return _.where(ele.summary, {activity : 'wlk'})[0].duration/60
            })

            var walkSteps = _.map(sortedActivityBody, function(ele){
                    return _.where(ele.summary, {activity : 'wlk'})[0].steps
            })

            var walk = {
                distance : walkDistance,
                duration : walkDuration,
                steps : walkSteps
            }

            var summary = {
                dates : dates,
                walk : walk
            }

            callback(err, summary)
        })
    })
}

module.exports = moves;
