"use strict";

var request = require('request')

var settings = require('../settings'),
    moves = require('../models/moves')

/*
Homepage (/)

If authorized, renders dashboard
Otherwise, redirects to login screen
*/
exports.index = function(req, res){

    if (req.cookies.access_token) {
        var requestOptions = {
            url : 'https://api.moves-app.com/oauth/v1/tokeninfo',
            qs : {
                access_token : req.cookies.access_token
            },
            json : true
        }

        request(requestOptions, function (err, response, body){
            if (err || response.statusCode !== 200) {
                console.log(err + response.statusCode);
                if (body.error === 'invalid_token')
                    res.redirect('/login'); // get a new token. in the future, refresh_token should be stored and the token should be refreshed
                else
                    res.send(400, body.error);
            }
            else {
                res.render('dashboard'); // render dashboard if authorized
            }
        })
    }
    else                             // if there is no access token
        res.redirect('/login') // get a token
}

/*
/login

Renders login screen

Shows button which forwards user to Moves app authorization
If there's a token stored in the environment for demo mode, shows a demo mode button
*/
exports.loginScreen = function(req, res){
    res.render('login', {
        authorizationUrl : 'https://api.moves-app.com/oauth/v1/authorize?response_type=code&client_id=' + settings.movesClientId + '&scope=activity', //+'%20location' if want location as well
        title : 'Move Modulate',
        allowDemo : settings.movesToken ? true : false
    })
}

/*
/login/demouser

Sets access_token cookie from the token in the environment for demonstration purposes
*/
exports.loginDemoUser = function (req, res){
    if (!settings.movesToken)
        return res.send(500)
    res.clearCookie('refresh_token')
    res.cookie('access_token', settings.movesToken)
    return res.send(200, { redirect : '/' } )
}

/*
/logout

Logout user
Invalidate access token and clear relevant cookies.
*/
exports.logout = function (req, res){
    res.clearCookie('access_token') // remove cookie

    // invalidate token if refresh token is available (won't invalidate demo mode token because no refresh token is associated with it)
    if (req.cookies.refresh_token) {
        var requestOptions = {
            url : 'https://api.moves-app.com/oauth/v1/access_token',
            qs : {
                grant_type : 'refresh_token',
                refresh_token : req.cookies.refresh_token,
                code : req.query.code,
                client_id : settings.movesClientId,
                client_secret : settings.movesSecret
            },
            json : true
        }

        request.post(requestOptions, function (err, response, body){
            if (err || response.statusCode !== 200)
                console.log(err)

            res.clearCookie('refresh_token')
            return res.redirect('/')
        })
    }
    else
        return res.redirect('/')
}

/*
/auth/moves/callback

Part of the oauth sequence with Moves
Moves app authorization redirects here to initiate access token generation
*/
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
    }

    request.post(requestOptions, function (err, response, body){
        if (err || response.statusCode !== 200) {
            console.log(err)
            res.send(400, body.error)
        }
        else {
            res.cookie('access_token', body.access_token, { maxAge : body.expires_in*1000})   // access token stored only in cookie for now
            res.cookie('refresh_token', body.refresh_token, { maxAge : body.expires_in*1000})
            res.redirect('/') // redirect to index, with access token and refresh token now stored in cookie
        }
    })
}

exports.movesFullDailySummary = function(req, res){
    moves.fullDailySummary(req.cookies.access_token, function (err, summary){
        if (err){
            if (err === 'invalidToken')
                return res.send(403, 'invalidToken')
            else
                return res.send(500, err)
        }
        return res.send(200, summary)
    });
}

