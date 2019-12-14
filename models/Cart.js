const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: String,
  inventory: []
})

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;

/*
var Inventory = new mongoose.Schema({
    product_name: String,
    product_type: String,
    stock: Number,
    price: Number,
    description: String,
    fileId: String
});

console.log("User: " + req.user);
  console.log();
  User.find({}, function (err, users) {
    users.forEach(function (user) {
      console.log(user);
    })
  });
*/