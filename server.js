var https = require('https');
var fs = require('fs');
var url = require('url');
var express = require('express');
var app = express();
var privatekey = fs.readFileSync("./key.pem", 'utf8');
var certificate = fs.readFileSync("./server.crt", 'utf8');
var credentials = {key: privatekey, cert: certificate};
app.use(express.static('dashboard'));
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3000, function(){
   console.log("start at https://127.0.0.1:3000");
});
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})