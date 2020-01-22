var app = require('express')();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
let userList = {};

function timestamp() {
  var date = new Date();
  return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' - ';
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

socket.on('connection', function (client) {

  client.on('login', function (name) {
    userList[client.id] = name;
    socket.emit('users list', userList);
    client.broadcast.emit('chat message', timestamp() + 'User ' + name + ' entered chat !');
    client.emit('chat message', timestamp() + 'You entered the chat.');
    console.log('User connected:');
    console.log(userList);
  });

  client.on('disconnect', function () {
    var user = userList[client.id];
    if(user != undefined){
      client.broadcast.emit('chat message', timestamp() + user + ": has disconnected !");
    }
    
    delete userList[client.id];
    socket.emit('users list', userList);
  });

  client.on('chat message', function (msg, user) {
    console.log('Message from ' + user + ': ' + msg);
    //socket.emit('chat message', timestamp() + user + ": " + msg);
    client.broadcast.emit('chat message', timestamp() + user + ": " + msg);
  });
  
  client.on('typing', function (user) {
    client.broadcast.emit('userTyping', user);    
  });

  client.on('stopTyping', function (user) {
    client.broadcast.emit('userStopTyping', user);    
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});