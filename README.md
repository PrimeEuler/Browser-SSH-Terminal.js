SSH-Browser-Terminal
====================

A trivial example of a SSH terminal in your browser using node.js, express.io and ssh2. Based on Fabrice
Bellard's vt100 for [jslinux](http://bellard.org/jslinux/).


Requirements:

* [node.js](http://nodejs.org/) -- v0.8.7 or newer
* [ssh2](https://github.com/mscdex/ssh2)
* [express.io](https://github.com/techpines/express.io)

Install:
```bash
npm install express.io
npm install ssh2
```
Run:
```bash
node server.js
```
Connect:
```bash
http://localhost:8080
```

Todo:
```bash
Fork:
WEB-CLI session management of:
SSH     - https://github.com/mscdex/ssh2
TELNET  - https://github.com/kanaka/websockify - https://github.com/kanaka/websockify/blob/master/wstelnet.html
SNMP    - https://github.com/calmh/node-snmp-native
ICMP    - https://bitbucket.org/stephenwvickers/node-net-ping
RAW     - https://bitbucket.org/stephenwvickers/node-raw-socket
VNC     - https://github.com/bgaff/vnc.js
```
