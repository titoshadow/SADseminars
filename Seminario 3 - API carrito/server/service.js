const express = require('express');
const service = express();
const pjson = require('../package.json');
const ServiceRegistry = require('./lib/ServiceRegistry');
const Cart = require('../cart');
let registeredCart = false;
var cart = new Cart();

module.exports = (config) => {
  const log = config.log();
  serviceRegistry = new ServiceRegistry(log);
  // Add a request logging middleware in development mode
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }
  
  if(serviceRegistry.register(pjson.name, pjson.version, 'localhost', '3000')){
    registeredCart = true;
  }

  // GET returns the whole Cart
  service.get('/cart/', (req, res, next) => {
    
    if(!registeredCart){
      return res.send('Service not registered');
    }

    return res.send(typeof cart !== 'undefined' && Object.keys(cart.cart).length > 0 ? cart : "Cart is empty !");
  });

  // Removed for consistency - Always returning the whole "cart"
  // service.get('/:codelement', (req, res, next) => {
  //   return res.send(typeof cart !== 'undefined' && Object.keys(cart.cart).length > 0 ? cart.getFromCart(req.params.codelement) : "Cart is empty !");
  // });

  // PUT inserts elements (same as POST)
  // service.put('/cart/:codelement/:qty', (req, res, next) => {

  //   var descr = null;
  //   switch (req.params.codelement) {
  //     case "1":
  //       descr = "palos";
  //       break;
  //     case "2":
  //       descr = "muelles";
  //       break;
  //     case "3":
  //       descr = "hierros";
  //       break;
  //     default:
  //       return res.send("Unknown product");
  //   }

  //   cart.addToCart({ cod: req.params.codelement, desc: descr, qty: parseInt(req.params.qty) });
  //   return res.send(cart);
  // });

  // POST inserts items or checks out cart
  service.post('/cart/:codelement/:qty', (req, res, next) => {
    
    if(!registeredCart){
      return res.send('Service not registered');
    }

    var descr = null;
    switch (req.params.codelement) {
      case "1":
        descr = "palos";
        break;
      case "2":
        descr = "muelles";
        break;
      case "3":
        descr = "hierros";
        break;
      default:
        return res.send("Unknown product");
    }

    cart.addToCart({ cod: req.params.codelement, desc: descr, qty: parseInt(req.params.qty) });
    return res.send(cart);
  });

  // DELETE removes 
  service.delete('/cart/:codelement/:qty', (req, res, next) => {
    
    if(!registeredCart){
      return res.send('Service not registered');
    }

    cart.removeFromCart(req.params.codelement, parseInt(req.params.qty));
    return res.send(Object.keys(cart.cart).length > 0 ? cart : "Cart is empty !");
  });


  // service.put('/register/:servicename/:serviceversion/:serviceport', (req, res) => {
  //   const { servicename, serviceversion, serviceport } = req.params;

  //   const serviceip = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;

  //   const serviceKey = serviceRegistry
  //     .register(servicename, serviceversion, serviceip, serviceport);
  //   return res.json({ result: serviceKey });
  // });

  // service.delete('/register/:servicename/:serviceversion/:serviceport', (req, res) => {
  //   const { servicename, serviceversion, serviceport } = req.params;

  //   const serviceip = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;

  //   const serviceKey = serviceRegistry
  //     .unregister(servicename, serviceversion, serviceip, serviceport);
  //   return res.json({ result: serviceKey });
  // });

  // service.get('/find/:servicename/:serviceversion', (req, res) => {
  //   const { servicename, serviceversion } = req.params;
  //   const svc = serviceRegistry.get(servicename, serviceversion);
  //   if (!svc) return res.status(404).json({ result: 'Service not found' });
  //   return res.json(svc);
  // });
  
  if (process.platform === "win32") {
    var rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on("SIGINT", function () {
      process.emit("SIGINT");
    });
  }

  process.on('SIGINT', function () {
    log.debug("Caught interrupt signal");
    serviceRegistry.
      unregister(pjson.name, pjson.version, 'localhost', '3000');
    registeredCart = false;
    process.exit();
  });

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    // Log out the error to the console
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
