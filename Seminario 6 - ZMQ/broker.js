const Cart = require('./cart.js');
const zmq = require('zeromq');

let cartsck = zmq.socket('router');
let workersck = zmq.socket('router');

cartsck.bind('tcp://*:9998');
workersck.bind('tcp://*:9999');

let cli = [], req = [], workers = [], carts = {};

class CartMsg {
    constructor(objson, action, prod, cant) {
        this.objson = objson;
        this.action = action;
        this.prod = prod;
        this.cant = cant;
    }
}

cartsck.on('message', (c, sep, data) => {
    var toSend;
    console.log(data.toString());

    if (workers.length === 0) {
        // Saving it for later ... Perhaps
        req.push(data);
    } else {
        let msgAux = JSON.parse(data);

        if (msgAux.action === 'create') {
            let auxCart = new Cart([]);
            carts[c] = auxCart;
            toSend = new CartMsg(carts[c], msgAux.action, msgAux.prod, msgAux.cant);
        } else {
            toSend = new CartMsg(carts[c], msgAux.action, msgAux.prod, msgAux.cant);
        }
        workersck.send([workers.shift(), '', c, '', JSON.stringify(toSend)])
    }
})

workersck.on('message', (w, sep, c, sep2, r) => {

    if (c === '') {
        workers.push(w);
        return
    }

    if (r.toString() !== "") {
        let j = JSON.parse(r);
        let auxCart = new Cart();

        for (i in j.items) {
            auxCart.addToCart(j.items[i]);
        }

        carts[c] = auxCart;
        console.log(JSON.stringify(carts.cart) + " dm.addSubject");
        cartsck.send([c, '', r])
    }

    if (cli.length > 0) {
        workersck.send([w, '', cli.shift(), '', req.shift()])
    } else {
        workers.push(w)
    }
});