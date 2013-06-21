"use strict";

var settings = require('../settings'),
    request = require('request');

exports.index = function(req, res){

    if (req.cookies.access_token) { // if there's an access token
        var requestOptions = {
            url : 'https://api.moves-app.com/oauth/v1/tokeninfo',
            qs : {
                access_token : req.cookies.access_token
            },
            json : true
        };

        request(requestOptions, function (err, response, body){
            if (err || response.statusCode !== 200) {
                console.log(err);
                if (body.error === 'invalid_token')
                    res.redirect('/auth/moves'); // get a new token. in the future, refresh_token should be stored and the token should be refreshed
                else
                    res.send(400, body.error);
            }
            else {
                res.render('index', { // placeholder. this will be more interesting soon
                    title : 'Move Modulate'
                })
            }
        });

    }
    else
        res.redirect('/auth/moves'); // get a token
};

exports.authorizeMoves = function(req, res){
    res.render('authmoves', {
        authorizationUrl : 'https://api.moves-app.com/oauth/v1/authorize?response_type=code&client_id=' + settings.movesClientId + '&scope=activity%20location',
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
            res.redirect('/'); // redirect to index, with access token now stored in cookie
        }
    });
};
