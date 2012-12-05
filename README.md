# Cheesecake

WebCam S3 upload using saycheese.js

## Getting Started
To run the s3 signature service you'll node.js >= 0.6.0. The node based S3 signature generation can of course be replaced by a service in any other language which may suit your requirements and infrastructural needs better.

Assuming, that you want to install the node based s3 service proceed as follows:

After downloading and extracting the application into a directory of your choice install it with: `npm install` in the directory where you put it.

The folder release contains the almost-ready-to-use app. The only thing which needs to be done is to configure our S3 Account. This has to be done in the ```release/config.js``` file.  
Your S3 Bucket used for this has to be CORS enabled for the domain or server which cheeseCake will be run on. For more information on CORS on Amazons S3, please refer to the AWS [CORS documentation](http://docs.amazonwebservices.com/AmazonS3/latest/dev/cors.html) 


To start cheeseCake use

```
node release/server.js
```
in the application directory. Cheesecake will now happily answer your request under http://[servername]:3333/


## Documentation
If you are planning to experiment or develop using this little piece of software (which would be cool) you can user the files located under ```src/```

The sources of cheeseCake are mainly written in coffeescript. I have set up a grunt.js file ([Grunt](http://gruntjs.com/)) which will make it a bit easier for you to get started developing. Just execute the following steps to get your development environment set up:

* cd into your app directory (not ```src``` or ```release```)
* Install node-dev using ```npm install -g node-dev``` (maybe needing sudo)
* run the server app ```node-dev release/server.js```
* start grunt using ```grunt watch```

Now the grunt service will listen on changes in your files and will recompile your coffee files if something changes and will copy the output files to the ```release/``` folder, thus forcing the node-dev service to restart.


## Examples
_(Coming soon)_

## License
Copyright (c) 2012 @exinferis  
Licensed under the MIT license.
