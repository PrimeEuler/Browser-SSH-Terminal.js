var express = require('express.io'); 
var fs = require('fs');
var Connection = require('ssh2'),
//https://github.com/techpines/express.io
//https://github.com/mscdex/ssh2
//https://github.com/chjj/tty.js/blob/master/static/term.js
/*
options = {
    key: fs.readFileSync('./ssl/myServer.key'),
    cert: fs.readFileSync('./ssl/myServer.crt'),
    passphrase: 'password'
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
    req.io.emit('req-username')

})

app.io.route('res-username', function (req) {
    req.session.username = req.data
    req.io.emit('req-password')
})


app.io.route('res-password', function (req) {
    req.session.password = req.data
    req.io.emit('create-term')

})

app.io.route('data', function (req) {
    if (req.session.stream.writable) {
        req.session.stream.write(req.data);
    }
    else {
        req.io.emit('kill-term');
    }
});

app.io.route('create-session', function (req) {
    var options = req.data;

    switch (options.Session) {
        case 'telnet':
            req.io.emit('kill-term', options.Session + ' protocol not supported yet.')
            break;
        case 'ping':
            req.io.emit('kill-term', options.Session + ' protocol not supported yet.')
            break;
        case 'ssh':
            var config = {
                host: req.session.host,
                port: 22,
                username: req.session.username,
                password: req.session.password,
                tryKeyboard: false
            }

            var banner = '';
            req.session.c = new Connection();
            req.session.c.connect(config);
            req.session.c.on('banner', function (message, language) {
                banner = message;
            });
            req.session.c.on('error', function (err) {
                console.log('Connection-Error :: ' + err);
                req.io.emit('kill-term', err.toString());
            });
            req.session.c.on('close', function (hadError) {
                console.log('Connection-Close :: ' + hadError);
                req.io.emit('kill-term', 'connection closed');
            });
            req.session.c.on('keyboard-interactive', function (name, instructions, instructionsLang, prompts, finish) {
                console.log('Connection-Keyboard :: ' + prompts.toString());
            });
            req.session.c.on('ready', function () {
                console.log('Connection :: ready');
                req.io.emit('data', banner.replace(/\n/g, "\r\n"));
                req.session.c.shell(function (err, stream) {
                    if (err) { console.log(err); }
                    req.session.stream = stream;
                    req.session.stream.setWindow(options.Cols, options.Rows, 600, 800);
                    req.session.stream.on('data', function (data, extended) {
                        req.io.emit('data', data.toString());
                    });
                    req.session.stream.on('end', function () {
                        console.log('Stream :: EOF');
                    });
                    req.session.stream.on('close', function () {
                        console.log('Stream :: close');
                    });
                    req.session.stream.on('error', function () {
                        console.log('Stream :: ERROR');
                    });
                    req.session.stream.on('exit', function (code, signal) {
                        console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
                        req.session.c.end();
                        req.session.c = null;
                        req.session.stream = null;
                    });
                });
            });
            break;

    }

});


app.listen(8080)
