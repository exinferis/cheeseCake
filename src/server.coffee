# Webmart CMS main server
express = require( "express" )
root.config = require( "./config" ) 
s3 = require( "./s3" )

app = express()

# setting up the app
app.use( express.compress( level: 7 ) )
app.use( express.bodyParser( ) )
app.use( express.multipart( ) )

# configuring templating engine, using ejs
app.set( "views", "#{__dirname}/views" );
app.set( "view engine", "ejs" )	
app.use( "/static/", express.static( "#{__dirname}/static" ) )

# checking for correct session
app.post( "/credentials", ( req, res ) ->
	if req.body.mimetype? and req.body.file?
		mimetype = req.body.mimetype
		file = req.body.file

		s3.createCredentials( mimetype, file, ( err, result ) ->
			res.header( "Access-Control-Allow-Origin", "*" )
			res.header( "Content-Type", "application/JSON" )
			res.end( JSON.stringify( result ) )
			return
		)
	else
		res.statusCode = 400
		res.end()
	return
)

app.get( "/", ( req, res ) ->
	res.redirect( "/static/index.html" )
)

app.get( "/image", ( req, res ) ->
	res.end( "<img src='http://letestbucket.s3.amazonaws.com/#{req.query["key"]}'>" )
	return
)

app.listen( 3333 )