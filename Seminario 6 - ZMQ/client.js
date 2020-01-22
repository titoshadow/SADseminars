const zmq = require('zeromq')
let req = zmq.socket('req');
req.connect('tcp://localhost:9998')

var pID = process.argv[2];

class cartMsg {
    constructor(action, product, qty) {
        this.action = action;
        this.product = product;
        this.qty = qty;
    }
}

function productCode(product) {
    var productCode = null;
    switch (product) {
        case 'palos':
            productCode = 1;
            break;
        case 'hierros':
            productCode = 2;
            break;
        case 'muelles':
            productCode = 3;
            break;
        default:
            break;
    }
    return productCode;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function test() {
    let msg = new cartMsg('add', productCode('muelles'), 3);
    console.log("Sending this: ");
    console.log(msg);
    req.send(JSON.stringify(msg));

    await sleep(2000);

    msg = new cartMsg('remove', productCode('muelles'), 1);
    console.log("Sending this: ");
    console.log(msg);
    req.send(JSON.stringify(msg));

    await sleep(2000);

    msg = new cartMsg('add', productCode('palos'), 5);
    console.log("Sending this: ");
    console.log(msg);
    req.send(JSON.stringify(msg));

    await sleep(2000);

    msg = new cartMsg('add', productCode('hierros'), 2);
    console.log("Sending this: ");
    console.log(msg);
    req.send(JSON.stringify(msg));

    await sleep(2000);

    msg = new cartMsg('remove', productCode('muelles'), 2);
    console.log("Sending this: ");
    console.log(msg);
    req.send(JSON.stringify(msg));
}

req.on('message', (msg) => {
    console.log('resp: ' + msg)
})

function createClient() {
    var msg = new Object('create');
    msg.pID = pID;
    req.send(JSON.stringify(msg));
}

createClient();
console.log("I just asked to create a client !");

console.log("Lets start testing ... ");
test();

setTimeout(function () {
    process.exit(0);
}, 10000)
