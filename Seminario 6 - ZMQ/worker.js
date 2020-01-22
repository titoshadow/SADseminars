var Cart = require('./cart.js');
var zeromq = require('zeromq');
let req = zeromq.socket('req');

req.identity = 'Worker' + process.pid

req.connect('tcp://localhost:9999')

req.on('message', (c, sep, data) => {
    var dataParsed = JSON.parse(data);
    console.log(dataParsed);
    let objetoArray = dataParsed.objson.items;
    
    var cart = new Cart();

    for (i in objetoArray) {
        cart.addToCart(objetoArray[i]);
    }

    if (dataParsed.action === 'add') {
        cart.addToCart(dataParsed.prod);
    }

    if (dataParsed.action === 'remove') {
        cart.removeFromCart(dataParsed.prod);
        console.log("My cart contains: ");
        console.log(cart.cart);
    }

    setTimeout(() => {
        req.send([c, '', JSON.stringify(cart)])
    }, 1000)
});

req.send(['', '', ''])