"use strict";

var request = require('request');

var settings = require('../settings'),
    moves = require('../models/moves');

/*
Homepage '/'

Renders dashboard if authorized

Redirects to authorization if not

*/

exports.index = function(req, res){

    var accessToken = req.cookies.access_token ? req.cookies.access_token : settings.movesToken // if authorized, access token will be in cookie, or for demonstration purposes in the environment

    if (accessToken) {
        var requestOptions = {
            url : 'https://api.moves-app.com/oauth/v1/tokeninfo',
            qs : {
                access_token : accessToken
            },
            json : true
        };

        request(requestOptions, function (err, response, body){
            if (err || response.statusCode !== 200) {
                console.log(err + response.statusCode);
                if (body.error === 'invalid_token')
                    res.redirect('/auth/moves'); // get a new token. in the future, refresh_token should be stored and the token should be refreshed
                else
                    res.send(400, body.error);
            }
            else {
                if (settings.movesToken && !req.cookies.access_token) // if access token is in the environment for demonstration purposes
                    res.cookie('access_token', accessToken)           // put token in the cookie for this browser session

                res.render('dashboard'); // render dashboard if authorized
            }
        });
    }
    else                             // if there is no access token
        res.redirect('/auth/moves'); // get a token
};

exports.authorizeMoves = function(req, res){
    res.render('authmoves', {
        authorizationUrl : 'https://api.moves-app.com/oauth/v1/authorize?response_type=code&client_id=' + settings.movesClientId + '&scope=activity', //+'%20location' if want location as well
        title : 'Move Modulate'
    })
};

exports.requestMovesToken = function(req, res){

    var requestOptions = {
        url : 'https://api.moves-app.com/oauth/v1/access_token',
        qs : {
            grant_type : 'authorization_code',
            code : req.query.code,
            client_id : settings.movesClientId,
            client_secret : settings.movesSecret
        },
        json : true
    };

    request.post(requestOptions, function (err, response, body){
        if (err || response.statusCode !== 200) {
            console.log(err)
            res.send(400, body.error)
        }
        else {
            res.cookie('access_token', body.access_token, { maxAge : body.expires_in*1000}) // access token stored only in cookie for now
            res.redirect('/');                                                              // redirect to index, with access token now stored in cookie
        }
    });
};

exports.loadDemoUser = function (req, res){
    if (!settings.movesToken)
        res.send(200, { redirect : '/' } )//return res.send(500)
    res.cookie('access_token', settings.movesToken)
    res.send(200, { redirect : '/' } )
}

exports.movesFullDailySummary = function(req, res){
    moves.fullDailySummary(req.cookies.access_token, function (err, summary){
        if (err){
            if (err === 'invalidToken')
                return res.send(403, 'invalidToken');
            else
                return res.send(500, err);
        }
        return res.send(200, summary)
    })
}
