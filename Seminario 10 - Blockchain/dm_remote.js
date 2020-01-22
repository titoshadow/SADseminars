var zmq = require('zeromq');
var req = zmq.socket('req');

exports.Start = function (host, port, cb) {
    req.connect('tcp://' + host + ":" + port);
    if (cb != null) cb();
};

var callbacks = {};// hash of callbacks. Key is invoId esto son los callbacks que me llegan cuando hacen una peticion (invoId) entonces si hacen peticion: invoId: 3 hay un cb() guardado en callbacks[3]
var invoCounter = 0; // current invocation number is key to access "callbacks".

//
// When data comes from server. It is a reply from our previous request
// extract the reply, find the callback, and call it.
// Its useful to study "exports" functions before studying this one.
//
req.on('message', function (data) {
    //console.log ('data comes in: ' + data);
    var jsonList = data.toString();

    jsonList = "[" + jsonList.replace("}{", "},{") + "]";
    var dataList = JSON.parse(jsonList);

    for (var idx in dataList) {
        var reply = dataList[idx];
        switch (reply.what) {
            case 'add user':
                //console.log ('We received a reply for \'add user\' command');
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'add subject':
                //console.log ('We received a reply for \'add subject\' command');
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'get subject list':
                //console.log ('We received a reply for \'get subject list\' command' + JSON.stringify(dataList));
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments 
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'get user list':
                //console.log ('We received a reply for \'get user list\' command');
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'login':
                //console.log ('We received a reply for \'login\' command');
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'add private message':
                //console.log ('We received a reply for \'add private message\' command');
                callbacks[reply.invoId](); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'get private message list':
                //console.log ('We received a reply for \'get private message list\' command');
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'add public message':
                //console.log ('We received a reply for add command');
                callbacks[reply.invoId](); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            case 'get public message list':
                //console.log ('We received a reply for \'get public message list\' command');
                callbacks[reply.invoId](reply.obj); // call the stored callback, no arguments
                delete callbacks[reply.invoId]; // remove from hash
                break;
            default: console.log("Panic: we got this: " + reply.what);
        }
    }
});

//
// on each invocation we store the command to execute (what) and the invocation Id (invoId)
// InvoId is used to execute the proper callback when reply comes back.
//
function Invo(str, cb) {
    this.what = str;
    this.invoId = ++invoCounter;
    callbacks[this.invoId] = cb;
}

//
//
// Exported functions as 'dm'
//
//
exports.addUser = function (u, p, cb) {
    invo = new Invo('add user', cb);
    invo.u = u;
    invo.p = p;
    req.send(JSON.stringify(invo));
};


exports.addSubject = function (s, cb) {
    invo = new Invo('add subject', cb);
    invo.s = s;
    req.send(JSON.stringify(invo));
};

exports.getSubjectList = function (cb) {//
    req.send(JSON.stringify(new Invo('get subject list', cb)));
};

exports.getUserList = function (cb) {
    req.send(JSON.stringify(new Invo('get user list', cb)));
};

// Tests if credentials are valid, returns true on success
exports.login = function (u, p, cb) {
    invo = new Invo('login', cb);
    invo.u = u;
    invo.p = p;
    req.send(JSON.stringify(invo));
};

exports.addPrivateMessage = function (msg, cb) {
    var invo = new Invo('add private message', cb);
    invo.u1 = msg.from;
    invo.u2 = msg.to;
    invo.msg = msg.msg;
    req.send(JSON.stringify(invo));
};

exports.getPrivateMessageList = function (u1, u2, cb) {//
    invo = new Invo('get private message list', cb);
    invo.u1 = u1;
    invo.u2 = u2;
    req.send(JSON.stringify(invo));
};

// adds a public message to storage
exports.addPublicMessage = function (msg, cb) {
    var invo = new Invo('add public message', cb);
    invo.from = msg.from;
    invo.to = msg.to;
    invo.msg = msg.msg;
    req.send(JSON.stringify(invo));
};

exports.getPublicMessageList = function (sbj, cb) {//
    var invo = new Invo('get public message list', cb);
    invo.sbj = sbj;
    req.send(JSON.stringify(invo));
};

exports.close = function () {
    req.close();
};