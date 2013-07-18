var express = require('express.io'); 
var fs = require('fs');
var Connection = require('ssh2'),
//https://github.com/techpines/express.io
//https://github.com/mscdex/ssh2
//https://github.com/chjj/tty.js/blob/master/static/term.js
//http://www.gettingcirrius.com/2012/06/automating-creation-of-certificate.html
//http://www.gettingcirrius.com/2012/06/securing-nodejs-and-express-with-ssl.html
/*
options = {
    // Specify the key file for the server
  key: fs.readFileSync('ssl/server/keys/server1.key'),
  
  // Specify the certificate file
  cert: fs.readFileSync('ssl/server/certificates/server1.crt'),
  
  // Specify the Certificate Authority certificate
  ca: fs.readFileSync('ssl/ca/ca.crt'),
  
  // This is where the magic happens in Node.  All previous
  // steps simply setup SSL (except the CA).  By requesting
  // the client provide a certificate, we are essentially
  // authenticating the user.
  requestCert: true,
  
  // If specified as "true", no unauthenticated traffic
  // will make it to the route specified.
  rejectUnauthorized: true
}
app = express().https(options).io()
*/
app = express().http().io()

app.use(express.cookieParser())
app.use(express.session({ secret: 'ssh2-html-client' }))
app.use(express.static(__dirname));


app.get('/', function (req, res) {
    req.session.loginDate = new Date().toString()
    res.sendfile(__dirname + '/client.html')
})


app.io.route('host', function (req) {
    req.session.host = req.data
    req.session.save(function () {
        req.io.emit('get-username')
    })
})

app.io.route('send-username', function (req) {
    req.session.username = req.data
    req.session.save(function () {
        req.io.emit('get-password')
    })
})


app.io.route('send-password', function (req) {
    req.session.password = req.data
    req.session.save(function () {
        req.io.emit('create-term')
    })
})

app.io.route('data', function (req) {
    if (req.session.connectedtohost) {
        req.session.stream.write(req.data);
    }
});

app.io.route('create-ssh', function (req) {
    var config = {
        host: req.session.host,
        port: 22,
        username: req.session.username,
        password: req.session.password,
        tryKeyboard: true
    }
    var options = req.data;

    var c = new Connection();
    c.connect(config);
    c.on('ready', function () {
        console.log('Connection :: ready');
        c.shell(function (err, stream) {
            if (err) throw err;
            req.session.stream = stream;
            req.session.connectedtohost = true;

            stream.setWindow(options.Cols, options.Rows, 480, 640);

            stream.on('data', function (data, extended) {
                req.io.emit('data', (data + '').replace(/\n/g, "\r\n"));
            });

            stream.on('end', function () {
                console.log('Stream :: EOF');
                req.session.connectedtohost = false;
            });

            stream.on('close', function () {
                console.log('Stream :: close');
                req.session.connectedtohost = false;
                c.end();
            });

            stream.on('exit', function (code, signal) {
                console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
                req.session.connectedtohost = false;
            });
        });
    });
})


app.listen(8080)
