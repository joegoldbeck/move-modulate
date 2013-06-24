MoveModulate v0.5
===================

Lightweight web app which uses data from the Moves app (http://moves-app.com/) to display a graph of walking (and soon running and biking) since Moves was installed and make recommendations for the next couple days.

To set up an instance, a moves developer account is required (https://dev.moves-app.com)
* Redirect URI should be http://YOURAPPURL/authmoves/callback
* Environment variable MOVES_SECRET should be set to the client secret
* Environment variable MOVES_CLIENT should be set to the client id

Authored by jgoldbeck. June 2013
