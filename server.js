var net = require('net');
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
var username = new Boolean;
var password = new Boolean;
app.io.route('create-session', function (req) {
    var options = req.data;
    switch (options.Session) {
        case 'telnet':
            //req.io.emit('kill-term', options.Session + ' protocol not supported yet.')
            username = false;
            password = false;
            req.session.stream = net.createConnection(23, req.session.host);
            req.session.stream.on("connect", function () {
                req.session.stream.on("data", function (data) {

                    /*
                    Command	            Code	Description
                    SE	                X'F0'	End of subnegotiation parameters.
                    NOP	                X'F1'	No operation.
                    Data Mark	        X'F2'	The data stream portion of a Synch. This should always be accompanied by a TCP Urgent notification.
                    Break	            X'F3'	NVT character BRK.
                    Interrupt Process	X'F4'	The function IP.
                    Abort output	    X'F5'	The function AO.
                    Are You There	    X'F6'	The function AYT.
                    Erase character 	X'F7'	The function EC.
                    Erase Line	        X'F8'	The function EL.
                    Go ahead	        X'F9'	The GA signal.
                    SB	                X'FA'	Indicates that what follows is subnegotiation of the indicated option.
                    WILL (option code)	X'FB'	Indicates the desire to begin performing, or confirmation that you are now performing, the indicated option.
                    WON'T (option code)	X'FC'	Indicates the refusal to perform, or continue performing, the indicated option.
                    DO (option code)	X'FD'	Indicates the request that the other party perform, or confirmation that you are expecting the other party to perform, the indicated option.
                    DON'T (option code)	X'FE'	Indicates the demand that the other party stop performing, or confirmation that you are no longer expecting the other party to perform, the indicated option.
                    IAC	                X'FF'	Data byte 255.

                    Option	Option (Hex)	Name
                    0	0	Binary Transmission
                    1	1	Echo
                    2	2	Reconnection
                    3	3	Suppress Go Ahead
                    4	4	Approx Message Size Negotiation
                    5	5	Status
                    6	6	Timing Mark
                    7	7	Remote Controlled Trans and Echo
                    8	8	Output Line Width
                    9	9	Output Page Size
                    10	A	Output Carriage-Return Disposition
                    11	B	Output Horizontal Tab Stops
                    12	C	Output Horizontal Tab Disposition
                    13	D	Output Formfeed Disposition
                    14	E	Output Vertical Tabstops
                    15	F	Output Vertical Tab Disposition
                    16	10	Output Linefeed Disposition
                    17	11	Extended ASCII
                    18	12	Logout
                    19	13	Byte Macro
                    20	14	Data Entry Terminal
                    21	15	SUPDUP
                    22	16	SUPDUP Output
                    23	17	Send Location
                    24	18	Terminal Type
                    25	19	End of Record
                    26	1A	TACACS User Identification
                    27	1B	Output Marking
                    28	1C	Terminal Location Number
                    29	1D	Telnet 3270 Regime
                    30	1E	X.3 PAD
                    31	1F	Negotiate About Window Size
                    32	20	Terminal Speed
                    33	21	Remote Flow Control
                    34	22	Linemode
                    35	23	X Display Location
                    39  27  New Environment Option
                    255	FF	Extended-Options-List
                    */
                    //Do Terminal Type

                    /*
                    if (data[0] == 255) {//IAC
                    for (var index = 1; index < data.length; index++) {
                    switch (data[index]) {
                    case 255: //IAC
                    break;
                    case 254: //DON'T
                    break;
                    case 253: //DO
                    break;
                    case 252: //WON't
                    break;
                    case 251: //WILL
                    break;
                    case 250: //SB
                    while (data[index] != 240) {
                    console.log(data[index]);
                    index++;
                    }
                    break;
                    case 249: //Go ahead
                    break;
                    case 248: //Erase Line
                    break;
                    case 247: //Erase character
                    break;
                    case 246: //Are You There
                    break;
                    case 245: // Abort output
                    break;
                    case 244: // Interrupt Process
                    break;
                    case 243: //Data Mark
                    break;
                    case 242: //DO
                    break;
                    case 241: //NOP
                    break;
                    case 240: //SE
                    break;
                    }
                    }
                    }
                    */


                    if (data[0] == 255 && data[1] == 253 && data[2] == 24) {
                        console.log(data);
                        var buffer = new Buffer(6);
                        buffer[0] = 255; //IAC
                        buffer[1] = 251; ////Will
                        buffer[2] = 24; ////Terminal Type
                        buffer[3] = 255; //IAC
                        buffer[4] = 251; ////Will
                        buffer[5] = 31; ////Negotiate About Window Size
                        req.session.stream.write(buffer);
                    } //Do Terminal Negotiate About Window Size
                    else if (data[0] == 255 && data[1] == 253 && data[2] == 31) {
                        console.log(data);
                        var buffer = new Buffer(9);
                        buffer[0] = 255; //IAC
                        buffer[1] = 252; ////WON'T
                        buffer[2] = 32; ////Terminal Speed
                        buffer[3] = 255; //IAC
                        buffer[4] = 252; ////WON'T
                        buffer[5] = 35; ////X Display Location
                        buffer[6] = 255; //IAC
                        buffer[7] = 252; ////WILL
                        buffer[8] = 39; ////X New Environment Option
                        req.session.stream.write(buffer);
                    } //ff fa 18 01 ff f0 // SB Terminal Type 01 SE
                    else if (data[0] == 255 && data[1] == 250 && data[2] == 24) {
                        console.log(data);
                        var buffer = new Buffer(9);
                        buffer[0] = 255; //IAC
                        buffer[1] = 250; ////SB
                        buffer[2] = 31; ////Negotiate About Window Size
                        buffer[3] = 00; //delimiter
                        buffer[4] = 200; //width
                        buffer[5] = 00 ///delimiter
                        buffer[6] = 64 //height
                        buffer[7] = 255; ////IAC
                        buffer[8] = 240////SE
                        req.session.stream.write(buffer);
                        buffer = new Buffer(10);
                        buffer[0] = 255; //IAC
                        buffer[1] = 250; ////SB
                        buffer[2] = 24 ////Terminal Type
                        buffer[3] = 00; //delimiter
                        buffer[4] = 65 //A
                        buffer[5] = 78///N
                        buffer[6] = 83//S
                        buffer[7] = 73//I
                        buffer[8] = 255//IAC
                        buffer[9] = 240//SE
                        req.session.stream.write(buffer);
                    } //IAC: Will Suppress Go Ahead, IAC:Do Echo, IAC:Will Status, IAC:Do Remote Flow Control
                    else if (data[0] == 255 && data[1] == 251 && data[2] == 03) {
                        console.log(data);
                        var buffer = new Buffer(3);
                        buffer[0] = 255; //IAC
                        buffer[1] = 253; //DO
                        buffer[2] = 03; //Suppress Go Ahead
                        req.session.stream.write(buffer);
                        buffer = new Buffer(9);
                        buffer[0] = 255; //IAC
                        buffer[1] = 251; ////WILL
                        buffer[2] = 01 ////Echo
                        buffer[3] = 255; //IAC
                        buffer[4] = 254; //DON"T
                        buffer[5] = 05 ////Status
                        buffer[6] = 255; //IAC
                        buffer[7] = 252; //WON"T
                        buffer[8] = 33 //Remote Flow Control
                        req.session.stream.write(buffer);
                    } ///IAC:Don't Echo, IAC:Will Echo
                    else if (data[0] == 255 && data[1] == 254 && data[2] == 01) {
                        console.log(data);
                    }
                    else if ((data.toString().indexOf("Username:") > -1 || data.toString().indexOf("login:") > -1) && username == false) {
                        console.log(username);
                        username = true;

                        req.io.emit('data', data.toString());
                        req.session.stream.write(req.session.username + "\r\n");
                    }
                    else if ((data.toString().indexOf("Password:") > -1) && password==false) {
                        password = true;
                        req.io.emit('data', data.toString());
                        req.session.stream.write(req.session.password + "\r\n");
                    }
                    else {

                        req.io.emit('data', data.toString());
                    }
                })
                req.session.stream.on("end", function () {
                    req.io.emit('kill-term', 'connection closed');
                    req.session.stream = null;
                })
            })
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
