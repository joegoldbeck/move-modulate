"use strict";

var express = require('express'),
    http = require('http'),
    path = require('path'),
    device = require('express-device')

var routes = require('./routes'),
    settings = require('./settings')

var app = express()

// all environments
app.set('port', process.env.PORT || 5000)
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(device.capture())
app.use(express.methodOverride())
app.use(express.cookieParser())
app.use(app.router)
app.use(require('less-middleware')({ src: __dirname + '/public' }))
app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler())
}

app.get('/', routes.index)
app.get('/login', routes.loginScreen)
app.get('/login/demouser', routes.loginDemoUser)
app.get('/logout', routes.logout)
app.get('/auth/moves/callback', routes.requestMovesToken)
app.get('/moves/summary/daily', routes.movesFullDailySummary)

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'))
})
