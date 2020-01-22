const semver = require('semver');

class Cart {

  constructor() {
    this.cart = new Array();
  }

  // Add to cart
  addToCart(element) {
    var elementToInsert = this.clone(element);
    if (this.cart.length == 0)
      this.cart.push(elementToInsert);
    else {
      var existInCart = false;
      for (var i in this.cart) {
        if (this.cart[i].cod == elementToInsert.cod) {
          existInCart = true;
          this.cart[i].qty = this.cart[i].qty + elementToInsert.qty;
        }
      }
      if (!existInCart)
        this.cart.push(elementToInsert);
    }
  }

  // Remove from cart
  removeFromCart(element) {
    for (var i = 0; i < this.cart.length; i++) {
        element === this.cart[i] ? this.cart.splice(i, 1) : false;
    }
    return this.cart;
}

  // Get from cart
  getFromCart(codelement) {
    var output = null;
    if (this.cart.length == 0)
      return output;
    else {
      for (var i in this.cart) {
        if (this.cart[i].cod == codelement) {
          output = this.cart[i];
        }
      }
      return output;
    }
  }

  checkoutCart() {
    var output = null;
    if (this.cart.length == 0)
      return output;
    else {
      for (var i in this.cart) {
        if (checkStock(i)) {
          output = true;
        }
        else {
          output = false;
        }
      }
    }
    return output;
  }

  checkStock(element) {
    // Get the products collection
    let output = false;
    mongoclient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {

      if (err) throw err;
      // Get the products collection
      var collection = db.collection('products');
      // Look for some product
      collection.findOne({ cod: element.cod }, function (err, result) {
        if (err) throw err;
        if (result.stock < element.qty) {
          output = false;
        }
        else
          output = true;
      });
    });
    return output;
  }

  clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
}

module.exports = Cart;