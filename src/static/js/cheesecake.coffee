# # CheeseCake
# Team Centric Software GmbH, Exinferis 2012
# http://www.tcs.de
# a little tool based on the work of Lee Machin used to capture image of your webcam right in your browser
# and uploading them to s3 directly using a node.js based service for generating the s3 Signature and Policy.  
# Will not work on anything else than the newest browsers.
class CheeseCake
	constructor: ( @options ) ->
		# extracting options or settings default values
		@el = 				@options.el or $( "document" )
		@format = 		@options.format or "image/jpeg"
		@ext = 			@options.ext or "jpg"
		@s3provider =	@options.s3provider or ""

		@cheese = new SayCheese( @el )
		@images = {}

		@cheese.on( "start", @initUI )
		@cheese.on( "snapshot", @_snapShotHandler )
		$( ".action-takepicture" ).on( "click", @takeSnapShot )
		$( ".action-reset" ).on( "click", @reset )

		@cheese.start()
		return

	# ### initUI
	# shows th ui after cheese has been initialized and the webcam access has been allowed
	initUI: =>
		$( ".action-takepicture" ).fadeIn()
		return

	# ### takeSnapShot
	# taking a snapshot using the webcam and publishing a corresponding event
	takeSnapShot: =>
		@cheese.takeSnapshot(  )
		return

	# ### _snapShotHandler
	# decides what to do with a previous taken snapshot
	_snapShotHandler: ( snapshot ) =>
		_id = _.uniqueId( "canvas_" )
		_data = snapshot.toDataURL( @format )
		@images[ _id ] = @dataURItoBlob( _data )

		# removing an old image from the ui and the images object
		if $( "#previewimages .thumbnail" ).length is 4
			_toRemoveid = $( "#previewimages .thumblistitem:first" ).attr( "id" )
			@images = _.omit( @images, _toRemoveid )
			$( "#previewimages .thumblistitem:first" ).remove()

		$( "#previewimages" ).append( "<li class='thumblistitem' id='thumb_#{_id}'><a href='#' class='thumbnail' id='#{_id}'><span class='marker hide'></span></a></li>" )
		$( "##{_id}" ).append( snapshot ) 
		$( "##{_id}").on( "click", @_createUploadForm )
		return

	# transforms a data uri from the canvas object to a JS blob object
	dataURItoBlob: (dataURI) =>
		binary = atob(dataURI.split(",")[1])
		array = []
		i = 0

		while i < binary.length
			array.push binary.charCodeAt(i)
			i++

		return new Blob( [new Uint8Array(array)],
			type: "image/jpeg"
		)

	# ### _requestCredentials
	# requesting the upload credentials
	_requestCredentials: ( mimetype, file, cb )=>
		$.ajax(
			type: "POST"
			url: "#{@s3provider}/credentials"
			data:
				mimetype: mimetype
				file: file
			success: ( res )=>
				cb( JSON.parse( res ) )
				return
			error: ( err ) =>
				alert( "An error occurred receiving the S3 credentials from the server." )
				return
		)
		return

	_createUploadForm: ( event ) =>
		# getting the id and anttaching the ajax loader to it
		_id = $( event.currentTarget ).attr( "id" )
		$( "##{_id}" ).append( "<span class='ajaxloader'></span>")
		$( ".action-takepicture" ).fadeOut()

		if @images[_id]?
			_fName = "pic_#{moment().valueOf().toString( 16 )}"
			@_requestCredentials( @format, _fName, ( res ) =>
				# building html5 / formdata object for use with xhr transport
				formData = new FormData
				formData.append( "key", "#{res.FileDescriptor}.#{@ext}" )
				formData.append( "acl", "public-read" )
				formData.append( "Content-Disposition", "" )
				formData.append( "Content-Type", res.ContentType )
				formData.append( "success_action_status", res.ActionStatus )
				formData.append( "AWSAccessKeyId", res.Key )
				formData.append( "Policy", res.PolicyBase64 )
				formData.append( "Signature", res.Signature )
				formData.append( "file", @images[_id] )

				try
					xhr = new XMLHttpRequest

					xhr.onreadystatechange = =>
						#xhr request has finished - one way or another
						if xhr.readyState is 4 
							if xhr.status is 200 or xhr.status is 201
								@_uploadFinished( _id, "http://#{res.Bucket}.s3.amazonaws.com/#{res.FileDescriptor}.#{@ext}" )
							else
								@_uploadError( _id, xhr.status )
						return

					xhr.onprogress = ( progress ) =>
						console.log "Progress!", progress
						return

					xhr.open "POST", "http://#{res.Bucket}.s3.amazonaws.com", true
					xhr.send formData
				catch e
					@_uploadError( _id, e ) 
				return
			)
		return

	# ### _uploadFinished
	_uploadFinished: ( id, link ) =>
		@_setUploadedVisible( id )
		$( "##{id}" ).find( ".marker" ).css( "background-position": "left bottom", "display": "block" )
		$( "#thumb_#{id}" ).append( "<div class='alert alert-success'>Your picture has been uploaded like a boss! <a href='#{link}' target='blank'>Link</a></div>" )
		return

	# ### _uploadError
	# handling the (hopefully rare) event of an error during the XHR transport
	_uploadError: ( id, e )=>
		@_setUploadedVisible( id )
		$( "##{id}" ).find( ".marker" ).css( "background-position": "right bottom", "display": "block" )	
		$( "#thumb_#{id}" ).append( "<div class='alert alert-error'>An error occurred while uploading the file.</div>" )
		return

	# ### _setUploadedVisible
	# emphasizes an element as the currently uploaded / uploading element by fading out the others
	_setUploadedVisible: ( id )=>
		$( ".thumblistitem" ).not( "#thumb_#{id}" ).fadeTo( 500, 0.5 )
		$( "#previewimages .thumbnail" ).off()
		$( "##{id}" ).find( ".ajaxloader" ).remove()
		$( ".action-reset" ).fadeIn()
		return

	# ### reset
	# resets the app, deleting all canvas objects, flushing the images 
	reset: =>
		@images = {}
		$( "#previewimages" ).empty()
		$( ".action-reset" ).fadeOut( ->
			$( ".action-takepicture" ).fadeIn()
		)
		return

window.CheeseCake = CheeseCake