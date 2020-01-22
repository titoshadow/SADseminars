var zmq = require('zeromq');
var rep = zmq.socket('rep');
var pub = zmq.socket('pub');
var sub = zmq.socket('sub');

var HOST = '127.0.0.1';
var PORT_REP = 9001;
var PUB_PORT = 5551;
var serverArgs = "";

var dm = require('./dm.js');
var blockchain = require('./blockchain.js');

// node dmserver.js PORT_REP(clientYforum) PORT_PUB URL_SERVERS_SUB

// node dmserver.js 9001 5551 tcp://127.0.0.1:5552,tcp://127.0.0.1:5553
// node dmserver.js 9002 5552 tcp://127.0.0.1:5551,tcp://127.0.0.1:5553
// node dmserver.js 9003 5553 tcp://127.0.0.1:5551,tcp://127.0.0.1:5552

var args = process.argv.slice(2);

//function from dm
class Post {
    constructor(msg, from, ts) {
        this.msg = msg;
        this.from = from;
        this.ts = ts;
    }
}

//console.log("USAGE: node dmserver.js PORT_REPN PORT_PUB URL_SERVERS_SUB");
if (process.argv.length > 2 && !args[0].includes(":")) {
    PORT_REP = args[0];
    PUB_PORT = args[1];
    serverArgs = args[2];
} else {
    addressport = args[0].split(":");
    HOST = addressport[0];
    PORT_REP = addressport[1];
    PUB_PORT = args[1];
    serverArgs = args[2];
}

if (serverArgs !== undefined) {
    var servidores = serverArgs.split(",");

    for (var serverURL in servidores) {
        sub.connect(servidores[serverURL]);
    }

    sub.subscribe('checkpoint');
    sub.on('message', function (msg) {
        var message = msg.toString();
        messageProcessor(message.substring(10), false);
    });
}

pub.bind('tcp://' + HOST + ":" + PUB_PORT);

rep.bind('tcp://' + HOST + ":" + PORT_REP, function (err) {
    if (err) throw err;
});


rep.on('message', function (data) {
    messageProcessor(data, true);
});

function retardo(n) {
    time = new Date().getTime();
    time2 = time + n;
    while (time < time2) {
        time = new Date().getTime();
    }
}

function messageProcessor(data, notifyServers) {

    var jsonList = "[" + data.toString().replace("}{", "},{") + "]";

    var dataList = JSON.parse(jsonList);

    dataList.forEach(function (elem) {
        var invo = elem;
        var reply = { what: invo.what, invoId: invo.invoId };

        switch (invo.what) {
            case 'add user':
                reply.obj = dm.addUser(invo.u, invo.p);
                var response = { what: invo.what, user: invo.u, exists: reply.obj }
                pub.send('webserver' + JSON.stringify(response));
                if (notifyServers) pub.send('checkpoint' + data);
                break;
            case 'add subject':
                reply.obj = dm.addSubject(invo.s);
                var response = { what: invo.what, id: reply.obj, subject: invo.s, }
                pub.send('webserver' + JSON.stringify(response));
                if (notifyServers) pub.send('checkpoint' + data);
                break;
            case 'get subject list':
                reply.obj = dm.getSubjectList();
                break;
            case 'get user list':
                reply.obj = dm.getUserList();
                break;
            case 'login':
                reply.obj = dm.login(invo.u, invo.p);
                break;
            case 'add private message':
                var message = { from: invo.u1, to: invo.u2, msg: invo.msg, isPrivate: true, ts: new Date() };
                reply.obj = dm.addPrivateMessage(message);
                var response = { what: invo.what, message: message };
                pub.send('webserver' + JSON.stringify(response));
                if (notifyServers) {
                    pub.send('checkpoint' + data);
                    blockchain.addMessage("private" + JSON.stringify(reply.obj))
                }
                break;
            case 'get private message list':
                reply.obj = blockchain.getPrivateMessages(dm.getUserKey(invo.u1, invo.u2));
                break;
            case 'add public message':
                var message = { to: invo.to, msg: invo.msg, from: invo.from, isPrivate: false, ts: new Date() };
                reply.obj = dm.addPublicMessage(message);
                var response = { what: invo.what, message: message };
                pub.send('webserver' + JSON.stringify(response));
                if (notifyServers) {
                    pub.send('checkpoint' + data);
                    blockchain.addMessage("public" + JSON.stringify(reply.obj))
                }
                break;
            case 'get public message list':
                reply.obj = blockchain.getPublicMessages(invo.sbj);
                break;
            default: console.log("error");
        }
        if (notifyServers) rep.send(JSON.stringify(reply));
    });
}