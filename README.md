# Cheesecake

Webcam S3 upload using say-cheese.js

## Getting Started

To run the s3 signature service you'll NodeJS >= 0.6.0. The node based S3 signature generation can of course be replaced by a service in any other language which may suit your requirements and infrastructural needs better.

Assuming, that you want to install the node based s3 service proceed as follows:

After downloading and extracting the application into a directory of your choice install it with: `npm install` in the directory where you put it.

The folder release contains the almost-ready-to-use app. The only thing which needs to be done is to configure our S3 Account. This has to be done in the `release/config.js` file.  
Your S3 Bucket used for this has to be CORS enabled for the domain or server which cheeseCake will be run on. For more information on CORS on Amazons S3, please refer to the AWS [CORS documentation](http://docs.amazonwebservices.com/AmazonS3/latest/dev/cors.html) 


To start cheeseCake use

`node release/server.js`

in the application directory. Cheesecake will now happily answer your request under http://[servername]:3333/

## Compatibility

Should work in:

* Firefox Nightly, Aurora, Beta (does not seem to be stable atm)
* Google Chrome
* Opera

**From the say-cheese documentation:**  
The beta release of Firefox supports a lower resolution compared to Opera and Chrome. This has been improved in Aurora and Nightly and may hopefully work its way into stable in the next version or two.

## Example app

Check out the [example](http://blog.tcs.de/projects/cheesecake/).

## License
Copyright (c) 2012 @exinferis  
Licensed under the MIT license.
