crypto = require( "crypto" )
module.exports =
	new class S3Vending
		constructor: ->
			@Secret = root.config.s3.secret
			@Key = root.config.s3.key
			@Bucket = root.config.bucket
			return

		# creating the s3 credentials for the upload form
		createCredentials: ( mimetype, file, cb ) =>
			# calling the create policy method and using its reposnse
			@createS3Policy( mimetype, file, ( err, policy ) => 
				if not err
					# now building the S3 credential object
					s3CredObj = 
						PolicyBase64: 	policy
						Signature: 		crypto.createHmac( "sha1", @Secret ).update( policy ).digest( "base64" )
						Key: 			@Key
						ActionStatus: 	"201"
						FileDescriptor: file
						ContentType:	"#{mimetype}"
						Bucket: 		@Bucket
		
				cb( err, s3CredObj )
				return
			)
			return

		createS3Policy: ( mimetype, file, cb ) =>
			# building the policy based on the config entries
			_date = new Date( )
			_s3Policy 		=
				"expiration": "#{_date.getFullYear()}-#{_date.getMonth() + 1}-#{_date.getDate()}T#{_date.getHours() + 1}:#{_date.getMinutes()}:#{_date.getSeconds()}Z",
				"conditions": [ 
					{"bucket": @Bucket}
					["starts-with", "$Content-Disposition", ""]
					["starts-with", "$key", "pic_"]
					{"acl": "public-read"}
					{"success_action_status": "201"}
					["content-length-range", 0, 1024 * 200] #images restricted to 200k
					["eq", "$Content-Type", mimetype],
				]

			# encoding the Policy
			pBuffer = new Buffer( JSON.stringify( _s3Policy ) )
			PolicyBase64 = pBuffer.toString( "base64" )
			cb( null, PolicyBase64 )
			return